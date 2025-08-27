import { useAuth } from '@/hooks/useAuth';
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

const DashboardPage = () => {
  const { user, signOut } = useAuth();

  const mockData = {
    portfolioValue: 25420.50,
    monthlyGrowth: 8.2,
    creditScore: 742,
    savings: {
      emergency: { current: 5000, target: 10000 },
      vacation: { current: 2500, target: 5000 },
    },
    recentTransactions: [
      { id: 1, type: 'income', amount: 3200, description: 'Freelance Payment', date: '2024-01-15', category: 'Work' },
      { id: 2, type: 'expense', amount: -85.50, description: 'Grocery Shopping', date: '2024-01-14', category: 'Food' },
      { id: 3, type: 'investment', amount: 500, description: 'Stock Purchase', date: '2024-01-13', category: 'Investment' },
      { id: 4, type: 'expense', amount: -120, description: 'Internet Bill', date: '2024-01-12', category: 'Utilities' },
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <Home className="h-5 w-5" />
              <span className="font-bold text-xl">GigVest</span>
            </Link>
            <Badge variant="secondary">Dashboard</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.user_metadata?.first_name || user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockData.portfolioValue.toLocaleString()}</div>
              <p className="text-xs text-success flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{mockData.monthlyGrowth}% this month
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
                    {mockData.recentTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'income' ? 'bg-success/10' :
                            transaction.type === 'investment' ? 'bg-accent/10' : 'bg-destructive/10'
                          }`}>
                            {transaction.type === 'income' ? (
                              <ArrowUpRight className="h-4 w-4 text-success" />
                            ) : transaction.type === 'investment' ? (
                              <TrendingUp className="h-4 w-4 text-accent" />
                            ) : (
                              <ArrowDownLeft className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">{transaction.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'income' ? 'text-success' : 'text-foreground'
                          }`}>
                            {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                    ))}
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
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>Complete transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'income' ? 'bg-success/10' :
                          transaction.type === 'investment' ? 'bg-accent/10' : 'bg-destructive/10'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className="h-4 w-4 text-success" />
                          ) : transaction.type === 'investment' ? (
                            <TrendingUp className="h-4 w-4 text-accent" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.category} • {transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'income' ? 'text-success' : 'text-foreground'
                        }`}>
                          {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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