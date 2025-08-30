import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  TrendingUp,
  Coins,
  Link2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PaymentResult {
  success: boolean;
  transactionId: string;
  originalAmount: number;
  roundUpAmount: number;
  totalAmount: number;
  processingFee: number;
  netAmount: number;
  cardLast4: string;
  timestamp: string;
  status: string;
  blockchain: {
    transactionId: string;
    blockHash: string;
    blockNumber: number;
    confirmations: number;
    fee: number;
  };
  savings: {
    roundUpSaved: number;
    totalSavingsToDate: number;
    projectedYearlySavings: number;
  };
}

const PaymentGateway = () => {
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [holderName, setHolderName] = useState('');
  const [enableRoundUp, setEnableRoundUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) { // 16 digits + 3 spaces
      setCardNumber(formatted);
    }
  };

  const processPayment = async () => {
    if (!amount || !cardNumber || !expiryDate || !cvv || !holderName) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all payment details',
        variant: 'destructive',
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('payment-gateway', {
        body: {
          amount: amountNum,
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiryDate,
          cvv,
          holderName,
          enableRoundUp
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error);
      }

      setPaymentResult(data);
      
      // Save transaction to database
      try {
        await supabase.functions.invoke('transactions', {
          body: {
            amount: data.originalAmount,
            category: 'Payment',
            date: new Date().toISOString().split('T')[0],
            description: `Payment Gateway Transaction - Card ****${data.cardLast4}`,
            type: 'debit'
          }
        });
      } catch (transactionError) {
        console.error('Error saving transaction:', transactionError);
        // Don't fail the payment if transaction logging fails
      }
      
      // Send receipt email if user is authenticated
      if (user?.email) {
        try {
          await supabase.functions.invoke('send-receipt', {
            body: {
              email: user.email,
              transactionId: data.transactionId,
              originalAmount: data.originalAmount,
              roundUpAmount: data.roundUpAmount,
              totalAmount: data.totalAmount,
              processingFee: data.processingFee,
              cardLast4: data.cardLast4,
              timestamp: data.timestamp,
              blockchain: data.blockchain,
              savings: data.savings
            }
          });
          
          toast({
            title: 'Payment Successful',
            description: `Transaction completed for ₹${data.totalAmount.toFixed(2)}. Receipt sent to ${user.email}`,
          });
        } catch (emailError) {
          console.error('Error sending receipt:', emailError);
          toast({
            title: 'Payment Successful',
            description: `Transaction completed for ₹${data.totalAmount.toFixed(2)}. Receipt email failed to send.`,
          });
        }
      } else {
        toast({
          title: 'Payment Successful',
          description: `Transaction completed for ₹${data.totalAmount.toFixed(2)}`,
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Payment processing failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setHolderName('');
    setPaymentResult(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Secure Payment Gateway
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="199.50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holderName">Cardholder Name</Label>
              <Input
                id="holderName"
                placeholder="John Doe"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="roundup"
              checked={enableRoundUp}
              onCheckedChange={setEnableRoundUp}
              disabled={loading}
            />
            <Label htmlFor="roundup" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Enable Round-Up Savings
            </Label>
          </div>

          <Button 
            onClick={processPayment} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Process Secure Payment
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {paymentResult && (
        <Card className="border-success">
          <CardHeader className="bg-success/10">
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" />
              Payment Successful
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Transaction ID</Label>
                <p className="font-mono text-sm">{paymentResult.transactionId}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Card</Label>
                <p>**** **** **** {paymentResult.cardLast4}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Original Amount</span>
                <span>₹{paymentResult.originalAmount.toFixed(2)}</span>
              </div>
              {paymentResult.roundUpAmount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Round-Up Savings</span>
                  <span>+₹{paymentResult.roundUpAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Processing Fee (2.9%)</span>
                <span>₹{paymentResult.processingFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total Charged</span>
                <span>₹{paymentResult.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            <div className="bg-accent/10 p-4 rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Link2 className="h-4 w-4" />
                Blockchain Transaction Record
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <Label className="text-muted-foreground">Block Number</Label>
                  <p className="font-mono">{paymentResult.blockchain.blockNumber.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Confirmations</Label>
                  <Badge variant="outline">{paymentResult.blockchain.confirmations}/12</Badge>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground">Transaction Hash</Label>
                  <p className="font-mono text-xs break-all">{paymentResult.blockchain.transactionId}</p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/10 p-4 rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4" />
                Your Savings Progress
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-secondary">₹{paymentResult.savings.roundUpSaved.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">This Transaction</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">₹{paymentResult.savings.totalSavingsToDate.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">₹{paymentResult.savings.projectedYearlySavings.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Projected Annual</p>
                </div>
              </div>
            </div>

            <Button onClick={resetForm} variant="outline" className="w-full">
              Make Another Payment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentGateway;