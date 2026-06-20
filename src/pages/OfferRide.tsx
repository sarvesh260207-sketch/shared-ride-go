import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Bike, Clock, Plus, Trash2, IndianRupee, Upload, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import LiveTracker from "@/components/LiveTracker";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { resolveLocation } from "@/lib/distance";
import {
  INDIAN_VEHICLES,
  FUEL_PRICE,
  PLATFORM_FEE,
  calcFare,
  type FuelType,
} from "@/data/vehicleMileage";

interface SavedVehicle {
  id: string;
  make: string;
  model: string;
  fuel_type: FuelType;
  mileage_kmpl: number;
  number_plate: string;
  vehicle_photo_url: string;
  plate_photo_url: string;
  status: "pending" | "verified" | "manual_review";
}

const OfferRide = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Route
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [seats, setSeats] = useState(3);
  const [stops, setStops] = useState<string[]>([""]);
  const [distance, setDistance] = useState<number>(10);
  const [notes, setNotes] = useState("");

  // Vehicle
  const [savedVehicles, setSavedVehicles] = useState<SavedVehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [mode, setMode] = useState<"select" | "new">("new");

  // New vehicle form
  const [vehicleIdx, setVehicleIdx] = useState<number>(15); // default Maruti Alto
  const [numberPlate, setNumberPlate] = useState("");
  const [vehiclePhoto, setVehiclePhoto] = useState<File | null>(null);
  const [platePhoto, setPlatePhoto] = useState<File | null>(null);
  const vehiclePhotoRef = useRef<HTMLInputElement>(null);
  const platePhotoRef = useRef<HTMLInputElement>(null);

  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("vehicles")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length) {
          setSavedVehicles(data as any);
          setSelectedVehicleId(data[0].id);
          setMode("select");
        }
      });
  }, [user]);

  const addStop = () => setStops([...stops, ""]);
  const removeStop = (i: number) => setStops(stops.filter((_, idx) => idx !== i));
  const updateStop = (i: number, val: string) => {
    const updated = [...stops];
    updated[i] = val;
    setStops(updated);
  };

  const activeVehicleMeta = (() => {
    if (mode === "select") {
      const v = savedVehicles.find((x) => x.id === selectedVehicleId);
      return v
        ? { mileage: Number(v.mileage_kmpl), fuel: v.fuel_type, label: `${v.make} ${v.model}`, isBike: false }
        : null;
    }
    const v = INDIAN_VEHICLES[vehicleIdx];
    return { mileage: v.mileage, fuel: v.fuel, label: `${v.make} ${v.model}`, isBike: v.category === "bike" };
  })();

  const isBike = activeVehicleMeta?.isBike ?? false;
  const fare = activeVehicleMeta
    ? calcFare(distance, activeVehicleMeta.mileage, activeVehicleMeta.fuel, seats)
    : null;

  const uploadPhoto = async (file: File, kind: "vehicle" | "plate") => {
    if (!user) throw new Error("Not signed in");
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("vehicle-photos").upload(path, file, { upsert: false });
    if (error) throw error;
    return path;
  };

  const handlePublish = async () => {
    if (!from || !to || !departureTime) {
      toast.error("Please fill in pickup, drop-off, and departure time");
      return;
    }
    if (!user) return;

    setPublishing(true);

    try {
      let vehicleId = selectedVehicleId;

      // New vehicle path → validate, upload, insert
      if (mode === "new") {
        if (!numberPlate.trim()) throw new Error("Please enter your vehicle's number plate");
        if (!vehiclePhoto) throw new Error("Please upload a photo of your vehicle");
        if (!platePhoto) throw new Error("Please upload a photo of the number plate");

        const [vehiclePath, platePath] = await Promise.all([
          uploadPhoto(vehiclePhoto, "vehicle"),
          uploadPhoto(platePhoto, "plate"),
        ]);

        const meta = INDIAN_VEHICLES[vehicleIdx];
        const { data: vRow, error: vErr } = await supabase
          .from("vehicles")
          .insert({
            owner_id: user.id,
            make: meta.make,
            model: meta.model,
            fuel_type: meta.fuel,
            mileage_kmpl: meta.mileage,
            number_plate: numberPlate.trim().toUpperCase(),
            vehicle_photo_url: vehiclePath,
            plate_photo_url: platePath,
            status: "pending",
          })
          .select("id")
          .single();
        if (vErr) throw vErr;
        vehicleId = vRow!.id;
      }

      if (!vehicleId) throw new Error("Select or add a vehicle to continue");

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
        price: fare?.total ?? null,
        distance_km: distance,
        fuel_cost: fare?.fuelCost ?? null,
        platform_fee: PLATFORM_FEE,
        vehicle_id: vehicleId,
        type: "offer" as const,
        notes: notes || null,
        driver_college: profile?.college ?? null,
        driver_department: profile?.department ?? null,
      });

      if (error) throw error;
      toast.success("Ride published successfully! 🎉");
      navigate("/");
    } catch (e: any) {
      toast.error(e.message || "Failed to publish ride");
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
          <h1 className="font-display text-2xl font-bold text-foreground mb-6">Offer a Ride</h1>

          {/* Vehicle selector */}
          <div className="mb-6 saathi-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-sm">Your vehicle</h3>
              {savedVehicles.length > 0 && (
                <div className="flex text-[11px] rounded-lg bg-muted p-0.5">
                  <button
                    onClick={() => setMode("select")}
                    className={`px-2 py-1 rounded-md ${mode === "select" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                  >
                    Saved
                  </button>
                  <button
                    onClick={() => setMode("new")}
                    className={`px-2 py-1 rounded-md ${mode === "new" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                  >
                    Add new
                  </button>
                </div>
              )}
            </div>

            {mode === "select" && savedVehicles.length > 0 ? (
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-card border border-input text-foreground text-sm"
              >
                {savedVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} · {v.number_plate} ·{" "}
                    {v.status === "verified" ? "✓ Verified" : v.status === "pending" ? "Pending verification" : "Manual review"}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-3">
                <select
                  value={vehicleIdx}
                  onChange={(e) => setVehicleIdx(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-input text-foreground text-sm"
                >
                  {INDIAN_VEHICLES.map((v, i) => (
                    <option key={i} value={i}>
                      {v.category === "bike" ? "🏍️" : "🚗"} {v.make} {v.model} — {v.mileage} km/{v.fuel === "ev" ? "kWh-eq" : v.fuel === "cng" ? "kg" : "L"} ({v.fuel.toUpperCase()})
                    </option>
                  ))}
                </select>

                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Number Plate</label>
                  <input
                    type="text"
                    value={numberPlate}
                    onChange={(e) => setNumberPlate(e.target.value.toUpperCase())}
                    placeholder="TN 01 AB 1234"
                    maxLength={20}
                    className="w-full px-3 py-2.5 rounded-xl bg-card border border-input text-foreground text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <UploadBox
                    label="Vehicle photo"
                    file={vehiclePhoto}
                    onPick={() => vehiclePhotoRef.current?.click()}
                  />
                  <input
                    ref={vehiclePhotoRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => setVehiclePhoto(e.target.files?.[0] ?? null)}
                  />
                  <UploadBox
                    label="Number-plate photo"
                    file={platePhoto}
                    onPick={() => platePhotoRef.current?.click()}
                  />
                  <input
                    ref={platePhotoRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => setPlatePhoto(e.target.files?.[0] ?? null)}
                  />
                </div>

                <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/50 rounded-lg p-2">
                  <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>
                    Your first rider will be asked to confirm these details match the actual vehicle. If they don't,
                    Zhoop officials will contact you for manual verification.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Live fare breakdown */}
          {fare && (
            <div className="mb-6 p-3 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between"><span>Mileage ({activeVehicleMeta!.fuel.toUpperCase()})</span><span className="text-foreground font-medium">{activeVehicleMeta!.mileage} km/L</span></div>
              <div className="flex justify-between"><span>Fuel price</span><span className="text-foreground font-medium">₹{FUEL_PRICE[activeVehicleMeta!.fuel]}/L</span></div>
              <div className="flex justify-between"><span>Trip fuel cost ({distance} km)</span><span className="text-foreground font-medium">₹{fare.fuelCost}</span></div>
              <div className="flex justify-between"><span>Split across {seats + 1} people</span><span className="text-foreground font-medium">₹{fare.perRiderShare}</span></div>
              <div className="flex justify-between"><span>Zhoop platform fee</span><span className="text-foreground font-medium">₹{PLATFORM_FEE}</span></div>
            </div>
          )}

          {/* From & To */}
          <div className="space-y-3 mb-6">
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

          {/* Time & Seats & Distance */}
          <div className="grid grid-cols-3 gap-3 mb-6">
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
              <label className="text-sm font-medium text-foreground mb-1 block">Est. km</label>
              <input type="number" min={1} value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          {/* Live GPS tracker preview */}
          {activeVehicleMeta && (
            <div className="mb-6">
              <LiveTracker
                mileage={activeVehicleMeta.mileage}
                fuelType={activeVehicleMeta.fuel}
                seats={seats}
                onStop={(km) => setDistance(Math.max(1, Math.round(km * 100) / 100))}
              />
            </div>
          )}

          {/* Notes */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-1 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any info for co-riders (e.g., AC car, music preferences...)"
              className="w-full px-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-none"
            />
          </div>

          {/* Price Preview */}
          {fare && (
            <div className="saathi-card p-4 mb-6 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total per rider (fuel share + ₹5 fee)</span>
              <span className="font-display font-bold text-primary text-xl flex items-center gap-0.5">
                <IndianRupee className="w-5 h-5" />{fare.total.toFixed(2)}
              </span>
            </div>
          )}

          <Button
            onClick={handlePublish}
            disabled={publishing}
            className="w-full saathi-gradient-bg rounded-xl font-display font-semibold text-primary-foreground border-0 hover:opacity-90 transition-opacity h-12 text-base"
          >
            {publishing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Publishing...</> : "Publish Ride"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

const UploadBox = ({ label, file, onPick }: { label: string; file: File | null; onPick: () => void }) => (
  <button
    type="button"
    onClick={onPick}
    className={`relative aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors ${
      file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
    }`}
  >
    {file ? (
      <img src={URL.createObjectURL(file)} alt={label} className="absolute inset-0 w-full h-full object-cover rounded-[10px]" />
    ) : (
      <>
        <Upload className="w-5 h-5 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground text-center px-2">{label}</span>
      </>
    )}
  </button>
);

export default OfferRide;
