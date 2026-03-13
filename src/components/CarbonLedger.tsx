import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, ArrowUpRight, Leaf, ShieldCheck, Hash, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LedgerEntry {
  id: string;
  created_at: string;
  distance_km: number;
  occupancy: number;
  bau_emissions_g: number;
  actual_emissions_g: number;
  delta_g: number;
  vehicle_type: string;
  entry_hash: string;
  previous_hash: string | null;
  verified: boolean;
}

// Fallback mock for non-authenticated users
const MOCK_LEDGER: LedgerEntry[] = [
  { id: "1", created_at: "2026-03-12T10:00:00Z", distance_km: 15, occupancy: 3, bau_emissions_g: 2880, actual_emissions_g: 960, delta_g: 1920, vehicle_type: "car", entry_hash: "a7f3c2..d91e", previous_hash: "GENESIS", verified: true },
  { id: "2", created_at: "2026-03-11T08:30:00Z", distance_km: 22, occupancy: 4, bau_emissions_g: 4224, actual_emissions_g: 1056, delta_g: 3168, vehicle_type: "car", entry_hash: "b8e4d3..c02f", previous_hash: "a7f3c2..d91e", verified: true },
  { id: "3", created_at: "2026-03-10T07:15:00Z", distance_km: 8, occupancy: 2, bau_emissions_g: 1536, actual_emissions_g: 768, delta_g: 768, vehicle_type: "car", entry_hash: "c9f5e4..b13g", previous_hash: "b8e4d3..c02f", verified: true },
  { id: "4", created_at: "2026-03-09T09:00:00Z", distance_km: 12, occupancy: 1, bau_emissions_g: 2304, actual_emissions_g: 600, delta_g: 1704, vehicle_type: "bike", entry_hash: "d0g6f5..a24h", previous_hash: "c9f5e4..b13g", verified: true },
  { id: "5", created_at: "2026-03-08T08:00:00Z", distance_km: 18, occupancy: 3, bau_emissions_g: 3456, actual_emissions_g: 1152, delta_g: 2304, vehicle_type: "car", entry_hash: "e1h7g6..935i", previous_hash: "d0g6f5..a24h", verified: true },
];

const CarbonLedger = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LedgerEntry[]>(MOCK_LEDGER);
  const [showHashes, setShowHashes] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchLedger = async () => {
      const { data } = await supabase
        .from("carbon_ledger")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data && data.length > 0) setEntries(data as LedgerEntry[]);
    };
    fetchLedger();
  }, [user]);

  const totalDelta = entries.reduce((s, e) => s + Number(e.delta_g), 0);
  const totalBAU = entries.reduce((s, e) => s + Number(e.bau_emissions_g), 0);
  const treeEquiv = (totalDelta / 12000).toFixed(1); // ~12kg CO2 per mangrove/year

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg text-foreground tracking-wide">
            The Carbon Ledger
          </h3>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold uppercase tracking-widest">
            MRV
          </span>
        </div>
        <button
          onClick={() => setShowHashes(!showHashes)}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Hash className="w-3 h-3" />
          {showHashes ? "Hide" : "Show"} Chain
        </button>
      </div>

      {/* Summary bar */}
      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">BAU Avoided</p>
            <p className="font-display font-bold text-xl text-foreground" style={{ fontFamily: "'Space Grotesk', monospace" }}>
              {(totalBAU / 1000).toFixed(1)}
              <span className="text-xs text-muted-foreground ml-1">kg</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">CO₂ Saved</p>
            <p className="font-display font-bold text-xl text-primary" style={{ fontFamily: "'Space Grotesk', monospace" }}>
              {(totalDelta / 1000).toFixed(1)}
              <span className="text-xs text-muted-foreground ml-1">kg</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Mangroves</p>
            <p className="font-display font-bold text-xl text-primary flex items-center gap-1">
              <Leaf className="w-4 h-4" />
              {treeEquiv}
            </p>
          </div>
        </div>
      </div>

      {/* Ledger table — blockchain explorer style */}
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[70px_1fr_65px_65px_55px] gap-1 px-3 py-2 bg-muted/50 border-b border-border text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
          <span>Date</span>
          <span>Scenario</span>
          <span className="text-right">BAU (g)</span>
          <span className="text-right">Δ Saved</span>
          <span className="text-right">Status</span>
        </div>

        {entries.map((entry, i) => {
          const date = new Date(entry.created_at);
          const dateStr = `${date.getDate()} ${date.toLocaleString("en", { month: "short" })}`;

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <div
                className="grid grid-cols-[70px_1fr_65px_65px_55px] gap-1 px-3 py-2 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                style={{ fontFamily: "'Space Grotesk', monospace" }}
              >
                <span className="text-[11px] text-muted-foreground">{dateStr}</span>
                <span className="text-[11px] text-foreground truncate">
                  {entry.vehicle_type === "bike" ? "🏍" : "🚗"} {entry.distance_km}km × {entry.occupancy}p
                </span>
                <span className="text-[11px] text-right text-muted-foreground">
                  {entry.bau_emissions_g}
                </span>
                <span className="text-[11px] text-right font-semibold text-primary flex items-center justify-end gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {entry.delta_g}
                </span>
                <span className="text-right">
                  {entry.verified ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-primary inline-block" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">pending</span>
                  )}
                </span>
              </div>

              {/* Hash chain row */}
              {showHashes && (
                <div className="px-3 py-1.5 bg-muted/20 border-b border-border flex items-center gap-2 text-[9px] text-muted-foreground overflow-hidden" style={{ fontFamily: "monospace" }}>
                  <Link2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {entry.previous_hash === "GENESIS" ? "⛓ GENESIS → " : `${entry.previous_hash?.slice(0, 8)}… → `}
                    <span className="text-foreground font-semibold">{entry.entry_hash.slice(0, 12)}…</span>
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-[10px] text-muted-foreground">
          🌊 Mangroves measured in Adyar Estuary equivalents • SHA-256 hash-chained
        </p>
        <p className="text-[10px] text-muted-foreground font-semibold">
          {entries.length} entries • {entries.filter((e) => e.verified).length} verified
        </p>
      </div>
    </div>
  );
};

export default CarbonLedger;
