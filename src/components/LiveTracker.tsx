import { useEffect, useRef, useState } from "react";
import { Navigation, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calcFare, FuelType } from "@/data/vehicleMileage";

interface Props {
  mileage: number;
  fuelType: FuelType;
  seats: number;
  onStop?: (distanceKm: number) => void;
}

// Haversine
const haversine = (a: GeolocationCoordinates, b: GeolocationCoordinates) => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

const LiveTracker = ({ mileage, fuelType, seats, onStop }: Props) => {
  const [tracking, setTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);
  const lastCoord = useRef<GeolocationCoordinates | null>(null);

  const start = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported on this device");
      return;
    }
    setError(null);
    setTracking(true);
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (lastCoord.current) {
          const d = haversine(lastCoord.current, pos.coords);
          if (d < 0.5 && pos.coords.accuracy < 50) {
            setDistance((prev) => prev + d);
          }
        }
        lastCoord.current = pos.coords;
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  };

  const pause = () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setTracking(false);
  };

  const stop = () => {
    pause();
    onStop?.(distance);
  };

  useEffect(() => () => { if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current); }, []);

  const fare = calcFare(distance || 0.01, mileage, fuelType, seats);

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Navigation className={`w-4 h-4 text-primary ${tracking ? "animate-pulse" : ""}`} />
        <h4 className="font-display font-semibold text-sm text-foreground">Live GPS Fare Meter</h4>
        {tracking && <span className="ml-auto text-[10px] font-bold text-primary uppercase tracking-wide">● Live</span>}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-background p-2">
          <div className="text-muted-foreground">Distance</div>
          <div className="font-display font-bold text-foreground text-base">{distance.toFixed(2)} km</div>
        </div>
        <div className="rounded-lg bg-background p-2">
          <div className="text-muted-foreground">Per rider</div>
          <div className="font-display font-bold text-primary text-base">₹{fare.total.toFixed(2)}</div>
        </div>
        <div className="rounded-lg bg-background p-2 col-span-2 text-[11px] text-muted-foreground">
          Fuel: ₹{fare.fuelCost.toFixed(2)} ÷ {seats + 1} = ₹{fare.perRiderShare.toFixed(2)} + ₹{fare.platformFee} platform fee
        </div>
      </div>

      {error && <p className="text-[11px] text-destructive">{error}</p>}

      <div className="flex gap-2">
        {!tracking ? (
          <Button size="sm" onClick={start} className="flex-1 gap-1.5">
            <Play className="w-3.5 h-3.5" /> Start Trip
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={pause} className="flex-1 gap-1.5">
            <Pause className="w-3.5 h-3.5" /> Pause
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={stop} className="flex-1 gap-1.5">
          <Square className="w-3.5 h-3.5" /> End & Save
        </Button>
      </div>
    </div>
  );
};

export default LiveTracker;
