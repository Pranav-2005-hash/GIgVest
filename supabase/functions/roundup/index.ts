const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RoundUpRequest {
  amount: number;
}

function calculateRoundUp(amount: number): number {
  if (amount <= 0) return 0;
  
  const nearestFive = Math.ceil(amount / 5) * 5;
  const roundUpAmount = nearestFive - amount;
  
  // If the amount is already a multiple of 5, round up to next 5
  return roundUpAmount === 0 ? 5 : roundUpAmount;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: RoundUpRequest = await req.json();
    
    if (!body.amount || typeof body.amount !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing amount field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const roundUpAmount = calculateRoundUp(body.amount);

    return new Response(
      JSON.stringify({ roundUpAmount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in roundup function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});