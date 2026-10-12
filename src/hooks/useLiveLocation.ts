import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Subscribe to a ride's live driver location (riders with accepted requests + driver). */
export function useRideLocation(rideId: string | undefined) {
  const [loc, setLoc] = useState<{ lat: number; lng: number; updated_at: string } | null>(null);
  useEffect(() => {
    if (!rideId) return;
    supabase.from("ride_locations").select("lat,lng,updated_at").eq("ride_id", rideId).maybeSingle()
      .then(({ data }) => data && setLoc(data));
    const ch = supabase.channel(`loc-${rideId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ride_locations", filter: `ride_id=eq.${rideId}` },
        (p: any) => p.new?.lat && setLoc({ lat: p.new.lat, lng: p.new.lng, updated_at: p.new.updated_at }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [rideId]);
  return loc;
}

/** Driver side: stream GPS to the backend while active (throttled to every 5s). */
export function useBroadcastLocation(rideId: string | null, driverId: string | undefined) {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const last = useRef(0);
  useEffect(() => {
    if (!rideId || !driverId) return;
    if (!navigator.geolocation) { setErr("GPS not available on this device"); return; }
    const id = navigator.geolocation.watchPosition(async (p) => {
      const c = { lat: p.coords.latitude, lng: p.coords.longitude };
      setPos(c);
      if (Date.now() - last.current < 5000) return;
      last.current = Date.now();
      const { error } = await supabase.from("ride_locations").upsert({
        ride_id: rideId, driver_id: driverId, ...c,
        heading: p.coords.heading, speed: p.coords.speed, updated_at: new Date().toISOString(),
      });
      setErr(error ? error.message : null);
    }, (e) => setErr(e.message), { enableHighAccuracy: true, maximumAge: 3000 });
    return () => navigator.geolocation.clearWatch(id);
  }, [rideId, driverId]);
  return { pos, err };
}
