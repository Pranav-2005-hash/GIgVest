import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'
import OpenAI from 'https://esm.sh/openai@4.67.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

function calculateSavingsScore(savingsBalance: number): number {
  // Score based on savings balance (0-100)
  if (savingsBalance >= 50000) return 100;
  if (savingsBalance >= 25000) return 80;
  if (savingsBalance >= 10000) return 60;
  if (savingsBalance >= 5000) return 40;
  if (savingsBalance >= 1000) return 20;
  return 0;
}

function calculateRoundUpScore(roundUpPercentage: number): number {
  // Score based on consistency of round-up usage (0-100)
  if (roundUpPercentage >= 80) return 100;
  if (roundUpPercentage >= 60) return 80;
  if (roundUpPercentage >= 40) return 60;
  if (roundUpPercentage >= 20) return 40;
  if (roundUpPercentage >= 10) return 20;
  return 0;
}

function calculateStabilityScore(incomeVariance: number): number {
  // Lower variance = higher score (0-100)
  if (incomeVariance <= 0.1) return 100; // Very stable
  if (incomeVariance <= 0.2) return 80;  // Stable
  if (incomeVariance <= 0.3) return 60;  // Moderate
  if (incomeVariance <= 0.4) return 40;  // Unstable
  if (incomeVariance <= 0.5) return 20;  // Very unstable
  return 0;
}

function calculateCommunityScore(contributions: number): number {
  // Score based on community contributions (0-100)
  if (contributions >= 10) return 100;
  if (contributions >= 7) return 80;
  if (contributions >= 5) return 60;
  if (contributions >= 3) return 40;
  if (contributions >= 1) return 20;
  return 0;
}

function calculateIncomeVariance(transactions: any[]): number {
  if (transactions.length < 2) return 0;
  
  const amounts = transactions.map(t => Number(t.amount));
  const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
  const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
  const standardDeviation = Math.sqrt(variance);
  
  return mean > 0 ? standardDeviation / mean : 0; // Coefficient of variation
}

async function generateAIAdvice(score: number, breakdown: any, savingsBalance: number, roundUpPercentage: number): Promise<string> {
  try {
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const prompt = `Based on the following credit score analysis, provide personalized financial advice:

Credit Score: ${score}/100
Breakdown:
- Savings Score: ${breakdown.savings}/100 (Current Balance: ₹${savingsBalance.toLocaleString()})
- Round-up Consistency: ${breakdown.roundup}/100 (${roundUpPercentage.toFixed(1)}% of transactions)
- Income Stability: ${breakdown.stability}/100
- Community Engagement: ${breakdown.community}/100

Please provide 2-3 actionable recommendations to improve the credit score. Be specific and encouraging.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful financial advisor providing specific, actionable advice to improve credit scores."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'Focus on building consistent savings habits and maintaining stable income.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Focus on building consistent savings habits and maintaining stable income.';
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

    console.log('Calculating credit score for user:', user.id);

    // Fetch savings data
    const { data: savings, error: savingsError } = await supabaseClient
      .from('savings')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (savingsError) {
      console.error('Error fetching savings:', savingsError);
    }

    const totalSavings = (savings || []).reduce((sum, s) => sum + Number(s.current_amount), 0);

    // Fetch transactions for round-up analysis
    const { data: transactions, error: transactionsError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
    }

    const allTransactions = transactions || [];
    const transactionsWithRoundUp = allTransactions.filter(t => t.round_up_applied);
    const roundUpPercentage = allTransactions.length > 0 ? 
      (transactionsWithRoundUp.length / allTransactions.length) * 100 : 0;

    // Calculate income stability
    const incomeTransactions = allTransactions.filter(t => t.type === 'income');
    const incomeVariance = calculateIncomeVariance(incomeTransactions);

    // Fetch community contributions
    const { data: contributions, error: contributionsError } = await supabaseClient
      .from('community_contributions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'published');

    if (contributionsError) {
      console.error('Error fetching contributions:', contributionsError);
    }

    const contributionCount = (contributions || []).length;

    // Calculate individual scores
    const savingsScore = calculateSavingsScore(totalSavings);
    const roundUpScore = calculateRoundUpScore(roundUpPercentage);
    const stabilityScore = calculateStabilityScore(incomeVariance);
    const communityScore = calculateCommunityScore(contributionCount);

    // Calculate weighted overall score
    const overallScore = Math.round(
      (savingsScore * 0.4) +
      (roundUpScore * 0.25) +
      (stabilityScore * 0.2) +
      (communityScore * 0.15)
    );

    const breakdown = {
      savings: savingsScore,
      roundup: roundUpScore,
      stability: stabilityScore,
      community: communityScore
    };

    // Generate AI advice
    const advice = await generateAIAdvice(overallScore, breakdown, totalSavings, roundUpPercentage);

    const result: CreditScoreResult = {
      score: overallScore,
      breakdown,
      advice
    };

    console.log('Credit score calculated:', { 
      score: overallScore, 
      breakdown,
      totalSavings,
      roundUpPercentage: roundUpPercentage.toFixed(1) + '%',
      contributionCount
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in credit score function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
