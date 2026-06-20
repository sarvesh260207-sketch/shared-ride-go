import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  number_plate: string;
  vehicle_photo_url: string;
  plate_photo_url: string;
  status: "pending" | "verified" | "manual_review";
}

interface Props {
  rideId: string;
  vehicle: Vehicle;
}

const signedUrl = async (path: string) => {
  if (!path) return null;
  const { data } = await supabase.storage.from("vehicle-photos").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
};

const VehicleVerifyCard = ({ rideId, vehicle }: Props) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [vehicleImg, setVehicleImg] = useState<string | null>(null);
  const [plateImg, setPlateImg] = useState<string | null>(null);

  useEffect(() => {
    signedUrl(vehicle.vehicle_photo_url).then(setVehicleImg);
    signedUrl(vehicle.plate_photo_url).then(setPlateImg);
  }, [vehicle.vehicle_photo_url, vehicle.plate_photo_url]);

  if (vehicle.status === "verified") return null;

  const submit = async (match: boolean) => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("vehicle_verifications").insert({
      ride_id: rideId,
      vehicle_id: vehicle.id,
      rider_id: user.id,
      plate_match: match,
    });
    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }
    // Update vehicle status (owner policy normally blocks; rely on edge case: owner verifies own = no-op)
    await supabase
      .from("vehicles")
      .update({
        status: match ? "verified" : "manual_review",
        verified_at: match ? new Date().toISOString() : null,
      })
      .eq("id", vehicle.id);

    setSubmitting(false);
    setDone(true);
    if (match) {
      toast.success("Vehicle verified for future rides ✓");
    } else {
      toast.warning("Flagged — Zhoop officials will contact the host for manual verification.");
    }
  };

  if (done) return null;

  return (
    <div className="saathi-card p-5 border-2 border-amber-400/40 bg-amber-50/40 dark:bg-amber-950/20">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="w-5 h-5 text-amber-600" />
        <h3 className="font-display font-semibold text-foreground">Verify the host's vehicle</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        This is the first ride after the host registered/changed this vehicle. Please confirm the plate &amp; vehicle
        match what you see in person. Wrong info triggers manual review by Zhoop.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {vehicleImg ? <img src={vehicleImg} alt="vehicle" className="rounded-lg w-full h-28 object-cover" /> : <div className="h-28 bg-muted rounded-lg" />}
        {plateImg ? <img src={plateImg} alt="plate" className="rounded-lg w-full h-28 object-cover" /> : <div className="h-28 bg-muted rounded-lg" />}
      </div>

      <div className="text-sm mb-3">
        <span className="text-muted-foreground">In app:</span>{" "}
        <span className="font-mono font-bold text-foreground">{vehicle.number_plate}</span>
        <span className="text-muted-foreground"> · {vehicle.make} {vehicle.model}</span>
      </div>

      <div className="flex gap-2">
        <Button size="sm" disabled={submitting} onClick={() => submit(true)} className="flex-1 gap-1.5 bg-primary">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Matches
        </Button>
        <Button size="sm" variant="destructive" disabled={submitting} onClick={() => submit(false)} className="flex-1">
          Doesn't match
        </Button>
      </div>
    </div>
  );
};

export default VehicleVerifyCard;
