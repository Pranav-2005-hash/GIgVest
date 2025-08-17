import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Users, Target } from "lucide-react";

const Dashboard = () => {
  // Mock data for demonstration
  const portfolioValue = 12450;
  const monthlyInvestment = 850;
  const creditScore = 724;
  const creditScoreChange = 32;
  const totalRoundups = 156;
  const emergencyFund = 2340;

  const recentInvestments = [
    { date: "Today", amount: 23, type: "Government Bonds" },
    { date: "Yesterday", amount: 15, type: "Gold ETF" },
    { date: "2 days ago", amount: 31, type: "Equity ETF" },
    { date: "3 days ago", amount: 18, type: "Government Bonds" }
  ];

  const portfolioBreakdown = [
    { name: "Government Bonds", percentage: 45, amount: 5602 },
    { name: "Equity ETFs", percentage: 35, amount: 4357 },
    { name: "Gold ETF", percentage: 20, amount: 2491 }
  ];

  return (
    <section id="dashboard" className="py-20 bg-gradient-to-b from-background to-muted/10">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-5xl font-bold">
            Your <span className="text-gradient-hero">Financial Dashboard</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Track your investments, monitor credit growth, and manage your financial future in real-time.
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">₹{portfolioValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12.5% this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{creditScore}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +{creditScoreChange} points this quarter
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Investment</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">₹{monthlyInvestment}</div>
              <p className="text-xs text-muted-foreground">
                {totalRoundups} round-ups this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emergency Fund</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">₹{emergencyFund}</div>
              <p className="text-xs text-muted-foreground">
                Community safety net
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Portfolio Breakdown */}
          <Card className="bg-background border-border/50">
            <CardHeader>
              <CardTitle>Portfolio Breakdown</CardTitle>
              <CardDescription>Your investment allocation across different assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {portfolioBreakdown.map((asset, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{asset.name}</span>
                    <span className="font-medium">₹{asset.amount.toLocaleString()} ({asset.percentage}%)</span>
                  </div>
                  <Progress value={asset.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-background border-border/50">
            <CardHeader>
              <CardTitle>Recent Round-Up Investments</CardTitle>
              <CardDescription>Your latest spare change investments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvestments.map((investment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{investment.type}</p>
                      <p className="text-sm text-muted-foreground">{investment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-secondary">+₹{investment.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credit Score Progress */}
        <Card className="bg-gradient-card border-border/50 mb-12">
          <CardHeader>
            <CardTitle>Credit Score Journey</CardTitle>
            <CardDescription>Building your financial credibility through consistent investing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Score</p>
                <p className="text-3xl font-bold text-accent">{creditScore}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Score Range</p>
                <p className="text-lg font-semibold">Good (670-739)</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Excellent (740+)</span>
                <span>{Math.round(((creditScore - 670) / (740 - 670)) * 100)}%</span>
              </div>
              <Progress value={((creditScore - 670) / (740 - 670)) * 100} className="h-3" />
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <p className="text-2xl font-bold text-success">98%</p>
                <p className="text-sm text-muted-foreground">Investment Consistency</p>
              </div>
              <div className="text-center p-4 bg-warning/10 rounded-lg">
                <p className="text-2xl font-bold text-warning">6</p>
                <p className="text-sm text-muted-foreground">Months Active</p>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <p className="text-2xl font-bold text-accent">A</p>
                <p className="text-sm text-muted-foreground">Risk Grade</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="hero" size="lg">
            Access Full Dashboard
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;