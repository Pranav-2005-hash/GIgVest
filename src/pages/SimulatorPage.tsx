import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calculator, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SimulatorPage = () => {
  const [amount, setAmount] = useState<string>('');
  const [roundUpAmount, setRoundUpAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateRoundUp = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('roundup', {
        body: { amount: parseFloat(amount) }
      });

      if (error) {
        throw error;
      }

      setRoundUpAmount(data.roundUpAmount);
    } catch (error) {
      console.error('Error calculating round-up:', error);
      toast({
        title: 'Calculation Failed',
        description: 'Failed to calculate round-up amount',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    { input: '199.5', output: '0.5' },
    { input: '203', output: '2' },
    { input: '205', output: '5' },
    { input: '198.75', output: '1.25' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calculator className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Round-Up Simulator</h1>
            </div>
            <p className="text-muted-foreground">
              Calculate how much extra you'll save with our round-up feature
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Calculate Round-Up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Transaction Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount (e.g., 199.5)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <Button 
                onClick={calculateRoundUp} 
                disabled={loading || !amount}
                className="w-full"
              >
                {loading ? 'Calculating...' : 'Calculate Round-Up'}
              </Button>

              {roundUpAmount !== null && (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      ₹{roundUpAmount.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Round-up amount to nearest ₹5
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How Round-Up Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Our round-up feature automatically rounds your transactions to the nearest ₹5 and saves the difference.
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Examples:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {examples.map((example, index) => (
                      <div key={index} className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>₹{example.input}</span>
                        <span className="font-medium text-primary">+₹{example.output}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SimulatorPage;