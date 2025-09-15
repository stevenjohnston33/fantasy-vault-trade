import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderFormProps {
  symbol: string;
  currentPrice: number;
  orderType: 'buy' | 'sell';
  onClose: () => void;
}

const OrderForm = ({ symbol, currentPrice, orderType, onClose }: OrderFormProps) => {
  const [quantity, setQuantity] = useState('');
  const [orderMethod, setOrderMethod] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState(currentPrice.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const price = orderMethod === 'market' ? currentPrice : parseFloat(limitPrice);
    return (qty * price).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate order processing
    setTimeout(() => {
      toast({
        title: "Order Encrypted",
        description: `${orderType.toUpperCase()} order for ${quantity} shares of ${symbol} has been encrypted and queued`,
      });
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  return (
    <Card className="trading-card animate-fade-slide-up">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {orderType === 'buy' ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
            <span className={orderType === 'buy' ? 'text-success' : 'text-destructive'}>
              {orderType.toUpperCase()} {symbol}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Lock className="w-3 h-3 mr-1" />
            Encrypted
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs value={orderMethod} onValueChange={(value) => setOrderMethod(value as 'market' | 'limit')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="market">Market Order</TabsTrigger>
            <TabsTrigger value="limit">Limit Order</TabsTrigger>
          </TabsList>
          
          <TabsContent value="market" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm text-muted-foreground">Market Price</Label>
              <div className="text-lg font-bold">${currentPrice.toFixed(2)}</div>
            </div>
          </TabsContent>
          
          <TabsContent value="limit" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="limitPrice">Limit Price</Label>
              <Input
                id="limitPrice"
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder="Enter limit price"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity (Shares)</Label>
          <Input
            id="quantity"
            type="number"
            step="1"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
          />
        </div>

        {quantity && (
          <div className="p-3 bg-secondary/30 rounded-lg border border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Estimate</span>
              <span className="font-bold text-lg">${calculateTotal()}</span>
            </div>
          </div>
        )}

        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className={`flex-1 ${orderType === 'buy' ? 'gradient-success' : 'gradient-danger'}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : `${orderType.toUpperCase()} ${symbol}`}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center p-2 bg-secondary/20 rounded">
          <Lock className="w-3 h-3 inline mr-1" />
          Order will remain encrypted until session ends or reveal timer expires
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderForm;