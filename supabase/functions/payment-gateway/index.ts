import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  holderName: string;
  enableRoundUp: boolean;
}

interface BlockchainTransaction {
  transactionId: string;
  blockHash: string;
  blockNumber: number;
  timestamp: string;
  amount: number;
  roundUpAmount: number;
  fee: number;
  confirmations: number;
}

// Simulate blockchain transaction processing
function generateBlockchainTransaction(amount: number, roundUpAmount: number): BlockchainTransaction {
  const transactionId = `0x${Math.random().toString(16).substr(2, 64)}`;
  const blockHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  const blockNumber = Math.floor(Math.random() * 1000000) + 18000000;
  const fee = 0.001; // Simulated blockchain fee
  
  return {
    transactionId,
    blockHash,
    blockNumber,
    timestamp: new Date().toISOString(),
    amount,
    roundUpAmount,
    fee,
    confirmations: Math.floor(Math.random() * 12) + 1
  };
}

serve(async (req) => {
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
    const { amount, cardNumber, expiryDate, cvv, holderName, enableRoundUp }: PaymentRequest = await req.json();
    
    // Validate required fields
    if (!amount || !cardNumber || !expiryDate || !cvv || !holderName) {
      return new Response(
        JSON.stringify({ error: 'All payment fields are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount must be positive' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate round-up if enabled
    let roundUpAmount = 0;
    let totalAmount = amount;
    
    if (enableRoundUp) {
      const nearestFive = Math.ceil(amount / 5) * 5;
      roundUpAmount = nearestFive - amount;
      if (roundUpAmount === 0) roundUpAmount = 5;
      totalAmount = amount + roundUpAmount;
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate payment success (95% success rate)
    const paymentSuccess = Math.random() > 0.05;
    
    if (!paymentSuccess) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment declined by bank. Please try a different card.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate blockchain transaction record
    const blockchainTx = generateBlockchainTransaction(amount, roundUpAmount);

    // Simulate payment gateway response
    const paymentResponse = {
      success: true,
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalAmount: amount,
      roundUpAmount,
      totalAmount,
      processingFee: totalAmount * 0.029, // 2.9% processing fee
      netAmount: totalAmount - (totalAmount * 0.029),
      cardLast4: cardNumber.slice(-4),
      timestamp: new Date().toISOString(),
      status: 'completed',
      blockchain: blockchainTx,
      savings: {
        roundUpSaved: roundUpAmount,
        totalSavingsToDate: Math.floor(Math.random() * 5000) + roundUpAmount,
        projectedYearlySavings: roundUpAmount * 365 / 7 // Assuming one transaction per week
      }
    };

    console.log('Payment processed successfully:', paymentResponse.transactionId);

    return new Response(
      JSON.stringify(paymentResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in payment-gateway function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});