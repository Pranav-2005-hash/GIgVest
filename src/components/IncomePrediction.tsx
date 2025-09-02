import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  TrendingFlat,
  RefreshCw,
  DollarSign,
  Calendar,
  Lightbulb
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface IncomeData {
  date: string;
  amount: number;
}

interface PredictionResult {
  historical: IncomeData[];
  forecast: IncomeData[];
  trend: 'increasing' | 'decreasing' | 'stable';
  explanation?: string;
}

const IncomePrediction = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [predictionData, setPredictionData] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIncomePrediction = async () => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to view income predictions',
          variant: 'destructive'
        });
        return;
      }

      console.log('Fetching income prediction...');
      const { data, error } = await supabase.functions.invoke('income-prediction', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) {
        console.error('Error fetching income prediction:', error);
        throw error;
      }

      console.log('Income prediction data:', data);
      setPredictionData(data);
      
    } catch (error) {
      console.error('Error fetching income prediction:', error);
      toast({
        title: 'Prediction Error',
        description: 'Failed to load income prediction data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchIncomePrediction();
    }
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchIncomePrediction();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <TrendingFlat className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'decreasing':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatChartData = () => {
    if (!predictionData) return [];

    const historical = predictionData.historical.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: item.amount,
      type: 'Historical'
    }));

    const forecast = predictionData.forecast.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: item.amount,
      type: 'Forecast'
    }));

    return [...historical, ...forecast];
  };

  const calculateAverageIncome = (data: IncomeData[]) => {
    if (data.length === 0) return 0;
    return data.reduce((sum, item) => sum + item.amount, 0) / data.length;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Income Prediction
          </CardTitle>
          <CardDescription>AI-powered income forecasting and trend analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!predictionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Income Prediction
          </CardTitle>
          <CardDescription>AI-powered income forecasting and trend analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No income data available. Start adding income transactions to see predictions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const chartData = formatChartData();
  const historicalAvg = calculateAverageIncome(predictionData.historical);
  const forecastAvg = calculateAverageIncome(predictionData.forecast);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Income Prediction
            </CardTitle>
            <CardDescription>AI-powered income forecasting and trend analysis</CardDescription>
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
        {/* Trend Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Trend:</span>
            <Badge className={getTrendColor(predictionData.trend)}>
              {getTrendIcon(predictionData.trend)}
              <span className="ml-1 capitalize">{predictionData.trend}</span>
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Avg Historical</div>
            <div className="font-semibold">₹{historicalAvg.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Avg Forecast</div>
            <div className="font-semibold">₹{forecastAvg.toLocaleString()}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                name="Historical"
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#82ca9d" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                name="Forecast"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Explanation */}
        {predictionData.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">AI Insights</h4>
                <p className="text-sm text-blue-800">{predictionData.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Data Summary */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Historical Periods:</span>
            <span className="font-medium">{predictionData.historical.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Forecast Periods:</span>
            <span className="font-medium">{predictionData.forecast.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomePrediction;
