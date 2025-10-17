// Contract configuration for FantasyVaultTradeV2
export const CONTRACT_ADDRESS = '0xb420eecda221E7BbbdEa4383CFef5eef68c2ddf3';
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
      {"name": "", "type": "bytes32"},
      {"name": "", "type": "bytes32"},
      {"name": "", "type": "bytes32"}
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
      {"name": "", "type": "bytes32"},
      {"name": "", "type": "bytes32"},
      {"name": "", "type": "bytes32"},
      {"name": "", "type": "bytes32"},
      {"name": "", "type": "bytes32"}
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
      {"name": "totalSupply", "type": "bytes32"},
      {"name": "marketCap", "type": "bytes32"},
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
      {"name": "orderId", "type": "bytes32"},
      {"name": "orderType", "type": "bytes32"},
      {"name": "quantity", "type": "bytes32"},
      {"name": "price", "type": "bytes32"},
      {"name": "stockSymbol", "type": "bytes32"},
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
