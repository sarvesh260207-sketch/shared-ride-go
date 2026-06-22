import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { INSURANCE_FEE } from "@/lib/pricing";

/** ₹5/month ride insurance opt-in. Frontend-only mock. */
const InsuranceSticker = () => {
  const [open, setOpen] = useState(false);
  const [bought, setBought] = useState<boolean>(() => localStorage.getItem("zhoop_insurance") === "1");

  const buy = () => {
    localStorage.setItem("zhoop_insurance", "1");
    setBought(true);
    setOpen(false);
    toast.success("Insurance active for 30 days", { description: `₹${INSURANCE_FEE} charged. All your rides this month are covered.` });
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-left rounded-xl border-2 border-accent/30 bg-accent/5 p-3 flex items-center gap-3 hover:bg-accent/10 transition"
      >
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-accent-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
            Ride Insurance {bought && <Check className="w-4 h-4 text-primary" />}
          </p>
          <p className="text-xs text-muted-foreground">
            {bought ? "Active — all rides this month are protected." : `Just ₹${INSURANCE_FEE}/month • Covers every ride • Tap to buy`}
          </p>
        </div>
        {!bought && <span className="text-xs font-bold text-primary">Buy</span>}
      </motion.button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Zhoop Ride Insurance
            </DialogTitle>
            <DialogDescription>
              30-day coverage for every ride you take or offer on Zhoop.
            </DialogDescription>
          </DialogHeader>
          <ul className="text-sm space-y-2 my-2">
            <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Accidental injury cover up to ₹1,00,000</li>
            <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Lost-item assistance during rides</li>
            <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> 24×7 emergency helpline</li>
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={buy}>Pay ₹{INSURANCE_FEE} & Activate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InsuranceSticker;
