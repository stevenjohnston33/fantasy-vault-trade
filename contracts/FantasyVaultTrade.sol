// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, euint64, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract FantasyVaultTradeV2 is SepoliaConfig {
    using FHE for *;
    
    // Simplified stock structure
    struct Stock {
        string symbol;
        string name;
        uint256 currentPrice; // Plaintext price for display
        euint64 totalSupply; // Encrypted total supply
        euint64 marketCap; // Encrypted market cap
        bool isActive;
    }
    
    // Encrypted trading order structure
    struct TradeOrder {
        address trader;
        euint32 orderId;
        euint32 orderType; // 1: Buy, 2: Sell
        euint32 quantity;
        euint32 price; // Price * 100 stored
        euint32 stockSymbol; // Stock symbol numeric representation
        bool isExecuted;
        uint256 timestamp;
    }
    
    // Encrypted portfolio structure
    struct Portfolio {
        address owner;
        euint64 totalValue; // Encrypted total value
        euint64 totalPnl; // Encrypted total PnL
        euint32 tradeCount; // Encrypted trade count
        mapping(string => uint256) holdings; // Plaintext holdings
    }
    
    // State variables
    address public owner;
    mapping(string => Stock) public stocks;
    mapping(uint256 => TradeOrder) public orders;
    mapping(address => Portfolio) public portfolios;
    uint256 public orderCounter;
    string[] public stockSymbols;
    
    // Events
    event StockCreated(string symbol, string name, uint256 initialPrice);
    event OrderPlaced(uint256 orderId, address trader, string symbol, uint256 quantity, uint256 price);
    event OrderExecuted(uint256 orderId, address trader, string symbol, uint256 quantity, uint256 price);
    event PortfolioUpdated(address trader, uint256 totalValue, uint256 totalPnl);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // Create stock
    function createStock(
        string memory _symbol,
        string memory _name,
        uint256 _initialPrice,
        uint256 _totalSupply,
        bytes calldata inputProof
    ) external onlyOwner {
        require(bytes(_symbol).length > 0, "Symbol cannot be empty");
        require(_initialPrice > 0, "Price must be positive");
        
        euint64 encryptedSupply = FHE.asEuint64(uint64(_totalSupply));
        euint64 encryptedMarketCap = encryptedSupply.mul(FHE.asEuint64(uint64(_initialPrice)));
        
        stocks[_symbol] = Stock({
            symbol: _symbol,
            name: _name,
            currentPrice: _initialPrice,
            totalSupply: encryptedSupply,
            marketCap: encryptedMarketCap,
            isActive: true
        });
        
        stockSymbols.push(_symbol);
        emit StockCreated(_symbol, _name, _initialPrice);
    }
    
    // Place order (encrypted data)
    function placeOrder(
        string memory _symbol,
        uint256 _orderType,
        bytes32[5] calldata _encryptedData, // Encrypted order data
        bytes calldata _inputProof
    ) external {
        require(stocks[_symbol].isActive, "Stock not active");
        require(_orderType == 1 || _orderType == 2, "Invalid order type");
        
        orderCounter++;
        
        orders[orderCounter] = TradeOrder({
            trader: msg.sender,
            orderId: FHE.asEuint32(uint32(orderCounter)),
            orderType: FHE.asEuint32(uint32(_orderType)),
            quantity: FHE.asEuint32(0), // Will be set from encrypted data
            price: FHE.asEuint32(0), // Will be set from encrypted data
            stockSymbol: FHE.asEuint32(0), // Will be set from encrypted data
            isExecuted: false,
            timestamp: block.timestamp
        });
        
        emit OrderPlaced(orderCounter, msg.sender, _symbol, 0, 0); // Quantity is 0 because encrypted
    }
    
    // Execute order
    function executeOrder(
        uint256 _orderId,
        bytes32[5] calldata _encryptedData,
        bytes calldata _inputProof
    ) external onlyOwner {
        require(_orderId <= orderCounter, "Order does not exist");
        require(!orders[_orderId].isExecuted, "Order already executed");
        
        orders[_orderId].isExecuted = true;
        
        // Update portfolio (encrypted data)
        portfolios[orders[_orderId].trader].tradeCount.add(FHE.asEuint32(1));
        
        emit OrderExecuted(_orderId, orders[_orderId].trader, "", 0, 0);
    }
    
    // Get portfolio value (returns encrypted data)
    function getPortfolioValue(address _trader) external view returns (euint64, euint64, euint32) {
        Portfolio storage portfolio = portfolios[_trader];
        return (
            portfolio.totalValue,
            portfolio.totalPnl,
            portfolio.tradeCount
        );
    }
    
    // Get stock holding (plaintext)
    function getStockHolding(address _trader, string memory _symbol) external view returns (uint256) {
        return portfolios[_trader].holdings[_symbol];
    }
    
    // Get order information (returns encrypted data)
    function getOrderEncryptedData(uint256 _orderId) external view returns (euint32, euint32, euint32, euint32, euint32) {
        TradeOrder storage order = orders[_orderId];
        return (
            order.orderId,
            order.orderType,
            order.quantity,
            order.price,
            order.stockSymbol
        );
    }
    
    // Update stock price
    function updateStockPrice(string memory _symbol, uint256 _newPrice) external onlyOwner {
        require(stocks[_symbol].isActive, "Stock not active");
        require(_newPrice > 0, "Price must be positive");
        
        stocks[_symbol].currentPrice = _newPrice;
        // Update encrypted market cap
        stocks[_symbol].marketCap = stocks[_symbol].totalSupply.mul(FHE.asEuint64(uint64(_newPrice)));
    }
    
    // Get stock information
    function getStockInfo(string memory _symbol) external view returns (
        string memory,
        string memory,
        uint256,
        bool
    ) {
        Stock storage stock = stocks[_symbol];
        return (
            stock.symbol,
            stock.name,
            stock.currentPrice,
            stock.isActive
        );
    }
    
    // Get all stock symbols
    function getAllStockSymbols() external view returns (string[] memory) {
        return stockSymbols;
    }
    
    // Get order count
    function getOrderCount() external view returns (uint256) {
        return orderCounter;
    }
    
    // Set ACL permissions
    function setACLPermissions(address _user, bool _canTrade) external onlyOwner {
        // ACL permission control logic can be added here
        // Currently simplified implementation
    }
}
