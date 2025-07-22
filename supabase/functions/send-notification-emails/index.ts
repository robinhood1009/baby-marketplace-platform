import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, record } = await req.json();
    
    console.log(`Processing ${type} notification for record:`, record);
    
    let emailData = null;
    
    switch (type) {
      case "offer.inserted":
        // Get vendor email for new offer submission
        const { data: offerProfile } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("id", record.vendor_id)
          .single();
          
        if (offerProfile) {
          const { data: offerUser } = await supabase.auth.admin.getUserById(offerProfile.user_id);
          if (offerUser.user?.email) {
            emailData = {
              type: "offer_submitted",
              vendorEmail: offerUser.user.email,
              data: {
                title: record.title
              }
            };
          }
        }
        break;
        
      case "offer.updated":
        // Check if status changed to approved
        if (record.status === "approved") {
          const { data: approvedProfile } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("id", record.vendor_id)
            .single();
            
          if (approvedProfile) {
            const { data: approvedUser } = await supabase.auth.admin.getUserById(approvedProfile.user_id);
            if (approvedUser.user?.email) {
              emailData = {
                type: "offer_approved",
                vendorEmail: approvedUser.user.email,
                data: {
                  title: record.title,
                  public_link: `${req.headers.get("origin") || "https://your-domain.com"}/offers?id=${record.id}`
                }
              };
            }
          }
        }
        break;
        
      case "ad.updated":
        // Check if ad was marked as paid
        if (record.paid === true) {
          const { data: adProfile } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("id", record.vendor_id)
            .single();
            
          if (adProfile) {
            const { data: adUser } = await supabase.auth.admin.getUserById(adProfile.user_id);
            if (adUser.user?.email) {
              emailData = {
                type: "ad_purchased",
                vendorEmail: adUser.user.email,
                data: {
                  title: "Ad Campaign", // You might want to add a title field to ads table
                  start_date: new Date(record.start_date).toLocaleDateString(),
                  end_date: new Date(record.end_date).toLocaleDateString()
                }
              };
            }
          }
        }
        break;
    }
    
    if (emailData) {
      // Call the email sending function
      const emailResult = await supabase.functions.invoke("send-vendor-email", {
        body: emailData
      });
      
      if (emailResult.error) {
        console.error("Error sending email:", emailResult.error);
        throw emailResult.error;
      }
      
      console.log("Email sent successfully");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in notification handler:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);