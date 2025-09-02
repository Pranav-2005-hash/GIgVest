import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Users, 
  Target,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Activity,
  Calendar,
  Coins,
  BarChart3,
  PieChart
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import IncomePrediction from './IncomePrediction';
import CreditScore from './CreditScore';

interface DashboardData {
  totalSavings: number;
  totalTransactions: number;
  roundUpSavings: number;
  monthlySpending: number;
  monthlySavings: number;
  recentTransactions: any[];
  savingsGoals: any[];
  spendingByCategory: { [key: string]: number };
  monthlyTrend: { month: string; spending: number; savings: number }[];
  creditScore: number;
  emergencyFund: number;
  investmentValue: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSavings: 0,
    totalTransactions: 0,
    roundUpSavings: 0,
    monthlySpending: 0,
    monthlySavings: 0,
    recentTransactions: [],
    savingsGoals: [],
    spendingByCategory: {},
    monthlyTrend: [],
    creditScore: 750,
    emergencyFund: 0,
    investmentValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    if (!user) {
      console.log('No user available for dashboard data fetch');
      return;
    }
    
    try {
      console.log('Fetching dashboard data for user:', user.id);
      
      // Get current session for authenticated requests
      let { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!session?.access_token) {
        console.error('No session available, user might not be authenticated');
        // Try to refresh the session
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshedSession?.access_token) {
          toast({
            title: 'Authentication Required',
            description: 'Please log in to view your dashboard',
            variant: 'destructive'
          });
          return;
        }
        // Use the refreshed session
        session = refreshedSession;
      }

      console.log('Session available, fetching transactions...');

      // Fetch transactions - try Edge Function first, fallback to direct query
      let transactions: any[] = [];
      let transactionsError: any = null;
      
