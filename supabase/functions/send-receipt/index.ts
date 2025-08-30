import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ReceiptData {
  email: string;
  transactionId: string;
  originalAmount: number;
  roundUpAmount: number;
  totalAmount: number;
  processingFee: number;
  cardLast4: string;
  timestamp: string;
  blockchain: {
    transactionId: string;
    blockHash: string;
    blockNumber: number;
    confirmations: number;
    fee: number;
  };
  savings: {
    roundUpSaved: number;
    totalSavingsToDate: number;
    projectedYearlySavings: number;
  };
}

const generateReceiptHTML = (data: ReceiptData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt - GigVest</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; }
        .section { background: white; margin: 15px 0; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .amount { font-size: 24px; font-weight: bold; color: #667eea; }
        .savings { color: #10b981; font-weight: bold; }
        .blockchain { background: #f0f9ff; border-left: 4px solid #3b82f6; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; width: 40%; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏦 GigVest Payment Receipt</h1>
        <p>Thank you for your payment!</p>
      </div>
      
      <div class="content">
        <div class="section">
          <h2>Transaction Details</h2>
          <table>
            <tr><td class="label">Transaction ID:</td><td>${data.transactionId}</td></tr>
            <tr><td class="label">Date & Time:</td><td>${new Date(data.timestamp).toLocaleString()}</td></tr>
            <tr><td class="label">Card:</td><td>**** **** **** ${data.cardLast4}</td></tr>
            <tr><td class="label">Status:</td><td>✅ Completed</td></tr>
          </table>
        </div>

        <div class="section">
          <h2>Payment Breakdown</h2>
          <table>
            <tr><td class="label">Original Amount:</td><td>₹${data.originalAmount.toFixed(2)}</td></tr>
            ${data.roundUpAmount > 0 ? `<tr><td class="label savings">Round-Up Savings:</td><td class="savings">+₹${data.roundUpAmount.toFixed(2)}</td></tr>` : ''}
            <tr><td class="label">Processing Fee (2.9%):</td><td>₹${data.processingFee.toFixed(2)}</td></tr>
            <tr style="border-top: 2px solid #333;"><td class="label">Total Charged:</td><td class="amount">₹${data.totalAmount.toFixed(2)}</td></tr>
          </table>
        </div>

        ${data.roundUpAmount > 0 ? `
        <div class="section">
          <h2>💰 Your Savings Progress</h2>
          <table>
            <tr><td class="label">This Transaction:</td><td class="savings">₹${data.savings.roundUpSaved.toFixed(2)}</td></tr>
            <tr><td class="label">Total Saved:</td><td class="savings">₹${data.savings.totalSavingsToDate.toFixed(2)}</td></tr>
            <tr><td class="label">Projected Annual:</td><td class="savings">₹${data.savings.projectedYearlySavings.toFixed(2)}</td></tr>
          </table>
        </div>
        ` : ''}

        <div class="section blockchain">
          <h2>🔗 Blockchain Transaction Record</h2>
          <table>
            <tr><td class="label">Block Number:</td><td>${data.blockchain.blockNumber.toLocaleString()}</td></tr>
            <tr><td class="label">Confirmations:</td><td>${data.blockchain.confirmations}/12</td></tr>
            <tr><td class="label">Network Fee:</td><td>₹${data.blockchain.fee.toFixed(3)}</td></tr>
            <tr><td class="label">Transaction Hash:</td><td style="font-family: monospace; font-size: 10px; word-break: break-all;">${data.blockchain.transactionId}</td></tr>
          </table>
        </div>

        <div class="footer">
          <p>This is an automated receipt from GigVest. Please keep this for your records.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>© 2024 GigVest - Secure Financial Services</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

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
    const receiptData: ReceiptData = await req.json();
    
    // Validate required fields
    if (!receiptData.email || !receiptData.transactionId) {
      return new Response(
        JSON.stringify({ error: 'Email and transaction ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending receipt to:', receiptData.email);

    const emailResponse = await resend.emails.send({
      from: "GigVest Payments <noreply@resend.dev>",
      to: [receiptData.email],
      subject: `Payment Receipt - ₹${receiptData.totalAmount.toFixed(2)} | ${receiptData.transactionId}`,
      html: generateReceiptHTML(receiptData),
    });

    console.log('Receipt email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Receipt sent successfully',
        emailId: emailResponse.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-receipt function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send receipt', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});