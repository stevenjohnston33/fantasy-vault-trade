import React, { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useStockData } from '../hooks/useStockData';
import { encryptTradingOrder, decryptTradingData, testFHEFunctionality } from '../lib/fhe-trading-utils';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';
import { Contract, ethers } from 'ethers';

export default function EncryptedTrading() {
  const { address } = useAccount();
  const { instance, isLoading: fheLoading, error: fheError } = useZamaInstance();
  const { getSigner } = useEthersSigner();
  const { stocks, loading: stocksLoading, error: stocksError, refetch: refetchStocks } = useStockData();
  
  const [selectedStock, setSelectedStock] = useState('');
  const [quantity, setQuantity] = useState('100'); // 默认下单数量100
  const [price, setPrice] = useState('');
  const [orderType, setOrderType] = useState(1); // 1: Buy, 2: Sell
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);
  
  // 创建股票相关状态
  const [showCreateStock, setShowCreateStock] = useState(false);
  const [newStockSymbol, setNewStockSymbol] = useState('');
  const [newStockName, setNewStockName] = useState('');
  const [newStockPrice, setNewStockPrice] = useState('');
  const [newStockSupply, setNewStockSupply] = useState('');
  const [creatingStock, setCreatingStock] = useState(false);

  // 当选择股票时自动填充价格
  useEffect(() => {
    if (selectedStock && stocks.length > 0) {
      const stock = stocks.find(s => s.symbol === selectedStock);
      if (stock) {
        setPrice(stock.currentPrice);
        console.log(`📊 Auto-filled price for ${selectedStock}: $${stock.currentPrice}`);
      }
    }
  }, [selectedStock, stocks]);

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

  // 创建新股票
  const createStock = async () => {
    if (!getSigner || !newStockSymbol || !newStockName || !newStockPrice || !newStockSupply) {
      alert('Please fill all fields');
      return;
    }

    setCreatingStock(true);
    try {
      console.log('🔄 Creating new stock...');
      
      const signer = await getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // 转换价格和供应量为正确的格式
      const priceInWei = ethers.parseEther(newStockPrice);
      const supply = BigInt(newStockSupply);
      
      const tx = await contract.createStock(
        newStockSymbol,
        newStockName,
        priceInWei,
        supply,
        "0x" // 空的 proof，用于初始化
      );
      
      console.log('⏳ Waiting for transaction confirmation...');
      await tx.wait();
      
      console.log('✅ Stock created successfully!');
      alert('✅ Stock created successfully!');
      
      // 重置表单
      setNewStockSymbol('');
      setNewStockName('');
      setNewStockPrice('');
      setNewStockSupply('');
      setShowCreateStock(false);
      
      // 刷新股票列表
      refetchStocks();
      
    } catch (error: any) {
      console.error('❌ Failed to create stock:', error);
      alert('❌ Failed to create stock: ' + error.message);
    } finally {
      setCreatingStock(false);
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
          <h2 className="text-2xl font-bold text-gray-900">🔐 FHE Encrypted Trading</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateStock(!showCreateStock)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {showCreateStock ? 'Cancel' : 'Create Stock'}
            </button>
            <button
              onClick={refetchStocks}
              disabled={stocksLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {stocksLoading ? 'Loading...' : 'Refresh Stocks'}
            </button>
            <button
              onClick={testFHE}
              disabled={testing || !instance}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test FHE'}
            </button>
          </div>
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

        {/* 创建股票表单 */}
        {showCreateStock && (
          <div className="mb-6 p-6 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">📈 Create New Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Symbol
                </label>
                <input
                  type="text"
                  value={newStockSymbol}
                  onChange={(e) => setNewStockSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g., AAPL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={newStockName}
                  onChange={(e) => setNewStockName(e.target.value)}
                  placeholder="e.g., Apple Inc."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Price (ETH)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newStockPrice}
                  onChange={(e) => setNewStockPrice(e.target.value)}
                  placeholder="e.g., 150.00"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Supply
                </label>
                <input
                  type="number"
                  value={newStockSupply}
                  onChange={(e) => setNewStockSupply(e.target.value)}
                  placeholder="e.g., 1000000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={createStock}
                disabled={creatingStock || !newStockSymbol || !newStockName || !newStockPrice || !newStockSupply}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingStock ? 'Creating...' : 'Create Stock'}
              </button>
              <button
                onClick={() => setShowCreateStock(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}


        {/* 交易表单 - 只在未显示创建股票表单时显示 */}
        {!showCreateStock && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Symbol
            </label>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              disabled={stocksLoading}
            >
              <option value="">Select a stock...</option>
              {stocks.map(stock => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} - {stock.name} - ${stock.currentPrice}
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
              placeholder="Default: 100"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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

        {/* 选中股票信息 */}
        {selectedStock && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Selected Stock Information</h3>
            {(() => {
              const stock = stocks.find(s => s.symbol === selectedStock);
              return stock ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Symbol: <span className="font-medium">{stock.symbol}</span></p>
                    <p className="text-sm text-gray-600">Name: <span className="font-medium">{stock.name}</span></p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Price: <span className="font-medium text-green-600">${stock.currentPrice}</span></p>
                    <p className="text-sm text-gray-600">Status: <span className="font-medium text-green-600">{stock.isActive ? 'Active' : 'Inactive'}</span></p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Loading stock information...</p>
              );
            })()}
          </div>
        )}

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
          </>
        )}
      </div>
    </div>
  );
}