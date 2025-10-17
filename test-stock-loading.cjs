// Test stock data loading
const { ethers } = require("hardhat");

async function testStockLoading() {
  console.log("🧪 Testing stock data loading...");
  
  try {
    // Use public RPC endpoint to test contract connection
    const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
    const contractAddress = "0xb420eecda221E7BbbdEa4383CFef5eef68c2ddf3";
    
    // Simplified ABI with only the methods we need
    const contractABI = [
      "function getAllStockSymbols() view returns (string[])",
      "function getStockInfo(string _symbol) view returns (string, string, uint256, bool)"
    ];
    
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    console.log("🔄 Calling getAllStockSymbols...");
    const stockSymbols = await contract.getAllStockSymbols();
    console.log("✅ Stock symbols:", stockSymbols);
    
    if (stockSymbols.length > 0) {
      console.log("🔄 Testing getStockInfo for first stock...");
      const stockInfo = await contract.getStockInfo(stockSymbols[0]);
      console.log("✅ Stock info:", {
        symbol: stockInfo[0],
        name: stockInfo[1],
        price: `$${ethers.formatEther(stockInfo[2])} USD`,
        active: stockInfo[3]
      });
    }
    
    console.log("🎉 Contract connection test successful!");
    
  } catch (error) {
    console.error("❌ Contract connection test failed:", error.message);
  }
}

testStockLoading();
