import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Train, Building2, GraduationCap, Landmark, Footprints } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BusStop {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  zone: string;
  stop_type: string;
  popularity: number;
}

const STOP_ICONS: Record<string, typeof MapPin> = {
  metro: Train,
  transit: Train,
  college: GraduationCap,
  corporate: Building2,
  landmark: Landmark,
  junction: Navigation,
  pickup: MapPin,
};

const ZONE_COLORS: Record<string, string> = {
  guindy: "bg-primary/10 text-primary border-primary/20",
  omr: "bg-accent/10 text-accent-foreground border-accent/20",
  tambaram: "bg-destructive/10 text-destructive border-destructive/20",
  chrompet: "bg-secondary text-secondary-foreground border-border",
  velachery: "bg-primary/10 text-primary border-primary/20",
  adyar: "bg-accent/10 text-accent-foreground border-accent/20",
  tnagar: "bg-muted text-muted-foreground border-border",
  porur: "bg-secondary text-secondary-foreground border-border",
};

interface ClusterResult {
  meeting_point: { lat: number; lng: number };
  matched_stop: { id: string; name: string; description: string; type: string } | null;
  stats: {
    max_walking_m: number;
    avg_walking_m: number;
    all_within_radius: boolean;
    detour_reduction_pct: number;
  };
  rider_distances: Array<{ rider_index: number; walking_distance_m: number; within_radius: boolean }>;
}

const VirtualBusStops = () => {
  const [stops, setStops] = useState<BusStop[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [clusterResult, setClusterResult] = useState<ClusterResult | null>(null);
  const [clustering, setClustering] = useState(false);

  useEffect(() => {
    const fetchStops = async () => {
      const { data } = await supabase
        .from("virtual_bus_stops")
        .select("*")
        .order("popularity", { ascending: false });
      if (data) setStops(data);
    };
    fetchStops();
  }, []);

  const zones = ["all", ...new Set(stops.map((s) => s.zone))];
  const filtered = selectedZone === "all" ? stops : stops.filter((s) => s.zone === selectedZone);

  // Demo clustering with sample rider locations
  const runDemoClustering = async () => {
    setClustering(true);
    try {
      // Sample riders near Guindy/Velachery area
      const demoRiders = [
        { lat: 13.0080, lng: 80.2190 },
        { lat: 13.0050, lng: 80.2220 },
        { lat: 13.0095, lng: 80.2240 },
        { lat: 13.0065, lng: 80.2180 },
      ];

      const { data, error } = await supabase.functions.invoke("cluster-pickup", {
        body: { rider_locations: demoRiders, max_walking_radius: 300 },
      });

      if (error) throw error;
      setClusterResult(data);
    } catch (err) {
      console.error("Clustering error:", err);
    } finally {
      setClustering(false);
    }
  };

  return (
    <section className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
            <Navigation className="w-3 h-3" />
            ZHOOP PICKUP POINTS
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Virtual Bus Stops
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            No more door-to-door detours. Walk to the nearest Zhoop Point — our algorithm finds the
            optimal meeting spot within <strong>200m walking distance</strong> for all riders.
          </p>
        </div>

        {/* Zone filter chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${
                selectedZone === zone
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {zone === "all" ? "All Zones" : zone}
            </button>
          ))}
        </div>

        {/* Stops grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {filtered.map((stop, i) => {
            const Icon = STOP_ICONS[stop.stop_type] || MapPin;
            const zoneStyle = ZONE_COLORS[stop.zone] || "bg-muted text-muted-foreground border-border";

            return (
              <motion.div
                key={stop.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${zoneStyle}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-sm text-foreground truncate">{stop.name}</p>
                  {stop.description && (
                    <p className="text-[11px] text-muted-foreground truncate">{stop.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${zoneStyle}`}>
                      {stop.zone}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize">{stop.stop_type}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* K-Means Demo */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-foreground">Smart Clustering Demo</h3>
              <p className="text-[11px] text-muted-foreground">
                K-Means algorithm finds optimal meeting point for 4 riders
              </p>
            </div>
            <button
              onClick={runDemoClustering}
              disabled={clustering}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {clustering ? "Computing..." : "Run Clustering"}
            </button>
          </div>

          {clusterResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Matched stop */}
              {clusterResult.matched_stop ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="font-display font-bold text-sm text-foreground">
                      {clusterResult.matched_stop.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{clusterResult.matched_stop.description}</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-xs text-muted-foreground">
                  No predefined stop within radius — using computed centroid at{" "}
                  {clusterResult.meeting_point.lat.toFixed(4)}, {clusterResult.meeting_point.lng.toFixed(4)}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="font-display font-bold text-lg text-foreground">
                    {clusterResult.stats.avg_walking_m}m
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Walk</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="font-display font-bold text-lg text-foreground">
                    {clusterResult.stats.max_walking_m}m
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Max Walk</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-primary/5">
                  <p className="font-display font-bold text-lg text-primary">
                    -{clusterResult.stats.detour_reduction_pct}%
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Detour Cut</p>
                </div>
              </div>

              {/* Rider distances */}
              <div className="space-y-1.5">
                {clusterResult.rider_distances.map((rd) => (
                  <div key={rd.rider_index} className="flex items-center gap-2 text-xs">
                    <Footprints className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Rider {rd.rider_index + 1}:</span>
                    <span className={`font-semibold ${rd.within_radius ? "text-primary" : "text-destructive"}`}>
                      {rd.walking_distance_m}m
                    </span>
                    {rd.within_radius && (
                      <span className="text-[10px] text-primary">✓ within radius</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default VirtualBusStops;
