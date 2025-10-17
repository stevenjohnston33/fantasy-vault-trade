import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';

export function useEthersSigner() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const getSigner = async () => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    const provider = new BrowserProvider(walletClient);
    return await provider.getSigner();
  };

  return {
    address,
    signer: walletClient,
    isConnected: !!address && !!walletClient,
    getSigner
  };
}
