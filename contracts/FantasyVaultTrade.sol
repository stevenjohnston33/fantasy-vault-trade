// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint64, externalEuint64, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract FantasyVaultTrade is SepoliaConfig {
    using FHE for *;
    
    struct TradingSession {
        euint32 sessionId;
        euint32 totalParticipants;
        euint32 totalVolume;
        euint32 totalTrades;
        bool isActive;
        bool isEnded;
        string name;
        string description;
        address creator;
        uint256 startTime;
        uint256 endTime;
        uint256 lockPeriod;
    }
    
    struct Stock {
        euint32 stockId;
        euint32 currentPrice;
        euint32 totalSupply;
        euint32 marketCap;
        bool isActive;
        string symbol;
        string name;
        address issuer;
    }
    
    struct TradeOrder {
        euint32 orderId;
        euint32 stockId;
        euint32 quantity;
        euint32 price;
        euint32 totalValue;
        bool isBuy;
        bool isExecuted;
        address trader;
        uint256 timestamp;
    }
    
    struct Portfolio {
        euint32 totalValue;
        euint32 totalPnl;
        euint32 tradeCount;
        address owner;
        bool isActive;
    }
    
    struct LeaderboardEntry {
        euint32 rank;
        euint32 score;
        address trader;
        bool isVerified;
    }
    
    mapping(uint256 => TradingSession) public sessions;
    mapping(uint256 => Stock) public stocks;
    mapping(uint256 => TradeOrder) public orders;
    mapping(address => Portfolio) public portfolios;
    mapping(uint256 => mapping(address => euint32)) public stockHoldings;
    mapping(uint256 => LeaderboardEntry) public leaderboard;
    
    uint256 public sessionCounter;
    uint256 public stockCounter;
    uint256 public orderCounter;
    uint256 public leaderboardCounter;
    
    address public owner;
    address public verifier;
    uint256 public platformFeeRate; // Basis points (e.g., 100 = 1%)
    
    event SessionCreated(uint256 indexed sessionId, address indexed creator, string name);
    event StockAdded(uint256 indexed stockId, string symbol, address indexed issuer);
    event OrderPlaced(uint256 indexed orderId, uint256 indexed stockId, address indexed trader, bool isBuy);
    event OrderExecuted(uint256 indexed orderId, uint256 indexed stockId, address indexed trader);
    event SessionEnded(uint256 indexed sessionId, address indexed creator);
    event LeaderboardUpdated(uint256 indexed sessionId, address indexed trader, uint32 rank);
    event PortfolioUpdated(address indexed trader, uint32 totalValue);
    
    constructor(address _verifier) {
        owner = msg.sender;
        verifier = _verifier;
        platformFeeRate = 50; // 0.5% platform fee
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyVerifier() {
        require(msg.sender == verifier, "Only verifier can call this function");
        _;
    }
    
    function createTradingSession(
        string memory _name,
        string memory _description,
        uint256 _duration,
        uint256 _lockPeriod
    ) public returns (uint256) {
        require(bytes(_name).length > 0, "Session name cannot be empty");
        require(_duration > 0, "Duration must be positive");
        require(_lockPeriod > 0, "Lock period must be positive");
        
        uint256 sessionId = sessionCounter++;
        
        sessions[sessionId] = TradingSession({
            sessionId: FHE.asEuint32(0), // Will be set properly later
            totalParticipants: FHE.asEuint32(0),
            totalVolume: FHE.asEuint32(0),
            totalTrades: FHE.asEuint32(0),
            isActive: true,
            isEnded: false,
            name: _name,
            description: _description,
            creator: msg.sender,
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            lockPeriod: _lockPeriod
        });
        
        emit SessionCreated(sessionId, msg.sender, _name);
        return sessionId;
    }
    
    function addStock(
        uint256 sessionId,
        string memory _symbol,
        string memory _name,
        externalEuint32 initialPrice,
        externalEuint32 totalSupply,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(sessions[sessionId].isActive, "Session is not active");
        require(!sessions[sessionId].isEnded, "Session has ended");
        require(bytes(_symbol).length > 0, "Stock symbol cannot be empty");
        require(bytes(_name).length > 0, "Stock name cannot be empty");
        
        uint256 stockId = stockCounter++;
        
        // Decrypt and validate the input
        euint32 decryptedPrice = FHE.asEuint32(initialPrice);
        euint32 decryptedSupply = FHE.asEuint32(totalSupply);
        
        // Calculate market cap
        euint32 marketCap = decryptedPrice.mul(decryptedSupply);
        
        stocks[stockId] = Stock({
            stockId: FHE.asEuint32(0), // Will be set properly later
            currentPrice: decryptedPrice,
            totalSupply: decryptedSupply,
            marketCap: marketCap,
            isActive: true,
            symbol: _symbol,
            name: _name,
            issuer: msg.sender
        });
        
        emit StockAdded(stockId, _symbol, msg.sender);
        return stockId;
    }
    
    function placeOrder(
        uint256 sessionId,
        uint256 stockId,
        externalEuint32 quantity,
        externalEuint32 price,
        bool isBuy,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(sessions[sessionId].isActive, "Session is not active");
        require(!sessions[sessionId].isEnded, "Session has ended");
        require(stocks[stockId].isActive, "Stock is not active");
        require(block.timestamp < sessions[sessionId].endTime, "Session has ended");
        
        uint256 orderId = orderCounter++;
        
        // Decrypt the input values
        euint32 decryptedQuantity = FHE.asEuint32(quantity);
        euint32 decryptedPrice = FHE.asEuint32(price);
        
        // Calculate total value
        euint32 totalValue = decryptedQuantity.mul(decryptedPrice);
        
        orders[orderId] = TradeOrder({
            orderId: FHE.asEuint32(0), // Will be set properly later
            stockId: FHE.asEuint32(stockId),
            quantity: decryptedQuantity,
            price: decryptedPrice,
            totalValue: totalValue,
            isBuy: isBuy,
            isExecuted: false,
            trader: msg.sender,
            timestamp: block.timestamp
        });
        
        emit OrderPlaced(orderId, stockId, msg.sender, isBuy);
        return orderId;
    }
    
    function executeOrder(
        uint256 sessionId,
        uint256 orderId,
        externalEuint32 executionPrice,
        bytes calldata inputProof
    ) public onlyVerifier {
        require(sessions[sessionId].isActive, "Session is not active");
        require(!sessions[sessionId].isEnded, "Session has ended");
        require(!orders[orderId].isExecuted, "Order already executed");
        
        // Decrypt execution price
        euint32 decryptedExecutionPrice = FHE.asEuint32(executionPrice);
        
        // Mark order as executed
        orders[orderId].isExecuted = true;
        orders[orderId].price = decryptedExecutionPrice;
        
        // Update portfolio and holdings
        address trader = orders[orderId].trader;
        uint256 stockId = uint256(FHE.asEuint32(orders[orderId].stockId));
        
        if (orders[orderId].isBuy) {
            // Add to holdings
            stockHoldings[stockId][trader] = stockHoldings[stockId][trader].add(orders[orderId].quantity);
        } else {
            // Remove from holdings
            stockHoldings[stockId][trader] = stockHoldings[stockId][trader].sub(orders[orderId].quantity);
        }
        
        // Update portfolio
        portfolios[trader].totalValue = portfolios[trader].totalValue.add(orders[orderId].totalValue);
        portfolios[trader].tradeCount = portfolios[trader].tradeCount.add(FHE.asEuint32(1));
        
        // Update session statistics
        sessions[sessionId].totalVolume = sessions[sessionId].totalVolume.add(orders[orderId].totalValue);
        sessions[sessionId].totalTrades = sessions[sessionId].totalTrades.add(FHE.asEuint32(1));
        
        emit OrderExecuted(orderId, stockId, trader);
        emit PortfolioUpdated(trader, uint32(FHE.asEuint32(portfolios[trader].totalValue)));
    }
    
    function endSession(uint256 sessionId) public {
        require(msg.sender == sessions[sessionId].creator, "Only session creator can end session");
        require(sessions[sessionId].isActive, "Session is not active");
        require(!sessions[sessionId].isEnded, "Session already ended");
        require(block.timestamp >= sessions[sessionId].endTime, "Session has not ended yet");
        
        sessions[sessionId].isActive = false;
        sessions[sessionId].isEnded = true;
        
        emit SessionEnded(sessionId, msg.sender);
    }
    
    function updateLeaderboard(
        uint256 sessionId,
        address trader,
        externalEuint32 score,
        bytes calldata inputProof
    ) public onlyVerifier {
        require(sessions[sessionId].isEnded, "Session must be ended to update leaderboard");
        
        uint256 entryId = leaderboardCounter++;
        
        leaderboard[entryId] = LeaderboardEntry({
            rank: FHE.asEuint32(0), // Will be calculated later
            score: FHE.asEuint32(score),
            trader: trader,
            isVerified: true
        });
        
        emit LeaderboardUpdated(sessionId, trader, 0); // Rank will be calculated off-chain
    }
    
    function getPortfolioValue(address trader) public view returns (euint32) {
        return portfolios[trader].totalValue;
    }
    
    function getStockPrice(uint256 stockId) public view returns (euint32) {
        return stocks[stockId].currentPrice;
    }
    
    function getSessionStats(uint256 sessionId) public view returns (
        euint32 totalParticipants,
        euint32 totalVolume,
        euint32 totalTrades
    ) {
        return (
            sessions[sessionId].totalParticipants,
            sessions[sessionId].totalVolume,
            sessions[sessionId].totalTrades
        );
    }
    
    function updateStockPrice(
        uint256 stockId,
        externalEuint32 newPrice,
        bytes calldata inputProof
    ) public onlyVerifier {
        require(stocks[stockId].isActive, "Stock is not active");
        
        euint32 decryptedPrice = FHE.asEuint32(newPrice);
        stocks[stockId].currentPrice = decryptedPrice;
        
        // Recalculate market cap
        stocks[stockId].marketCap = decryptedPrice.mul(stocks[stockId].totalSupply);
    }
    
    function setPlatformFeeRate(uint256 newRate) public onlyOwner {
        require(newRate <= 1000, "Fee rate cannot exceed 10%");
        platformFeeRate = newRate;
    }
    
    function withdrawFees() public onlyOwner {
        // Implementation for withdrawing platform fees
        // This would require additional logic for fee collection
    }
}
