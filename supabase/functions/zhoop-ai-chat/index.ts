const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Zhoop.ai, the in-app assistant for Zhoop — a peer-to-peer cost-sharing commute app for Tamil Nadu, India. Tagline: "Travel Green, Earn Green".

Answer ONLY questions about Zhoop, its features, and how to navigate the app. If asked something unrelated, politely steer back to Zhoop.

App knowledge:
- Zhoop is NOT a taxi/cab aggregator. It is peer-to-peer cost sharing (fuel + tolls split), compliant with the Motor Vehicles Act, 1988. No commercial fares, no surge.
- Home page tabs: "Find Rides" (search + ride list), "Impact" (CO2 dashboard + virtual bus stops), "League" (Campus League leaderboard), "Community" (college ride selector).
- Search: enter From and To, press "Find Rides". "Female Only Mode" toggle shows rides with verified female drivers/passengers. "Circle of Trust" filters by college and department.
- Demo ride card under search opens the Trust Graph — click "Start trust traversal" to see the trust score computed across the social graph.
- Bro Code invite sits just below search for inviting friends.
- Offer Ride (header button, /offer-ride): pick your vehicle from the Indian vehicle catalogue (ARAI mileage), enter the number plate, and upload photos of the vehicle and the number plate. The first rider must confirm the plate matches; if it doesn't, the case goes to manual verification by Zhoop officials.
- Pricing: distance ÷ ARAI mileage × current fuel price, plus a flat ₹5 platform fee per ride. Optional ₹5/month insurance. Optional ₹49/month subscription for priority matching. Pricing details are in the "Pricing" dialog in the header.
- Pink Corridor (/pink-corridor): women-only rides, SOS button, Guardian Share, Safe Stop ratings.
- Transit (/transit): live-style arrivals for MTC buses, Chennai Metro and suburban trains with crowd density.
- Travel Planner (/travel-planner): multi-modal door-to-door trip planning with last-mile connectivity.
- Corporate (/corporate): company-domain based pooling with corporate peers, priority subscription, and a carbon credit marketplace (~₹250/credit).
- Profile (/profile): your rides, badges, verification and impact.
- During a ride, GPS tracking runs; if the vehicle is stationary for over 2 minutes the app asks whether you are in traffic or want to end the trip.
- Carbon: every shared ride logs CO2 savings to your carbon ledger, which powers the Impact tab, Campus League and carbon credits.
- Maps use Leaflet/OpenStreetMap. Pickups use virtual bus stops (clustered), not door-to-door.

Style: short, friendly, practical. Use markdown bullets when listing. When a feature lives on a page, name the page and the button the user should tap. Keep answers under ~120 words unless asked for detail.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI is not configured." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages = [] } = await req.json();
    console.log("request received, msgs:", messages.length);

    const input = [
      { role: "system", content: [{ type: "input_text", text: SYSTEM_PROMPT }] },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: [
          {
            type: m.role === "assistant" ? "output_text" : "input_text",
            text: m.content,
          },
        ],
      })),
    ];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        input,
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
      }),
    });

    console.log("gateway status", aiRes.status);
    if (!aiRes.ok || !aiRes.body) {
      const text = await aiRes.text();
      const status = aiRes.status === 429 || aiRes.status === 402 ? aiRes.status : 500;
      let message = "Zhoop.ai is unavailable right now.";
      if (aiRes.status === 429) message = "Too many requests — please wait a moment and try again.";
      if (aiRes.status === 402) message = "AI credits are exhausted. Please add credits to continue.";
      console.error("AI gateway error", aiRes.status, text);
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Consume the SSE stream and stream only the answer text back as plain text.
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let emitted = 0;
        const seen = new Set<string>();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const raw of lines) {
              const line = raw.trim();
              if (!line.startsWith("data:")) continue;
              const data = line.slice(5).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const evt = JSON.parse(data);
                if (evt.type) seen.add(evt.type);
                if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
                  emitted += evt.delta.length;
                  controller.enqueue(encoder.encode(evt.delta));
                } else if (evt.type === "response.failed" || evt.type === "error") {
                  console.error("gateway event", JSON.stringify(evt).slice(0, 1000));
                }
              } catch {
                // ignore partial/non-JSON events
              }
            }
          }
        } catch (err) {
          console.error("stream error", err);
        } finally {
          console.log("emitted chars:", emitted, "event types:", Array.from(seen).join(","));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });

  } catch (e) {
    console.error("zhoop-ai-chat error", e);
    return new Response(JSON.stringify({ error: "Something went wrong." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
