import { useState } from "react";
import { PlayCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/** Lightweight "intro" launcher — icon only, no video file. */
const IntroIcon = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="What is Zhoop">
        <PlayCircle className="w-5 h-5 text-primary" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to Zhoop</DialogTitle>
            <DialogDescription>Travel Green, Earn Green — the 60-second tour.</DialogDescription>
          </DialogHeader>
          <ol className="text-sm space-y-2 list-decimal pl-5">
            <li><span className="font-semibold">Find a ride</span> heading your way, or offer one of yours.</li>
            <li><span className="font-semibold">Split fuel costs</span> transparently — no surge, no fares, flat ₹5 platform fee.</li>
            <li><span className="font-semibold">Earn carbon credits</span> for every shared kilometre.</li>
            <li><span className="font-semibold">Stay safe</span> with Pink Corridor, Guardian Share & Verified Circles.</li>
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IntroIcon;
