import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'
import OpenAI from 'https://esm.sh/openai@4.67.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

function calculateMovingAverage(data: IncomeData[], window: number): number[] {
  const averages: number[] = [];
  for (let i = window - 1; i < data.length; i++) {
    const sum = data.slice(i - window + 1, i + 1).reduce((acc, item) => acc + item.amount, 0);
    averages.push(sum / window);
  }
  return averages;
}

function calculateTrend(data: IncomeData[]): 'increasing' | 'decreasing' | 'stable' {
  if (data.length < 2) return 'stable';
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, item) => sum + item.amount, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, item) => sum + item.amount, 0) / secondHalf.length;
  
  const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (changePercent > 5) return 'increasing';
  if (changePercent < -5) return 'decreasing';
  return 'stable';
}

function generateForecast(historical: IncomeData[], periods: number = 12): IncomeData[] {
  if (historical.length < 4) return [];
  
  // Calculate moving average for trend
  const movingAvg = calculateMovingAverage(historical, Math.min(4, historical.length));
  const trend = calculateTrend(historical);
  
  // Get recent average
  const recentAvg = movingAvg[movingAvg.length - 1] || 0;
  const recentData = historical.slice(-4);
  const avgAmount = recentData.reduce((sum, item) => sum + item.amount, 0) / recentData.length;
  
  // Generate forecast based on trend
  const forecast: IncomeData[] = [];
  const lastDate = new Date(historical[historical.length - 1].date);
  
  for (let i = 1; i <= periods; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + (i * 7)); // Weekly forecast
    
    let forecastAmount = avgAmount;
    
    // Apply trend
    if (trend === 'increasing') {
      forecastAmount *= (1 + (i * 0.02)); // 2% growth per week
    } else if (trend === 'decreasing') {
      forecastAmount *= (1 - (i * 0.01)); // 1% decline per week
    }
    
    // Add some randomness for realism
    const randomFactor = 0.9 + Math.random() * 0.2; // ±10% variation
    forecastAmount *= randomFactor;
    
    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      amount: Math.round(forecastAmount * 100) / 100
    });
  }
  
  return forecast;
}

async function generateAIExplanation(historical: IncomeData[], forecast: IncomeData[], trend: string): Promise<string> {
  try {
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const historicalSummary = historical.slice(-8).map(item => 
      `${item.date}: ₹${item.amount.toFixed(2)}`
    ).join(', ');

    const forecastSummary = forecast.slice(0, 4).map(item => 
      `${item.date}: ₹${item.amount.toFixed(2)}`
    ).join(', ');

    const prompt = `Based on the following income data, provide a brief, friendly explanation of the income trend and forecast:

Historical Income (last 8 periods): ${historicalSummary}
Forecast (next 4 periods): ${forecastSummary}
Trend: ${trend}

Please provide a 2-3 sentence explanation that's easy to understand and encouraging. Focus on the trend and what it means for the user's financial future.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful financial advisor providing clear, encouraging insights about income trends."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'Income trend analysis completed.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Income trend analysis completed.';
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: req.headers.get('Authorization') ?? '',
          },
        },
      }
    );

    // Get user from the request context
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching income data for user:', user.id);

    // Fetch income transactions from the last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: transactions, error: transactionsError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'income')
      .gte('date', ninetyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch income data', 
          details: transactionsError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetched income transactions:', transactions?.length || 0);

    // Process historical data
    const historical: IncomeData[] = (transactions || []).map(t => ({
      date: t.date,
      amount: Number(t.amount)
    }));

    // Calculate trend
    const trend = calculateTrend(historical);

    // Generate forecast
    const forecast = generateForecast(historical, 12);

    // Generate AI explanation
    const explanation = await generateAIExplanation(historical, forecast, trend);

    const result: PredictionResult = {
      historical,
      forecast,
      trend,
      explanation
    };

    console.log('Income prediction completed:', { 
      historicalCount: historical.length, 
      forecastCount: forecast.length, 
      trend 
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in income prediction function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
