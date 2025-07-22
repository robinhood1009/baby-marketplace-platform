import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "offer_submitted" | "offer_approved" | "ad_purchased";
  vendorEmail: string;
  data: {
    title?: string;
    start_date?: string;
    end_date?: string;
    offer_id?: string;
    public_link?: string;
  };
}

const getEmailTemplate = (type: string, data: any) => {
  const baseStyles = `
    <style>
      .email-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        max-width: 600px;
        margin: 0 auto;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        overflow: hidden;
      }
      .email-header {
        background: rgba(255, 255, 255, 0.1);
        padding: 32px;
        text-align: center;
        color: white;
      }
      .email-body {
        background: white;
        padding: 32px;
        color: #333;
        line-height: 1.6;
      }
      .email-footer {
        background: #f8f9fa;
        padding: 24px;
        text-align: center;
        color: #666;
        font-size: 14px;
      }
      .button {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        margin: 16px 0;
      }
      .highlight {
        background: #f0f4ff;
        padding: 16px;
        border-radius: 8px;
        border-left: 4px solid #667eea;
        margin: 16px 0;
      }
    </style>
  `;

  switch (type) {
    case "offer_submitted":
      return {
        subject: "🎉 Thanks for submitting your offer!",
        html: `
          ${baseStyles}
          <div class="email-container">
            <div class="email-header">
              <h1>🎉 Submission Received!</h1>
            </div>
            <div class="email-body">
              <h2>Hey there!</h2>
              <p>Thanks so much for submitting your offer "<strong>${data.title}</strong>"! We're excited to review it.</p>
              
              <div class="highlight">
                <p><strong>What happens next?</strong></p>
                <p>Our team will review your submission within 24-48 hours. We'll email you as soon as it's approved and live on the site!</p>
              </div>
              
              <p>In the meantime, feel free to prepare more amazing offers for our community of parents.</p>
              
              <p>Best regards,<br>The Baby Deals Team</p>
            </div>
            <div class="email-footer">
              <p>Questions? Reply to this email - we're here to help! 💜</p>
            </div>
          </div>
        `
      };

    case "offer_approved":
      return {
        subject: "🚀 Your offer is now LIVE!",
        html: `
          ${baseStyles}
          <div class="email-container">
            <div class="email-header">
              <h1>🚀 Congratulations!</h1>
            </div>
            <div class="email-body">
              <h2>Your offer is now live!</h2>
              <p>Great news! Your offer "<strong>${data.title}</strong>" has been approved and is now visible to thousands of parents looking for amazing baby deals.</p>
              
              <div class="highlight">
                <p><strong>Your offer is live at:</strong></p>
                <a href="${data.public_link}" class="button" target="_blank">View Your Live Offer</a>
              </div>
              
              <p>Share this link with your customers and on social media to maximize your reach!</p>
              
              <p>Ready to submit more offers? We'd love to feature more of your products!</p>
              
              <p>Cheers to your success,<br>The Baby Deals Team</p>
            </div>
            <div class="email-footer">
              <p>Track your offer performance in your vendor dashboard 📊</p>
            </div>
          </div>
        `
      };

    case "ad_purchased":
      return {
        subject: "✨ Your ad campaign is confirmed!",
        html: `
          ${baseStyles}
          <div class="email-container">
            <div class="email-header">
              <h1>✨ Ad Campaign Confirmed!</h1>
            </div>
            <div class="email-body">
              <h2>Payment successful!</h2>
              <p>Awesome! Your ad campaign for "<strong>${data.title}</strong>" has been confirmed and paid for.</p>
              
              <div class="highlight">
                <p><strong>Campaign Details:</strong></p>
                <p>📅 <strong>Start Date:</strong> ${data.start_date}</p>
                <p>📅 <strong>End Date:</strong> ${data.end_date}</p>
                <p>🎯 Your ad will be prominently displayed during this period</p>
              </div>
              
              <p>Your ad will go live on the start date and reach thousands of engaged parents actively looking for baby products.</p>
              
              <p>We'll send you performance updates throughout your campaign!</p>
              
              <p>Thank you for choosing us,<br>The Baby Deals Team</p>
            </div>
            <div class="email-footer">
              <p>Need to make changes? Contact us within 24 hours of your start date 🕒</p>
            </div>
          </div>
        `
      };

    default:
      return {
        subject: "Update from Baby Deals",
        html: `<p>Thank you for using our platform!</p>`
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, vendorEmail, data }: EmailRequest = await req.json();
    
    console.log(`Sending ${type} email to ${vendorEmail}`);
    
    const emailTemplate = getEmailTemplate(type, data);
    
    const emailResponse = await resend.emails.send({
      from: "Baby Deals <onboarding@resend.dev>",
      to: [vendorEmail],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-vendor-email function:", error);
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