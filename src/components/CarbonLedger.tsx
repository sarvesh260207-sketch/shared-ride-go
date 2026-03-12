import { motion } from "framer-motion";
import { BookOpen, ArrowUpRight, ArrowDownRight, Leaf } from "lucide-react";

interface LedgerEntry {
  date: string;
  type: "earned" | "spent";
  description: string;
  co2Kg: number;
  treeEquiv: number;
}

const MOCK_LEDGER: LedgerEntry[] = [
  { date: "12 Mar 2026", type: "earned", description: "Shared ride: T. Nagar → Tambaram", co2Kg: 2.4, treeEquiv: 0.2 },
  { date: "11 Mar 2026", type: "earned", description: "Shared ride: Anna Nagar → OMR", co2Kg: 3.1, treeEquiv: 0.25 },
  { date: "10 Mar 2026", type: "earned", description: "Offered ride: Adyar → Tidel Park", co2Kg: 1.8, treeEquiv: 0.15 },
  { date: "09 Mar 2026", type: "earned", description: "Shared ride: Guindy → Velachery", co2Kg: 1.2, treeEquiv: 0.1 },
  { date: "08 Mar 2026", type: "earned", description: "Offered ride: Chromepet → T.Nagar", co2Kg: 2.8, treeEquiv: 0.23 },
];

const CarbonLedger = () => {
  const totalCO2 = MOCK_LEDGER.reduce((sum, e) => sum + e.co2Kg, 0);
  const totalTrees = MOCK_LEDGER.reduce((sum, e) => sum + e.treeEquiv, 0);

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="font-display font-bold text-lg text-foreground tracking-wide">The Ledger</h3>
      </div>

      {/* Summary bar */}
      <div className="zhoop-card p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total Impact</p>
          <p className="font-display font-bold text-2xl text-foreground" style={{ fontFamily: "'Space Grotesk', monospace" }}>
            {totalCO2.toFixed(1)} <span className="text-sm text-muted-foreground">kg CO₂</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Tree Equiv.</p>
          <p className="font-display font-bold text-xl text-primary flex items-center gap-1 justify-end">
            <Leaf className="w-4 h-4" />
            {totalTrees.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Ledger entries — bank-statement style */}
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[80px_1fr_80px_60px] gap-2 px-4 py-2 bg-muted/50 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
          <span>Date</span>
          <span>Description</span>
          <span className="text-right">CO₂ (kg)</span>
          <span className="text-right">Trees</span>
        </div>
        {MOCK_LEDGER.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-[80px_1fr_80px_60px] gap-2 px-4 py-2.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            <span className="text-[11px] text-muted-foreground">{entry.date}</span>
            <span className="text-xs text-foreground truncate">{entry.description}</span>
            <span className="text-xs text-right flex items-center justify-end gap-1">
              {entry.type === "earned" ? (
                <ArrowUpRight className="w-3 h-3 text-primary" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-destructive" />
              )}
              <span className={entry.type === "earned" ? "text-primary font-semibold" : "text-destructive font-semibold"}>
                {entry.type === "earned" ? "+" : "-"}{entry.co2Kg.toFixed(1)}
              </span>
            </span>
            <span className="text-[11px] text-right text-muted-foreground">
              {entry.treeEquiv.toFixed(2)}
            </span>
          </motion.div>
        ))}
      </div>

      <p className="text-[10px] text-center text-muted-foreground mt-3">
        🌊 Trees measured in Adyar Estuary Mangrove equivalents
      </p>
    </div>
  );
};

export default CarbonLedger;
