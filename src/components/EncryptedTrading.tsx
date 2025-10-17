import React, { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useStockData } from '../hooks/useStockData';
import { encryptTradingOrder, decryptTradingData, testFHEFunctionality } from '../lib/fhe-trading-utils';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';
import { Contract } from 'ethers';

export default function EncryptedTrading() {
  const { address } = useAccount();
  const { instance, isLoading: fheLoading, error: fheError } = useZamaInstance();
  const { getSigner } = useEthersSigner();
  const { stocks, loading: stocksLoading, error: stocksError, refetch: refetchStocks } = useStockData();
  
  const [selectedStock, setSelectedStock] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [orderType, setOrderType] = useState(1); // 1: Buy, 2: Sell
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  // 检查是否可以提交
  const canSubmit = useMemo(() => {
    return selectedStock && quantity && price && !submitting && instance && address;
  }, [selectedStock, quantity, price, submitting, instance, address]);

  // 测试 FHE 功能
  const testFHE = async () => {
    if (!instance) {
      alert('FHE instance not ready');
      return;
    }
    
    setTesting(true);
    try {
      const success = await testFHEFunctionality(instance);
      if (success) {
        alert('✅ FHE Test Successful!');
      } else {
        alert('❌ FHE Test Failed!');
      }
    } catch (error) {
      console.error('FHE Test Error:', error);
      alert('❌ FHE Test Error: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  // 提交加密交易订单
  const submitOrder = async () => {
    if (!instance || !address || !getSigner) {
      alert('Missing wallet or encryption service');
      return;
    }
    
    if (!canSubmit) {
      alert('Please fill all fields');
      return;
    }
    
    setSubmitting(true);
    try {
      console.log('🔄 Creating encrypted trading order...');
      
      // 准备订单数据
      const orderData = {
        stockSymbol: selectedStock,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        orderType: orderType,
        orderId: Date.now() // 使用时间戳作为订单ID
      };
      
      // 加密订单数据
      const encryptedData = await encryptTradingOrder(
        instance,
        address,
        orderData
      );
      
      console.log('🔄 Submitting encrypted order to blockchain...');
      
      // 获取签名者并创建合约实例
      const signer = await getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // 提交加密订单
      const tx = await contract.placeOrder(
        selectedStock,
        orderType,
        encryptedData.handles,
        encryptedData.proof
      );
      
      console.log('⏳ Waiting for transaction confirmation...');
      await tx.wait();
      
      console.log('✅ Order submitted successfully!');
      alert('✅ Encrypted order submitted successfully!');
      
      // 重置表单
      setQuantity('');
      setPrice('');
      
    } catch (error) {
      console.error('❌ Order submission failed:', error);
      alert('❌ Order submission failed: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 解密并查看订单
  const viewOrder = async (orderId: string) => {
    if (!instance || !getSigner) {
      alert('Missing wallet or encryption service');
      return;
    }
    
    try {
      console.log('🔄 Decrypting order data...');
      
      const signer = await getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const decryptedData = await decryptTradingData(contract, contract, orderId);
      
      console.log('✅ Order decrypted:', decryptedData);
      alert(`Order Details:
        ID: ${decryptedData.orderId}
        Type: ${decryptedData.orderType === 1 ? 'Buy' : 'Sell'}
        Quantity: ${decryptedData.quantity}
        Price: $${decryptedData.price}
        Symbol: ${decryptedData.stockSymbol}`);
        
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      alert('❌ Failed to decrypt order: ' + error.message);
    }
  };

  if (fheLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Initializing FHE encryption service...</p>
        </div>
      </div>
    );
  }

  if (fheError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">FHE Initialization Error</h3>
        <p className="text-red-600">{fheError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🔐 Encrypted Trading Platform</h2>
          <button
            onClick={refetchStocks}
            disabled={stocksLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {stocksLoading ? 'Loading...' : 'Refresh Stocks'}
          </button>
        </div>
        
        {/* FHE 状态指示器 */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <span className="text-green-800 font-medium">FHE Encryption Ready</span>
          </div>
          <p className="text-green-600 text-sm mt-1">
            All trading data is encrypted before blockchain submission
          </p>
        </div>

        {/* 测试 FHE 功能 */}
        <div className="mb-6">
          <button
            onClick={testFHE}
            disabled={testing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test FHE Functionality'}
          </button>
        </div>

        {/* 交易表单 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Symbol
            </label>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={stocksLoading}
            >
              <option value="">Select a stock...</option>
              {stocks.map(stock => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} - {stock.name} (${stock.currentPrice})
                </option>
              ))}
            </select>
            {stocksLoading && <p className="text-sm text-gray-500 mt-1">Loading stocks from contract...</p>}
            {stocksError && <p className="text-sm text-red-500 mt-1">Error loading stocks: {stocksError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Type
            </label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Buy</option>
              <option value={2}>Sell</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="mt-6">
          <button
            onClick={submitOrder}
            disabled={!canSubmit}
            className="w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Encrypting & Submitting...' : 'Submit Encrypted Order'}
          </button>
        </div>

        {/* 连接钱包提示 */}
        {!address && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Please connect your wallet to start encrypted trading
            </p>
          </div>
        )}

        {/* 功能说明 */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">🔐 FHE Encryption Features</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• All trading data is encrypted before blockchain submission</li>
            <li>• Order details remain private and secure</li>
            <li>• Only you can decrypt your trading history</li>
            <li>• Real-time encrypted calculations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}