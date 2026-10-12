import { useState } from "react";
import { Link } from "react-router-dom";
import { LocateFixed, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import { resolveLocation } from "@/lib/distance";
import { routeOverlap, MATCH_THRESHOLD, MAX_DETOUR_KM, type LatLng } from "@/lib/matching";
import { useActiveRides } from "@/hooks/useRides";

export default function MatchRides() {
  const { data: rides } = useActiveRides();
  const [here, setHere] = useState<LatLng | null>(null);
  const [fromText, setFromText] = useState("");
  const [to, setTo] = useState("");
  const [results, setResults] = useState<any[] | null>(null);

  const locate = () => navigator.geolocation?.getCurrentPosition(
    (p) => { setHere({ lat: p.coords.latitude, lng: p.coords.longitude }); setFromText("My current location"); },
    () => toast.error("Allow location access to use your current position"),
  );

  const search = () => {
    const from = here ?? resolveLocation(fromText);
    const dest = resolveLocation(to);
    if (!from || !dest) return toast.error("Pick a known start and destination");
    const out = (rides ?? [])
      .filter((r) => r.origin_lat != null && r.destination_lat != null)
      .map((r) => ({ ride: r, ...routeOverlap(
        { lat: r.origin_lat!, lng: r.origin_lng! }, { lat: r.destination_lat!, lng: r.destination_lng! }, from, dest) }))
      .filter((m) => m.score >= MATCH_THRESHOLD && m.detourKm <= MAX_DETOUR_KM)
      .sort((a, b) => b.score - a.score);
    setResults(out);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-xl">
      <h1 className="font-display text-2xl font-bold mb-1">Find a matching ride</h1>
      <p className="text-sm text-muted-foreground mb-5">We show rides whose route covers at least 75% of your trip.</p>
      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          <PlacesAutocomplete value={fromText} onChange={(v) => { setFromText(v); setHere(null); }} placeholder="From" className="flex-1" />
          <Button variant="outline" size="icon" aria-label="Use my location" onClick={locate}><LocateFixed className="w-4 h-4" /></Button>
        </div>
        <PlacesAutocomplete value={to} onChange={setTo} placeholder="Where do you want to go?" />
        <Button className="w-full" onClick={search}><Search className="w-4 h-4 mr-1" />Find matches</Button>
      </div>
      {results && results.length === 0 && <p className="text-muted-foreground text-sm">No rides match 75% of your route yet. Try again later.</p>}
      <div className="space-y-3">
        {results?.map(({ ride, score }) => (
          <Link key={ride.id} to={`/ride/${ride.id}`} className="block rounded-xl border border-border bg-card p-4 hover:border-primary">
            <div className="flex justify-between">
              <span className="font-semibold">{ride.origin} → {ride.destination}</span>
              <span className="text-primary font-bold">{Math.round(score * 100)}% match</span>
            </div>
            <div className="text-xs text-muted-foreground">{ride.profile?.display_name ?? "Driver"} · {ride.seats_available} seats · ₹{ride.price ?? 0}/seat</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
