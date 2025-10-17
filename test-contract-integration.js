const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing contract integration...");
  
  // Get contract instance
  const contractAddress = "0xd07Df04833AC66C480c6844955E34F54af475030";
  const FantasyVaultTradeV2 = await ethers.getContractFactory("FantasyVaultTradeV2");
  const contract = FantasyVaultTradeV2.attach(contractAddress);
  
  console.log("📊 Contract address:", contractAddress);
  
  // Test getting all stock symbols
  console.log("🔄 Fetching all stock symbols...");
  const stockSymbols = await contract.getAllStockSymbols();
  console.log("✅ Stock symbols:", stockSymbols);
  
  // Test getting detailed information for each stock
  for (const symbol of stockSymbols) {
    console.log(`\n📈 Testing stock: ${symbol}`);
    try {
      const stockInfo = await contract.getStockInfo(symbol);
      console.log(`  - Name: ${stockInfo[1]}`);
      console.log(`  - Price: ${ethers.formatEther(stockInfo[2])} ETH`);
      console.log(`  - Active: ${stockInfo[3]}`);
    } catch (error) {
      console.error(`  ❌ Error fetching ${symbol}:`, error.message);
    }
  }
  
  // Test getting order count
  console.log("\n📊 Testing order counter...");
  const orderCount = await contract.orderCounter();
  console.log("✅ Order count:", orderCount.toString());
  
  console.log("\n🎉 Contract integration test completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
