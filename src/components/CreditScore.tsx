import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  TrendingUp, 
  PiggyBank, 
  Coins, 
  Users, 
  RefreshCw,
  Lightbulb,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CreditScoreResult {
  score: number;
  breakdown: {
    savings: number;
    roundup: number;
    stability: number;
    community: number;
  };
  advice: string;
  explanation?: string;
}

const CreditScore = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [creditData, setCreditData] = useState<CreditScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCreditScore = async () => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to view credit score',
          variant: 'destructive'
        });
        return;
      }

      console.log('Fetching credit score...');
      const { data, error } = await supabase.functions.invoke('credit-score', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) {
        console.error('Error fetching credit score:', error);
        throw error;
      }

      console.log('Credit score data:', data);
      setCreditData(data);
      
    } catch (error) {
      console.error('Error fetching credit score:', error);
      toast({
        title: 'Credit Score Error',
        description: 'Failed to load credit score data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCreditScore();
    }
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCreditScore();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit Score
          </CardTitle>
          <CardDescription>AI-powered credit score analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <Skeleton className="h-16 w-16 mx-auto rounded-full" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!creditData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit Score
          </CardTitle>
          <CardDescription>AI-powered credit score analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Unable to calculate credit score. Please ensure you have transaction data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Credit Score
            </CardTitle>
            <CardDescription>AI-powered credit score analysis and recommendations</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Display */}
        <div className="text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-gray-200 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(creditData.score)}`}>
                {creditData.score}
              </span>
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <Badge className={getScoreBadgeColor(creditData.score)}>
                {getScoreLabel(creditData.score)}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress to Excellent</span>
              <span className="text-muted-foreground">{creditData.score}/100</span>
            </div>
            <Progress 
              value={creditData.score} 
              className="h-2"
            />
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Score Breakdown
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Savings</span>
                </div>
                <span className="text-sm font-semibold">{creditData.breakdown.savings}/100</span>
              </div>
              <Progress value={creditData.breakdown.savings} className="h-2" />
              <span className="text-xs text-muted-foreground">40% weight</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Round-up</span>
                </div>
                <span className="text-sm font-semibold">{creditData.breakdown.roundup}/100</span>
              </div>
              <Progress value={creditData.breakdown.roundup} className="h-2" />
              <span className="text-xs text-muted-foreground">25% weight</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Stability</span>
                </div>
                <span className="text-sm font-semibold">{creditData.breakdown.stability}/100</span>
              </div>
              <Progress value={creditData.breakdown.stability} className="h-2" />
              <span className="text-xs text-muted-foreground">20% weight</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Community</span>
                </div>
                <span className="text-sm font-semibold">{creditData.breakdown.community}/100</span>
              </div>
              <Progress value={creditData.breakdown.community} className="h-2" />
              <span className="text-xs text-muted-foreground">15% weight</span>
            </div>
          </div>
        </div>

        {/* AI Advice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">AI Recommendations</h4>
              <p className="text-sm text-blue-800">{creditData.advice}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <PiggyBank className="h-3 w-3 mr-1" />
              Boost Savings
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Coins className="h-3 w-3 mr-1" />
              Enable Round-up
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Join Community
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditScore;
