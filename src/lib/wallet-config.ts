import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { ENV_CONFIG } from '../config/env';

// Get projectId from https://cloud.walletconnect.com
export const config = getDefaultConfig({
  appName: ENV_CONFIG.APP_NAME,
  projectId: ENV_CONFIG.WALLET_CONNECT_PROJECT_ID,
  chains: [sepolia],
  ssr: false, // If your dApp uses server side rendering (SSR)
});
