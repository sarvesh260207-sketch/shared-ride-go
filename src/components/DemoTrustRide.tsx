import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, IndianRupee, Sparkles, Network } from "lucide-react";
import TrustGraphDialog from "@/components/TrustGraphDialog";

const DemoTrustRide = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setOpen(true)}
        className="w-full text-left saathi-card p-4 cursor-pointer hover:shadow-md transition-shadow border-2 border-primary/40 bg-primary/5 relative"
      >
        <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Demo · Trust Graph
        </div>
        <div className="flex items-start gap-3 mt-1">
          <div className="w-11 h-11 rounded-full saathi-gradient-bg flex items-center justify-center text-primary-foreground font-display font-bold text-sm flex-shrink-0">
            AK
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display font-semibold text-foreground text-sm">Arjun K.</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">✓ Verified</span>
              <span className="text-xs text-muted-foreground ml-auto">⭐ 4.9</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-foreground truncate">HSR Layout</span>
              <span className="text-muted-foreground mx-1">→</span>
              <span className="text-foreground truncate">Manyata Tech Park</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />09:15 AM</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />2 seats</span>
              <span className="flex items-center gap-0.5 text-primary font-semibold"><IndianRupee className="w-3 h-3" />68</span>
              <span className="flex items-center gap-1 text-primary font-medium">
                <Network className="w-3 h-3" /> Tap to see trust path
              </span>
            </div>
          </div>
        </div>
      </motion.button>
      <TrustGraphDialog open={open} onOpenChange={setOpen} from="HSR Layout" to="Manyata Tech Park" />
    </>
  );
};

export default DemoTrustRide;
