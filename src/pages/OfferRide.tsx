import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Bike, Clock, Plus, Trash2, IndianRupee, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRICING, VehicleCategory, calcRidePrice } from "@/types/ride";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { resolveLocation } from "@/lib/distance";

const VEHICLE_OPTIONS: { key: VehicleCategory; icon: typeof Car; label: string }[] = [
  { key: "bike_petrol", icon: Bike, label: "Bike" },
  { key: "bike_ev", icon: Zap, label: "Bike EV" },
  { key: "car_petrol", icon: Car, label: "Car" },
  { key: "car_ev", icon: Zap, label: "Car EV" },
];

const OfferRide = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>("car_petrol");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [seats, setSeats] = useState(3);
  const [stops, setStops] = useState<string[]>([""]);
  const [distance, setDistance] = useState<number>(10);
  const [notes, setNotes] = useState("");
  const [publishing, setPublishing] = useState(false);

  const addStop = () => setStops([...stops, ""]);
  const removeStop = (i: number) => setStops(stops.filter((_, idx) => idx !== i));
  const updateStop = (i: number, val: string) => {
    const updated = [...stops];
    updated[i] = val;
    setStops(updated);
  };

  const isBike = vehicleCategory.startsWith("bike");
  const pricing = PRICING[vehicleCategory];
  const totalPrice = calcRidePrice(vehicleCategory, distance);

  const handlePublish = async () => {
    if (!from || !to || !departureTime) {
      toast.error("Please fill in pickup, drop-off, and departure time");
      return;
    }
    if (!user) return;

    setPublishing(true);

    // Resolve coordinates
    const fromCoords = resolveLocation(from);
    const toCoords = resolveLocation(to);

    // Build departure timestamp for today
    const today = new Date();
    const [hours, minutes] = departureTime.split(":").map(Number);
    today.setHours(hours, minutes, 0, 0);

    // Get user profile for college/department
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
      price: totalPrice,
      type: "offer" as const,
      notes: notes || null,
      driver_college: profile?.college ?? null,
      driver_department: profile?.department ?? null,
    });

    setPublishing(false);

    if (error) {
      toast.error("Failed to publish ride: " + error.message);
    } else {
      toast.success("Ride published successfully! 🎉");
      navigate("/");
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

          {/* Vehicle Type */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">Vehicle Type</label>
            <div className="grid grid-cols-2 gap-2">
              {VEHICLE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const p = PRICING[opt.key];
                const selected = vehicleCategory === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => { setVehicleCategory(opt.key); setSeats(opt.key.startsWith("bike") ? 1 : 3); }}
                    className={`py-3 rounded-xl border-2 flex items-center justify-center gap-2 font-display font-semibold text-sm transition-all ${selected ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}
                  >
                    <Icon className="w-4 h-4" /> {opt.label} — ₹{p.perKm}/km
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="mb-6 p-3 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between"><span>Base fare</span><span className="text-foreground font-medium">₹{pricing.baseFare}</span></div>
            <div className="flex justify-between"><span>Per km rate</span><span className="text-foreground font-medium">₹{pricing.perKm}/km</span></div>
            <div className="flex justify-between"><span>Zhoop App Fee</span><span className="text-foreground font-medium">₹{pricing.appFee}</span></div>
          </div>

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
              <label className="text-sm font-medium text-foreground mb-1 block">Distance (km)</label>
              <input type="number" min={1} value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

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
          <div className="saathi-card p-4 mb-6 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total fare per rider</span>
            <span className="font-display font-bold text-primary text-xl flex items-center gap-0.5">
              <IndianRupee className="w-5 h-5" />{totalPrice}
            </span>
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

export default OfferRide;
