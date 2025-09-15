// Environment configuration for Fantasy Vault Trade
export const ENV_CONFIG = {
  // Chain Configuration
  CHAIN_ID: 11155111, // Sepolia testnet
  RPC_URL: 'https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990',
  
  // Wallet Connect Configuration
  WALLET_CONNECT_PROJECT_ID: '2ec9743d0d0cd7fb94dee1a7e6d33475',
  
  // Infura Configuration
  INFURA_API_KEY: 'b18fb7e6ca7045ac83c41157ab93f990',
  RPC_URL_ALT: 'https://1rpc.io/sepolia',
  
  // Contract Configuration
  CONTRACT_ADDRESS: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // FantasyVaultTrade contract on Sepolia
  
  // FHE Configuration
  FHE_NETWORK_URL: 'https://api.zama.ai',
  FHE_APP_ID: 'fantasy-vault-trade',
  
  // Application Configuration
  APP_NAME: 'Fantasy Vault Trade',
  APP_DESCRIPTION: 'Privacy-focused fantasy trading platform with FHE encryption',
  APP_URL: 'https://fantasy-vault-trade.vercel.app',
  
  // Trading Configuration
  DEFAULT_SESSION_DURATION: 24 * 60 * 60, // 24 hours in seconds
  DEFAULT_LOCK_PERIOD: 60 * 60, // 1 hour in seconds
  PLATFORM_FEE_RATE: 50, // 0.5% in basis points
  
  // UI Configuration
  MAX_ORDERS_PER_PAGE: 20,
  REFRESH_INTERVAL: 30000, // 30 seconds
  TOAST_DURATION: 5000, // 5 seconds
} as const;

// Helper function to get environment variables with fallbacks
export const getEnvVar = (key: string, fallback: string = ''): string => {
  if (typeof window !== 'undefined') {
    // Client-side
    return (window as any).ENV?.[key] || fallback;
  }
  // Server-side
  return process.env[key] || fallback;
};

// Chain configuration for wagmi
export const CHAIN_CONFIG = {
  id: ENV_CONFIG.CHAIN_ID,
  name: 'Sepolia',
  network: 'sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [ENV_CONFIG.RPC_URL],
    },
    public: {
      http: [ENV_CONFIG.RPC_URL, ENV_CONFIG.RPC_URL_ALT],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://sepolia.etherscan.io',
    },
  },
  testnet: true,
} as const;
