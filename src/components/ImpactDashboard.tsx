import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TreePine, Leaf, TrendingUp } from "lucide-react";

// 1 kg CO2 ≈ what 1 mangrove tree absorbs in ~2 months
const CO2_PER_TREE = 12.3; // kg per mangrove per year simplified

interface ImpactDashboardProps {
  className?: string;
}

const ImpactDashboard = ({ className = "" }: ImpactDashboardProps) => {
  // Simulated live counter — in production this would pull from realtime aggregate
  const [totalCO2, setTotalCO2] = useState(1240);

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalCO2((prev) => prev + Math.random() * 0.3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const treeEquivalent = Math.floor(totalCO2 / CO2_PER_TREE);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-6 ${className}`}
    >
      {/* Decorative background trees */}
      <div className="absolute top-2 right-4 opacity-[0.06]">
        <TreePine className="w-32 h-32 text-primary" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">
            Live Impact
          </h3>
        </div>

        {/* Live CO2 counter */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">Zhoop Chennai has saved</p>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={Math.floor(totalCO2)}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display font-bold text-4xl text-foreground tabular-nums"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {totalCO2.toFixed(1)}
            </motion.span>
            <span className="text-sm font-medium text-muted-foreground">kg CO₂</span>
            <span className="text-xs text-primary ml-1">this morning</span>
          </div>
        </div>

        {/* Tree equivalent — Adyar Estuary */}
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1">
              {Array.from({ length: Math.min(treeEquivalent, 5) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <TreePine className="w-5 h-5 text-primary drop-shadow-sm" />
                </motion.div>
              ))}
              {treeEquivalent > 5 && (
                <span className="text-xs font-bold text-primary ml-2">+{treeEquivalent - 5}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {treeEquivalent} Mangrove trees saved
              </p>
              <p className="text-[11px] text-muted-foreground">
                in the Adyar Estuary, Chennai 🌊
              </p>
            </div>
          </div>
        </div>

        {/* Pulse indicator */}
        <div className="flex items-center gap-2 mt-3">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary animate-ping" />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">Updating in real-time</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ImpactDashboard;
