import { useState, useEffect } from 'react';
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

  const loadStockData = async () => {
    if (!address || !getSigner) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading stock data from contract...');
      
      const signer = await getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Get all stock symbols from contract
      const stockSymbols = await contract.getAllStockSymbols();
      console.log('📊 Stock symbols from contract:', stockSymbols);
      
      const stockData: StockInfo[] = [];
      
      // Fetch details for each stock
      for (const symbol of stockSymbols) {
        try {
          console.log(`🔄 Fetching data for stock: ${symbol}`);
          const stockInfo = await contract.getStockInfo(symbol);
          
          stockData.push({
            symbol: stockInfo[0],
            name: stockInfo[1], 
            currentPrice: stockInfo[2].toString(),
            isActive: stockInfo[3]
          });
          
          console.log(`✅ Stock ${symbol} loaded:`, {
            name: stockInfo[1],
            price: stockInfo[2].toString(),
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address && getSigner) {
      loadStockData();
    }
  }, [address, getSigner]);

  return {
    stocks,
    loading,
    error,
    refetch: loadStockData
  };
}
