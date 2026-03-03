import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Use service role to insert notifications (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, ride_id, target_user_id, requester_name, ride_origin, ride_destination } =
      await req.json();

    let title = "";
    let message = "";
    let type = "info";
    let notifyUserId = target_user_id;

    switch (action) {
      case "ride_requested":
        title = "New Ride Request";
        message = `${requester_name || "Someone"} wants to join your ride from ${ride_origin} to ${ride_destination}.`;
        type = "ride_request";
        break;
      case "request_accepted":
        title = "Request Accepted! 🎉";
        message = `Your request for the ride from ${ride_origin} to ${ride_destination} has been accepted.`;
        type = "ride_accepted";
        break;
      case "request_rejected":
        title = "Request Declined";
        message = `Your request for the ride from ${ride_origin} to ${ride_destination} was declined.`;
        type = "ride_rejected";
        break;
      case "ride_cancelled":
        title = "Ride Cancelled";
        message = `The ride from ${ride_origin} to ${ride_destination} has been cancelled.`;
        type = "ride_cancelled";
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const { error: insertError } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: notifyUserId,
        title,
        message,
        type,
        ride_id,
      });

    if (insertError) {
      console.error("Notification insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create notification" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
