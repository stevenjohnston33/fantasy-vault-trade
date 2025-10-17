import { createRoot } from "react-dom/client";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from "./App.tsx";
import { config } from './lib/wallet-config';
import './lib/ethereum-fix'; // Fix ethereum injection conflicts
import "./index.css";
import '@rainbow-me/rainbowkit/styles.css';

console.log('🚀 Application starting...');
console.log('📊 Environment:', {
  nodeEnv: import.meta.env.MODE,
  vite: import.meta.env.VITE,
  hasEthereum: !!window.ethereum,
  hasRelayerSDK: !!window.relayerSDK
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <App />
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
