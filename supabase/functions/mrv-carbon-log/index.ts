import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// CO2 emission factors in grams per km
const EMISSION_FACTORS = {
  // BAU: single-occupancy petrol car (Indian avg)
  bau_petrol_car: 192, // g CO2/km for a typical petrol car in India
  // Shared ride emissions per person
  car_per_occupant: (occupancy: number) => 192 / occupancy, // Split among riders
  bike_per_occupant: 50, // g CO2/km for a bike (already efficient)
};

// SHA-256 hash for chain integrity
async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { ride_id, distance_km, occupancy, vehicle_type = "car" } = await req.json();

    if (!ride_id || !distance_km || !occupancy) {
      return new Response(
        JSON.stringify({ error: "ride_id, distance_km, and occupancy are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: BAU Calculation (what if user drove alone in petrol car)
    const bauEmissions = Math.round(EMISSION_FACTORS.bau_petrol_car * distance_km);

    // Step 2: Actual emissions (shared ride)
    const actualEmissions =
      vehicle_type === "bike"
        ? Math.round(EMISSION_FACTORS.bike_per_occupant * distance_km)
        : Math.round(EMISSION_FACTORS.car_per_occupant(occupancy) * distance_km);

    // Step 3: Delta (savings)
    const delta = bauEmissions - actualEmissions;

    // Step 4: Get previous hash for chain
    const { data: lastEntry } = await supabaseAdmin
      .from("carbon_ledger")
      .select("entry_hash")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const previousHash = lastEntry?.entry_hash || "GENESIS";

    // Step 5: Create entry hash
    const entryData = `${previousHash}|${userId}|${ride_id}|${distance_km}|${occupancy}|${bauEmissions}|${actualEmissions}|${delta}|${Date.now()}`;
    const entryHash = await sha256(entryData);

    // Step 6: Insert immutable ledger entry
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("carbon_ledger")
      .insert({
        ride_id,
        user_id: userId,
        distance_km,
        occupancy,
        bau_emissions_g: bauEmissions,
        actual_emissions_g: actualEmissions,
        delta_g: delta,
        vehicle_type,
        previous_hash: previousHash,
        entry_hash: entryHash,
        verified: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Ledger insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to log carbon entry" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        entry: inserted,
        calculation: {
          bau_scenario: `Single petrol car: ${bauEmissions}g CO₂`,
          actual_scenario: `Shared ${vehicle_type} (${occupancy} people): ${actualEmissions}g CO₂`,
          savings: `${delta}g CO₂ saved`,
          tree_equivalent: (delta / 12000).toFixed(3), // ~12kg CO2 per mangrove tree/year
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("MRV carbon log error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
