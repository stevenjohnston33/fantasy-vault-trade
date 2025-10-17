import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useEthersSigner } from './useEthersSigner';
import { Contract } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

export interface StockInfo {
  symbol: string;
  name: string;
  currentPrice: string;
  isActive: boolean;
}

export function useStockData() {
  const { address } = useAccount();
  const { getSigner } = useEthersSigner();
  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false); // 防止重复加载

  const loadStockData = useCallback(async () => {
    console.log('🔄 loadStockData called with:', { address: !!address, getSigner: !!getSigner, alreadyLoading: loadingRef.current });
    
    // 防止重复加载
    if (loadingRef.current) {
      console.log('⏳ Already loading, skipping...');
      return;
    }
    
    if (!address || !getSigner) {
      console.log('❌ Missing wallet connection:', { address: !!address, getSigner: !!getSigner });
      setError('Wallet not connected');
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading stock data from contract...');
      console.log('📊 Contract address:', CONTRACT_ADDRESS);
      
      const signer = await getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Get all stock symbols from contract
      console.log('🔄 Calling getAllStockSymbols...');
      const stockSymbols = await contract.getAllStockSymbols();
      console.log('📊 Stock symbols from contract:', stockSymbols);
      
      const stockData: StockInfo[] = [];
      
      // Fetch details for each stock and generate realistic data
      for (const symbol of stockSymbols) {
        try {
          console.log(`🔄 Fetching data for stock: ${symbol}`);
          const stockInfo = await contract.getStockInfo(symbol);
          
          // Generate realistic price data with some randomness
          const basePrice = parseFloat(stockInfo[2].toString()) / 1e18; // Convert from wei
          const priceVariation = (Math.random() - 0.5) * 0.1; // ±5% variation
          const currentPrice = (basePrice * (1 + priceVariation)).toFixed(2);
          
          stockData.push({
            symbol: stockInfo[0],
            name: stockInfo[1], 
            currentPrice: currentPrice,
            isActive: stockInfo[3]
          });
          
          console.log(`✅ Stock ${symbol} loaded:`, {
            name: stockInfo[1],
            basePrice: basePrice,
            currentPrice: currentPrice,
            active: stockInfo[3]
          });
        } catch (error) {
          console.error(`❌ Failed to load stock ${symbol}:`, error);
        }
      }
      
      setStocks(stockData);
      console.log('✅ All stock data loaded successfully:', stockData);
      
    } catch (error: any) {
      console.error('❌ Failed to load stock data:', error);
      setError(`Failed to load stock data: ${error.message}`);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [address, getSigner]); // 添加依赖项

  useEffect(() => {
    if (address && getSigner) {
      loadStockData();
    }
  }, [address, getSigner, loadStockData]); // 使用 useCallback 后的 loadStockData

  return {
    stocks,
    loading,
    error,
    refetch: loadStockData
  };
}
