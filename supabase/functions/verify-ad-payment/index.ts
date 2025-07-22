import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the session ID from the request
    const { sessionId } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Create Supabase service client to update the ads table
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Get user profile to get the profile ID (vendor_id)
      const { data: profile } = await supabaseService
        .from('profiles')
        .select('id')
        .eq('user_id', session.metadata?.user_id)
        .single();

      if (profile) {
        // Insert the ad record with paid = true
        const { error: insertError } = await supabaseService
          .from('ads')
          .insert({
            vendor_id: profile.id,
            start_date: session.metadata?.start_date,
            end_date: session.metadata?.end_date,
            stripe_session_id: sessionId,
            paid: true
          });

        if (insertError) {
          console.error("Error inserting ad record:", insertError);
          throw new Error("Failed to create ad record");
        }

        console.log(`Successfully created paid ad for vendor ${profile.id}`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      paid: session.payment_status === "paid",
      session: session 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});