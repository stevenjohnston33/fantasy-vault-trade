import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

const PortfolioOverview = () => {
  const portfolioValue = 125847.32;
  const dailyChange = 2847.18;
  const dailyChangePercent = 2.31;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total Portfolio Value */}
      <Card className="trading-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${portfolioValue.toLocaleString()}</div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            <span>+12.4% total</span>
          </div>
        </CardContent>
      </Card>

      {/* Daily P&L */}
      <Card className="trading-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily P&L</CardTitle>
          {dailyChange > 0 ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${dailyChange > 0 ? 'price-up' : 'price-down'}`}>
            ${Math.abs(dailyChange).toLocaleString()}
          </div>
          <div className={`text-xs ${dailyChange > 0 ? 'text-success' : 'text-destructive'}`}>
            {dailyChange > 0 ? '+' : '-'}{dailyChangePercent}% today
          </div>
        </CardContent>
      </Card>

      {/* Buying Power */}
      <Card className="trading-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Buying Power</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$45,293</div>
          <div className="text-xs text-muted-foreground">Available to trade</div>
        </CardContent>
      </Card>

      {/* Session Timer */}
      <Card className="trading-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Session Ends</CardTitle>
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">04:27:12</div>
          <div className="text-xs text-muted-foreground">Orders reveal in</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioOverview;