import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Check, X, Radio, Square, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import LiveMap from "@/components/LiveMap";
import { useBroadcastLocation } from "@/hooks/useLiveLocation";

export default function DriverPanel() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [liveRide, setLiveRide] = useState<string | null>(null);
  const { pos, err } = useBroadcastLocation(liveRide, user?.id);

  const { data } = useQuery({
    queryKey: ["driver-panel", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: rides } = await supabase.from("rides").select("*").eq("user_id", user!.id)
        .in("status", ["active", "in_progress"]).order("departure_time");
      const ids = (rides ?? []).map((r) => r.id);
      const { data: reqs } = ids.length
        ? await supabase.from("ride_requests").select("*").in("ride_id", ids).order("created_at", { ascending: false })
        : { data: [] as any[] };
      const uids = [...new Set((reqs ?? []).map((r) => r.requester_id))];
      const { data: profs } = uids.length
        ? await supabase.from("profiles").select("user_id, display_name, rating, verified").in("user_id", uids)
        : { data: [] as any[] };
      const pm = new Map((profs ?? []).map((p) => [p.user_id, p]));
      return { rides: rides ?? [], reqs: (reqs ?? []).map((r) => ({ ...r, profile: pm.get(r.requester_id) })) };
    },
  });

  // Realtime: refresh when new requests come in
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("driver-reqs")
      .on("postgres_changes", { event: "*", schema: "public", table: "ride_requests" }, () => {
        qc.invalidateQueries({ queryKey: ["driver-panel"] });
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);

  const respond = async (req: any, status: "accepted" | "rejected", ride: any) => {
    if (status === "accepted" && ride.seats_available < req.seats_requested) return toast.error("No seats left");
    const { error } = await supabase.from("ride_requests").update({ status }).eq("id", req.id);
    if (error) return toast.error(error.message);
    if (status === "accepted")
      await supabase.from("rides").update({ seats_available: ride.seats_available - req.seats_requested }).eq("id", ride.id);
    toast.success(status === "accepted" ? "Rider accepted" : "Request declined");
    qc.invalidateQueries({ queryKey: ["driver-panel"] });
  };

  const toggleLive = async (ride: any) => {
    if (liveRide === ride.id) {
      setLiveRide(null);
      await supabase.from("rides").update({ status: "completed" }).eq("id", ride.id);
      toast.success("Trip ended");
    } else {
      setLiveRide(ride.id);
      await supabase.from("rides").update({ status: "in_progress" }).eq("id", ride.id);
      toast.success("Trip started — sharing live location");
    }
    qc.invalidateQueries({ queryKey: ["driver-panel"] });
  };

  if (!user) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <p className="mb-4 text-muted-foreground">Sign in to manage the rides you post.</p>
      <Link to="/auth"><Button>Sign in</Button></Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Driver Panel</h1>
        <Link to="/offer-ride"><Button size="sm"><Plus className="w-4 h-4 mr-1" />Post route</Button></Link>
      </div>
      {liveRide && (
        <div className="mb-6 space-y-2">
          <LiveMap live={pos} />
          <p className="text-xs text-muted-foreground">{err ? `GPS: ${err}` : pos ? "Live location is being shared with your accepted riders." : "Waiting for GPS…"}</p>
        </div>
      )}
      {data?.rides.length === 0 && <p className="text-muted-foreground">No active rides. Post a route to start getting requests.</p>}
      <div className="space-y-4">
        {data?.rides.map((ride) => {
          const reqs = data.reqs.filter((r) => r.ride_id === ride.id);
          return (
            <div key={ride.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex justify-between gap-2 mb-3">
                <div>
                  <div className="font-semibold">{ride.origin} → {ride.destination}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(ride.departure_time), "dd MMM, HH:mm")} · <Users className="inline w-3 h-3" /> {ride.seats_available} seats left · ₹{ride.price ?? 0}/seat
                  </div>
                </div>
                <Button size="sm" variant={liveRide === ride.id ? "destructive" : "default"} onClick={() => toggleLive(ride)}>
                  {liveRide === ride.id ? <><Square className="w-4 h-4 mr-1" />End trip</> : <><Radio className="w-4 h-4 mr-1" />Start trip</>}
                </Button>
              </div>
              {reqs.length === 0 ? <p className="text-xs text-muted-foreground">No requests yet.</p> : (
                <ul className="space-y-2">
                  {reqs.map((r) => (
                    <li key={r.id} className="flex items-center justify-between rounded-lg bg-muted/40 p-2 text-sm">
                      <span>{r.profile?.display_name || "Rider"} · {r.seats_requested} seat · <span className="capitalize">{r.status}</span></span>
                      {r.status === "pending" && (
                        <span className="flex gap-1">
                          <Button size="icon" variant="outline" aria-label="Accept" onClick={() => respond(r, "accepted", ride)}><Check className="w-4 h-4" /></Button>
                          <Button size="icon" variant="outline" aria-label="Decline" onClick={() => respond(r, "rejected", ride)}><X className="w-4 h-4" /></Button>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