      try {
        console.log('Trying to fetch transactions via Edge Function...');
        const { data: transactionsData, error: edgeFunctionError } = await supabase.functions.invoke('transactions', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          }
        });

        if (edgeFunctionError) {
          console.warn('Edge Function failed, trying direct database query:', edgeFunctionError);
          transactionsError = edgeFunctionError;
          
          // Fallback to direct database query
          const { data: directTransactions, error: directError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (directError) {
            console.error('Direct database query also failed:', directError);
            throw directError;
          }
          
          transactions = directTransactions || [];
          console.log('Fetched transactions via direct query:', transactions.length);
        } else {
          transactions = transactionsData?.transactions || [];
          console.log('Fetched transactions via Edge Function:', transactions.length);
        }
      } catch (error) {
        console.error('All transaction fetching methods failed:', error);
        throw error;
      }

      // Fetch savings data
      console.log('Fetching savings data...');
      const { data: savingsData, error: savingsError } = await supabase
        .from('savings')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (savingsError) {
        console.error('Error fetching savings:', savingsError);
        // Don't throw here, just log the error and continue with empty savings
      }

      const savings = savingsData || [];
      console.log('Fetched savings:', savings.length);

      // Calculate metrics
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      });

      const monthlySpending = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const monthlySavings = monthlyTransactions
        .filter(t => t.type === 'savings' || t.round_up_applied)
        .reduce((sum, t) => sum + (t.round_up_applied ? Number(t.round_up_amount) : Number(t.amount)), 0);

      const totalRoundUps = transactions.reduce((sum, t) => 
        sum + (t.round_up_applied ? Number(t.round_up_amount) : 0), 0
      );

      const totalSavings = savings.reduce((sum, s) => sum + Number(s.current_amount), 0);

      // Calculate spending by category
      const spendingByCategory: { [key: string]: number } = {};
      transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + Number(t.amount);
        });

      // Calculate monthly trend (last 6 months)
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === date.getMonth() && 
                 transactionDate.getFullYear() === date.getFullYear();
        });
        
        const monthSpending = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const monthSavings = monthTransactions
          .filter(t => t.type === 'savings' || t.round_up_applied)
          .reduce((sum, t) => sum + (t.round_up_applied ? Number(t.round_up_amount) : Number(t.amount)), 0);

        monthlyTrend.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          spending: monthSpending,
          savings: monthSavings
        });
      }

      // Calculate credit score based on financial behavior
      const creditScore = Math.min(850, Math.max(300, 750 + 
        (totalSavings > 1000 ? 20 : 0) +
        (monthlySavings > 100 ? 15 : 0) +
        (transactions.length > 10 ? 10 : 0) -
        (monthlySpending > 5000 ? 10 : 0)
      ));

      const emergencyFund = savings.find(s => s.goal_name.toLowerCase().includes('emergency'))?.current_amount || 0;
      const investmentValue = totalSavings * 1.12; // Simulate 12% growth

      const newDashboardData: DashboardData = {
        totalSavings,
        totalTransactions: transactions.length,
        roundUpSavings: totalRoundUps,
        monthlySpending,
        monthlySavings,
        recentTransactions: transactions.slice(0, 5),
        savingsGoals: savings,
        spendingByCategory,
        monthlyTrend,
        creditScore: Math.round(creditScore),
        emergencyFund: Number(emergencyFund),
        investmentValue: Number(investmentValue)
      };

      console.log('Updated dashboard data:', newDashboardData);
      setDashboardData(newDashboardData);
      
      // Show success message if this was a refresh after transaction
      if (refreshing) {
        toast({
          title: 'Dashboard Updated',
          description: 'Your financial data has been refreshed successfully',
        });
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load dashboard data';
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized') || error.message.includes('401')) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      toast({
        title: 'Dashboard Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // Set fallback data to prevent empty dashboard
      const fallbackData: DashboardData = {
        totalSavings: 0,
        totalTransactions: 0,
        roundUpSavings: 0,
        monthlySpending: 0,
        monthlySavings: 0,
        recentTransactions: [],
        savingsGoals: [],
        spendingByCategory: {},
        monthlyTrend: [],
        creditScore: 750,
        emergencyFund: 0,
        investmentValue: 0
      };
      setDashboardData(fallbackData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Listen for transaction completion events
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }

    const handleTransactionCompleted = (event: any) => {
      console.log('Transaction completed, refreshing dashboard data', event.detail);
      setRefreshing(true);
      fetchDashboardData();
    };

    const handleDashboardRefresh = (event: any) => {
      console.log('Dashboard refresh event received', event.detail);
      setRefreshing(true);
      fetchDashboardData();
    };

    window.addEventListener('transactionCompleted', handleTransactionCompleted);
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    
    return () => {
      window.removeEventListener('transactionCompleted', handleTransactionCompleted);
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, [user]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Financial Dashboard</h2>
          <p className="text-muted-foreground">Real-time overview of your financial health</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleManualRefresh} 
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
        </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold text-blue-900">₹{dashboardData.totalSavings.toLocaleString()}</div>
            <p className="text-xs text-blue-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +₹{dashboardData.monthlySavings.toFixed(2)} this month
              </p>
            </CardContent>
          </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Round-Up Savings</CardTitle>
            <Coins className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold text-green-900">₹{dashboardData.roundUpSavings.toFixed(2)}</div>
            <p className="text-xs text-green-600">
              From {dashboardData.totalTransactions} transactions
              </p>
            </CardContent>
          </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Credit Score</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold text-purple-900">{dashboardData.creditScore}</div>
            <p className="text-xs text-purple-600">
              {dashboardData.creditScore >= 750 ? 'Excellent' : 
               dashboardData.creditScore >= 700 ? 'Good' : 'Fair'}
              </p>
            </CardContent>
          </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Monthly Spending</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold text-orange-900">₹{dashboardData.monthlySpending.toLocaleString()}</div>
            <p className="text-xs text-orange-600">
              {dashboardData.totalTransactions} transactions
              </p>
            </CardContent>
          </Card>
        </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Your latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Start making payments to see activity here!</p>
                </div>
              ) : (
                dashboardData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'income' || transaction.type === 'savings' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'income' || transaction.type === 'savings' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description || 'Transaction'}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{transaction.category}</span>
                          <span>•</span>
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          {transaction.round_up_applied && (
                            <>
                              <span>•</span>
                              <Badge variant="secondary" className="text-xs">
                                <Coins className="h-3 w-3 mr-1" />
                                +₹{Number(transaction.round_up_amount).toFixed(2)}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' || transaction.type === 'savings' 
                          ? 'text-green-600' 
                          : 'text-foreground'
                      }`}>
                        {transaction.type === 'income' || transaction.type === 'savings' ? '+' : '-'}₹{Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Savings Goals Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Savings Goals
            </CardTitle>
            <CardDescription>Track your progress towards financial goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.savingsGoals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No savings goals yet</p>
                  <p className="text-sm">Create your first savings goal to get started!</p>
                </div>
              ) : (
                dashboardData.savingsGoals.map((goal) => {
                  const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{goal.goal_name}</h4>
                        <span className="text-sm text-muted-foreground">
                          ₹{Number(goal.current_amount).toLocaleString()} / ₹{Number(goal.target_amount).toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{progress.toFixed(1)}% complete</span>
                        <span>₹{(Number(goal.target_amount) - Number(goal.current_amount)).toLocaleString()} remaining</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Spending by Category
            </CardTitle>
            <CardDescription>Where your money goes this month</CardDescription>
            </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.keys(dashboardData.spendingByCategory).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No spending data yet</p>
                  <p className="text-sm">Make some transactions to see spending patterns!</p>
                </div>
              ) : (
                Object.entries(dashboardData.spendingByCategory)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, amount]) => {
                    const percentage = (amount / dashboardData.monthlySpending) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{category}</span>
                          <span className="text-sm text-muted-foreground">₹{amount.toLocaleString()}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="text-xs text-muted-foreground text-right">
                          {percentage.toFixed(1)}% of monthly spending
                        </div>
                  </div>
                    );
                  })
              )}
                </div>
            </CardContent>
          </Card>

        {/* Monthly Trend */}
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Trend
            </CardTitle>
            <CardDescription>Spending vs Savings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              {dashboardData.monthlyTrend.map((month, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{month.month}</span>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-red-600">₹{month.spending.toLocaleString()}</span>
                      <span className="text-green-600">₹{month.savings.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">Spending</div>
                      <Progress 
                        value={Math.min(100, (month.spending / Math.max(...dashboardData.monthlyTrend.map(m => m.spending))) * 100)} 
                        className="h-2 bg-red-100" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">Savings</div>
                      <Progress 
                        value={Math.min(100, (month.savings / Math.max(...dashboardData.monthlyTrend.map(m => m.savings), 1)) * 100)} 
                        className="h-2 bg-green-100" 
                      />
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

             {/* Investment Overview */}
       <Card>
           <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <TrendingUp className="h-5 w-5" />
             Investment Overview
           </CardTitle>
           <CardDescription>Your investment portfolio performance</CardDescription>
           </CardHeader>
         <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="text-center p-4 bg-green-50 rounded-lg">
               <div className="text-2xl font-bold text-green-600">₹{dashboardData.investmentValue.toLocaleString()}</div>
               <div className="text-sm text-muted-foreground">Current Value</div>
               </div>
             <div className="text-center p-4 bg-blue-50 rounded-lg">
               <div className="text-2xl font-bold text-blue-600">₹{(dashboardData.investmentValue - dashboardData.totalSavings).toLocaleString()}</div>
               <div className="text-sm text-muted-foreground">Gains</div>
               </div>
             <div className="text-center p-4 bg-purple-50 rounded-lg">
               <div className="text-2xl font-bold text-purple-600">12.0%</div>
               <div className="text-sm text-muted-foreground">Annual Return</div>
               </div>
             </div>
           </CardContent>
         </Card>

       {/* AI-Powered Features */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <IncomePrediction />
         <CreditScore />
       </div>
       </div>
  );
};

export default Dashboard;
