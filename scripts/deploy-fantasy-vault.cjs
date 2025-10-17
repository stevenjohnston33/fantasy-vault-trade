const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting Fantasy Vault Trade deployment to Sepolia testnet...");
  
  // 检查环境变量
  if (!process.env.PRIVATE_KEY) {
    throw new Error("❌ Please set PRIVATE_KEY environment variable");
  }
  
  console.log("✅ Environment variables check passed");
  
  // 获取部署者
  const [deployer] = await ethers.getSigners();
  console.log("📦 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  
  // 部署 FantasyVaultTradeV2 合约
  console.log("📦 Contract factory created successfully");
  const FantasyVaultTradeV2 = await ethers.getContractFactory("FantasyVaultTradeV2");
  
  console.log("⏳ Deploying FantasyVaultTradeV2 contract...");
  const fantasyVault = await FantasyVaultTradeV2.deploy();
  await fantasyVault.waitForDeployment();
  
  const contractAddress = await fantasyVault.getAddress();
  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  
  // 等待几个区块确认
  console.log("⏳ Waiting for confirmations...");
  await fantasyVault.deploymentTransaction().wait(3);
  
  // 验证合约
  console.log("🔍 Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verification successful");
  } catch (error) {
    console.log("⚠️ Contract verification failed:", error.message);
  }
  
  // 保存部署信息
  const deploymentInfo = {
    network: "sepolia",
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: fantasyVault.deploymentTransaction().hash,
    blockNumber: await ethers.provider.getBlockNumber()
  };
  
  const deploymentPath = path.join(__dirname, '../deployment-info.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Deployment info saved to deployment-info.json");
  
  // 更新 .env 文件
  const envPath = path.join(__dirname, '../.env');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // 更新或添加合约地址
  const contractAddressLine = `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`;
  if (envContent.includes('NEXT_PUBLIC_CONTRACT_ADDRESS=')) {
    envContent = envContent.replace(/NEXT_PUBLIC_CONTRACT_ADDRESS=.*/, contractAddressLine);
  } else {
    envContent += `\n${contractAddressLine}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env file updated successfully");
  
  // Initialize stock data
  console.log("📈 Initializing stock data...");
  const stockData = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      initialPrice: ethers.parseEther("150.00"),
      totalSupply: 1000000
    },
    {
      symbol: "GOOGL", 
      name: "Alphabet Inc.",
      initialPrice: ethers.parseEther("2800.00"),
      totalSupply: 500000
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation", 
      initialPrice: ethers.parseEther("300.00"),
      totalSupply: 800000
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      initialPrice: ethers.parseEther("200.00"),
      totalSupply: 1200000
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      initialPrice: ethers.parseEther("3200.00"),
      totalSupply: 600000
    }
  ];
  
  for (const stock of stockData) {
    try {
      console.log(`📊 Creating stock: ${stock.symbol} - ${stock.name}`);
      const tx = await fantasyVault.createStock(
        stock.symbol,
        stock.name,
        stock.initialPrice,
        stock.totalSupply,
        "0x" // Empty proof for initialization
      );
      await tx.wait();
      console.log(`✅ Stock ${stock.symbol} created successfully`);
    } catch (error) {
      console.error(`❌ Failed to create stock ${stock.symbol}:`, error.message);
    }
  }
  
  console.log("🎉 Deployment and initialization completed successfully!");
  console.log("📊 Deployment Summary:");
  console.log("  - Contract Address:", contractAddress);
  console.log("  - Network: Sepolia");
  console.log("  - Deployer:", deployer.address);
  console.log("  - Transaction Hash:", fantasyVault.deploymentTransaction().hash);
  console.log("  - Stocks Initialized:", stockData.length);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
