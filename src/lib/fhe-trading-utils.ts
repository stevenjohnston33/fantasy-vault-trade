import { Contract } from 'ethers';

// FHE Handle 转换工具
export const convertHex = (handle: any): string => {
  let hex = '';
  if (handle instanceof Uint8Array) {
    hex = `0x${Array.from(handle).map(b => b.toString(16).padStart(2, '0')).join('')}`;
  } else if (typeof handle === 'string') {
    hex = handle.startsWith('0x') ? handle : `0x${handle}`;
  } else if (Array.isArray(handle)) {
    hex = `0x${handle.map(b => b.toString(16).padStart(2, '0')).join('')}`;
  } else {
    hex = `0x${handle.toString()}`;
  }
  
  // 确保恰好 32 字节 (66 字符包含 0x)
  if (hex.length < 66) {
    hex = hex.padEnd(66, '0');
  } else if (hex.length > 66) {
    hex = hex.substring(0, 66);
  }
  return hex;
};

// 字符串到数字的安全转换 (避免 32位溢出)
export const getStringValue = (str: string): number => {
  const first6 = str.substring(0, 6);
  let value = 0;
  for (let i = 0; i < first6.length; i++) {
    value = value * 100 + first6.charCodeAt(i);
  }
  return Math.min(value, 2000000000); // 限制在 32位范围内
};

// 数字到字符串的反向转换
export const getStringDescription = (value: number): string => {
  let result = '';
  let num = value;
  while (num > 0 && result.length < 6) {
    const charCode = num % 100;
    if (charCode >= 32 && charCode <= 126) {
      result = String.fromCharCode(charCode) + result;
    }
    num = Math.floor(num / 100);
  }
  return result ? `${result}...` : 'Unknown';
};

// 加密交易订单
export const encryptTradingOrder = async (
  instance: any,
  contractAddress: string,
  userAddress: string,
  orderData: {
    stockSymbol: string;
    quantity: number;
    price: number;
    orderType: number; // 1: Buy, 2: Sell
    orderId: number;
  }
) => {
  try {
    console.log('🔄 Creating encrypted trading order...');
    
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    
    // 添加加密数据
    input.add32(BigInt(orderData.orderId)); // 订单ID
    input.add8(orderData.orderType); // 订单类型
    input.add32(BigInt(orderData.quantity)); // 数量
    input.add32(BigInt(Math.floor(orderData.price * 100))); // 价格 (转换为整数)
    input.add32(getStringValue(orderData.stockSymbol)); // 股票代码
    
    console.log('🔄 Encrypting order data...');
    const encryptedInput = await input.encrypt();
    
    // 转换 handles 为正确的格式
    const handles = encryptedInput.handles.map(convertHex);
    const proof = `0x${Array.from(encryptedInput.inputProof)
      .map(b => b.toString(16).padStart(2, '0')).join('')}`;
    
    console.log('✅ Order encrypted successfully');
    return { handles, proof };
  } catch (error) {
    console.error('❌ Failed to encrypt trading order:', error);
    throw error;
  }
};

// 解密交易数据
export const decryptTradingData = async (
  instance: any,
  contract: Contract,
  orderId: string
) => {
  try {
    console.log('🔄 Decrypting trading data...');
    
    const encryptedData = await contract.getOrderEncryptedData(orderId);
    
    // 构建 handle-contract 对
    const handleContractPairs = [
      { handle: encryptedData[0], contractAddress: contract.target },
      { handle: encryptedData[1], contractAddress: contract.target },
      { handle: encryptedData[2], contractAddress: contract.target },
      { handle: encryptedData[3], contractAddress: contract.target },
      { handle: encryptedData[4], contractAddress: contract.target }
    ];
    
    console.log('🔄 Decrypting handles...');
    const result = await instance.userDecrypt(handleContractPairs);
    
    // 解析解密结果
    const decryptedData = {
      orderId: result[encryptedData[0]]?.toString() || '0',
      orderType: Number(result[encryptedData[1]]) || 0,
      quantity: result[encryptedData[2]]?.toString() || '0',
      price: Number(result[encryptedData[3]]) / 100 || 0,
      stockSymbol: getStringDescription(Number(result[encryptedData[4]]) || 0)
    };
    
    console.log('✅ Trading data decrypted successfully');
    return decryptedData;
  } catch (error) {
    console.error('❌ Failed to decrypt trading data:', error);
    throw error;
  }
};

// 加密投资组合数据
export const encryptPortfolioData = async (
  instance: any,
  contractAddress: string,
  userAddress: string,
  portfolioData: {
    totalValue: number;
    totalPnl: number;
    tradeCount: number;
    userId: number;
  }
) => {
  try {
    console.log('🔄 Creating encrypted portfolio data...');
    
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    
    // 添加加密数据
    input.add32(BigInt(Math.floor(portfolioData.totalValue * 100))); // 总价值
    input.add32(BigInt(Math.floor(portfolioData.totalPnl * 100))); // 总盈亏
    input.add32(BigInt(portfolioData.tradeCount)); // 交易次数
    input.add32(BigInt(portfolioData.userId)); // 用户ID
    
    console.log('🔄 Encrypting portfolio data...');
    const encryptedInput = await input.encrypt();
    
    const handles = encryptedInput.handles.map(convertHex);
    const proof = `0x${Array.from(encryptedInput.inputProof)
      .map(b => b.toString(16).padStart(2, '0')).join('')}`;
    
    console.log('✅ Portfolio data encrypted successfully');
    return { handles, proof };
  } catch (error) {
    console.error('❌ Failed to encrypt portfolio data:', error);
    throw error;
  }
};

// 测试 FHE 功能
export const testFHEFunctionality = async (instance: any) => {
  try {
    console.log('🧪 Testing FHE functionality...');
    
    const testData = {
      orderId: 1,
      orderType: 1,
      quantity: 100,
      price: 50.25,
      stockSymbol: 'AAPL'
    };
    
    // 测试加密
    const encrypted = await encryptTradingOrder(
      instance,
      '0x0000000000000000000000000000000000000000', // 测试地址
      '0x0000000000000000000000000000000000000000', // 测试地址
      testData
    );
    
    console.log('✅ FHE Test Successful! Encrypted', encrypted.handles.length, 'handles');
    return true;
  } catch (error) {
    console.error('❌ FHE Test Failed:', error);
    return false;
  }
};
