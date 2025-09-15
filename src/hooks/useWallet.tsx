import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();

  const connectWallet = async () => {
    try {
      // Use the first available connector (usually MetaMask)
      const connector = connectors[0];
      if (connector) {
        await connect({ connector });
        toast({
          title: "Wallet Connected",
          description: `Connected to ${address?.substring(0, 6)}...${address?.substring(38)}`,
        });
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed", 
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  return {
    isConnected,
    address: address || null,
    balance: balance ? parseFloat(balance.formatted).toFixed(4) : null,
    connecting: isPending,
    connectWallet,
    disconnectWallet,
  };
};