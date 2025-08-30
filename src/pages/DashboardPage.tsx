import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import AuthenticatedHeader from '@/components/AuthenticatedHeader';
import TransactionHistory from '@/components/TransactionHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Wallet, 
  Target, 
  CreditCard, 
  Users, 
  LogOut,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Home
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalSavings: 0,
    totalTransactions: 0,
    roundUpSavings: 0,
    recentTransactions: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch savings data
      const { data: savingsData } = await supabase
        .from('savings')
        .select('current_amount')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      // Fetch recent transactions
      const { data: transactionsData } = await supabase.functions.invoke('transactions', {
        method: 'GET'
      });

      const transactions = transactionsData?.transactions || [];
      const roundUpTotal = transactions.reduce((sum: number, t: any) => 
        sum + (t.round_up_applied ? Number(t.round_up_amount) : 0), 0
      );

      setDashboardData({
        totalSavings: Number(savingsData?.current_amount) || 0,
        totalTransactions: transactions.length,
        roundUpSavings: roundUpTotal,
        recentTransactions: transactions.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for features not yet implemented
  const mockData = {
    portfolioValue: 25420.50,
    monthlyGrowth: 8.2,
    creditScore: 742,
    savings: {
      emergency: { current: dashboardData.totalSavings, target: 10000 },
      vacation: { current: 2500, target: 5000 },
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{dashboardData.totalSavings.toFixed(2)}</div>
              <p className="text-xs text-success flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Round-up savings growing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.creditScore}</div>
              <p className="text-xs text-success">Excellent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emergency Fund</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${mockData.savings.emergency.current.toLocaleString()}
              </div>
              <div className="mt-2">
                <Progress 
                  value={(mockData.savings.emergency.current / mockData.savings.emergency.target) * 100} 
                  className="h-2" 
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ${mockData.savings.emergency.target.toLocaleString()} goal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Rank</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#247</div>
              <p className="text-xs text-muted-foreground">Top 15% this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="savings">Savings Goals</TabsTrigger>
            <TabsTrigger value="credit">Credit</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest financial activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-4 text-muted-foreground">Loading recent activity...</div>
                    ) : dashboardData.recentTransactions.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No transactions yet. Start making payments to see activity here!
                      </div>
                    ) : (
                      dashboardData.recentTransactions.map((transaction: any) => (
                        <div key={transaction.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${
                              transaction.type === 'credit' ? 'bg-success/10' : 'bg-destructive/10'
                            }`}>
                              {transaction.type === 'credit' ? (
                                <ArrowUpRight className="h-4 w-4 text-success" />
                              ) : (
                                <ArrowDownLeft className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description || 'Transaction'}</p>
                              <p className="text-sm text-muted-foreground">{transaction.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.type === 'credit' ? 'text-success' : 'text-foreground'
                            }`}>
                              {transaction.type === 'credit' ? '+' : '-'}₹{Math.abs(transaction.amount).toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Savings Goals</CardTitle>
                  <CardDescription>Track your progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Emergency Fund</h4>
                        <span className="text-sm text-muted-foreground">
                          ${mockData.savings.emergency.current.toLocaleString()} / ${mockData.savings.emergency.target.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={(mockData.savings.emergency.current / mockData.savings.emergency.target) * 100} 
                        className="h-2" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Vacation Fund</h4>
                        <span className="text-sm text-muted-foreground">
                          ${mockData.savings.vacation.current.toLocaleString()} / ${mockData.savings.vacation.target.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={(mockData.savings.vacation.current / mockData.savings.vacation.target) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionHistory />
          </TabsContent>

          <TabsContent value="savings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Fund</CardTitle>
                  <CardDescription>3-6 months of expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">
                    ${mockData.savings.emergency.current.toLocaleString()}
                  </div>
                  <Progress 
                    value={(mockData.savings.emergency.current / mockData.savings.emergency.target) * 100} 
                    className="h-4 mb-4" 
                  />
                  <p className="text-sm text-muted-foreground">
                    {((mockData.savings.emergency.current / mockData.savings.emergency.target) * 100).toFixed(1)}% of ${mockData.savings.emergency.target.toLocaleString()} goal
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vacation Fund</CardTitle>
                  <CardDescription>Save for your dream vacation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">
                    ${mockData.savings.vacation.current.toLocaleString()}
                  </div>
                  <Progress 
                    value={(mockData.savings.vacation.current / mockData.savings.vacation.target) * 100} 
                    className="h-4 mb-4" 
                  />
                  <p className="text-sm text-muted-foreground">
                    {((mockData.savings.vacation.current / mockData.savings.vacation.target) * 100).toFixed(1)}% of ${mockData.savings.vacation.target.toLocaleString()} goal
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="credit">
            <Card>
              <CardHeader>
                <CardTitle>Credit Score Journey</CardTitle>
                <CardDescription>Track your credit health over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold text-success mb-4">{mockData.creditScore}</div>
                  <Badge variant="secondary" className="mb-4">Excellent</Badge>
                  <p className="text-muted-foreground">
                    Your credit score is in excellent condition. Keep up the good work!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;