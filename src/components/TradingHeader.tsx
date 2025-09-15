import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Shield, TrendingUp } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

const TradingHeader = () => {
  const { isConnected, address, balance } = useWallet();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Fantasy Finance
              </h1>
              <p className="text-xs text-muted-foreground">with Privacy</p>
            </div>
          </div>

          {/* Privacy Indicator */}
          <div className="hidden md:flex items-center space-x-2 bg-secondary/50 rounded-lg px-3 py-2">
            <Shield className="w-4 h-4 text-success" />
            <span className="text-sm font-medium">Orders Encrypted</span>
          </div>

          {/* Wallet Connect */}
          <ConnectButton 
            chainStatus="icon"
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
            showBalance={{
              smallScreen: false,
              largeScreen: true,
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default TradingHeader;