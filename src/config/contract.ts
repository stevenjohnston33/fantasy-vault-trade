// Contract configuration for FantasyVaultTradeV2
export const CONTRACT_ADDRESS = '0xd07Df04833AC66C480c6844955E34F54af475030';
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"name": "_symbol", "type": "string"},
      {"name": "_name", "type": "string"},
      {"name": "_initialPrice", "type": "uint256"},
      {"name": "_totalSupply", "type": "uint256"},
      {"name": "inputProof", "type": "bytes"}
    ],
    "name": "createStock",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_symbol", "type": "string"},
      {"name": "_orderType", "type": "uint256"},
      {"name": "_encryptedData", "type": "bytes32[5]"},
      {"name": "_inputProof", "type": "bytes"}
    ],
    "name": "placeOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_orderId", "type": "uint256"},
      {"name": "_encryptedData", "type": "bytes32[5]"},
      {"name": "_inputProof", "type": "bytes"}
    ],
    "name": "executeOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_trader", "type": "address"}
    ],
    "name": "getPortfolioValue",
    "outputs": [
      {"name": "", "type": "euint64"},
      {"name": "", "type": "euint64"},
      {"name": "", "type": "euint32"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_trader", "type": "address"},
      {"name": "_symbol", "type": "string"}
    ],
    "name": "getStockHolding",
    "outputs": [
      {"name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_orderId", "type": "uint256"}
    ],
    "name": "getOrderEncryptedData",
    "outputs": [
      {"name": "", "type": "euint32"},
      {"name": "", "type": "euint32"},
      {"name": "", "type": "euint32"},
      {"name": "", "type": "euint32"},
      {"name": "", "type": "euint32"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_symbol", "type": "string"},
      {"name": "_newPrice", "type": "uint256"}
    ],
    "name": "updateStockPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_symbol", "type": "string"}
    ],
    "name": "getStockInfo",
    "outputs": [
      {"name": "", "type": "string"},
      {"name": "", "type": "string"},
      {"name": "", "type": "uint256"},
      {"name": "", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllStockSymbols",
    "outputs": [
      {"name": "", "type": "string[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getOrderCount",
    "outputs": [
      {"name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_user", "type": "address"},
      {"name": "_canTrade", "type": "bool"}
    ],
    "name": "setACLPermissions",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {"name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "", "type": "string"}
    ],
    "name": "stocks",
    "outputs": [
      {"name": "symbol", "type": "string"},
      {"name": "name", "type": "string"},
      {"name": "currentPrice", "type": "uint256"},
      {"name": "totalSupply", "type": "euint64"},
      {"name": "marketCap", "type": "euint64"},
      {"name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "", "type": "uint256"}
    ],
    "name": "orders",
    "outputs": [
      {"name": "trader", "type": "address"},
      {"name": "orderId", "type": "euint32"},
      {"name": "orderType", "type": "euint32"},
      {"name": "quantity", "type": "euint32"},
      {"name": "price", "type": "euint32"},
      {"name": "stockSymbol", "type": "euint32"},
      {"name": "isExecuted", "type": "bool"},
      {"name": "timestamp", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "orderCounter",
    "outputs": [
      {"name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_symbol", "type": "string"}],
    "name": "getStockInfo",
    "outputs": [
      {"name": "", "type": "string"},
      {"name": "", "type": "string"},
      {"name": "", "type": "uint256"},
      {"name": "", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllStockSymbols",
    "outputs": [{"name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "name": "symbol", "type": "string"},
      {"indexed": false, "name": "name", "type": "string"},
      {"indexed": false, "name": "initialPrice", "type": "uint256"}
    ],
    "name": "StockCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "name": "orderId", "type": "uint256"},
      {"indexed": false, "name": "trader", "type": "address"},
      {"indexed": false, "name": "symbol", "type": "string"},
      {"indexed": false, "name": "quantity", "type": "uint256"},
      {"indexed": false, "name": "price", "type": "uint256"}
    ],
    "name": "OrderPlaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "name": "orderId", "type": "uint256"},
      {"indexed": false, "name": "trader", "type": "address"},
      {"indexed": false, "name": "symbol", "type": "string"},
      {"indexed": false, "name": "quantity", "type": "uint256"},
      {"indexed": false, "name": "price", "type": "uint256"}
    ],
    "name": "OrderExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "name": "trader", "type": "address"},
      {"indexed": false, "name": "totalValue", "type": "uint256"},
      {"indexed": false, "name": "totalPnl", "type": "uint256"}
    ],
    "name": "PortfolioUpdated",
    "type": "event"
  }
] as const;
