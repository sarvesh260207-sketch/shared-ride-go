import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Plus, Trash2, IndianRupee, Upload, Camera, Fuel, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { resolveLocation } from "@/lib/distance";
import {
  VEHICLE_CATALOG, getVehicle, calcPrice, fuelLabel,
  PLATFORM_FEE, INSURANCE_FEE,
} from "@/lib/pricing";

const PLATE_RE = /^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{1,4}$/i;

const OfferRide = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicleId, setVehicleId] = useState<string>("swift");
  const [plate, setPlate] = useState("");
  const [vehiclePhoto, setVehiclePhoto] = useState<File | null>(null);
  const [platePhoto, setPlatePhoto] = useState<File | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [seats, setSeats] = useState(3);
  const [stops, setStops] = useState<string[]>([""]);
  const [distance, setDistance] = useState<number>(10);
  const [notes, setNotes] = useState("");
  const [insurance, setInsurance] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const spec = getVehicle(vehicleId)!;
  const isBike = spec.category === "bike";
  const breakdown = calcPrice(spec, distance, { seats, insurance });

  const addStop = () => setStops([...stops, ""]);
  const removeStop = (i: number) => setStops(stops.filter((_, idx) => idx !== i));
  const updateStop = (i: number, val: string) =>
    setStops(stops.map((s, idx) => (idx === i ? val : s)));

  async function uploadPhoto(file: File, kind: "vehicle" | "plate"): Promise<string> {
    const path = `${user!.id}/${kind}-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage.from("vehicle-photos").upload(path, file, {
      cacheControl: "3600", upsert: false,
    });
    if (error) throw error;
    return path;
  }

  const handlePublish = async () => {
    if (!user) return;
    if (!from || !to || !departureTime) {
      toast.error("Please fill in pickup, drop-off, and departure time");
      return;
    }
    if (!plate.trim() || !PLATE_RE.test(plate.trim())) {
      toast.error("Enter a valid Indian number plate (e.g. TN 09 AB 1234)");
      return;
    }
    if (!vehiclePhoto || !platePhoto) {
      toast.error("Upload both vehicle and number-plate photos to start the ride");
      return;
    }

    setPublishing(true);
    try {
      // 1. upload both photos
      const [vehUrl, plateUrl] = await Promise.all([
        uploadPhoto(vehiclePhoto, "vehicle"),
        uploadPhoto(platePhoto, "plate"),
      ]);

      const normalizedPlate = plate.trim().toUpperCase().replace(/\s+/g, " ");

      // 2. reuse existing vehicle if same plate, else create new
      const { data: existing } = await supabase
        .from("vehicles")
        .select("id")
        .eq("owner_id", user.id)
        .eq("number_plate", normalizedPlate)
        .maybeSingle();

      let vehicleRowId: string | undefined = existing?.id;
      if (!vehicleRowId) {
        const { data: vRow, error: vErr } = await supabase
          .from("vehicles")
          .insert({
            owner_id: user.id,
            make: spec.name.split(" ")[0],
            model: spec.name,
            fuel_type: spec.fuel === "electric" ? "electric" : spec.fuel,
            mileage_kmpl: spec.mileageKmpl,
            number_plate: normalizedPlate,
            vehicle_photo_url: vehUrl,
            plate_photo_url: plateUrl,
          })
          .select("id")
          .single();
        if (vErr) throw vErr;
        vehicleRowId = vRow.id;
      } else {
        // refresh photos for the existing vehicle
        await supabase
          .from("vehicles")
          .update({ vehicle_photo_url: vehUrl, plate_photo_url: plateUrl })
          .eq("id", vehicleRowId);
      }

      // 3. publish ride
      const fromCoords = resolveLocation(from);
      const toCoords = resolveLocation(to);
      const today = new Date();
      const [hours, minutes] = departureTime.split(":").map(Number);
      today.setHours(hours, minutes, 0, 0);

      const { data: profile } = await supabase
        .from("profiles")
        .select("college, department")
        .eq("user_id", user.id)
        .single();

      const { error } = await supabase.from("rides").insert({
        user_id: user.id,
        origin: from,
        destination: to,
        origin_lat: fromCoords?.lat ?? null,
        origin_lng: fromCoords?.lng ?? null,
        destination_lat: toCoords?.lat ?? null,
        destination_lng: toCoords?.lng ?? null,
        departure_time: today.toISOString(),
        seats_available: seats,
        price: breakdown.perSeat,
        type: "offer" as const,
        notes: notes || null,
        driver_college: profile?.college ?? null,
        driver_department: profile?.department ?? null,
        vehicle_id: vehicleRowId,
        distance_km: distance,
        fuel_cost: breakdown.fuelCost,
        platform_fee: PLATFORM_FEE,
      });
      if (error) throw error;

      toast.success("Ride published! Riders will verify your plate on join.");
      navigate("/");
    } catch (e: any) {
      toast.error("Failed to publish: " + (e.message ?? "unknown"));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Offer a Ride</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Pick your vehicle — fares are calculated from official ARAI mileage and live fuel prices.
          </p>

          {/* Vehicle selector */}
          <div className="mb-4">
            <label className="text-sm font-medium text-foreground mb-2 block">Vehicle</label>
            <select
              value={vehicleId}
              onChange={(e) => {
                setVehicleId(e.target.value);
                const newSpec = getVehicle(e.target.value);
                if (newSpec) setSeats(newSpec.category === "bike" ? 1 : 3);
              }}
              className="w-full px-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <optgroup label="Bikes & Scooters">
                {VEHICLE_CATALOG.filter((v) => v.category === "bike").map((v) => (
                  <option key={v.id} value={v.id}>{v.name} — {fuelLabel(v)}</option>
                ))}
              </optgroup>
              <optgroup label="Cars">
                {VEHICLE_CATALOG.filter((v) => v.category === "car").map((v) => (
                  <option key={v.id} value={v.id}>{v.name} — {fuelLabel(v)}</option>
                ))}
              </optgroup>
            </select>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <Fuel className="w-3 h-3" /> Source: {spec.source} · {spec.fuel} · {fuelLabel(spec)}
            </p>
          </div>

          {/* Plate */}
          <div className="mb-4">
            <label className="text-sm font-medium text-foreground mb-1 block">Number Plate</label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="TN 09 AB 1234"
              className="w-full px-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Riders will visually confirm this plate matches your vehicle. Mismatches trigger manual verification.
            </p>
          </div>

          {/* Photo uploads */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <PhotoUploader label="Vehicle photo" icon={<Camera className="w-4 h-4" />} file={vehiclePhoto} onChange={setVehiclePhoto} />
            <PhotoUploader label="Number plate photo" icon={<Upload className="w-4 h-4" />} file={platePhoto} onChange={setPlatePhoto} />
          </div>

          {/* From & To */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Pickup</label>
              <PlacesAutocomplete value={from} onChange={setFrom} placeholder="Starting location in Tamil Nadu" iconColor="text-primary" />
            </div>

            {stops.map((stop, i) => (
              <div key={i} className="flex gap-2">
                <PlacesAutocomplete value={stop} onChange={(val) => updateStop(i, val)} placeholder={`Stop ${i + 1}`} iconColor="text-muted-foreground" className="flex-1" />
                <button onClick={() => removeStop(i)} className="p-3 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button onClick={addStop} className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
              <Plus className="w-4 h-4" /> Add stop
            </button>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Drop-off</label>
              <PlacesAutocomplete value={to} onChange={setTo} placeholder="Final destination in Tamil Nadu" iconColor="text-accent" />
            </div>
          </div>

          {/* Time, seats, distance */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Departure</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className="w-full pl-10 pr-2 py-3 rounded-xl bg-card border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Seats</label>
              <input type="number" min={1} max={isBike ? 1 : 4} value={seats} onChange={(e) => setSeats(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Distance (km)</label>
              <input type="number" min={1} value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          {/* Insurance toggle */}
          <div className="flex items-center justify-between p-3 mb-4 rounded-xl bg-muted/40 border border-border">
            <Label htmlFor="insurance" className="flex items-center gap-2 text-sm cursor-pointer">
              <ShieldCheck className="w-4 h-4 text-accent-foreground" />
              Buy Ride Insurance (₹{INSURANCE_FEE}/ride · valid 1 month)
            </Label>
            <Switch id="insurance" checked={insurance} onCheckedChange={setInsurance} />
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="text-sm font-medium text-foreground mb-1 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any info for co-riders (e.g., AC, music preferences...)"
              className="w-full px-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[70px] resize-none"
            />
          </div>

          {/* Live breakdown */}
          <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border text-sm space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Fuel ({distance} km @ {fuelLabel(spec)})</span>
              <span className="text-foreground">₹{breakdown.fuelCost}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Platform fee</span><span className="text-foreground">₹{breakdown.platformFee}</span>
            </div>
            {insurance && (
              <div className="flex justify-between text-muted-foreground">
                <span>Insurance</span><span className="text-foreground">₹{breakdown.insuranceFee}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 mt-2 border-t border-border">
              <span className="font-medium text-foreground">Total</span>
              <span className="font-display font-bold text-foreground">₹{breakdown.total}</span>
            </div>
            <div className="flex justify-between text-primary">
              <span className="font-medium">Per rider (split across {seats})</span>
              <span className="font-display font-bold text-lg flex items-center gap-0.5">
                <IndianRupee className="w-4 h-4" />{breakdown.perSeat}
              </span>
            </div>
          </div>

          <Button
            onClick={handlePublish}
            disabled={publishing}
            className="w-full saathi-gradient-bg rounded-xl font-display font-semibold text-primary-foreground border-0 hover:opacity-90 transition-opacity h-12 text-base"
          >
            {publishing ? "Publishing..." : "Publish Ride"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

function PhotoUploader({
  label, icon, file, onChange,
}: { label: string; icon: React.ReactNode; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <label className="cursor-pointer">
      <span className="text-xs font-medium text-foreground mb-1 block">{label}</span>
      <div className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 border-dashed transition-colors ${file ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}>
        {file ? (
          <>
            <img src={URL.createObjectURL(file)} alt={label} className="w-full h-24 object-cover rounded-lg" />
            <span className="text-[11px] text-primary font-medium truncate max-w-full">{file.name}</span>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">{icon}</div>
            <span className="text-[11px] text-muted-foreground">Tap to upload</span>
          </>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}

export default OfferRide;
