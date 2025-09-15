import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ContractUtils } from '@/lib/contract-utils';
import { FHEUtils } from '@/lib/fhe-utils';
import { ENV_CONFIG } from '@/config/env';
import { Lock, TrendingUp, Eye, EyeOff, Shield, Zap } from 'lucide-react';

interface EncryptedOrder {
  id: string;
  stockSymbol: string;
  amount: number;
  price: number;
  isBuy: boolean;
  encryptedData: string;
  timestamp: number;
  status: 'pending' | 'executed' | 'cancelled';
}

export const EncryptedTrading: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<EncryptedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEncryptedData, setShowEncryptedData] = useState(false);
  
  // Form state
  const [stockSymbol, setStockSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [sessionId, setSessionId] = useState('1');

  // Initialize contract
  useEffect(() => {
    if (isConnected && address) {
      ContractUtils.initialize(ENV_CONFIG.CONTRACT_ADDRESS);
      FHEUtils.initializeFHE();
    }
  }, [isConnected, address]);

  const handlePlaceOrder = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to place orders",
        variant: "destructive",
      });
      return;
    }

    if (!stockSymbol || !amount || !price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Encrypt sensitive trading data using FHE
      const encryptedData = await FHEUtils.generateTradingProof(
        {
          quantity: parseFloat(amount),
          price: parseFloat(price),
          isBuy: orderType === 'buy'
        },
        ENV_CONFIG.CONTRACT_ADDRESS,
        address
      );

      // Place encrypted order on blockchain
      const txHash = await ContractUtils.placeOrder(
        parseInt(sessionId),
        1, // stockId - would be dynamic in real implementation
        parseFloat(amount),
        parseFloat(price),
        orderType === 'buy',
        address
      );

      // Create local order record
      const newOrder: EncryptedOrder = {
        id: Date.now().toString(),
        stockSymbol,
        amount: parseFloat(amount),
        price: parseFloat(price),
        isBuy: orderType === 'buy',
        encryptedData: encryptedData.encryptedQuantity,
        timestamp: Date.now(),
        status: 'pending'
      };

      setOrders(prev => [newOrder, ...prev]);

      toast({
        title: "Order Placed Successfully",
        description: `Encrypted ${orderType} order for ${amount} ${stockSymbol} at $${price}`,
      });

      // Reset form
      setStockSymbol('');
      setAmount('');
      setPrice('');

    } catch (error: any) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place encrypted order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteOrder = async (orderId: string) => {
    setIsLoading(true);

    try {
      const txHash = await ContractUtils.executeOrder(
        parseInt(sessionId),
        parseInt(orderId),
        0, // executionPrice - would be current market price
        address!
      );

      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'executed' as const }
          : order
      ));

      toast({
        title: "Order Executed",
        description: "Your encrypted order has been executed on-chain",
      });

    } catch (error: any) {
      console.error('Error executing order:', error);
      toast({
        title: "Execution Failed",
        description: error.message || "Failed to execute order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'executed': return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-600 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Encrypted Trading
          </CardTitle>
          <CardDescription>
            Connect your wallet to access encrypted trading features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Your wallet must be connected to place encrypted orders
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            FHE-Encrypted Trading
          </CardTitle>
          <CardDescription>
            Place orders with complete privacy using Fully Homomorphic Encryption
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Place Encrypted Order
            </CardTitle>
            <CardDescription>
              All sensitive data is encrypted before being sent to the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock">Stock Symbol</Label>
                <Input
                  id="stock"
                  placeholder="AAPL"
                  value={stockSymbol}
                  onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <Label htmlFor="session">Session ID</Label>
                <Input
                  id="session"
                  placeholder="1"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="150.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="type">Order Type</Label>
              <Select value={orderType} onValueChange={(value: 'buy' | 'sell') => setOrderType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handlePlaceOrder} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Encrypting & Placing Order...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Place Encrypted Order
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Encrypted Orders
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEncryptedData(!showEncryptedData)}
              >
                {showEncryptedData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </CardTitle>
            <CardDescription>
              Your orders are encrypted on-chain for complete privacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lock className="w-8 h-8 mx-auto mb-2" />
                  <p>No encrypted orders yet</p>
                  <p className="text-sm">Place your first order to see it here</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={order.isBuy ? "default" : "secondary"}>
                          {order.isBuy ? "BUY" : "SELL"}
                        </Badge>
                        <span className="font-medium">{order.stockSymbol}</span>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="ml-2 font-medium">{order.amount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Price:</span>
                        <span className="ml-2 font-medium">${order.price}</span>
                      </div>
                    </div>

                    {showEncryptedData && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Encrypted Data:</span>
                        <div className="font-mono bg-muted p-2 rounded mt-1 break-all">
                          {order.encryptedData}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.timestamp).toLocaleString()}
                      </span>
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExecuteOrder(order.id)}
                          disabled={isLoading}
                        >
                          Execute
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-primary mb-1">Privacy Protection</h4>
              <p className="text-sm text-muted-foreground">
                All your trading data is encrypted using Fully Homomorphic Encryption (FHE) 
                before being sent to the blockchain. This means your order amounts, prices, 
                and trading strategies remain completely private while still allowing the 
                smart contract to process your trades.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Mode Notice */}
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-600 mb-1">Demo Mode</h4>
              <p className="text-sm text-muted-foreground">
                This is a demonstration version of the FHE-encrypted trading platform. 
                Orders are simulated with mock encryption for demonstration purposes. 
                In production, this would use real FHE encryption and interact with 
                deployed smart contracts on the blockchain.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
