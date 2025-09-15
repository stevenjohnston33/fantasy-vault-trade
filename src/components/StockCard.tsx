import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Lock, Eye } from "lucide-react";
import { useState } from "react";
import OrderForm from "./OrderForm";

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  hiddenOrders?: number;
}

const StockCard = ({ 
  symbol, 
  name, 
  price, 
  change, 
  changePercent, 
  volume, 
  marketCap,
  hiddenOrders = 0 
}: StockCardProps) => {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const isPositive = change > 0;

  return (
    <Card className="trading-card hover:glow-primary transition-all duration-300 animate-fade-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">{symbol}</CardTitle>
            <p className="text-sm text-muted-foreground">{name}</p>
          </div>
          <div className="flex items-center space-x-2">
            {hiddenOrders > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Lock className="w-3 h-3 mr-1" />
                {hiddenOrders} hidden
              </Badge>
            )}
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Price Section */}
        <div>
          <div className="text-2xl font-bold">${price.toFixed(2)}</div>
          <div className={`flex items-center space-x-1 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
            <span>{isPositive ? '+' : ''}{change.toFixed(2)}</span>
            <span>({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Volume:</span>
            <div className="font-medium">{volume}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Market Cap:</span>
            <div className="font-medium">{marketCap}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gradient-success text-success-foreground border-0"
            onClick={() => {
              setOrderType('buy');
              setShowOrderForm(true);
            }}
          >
            BUY
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gradient-danger text-destructive-foreground border-0"
            onClick={() => {
              setOrderType('sell');
              setShowOrderForm(true);
            }}
          >
            SELL
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        {/* Order Form */}
        {showOrderForm && (
          <div className="mt-4">
            <OrderForm
              symbol={symbol}
              currentPrice={price}
              orderType={orderType}
              onClose={() => setShowOrderForm(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockCard;