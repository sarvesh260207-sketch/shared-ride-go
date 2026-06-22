import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * Simulated-GPS idle detector. If "speed" (mocked) stays at 0 for 2 minutes,
 * prompts the rider with "In traffic?" / "End trip".
 * Frontend-only: no real geolocation calls. Used inside active-ride screens.
 */
interface Props {
  active: boolean;
  onEndTrip?: () => void;
}

const IDLE_MS = 2 * 60 * 1000; // 2 minutes

const IdlePrompt = ({ active, onEndTrip }: Props) => {
  const [open, setOpen] = useState(false);
  const lastMoveRef = useRef(Date.now());

  useEffect(() => {
    if (!active) return;
    // Simulated speed sampling — random "moving" vs "stopped"
    const tick = setInterval(() => {
      const movingNow = Math.random() > 0.35; // 65% moving
      if (movingNow) lastMoveRef.current = Date.now();
      if (Date.now() - lastMoveRef.current >= IDLE_MS) {
        setOpen(true);
        lastMoveRef.current = Date.now(); // reset so prompt isn't spammed
      }
    }, 5000);
    return () => clearInterval(tick);
  }, [active]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Vehicle hasn't moved
          </DialogTitle>
          <DialogDescription>
            We noticed no movement for 2 minutes. Are you stuck in traffic or has the trip ended?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>In traffic</Button>
          <Button onClick={() => { setOpen(false); onEndTrip?.(); }}>End trip</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IdlePrompt;
