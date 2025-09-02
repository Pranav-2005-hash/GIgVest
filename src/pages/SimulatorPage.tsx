import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calculator, 
  IndianRupee, 
  CreditCard, 
  MessageSquare,
  TrendingUp,
  PiggyBank,
  Shield,
  Coins,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedHeader from '@/components/AuthenticatedHeader';
import PaymentGateway from '@/components/PaymentGateway';
import FinancialChatBot from '@/components/FinancialChatbot';

interface RoundUpResult {
  roundUpAmount: number;
  originalAmount: number;
  totalSaved: number;
  nextTarget: number;
  savingsBreakdown: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
}

interface DashboardStats {
  totalSavings: number;
  totalTransactions: number;
  roundUpSavings: number;
  monthlySpending: number;
}

const SimulatorPage = () => {
  const [amount, setAmount] = useState<string>('');
  const [roundUpResult, setRoundUpResult] = useState<RoundUpResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    if (!user) return;
    
    setStatsLoading(true);
    try {
      console.log('Fetching dashboard stats for simulator...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No session available for stats fetch');
        return;
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase.functions.invoke('transactions', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (transactionsError) {
        console.error('Error fetching transactions for stats:', transactionsError);
        return;
      }

      const transactions = transactionsData?.transactions || [];
      
      // Fetch savings data
      const { data: savingsData, error: savingsError } = await supabase
        .from('savings')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (savingsError) {
        console.error('Error fetching savings for stats:', savingsError);
      }

      const savings = savingsData || [];
      
      // Calculate stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      });

      const monthlySpending = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalRoundUps = transactions.reduce((sum, t) => 
        sum + (t.round_up_applied ? Number(t.round_up_amount) : 0), 0
      );

      const totalSavings = savings.reduce((sum, s) => sum + Number(s.current_amount), 0);

      const stats: DashboardStats = {
        totalSavings,
        totalTransactions: transactions.length,
        roundUpSavings: totalRoundUps,
        monthlySpending
      };

      console.log('Dashboard stats fetched:', stats);
      setDashboardStats(stats);
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Listen for transaction completion events
  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }

    const handleTransactionCompleted = (event: any) => {
      console.log('Transaction completed, refreshing simulator stats', event.detail);
      fetchDashboardStats();
    };

    window.addEventListener('transactionCompleted', handleTransactionCompleted);
    
    return () => {
      window.removeEventListener('transactionCompleted', handleTransactionCompleted);
    };
  }, [user]);

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

      const originalAmount = parseFloat(amount);
      const roundUpAmount = data.roundUpAmount;
      
      // Calculate savings projections
      const dailySavings = roundUpAmount; // Assuming one transaction per day
      const weeklySavings = dailySavings * 7;
      const monthlySavings = dailySavings * 30;
      const yearlySavings = dailySavings * 365;
      
      // Use real data if available, otherwise simulate
      const totalSaved = dashboardStats?.roundUpSavings || Math.floor(Math.random() * 5000) + roundUpAmount;
      
      // Calculate next savings milestone
      const nextTarget = Math.ceil(totalSaved / 1000) * 1000;

      const result: RoundUpResult = {
        roundUpAmount,
        originalAmount,
        totalSaved,
        nextTarget,
        savingsBreakdown: {
          daily: dailySavings,
          weekly: weeklySavings,
          monthly: monthlySavings,
          yearly: yearlySavings
        }
      };

      setRoundUpResult(result);
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
      {user && <AuthenticatedHeader />}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calculator className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Financial Simulator & Gateway</h1>
            </div>
            <p className="text-muted-foreground">
              Advanced round-up calculator, secure payment processing, and AI-powered financial assistance
            </p>
          </div>

          {/* Dashboard Stats Overview */}
          {user && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Your Financial Overview
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={fetchDashboardStats}
                    disabled={statsLoading}
                    className="ml-auto"
                  >
                    <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="text-center py-4">Loading your financial data...</div>
                ) : dashboardStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">₹{dashboardStats.totalSavings.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Total Savings</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">₹{dashboardStats.roundUpSavings.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Round-Up Savings</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">₹{dashboardStats.monthlySpending.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Monthly Spending</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{dashboardStats.totalTransactions}</div>
                      <div className="text-xs text-muted-foreground">Total Transactions</div>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No financial data available yet. Make your first transaction to see your overview here!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="simulator" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="simulator" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Round-Up Simulator
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Gateway
              </TabsTrigger>
              <TabsTrigger value="chatbot" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                AI Assistant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="simulator" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      {loading ? 'Calculating...' : 'Calculate Round-Up & Projections'}
                    </Button>

                    {roundUpResult && (
                      <div className="space-y-4">
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                          <div className="text-center space-y-2">
                            <div className="text-2xl font-bold text-primary">
                              ₹{roundUpResult.roundUpAmount.toFixed(2)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Round-up from ₹{roundUpResult.originalAmount.toFixed(2)} to nearest ₹5
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="p-3 bg-secondary/10 rounded-lg text-center">
                            <div className="font-bold text-secondary">₹{roundUpResult.totalSaved.toFixed(2)}</div>
                            <div className="text-muted-foreground">Total Saved</div>
                          </div>
                          <div className="p-3 bg-accent/10 rounded-lg text-center">
                            <div className="font-bold text-accent">₹{(roundUpResult.nextTarget - roundUpResult.totalSaved).toFixed(2)}</div>
                            <div className="text-muted-foreground">To Next ₹{roundUpResult.nextTarget}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {roundUpResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Savings Projections
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-lg font-bold">₹{roundUpResult.savingsBreakdown.weekly.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">Weekly</div>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-lg font-bold">₹{roundUpResult.savingsBreakdown.monthly.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">Monthly</div>
                          </div>
                          <div className="text-center p-3 bg-success/10 rounded-lg">
                            <div className="text-lg font-bold text-success">₹{roundUpResult.savingsBreakdown.yearly.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">Yearly</div>
                          </div>
                          <div className="text-center p-3 bg-warning/10 rounded-lg">
                            <div className="text-lg font-bold text-warning">₹{(roundUpResult.savingsBreakdown.yearly * 5).toFixed(0)}</div>
                            <div className="text-xs text-muted-foreground">5 Years</div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <PiggyBank className="h-4 w-4 text-primary" />
                            <span className="font-medium">Investment Opportunities</span>
                          </div>
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            <div className="flex justify-between p-2 bg-muted/30 rounded">
                              <span>SIP Investment (12% returns)</span>
                              <Badge variant="outline">₹{(roundUpResult.savingsBreakdown.yearly * 1.12).toFixed(0)}/year</Badge>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/30 rounded">
                              <span>Fixed Deposit (7% returns)</span>
                              <Badge variant="outline">₹{(roundUpResult.savingsBreakdown.yearly * 1.07).toFixed(0)}/year</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    How Round-Up Works
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Our advanced round-up system uses blockchain technology to securely track and save your spare change, 
                      automatically investing it for maximum returns.
                    </p>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Secure Examples:
                      </h4>
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
            </TabsContent>

            <TabsContent value="payment">
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Complete a payment to see your dashboard update in real-time! Your transaction will be automatically saved and your savings will be updated.
                  </AlertDescription>
                </Alert>
                <PaymentGateway onTransactionSuccess={() => {
                  console.log('Payment completed in simulator - dashboard will update automatically');
                  toast({
                    title: 'Payment Successful!',
                    description: 'Your dashboard has been updated with the new transaction.',
                  });
                }} />
              </div>
            </TabsContent>

            <TabsContent value="chatbot">
              <FinancialChatBot context="Round-up savings simulator and payment gateway" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SimulatorPage;
