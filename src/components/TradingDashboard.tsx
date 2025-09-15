import { useState, useEffect } from "react";
import StockCard from "./StockCard";
import PortfolioOverview from "./PortfolioOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity, Lock } from "lucide-react";

const TradingDashboard = () => {
  // Mock stock data with realistic values
  const [stocks] = useState([
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 182.45,
      change: 2.34,
      changePercent: 1.30,
      volume: "52.3M",
      marketCap: "2.85T",
      hiddenOrders: 23
    },
    {
      symbol: "TSLA", 
      name: "Tesla Inc.",
      price: 251.82,
      change: -8.44,
      changePercent: -3.24,
      volume: "89.7M",
      marketCap: "801B",
      hiddenOrders: 41
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 138.21,
      change: 1.87,
      changePercent: 1.37,
      volume: "28.1M", 
      marketCap: "1.74T",
      hiddenOrders: 18
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      price: 378.85,
      change: 4.22,
      changePercent: 1.13,
      volume: "31.4M",
      marketCap: "2.81T",
      hiddenOrders: 35
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      price: 875.28,
      change: 15.67,
      changePercent: 1.82,
      volume: "47.2M",
      marketCap: "2.16T",
      hiddenOrders: 67
    },
    {
      symbol: "META",
      name: "Meta Platforms",
      price: 295.89,
      change: -2.11,
      changePercent: -0.71,
      volume: "19.8M",
      marketCap: "756B",
      hiddenOrders: 28
    }
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Portfolio Overview */}
      <PortfolioOverview />

      {/* Market Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Market</h2>
          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4" />
            <span>Privacy Mode Active</span>
          </div>
        </div>
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stocks.map((stock) => (
          <StockCard key={stock.symbol} {...stock} />
        ))}
      </div>

      {/* Hidden Orders Summary */}
      <Card className="trading-card mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-accent" />
            <span>Hidden Orders Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-accent">212</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">$2.4M</div>
              <div className="text-sm text-muted-foreground">Buy Volume</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">$1.8M</div>
              <div className="text-sm text-muted-foreground">Sell Volume</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">04:27:12</div>
              <div className="text-sm text-muted-foreground">Reveal Timer</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingDashboard;