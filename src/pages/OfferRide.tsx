import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Bike, MapPin, Clock, Plus, Trash2, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRICE_PER_KM } from "@/types/ride";
import { popularLocations } from "@/data/mockRides";
import { motion } from "framer-motion";

const OfferRide = () => {
  const navigate = useNavigate();
  const [vehicleType, setVehicleType] = useState<'car' | 'bike'>('car');
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [seats, setSeats] = useState(3);
  const [stops, setStops] = useState<string[]>([""]);
  const [distance, setDistance] = useState<number>(10);

  const addStop = () => setStops([...stops, ""]);
  const removeStop = (i: number) => setStops(stops.filter((_, idx) => idx !== i));
  const updateStop = (i: number, val: string) => {
    const updated = [...stops];
    updated[i] = val;
    setStops(updated);
  };

  const price = distance * PRICE_PER_KM[vehicleType];

  const handlePublish = () => {
    navigate("/");
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
            <div className="flex gap-3">
              <button
                onClick={() => { setVehicleType('car'); setSeats(3); }}
                className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 font-display font-semibold text-sm transition-all ${vehicleType === 'car' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}
              >
                <Car className="w-4 h-4" /> Car — ₹{PRICE_PER_KM.car}/km
              </button>
              <button
                onClick={() => { setVehicleType('bike'); setSeats(1); }}
                className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 font-display font-semibold text-sm transition-all ${vehicleType === 'bike' ? 'border-accent bg-accent/5 text-accent-foreground' : 'border-border text-muted-foreground'}`}
              >
                <Bike className="w-4 h-4" /> Bike — ₹{PRICE_PER_KM.bike}/km
              </button>
            </div>
          </div>

          {/* From & To */}
          <div className="space-y-3 mb-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Pickup</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Starting location" className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            {/* Stops */}
            {stops.map((stop, i) => (
              <div key={i} className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={stop} onChange={(e) => updateStop(i, e.target.value)} placeholder={`Stop ${i + 1}`} className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
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
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Final destination" className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
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
              <input type="number" min={1} max={vehicleType === 'car' ? 4 : 1} value={seats} onChange={(e) => setSeats(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Distance (km)</label>
              <input type="number" min={1} value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          {/* Price Preview */}
          <div className="saathi-card p-4 mb-6 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estimated fare per rider</span>
            <span className="font-display font-bold text-primary text-xl flex items-center gap-0.5">
              <IndianRupee className="w-5 h-5" />{price}
            </span>
          </div>

          <Button onClick={handlePublish} className="w-full saathi-gradient-bg rounded-xl font-display font-semibold text-primary-foreground border-0 hover:opacity-90 transition-opacity h-12 text-base">
            Publish Ride
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default OfferRide;
