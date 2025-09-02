import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TransactionData {
  amount: number;
  category: string;
  date: string;
  description?: string;
  type: 'debit' | 'credit';
}

function calculateRoundUp(amount: number): { roundUpAmount: number; roundUpApplied: boolean } {
  const nearestFive = Math.ceil(amount / 5) * 5;
  const roundUpAmount = nearestFive - amount;
  
  return {
    roundUpAmount: roundUpAmount === 0 ? 5 : roundUpAmount,
    roundUpApplied: true
  };
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
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'GET') {
      // Fetch all transactions for the user
      const { data: transactions, error } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch transactions' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ transactions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      const body: TransactionData = await req.json();
      
      if (!body.amount || !body.category || !body.date || !body.type) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: amount, category, date, type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate round-up for debit transactions
      let roundUpAmount = 0;
      let roundUpApplied = false;
      
      if (body.type === 'debit') {
        const roundUp = calculateRoundUp(body.amount);
        roundUpAmount = roundUp.roundUpAmount;
        roundUpApplied = roundUp.roundUpApplied;
      }

      // Insert the transaction
      const { data: transaction, error: transactionError } = await supabaseClient
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: body.amount,
          category: body.category,
          date: body.date,
          description: body.description || '',
          type: body.type,
          round_up_amount: roundUpAmount,
          round_up_applied: roundUpApplied,
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create transaction' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update savings if round-up was applied
      if (roundUpApplied && roundUpAmount > 0) {
        // Get or create default savings goal
        let { data: savings, error: savingsError } = await supabaseClient
          .from('savings')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (savingsError && savingsError.code === 'PGRST116') {
          // No savings goal found, create one
          const { data: newSavings, error: createError } = await supabaseClient
            .from('savings')
            .insert({
              user_id: user.id,
              goal_name: 'Round-Up Savings',
              target_amount: 10000,
              current_amount: roundUpAmount,
              status: 'active',
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating savings goal:', createError);
          }
        } else if (!savingsError && savings) {
          // Update existing savings
          const { error: updateError } = await supabaseClient
            .from('savings')
            .update({
              current_amount: savings.current_amount + roundUpAmount,
            })
            .eq('id', savings.id);

          if (updateError) {
            console.error('Error updating savings:', updateError);
          }
        }
      }

      return new Response(
        JSON.stringify({ transaction }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in transactions function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});