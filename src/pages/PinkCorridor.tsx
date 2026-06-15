import { motion } from "framer-motion";
import { Shield, Sparkles, Users, MapPin, Clock, Phone, Mic, Lock, Star, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";

const pinkRides = [
  { id: 1, driver: "Priya R.", rating: 4.9, rides: 142, from: "Velachery", to: "Tidel Park", time: "8:30 AM", seats: 3, verified: true, escort: false },
  { id: 2, driver: "Anitha K.", rating: 5.0, rides: 87, from: "T. Nagar", to: "IIT Madras", time: "9:00 AM", seats: 2, verified: true, escort: true },
  { id: 3, driver: "Divya S.", rating: 4.8, rides: 56, from: "Adyar", to: "DLF IT Park", time: "8:15 AM", seats: 1, verified: true, escort: false },
  { id: 4, driver: "Meera J.", rating: 4.95, rides: 210, from: "Anna Nagar", to: "Sholinganallur", time: "8:45 AM", seats: 2, verified: true, escort: true },
];

const safeStops = [
  { name: "Velachery MRTS", lighting: 5, footfall: "High", cctv: true },
  { name: "Tidel Park Gate 2", lighting: 5, footfall: "High", cctv: true },
  { name: "Adyar Signal", lighting: 4, footfall: "Medium", cctv: true },
  { name: "Tambaram Bus Depot", lighting: 4, footfall: "High", cctv: false },
];

export default function PinkCorridor() {
  const [escortMode, setEscortMode] = useState(false);
  const [silentSOS, setSilentSOS] = useState(true);

  const triggerSOS = () => {
    toast.success("🚨 SOS Triggered — Guardians notified, audio recording started", { duration: 4000 });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border" style={{ background: "linear-gradient(135deg, hsl(330 80% 96%) 0%, hsl(340 70% 92%) 100%)" }}>
        <div className="container mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <Badge className="mb-3 bg-pink-500/15 text-pink-700 border-pink-300 hover:bg-pink-500/20">
              <Sparkles className="w-3 h-3 mr-1" /> Women-First Safety Network
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2 tracking-tight">
              Pink <span className="text-pink-600">Corridor</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Verified women drivers, verified women co-riders, lit-up safe stops, and a tap-to-trigger SOS that actually reaches help.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
        {/* Safety controls */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-4 border-pink-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-pink-600" />
                <span className="font-display font-semibold text-sm">Late-Night Escort</span>
              </div>
              <Switch checked={escortMode} onCheckedChange={setEscortMode} />
            </div>
            <p className="text-xs text-muted-foreground">Auto-pool 2+ verified women after 9 PM.</p>
          </Card>
          <Card className="p-4 border-pink-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-pink-600" />
                <span className="font-display font-semibold text-sm">Silent SOS</span>
              </div>
              <Switch checked={silentSOS} onCheckedChange={setSilentSOS} />
            </div>
            <p className="text-xs text-muted-foreground">Volume button ×3 → silent alert + audio capture.</p>
          </Card>
          <Card className="p-4 border-pink-200 bg-pink-50">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-pink-600" />
              <span className="font-display font-semibold text-sm">Trusted Match</span>
            </div>
            <p className="text-xs text-muted-foreground">Prioritises riders from your Verified Circle.</p>
          </Card>
        </div>

        {/* SOS Button */}
        <Card className="p-6 border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-foreground mb-1">Emergency SOS</h3>
              <p className="text-sm text-muted-foreground">Alerts Guardian, nearest verified rider, and optionally local police.</p>
            </div>
            <Button onClick={triggerSOS} size="lg" className="bg-pink-600 hover:bg-pink-700 text-white gap-2 shadow-lg">
              <Phone className="w-4 h-4" /> Trigger SOS
            </Button>
          </div>
        </Card>

        {/* Pink Rides */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-pink-600" />
            <h2 className="font-display font-bold text-xl text-foreground">Women-Only Rides Available Now</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {pinkRides.map((r) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-4 border-pink-200 hover:border-pink-400 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0">
                      {r.driver.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-display font-semibold text-sm">{r.driver}</span>
                        {r.verified && <Badge variant="outline" className="text-[9px] border-pink-300 text-pink-700 px-1">✓ Pink Verified</Badge>}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm mb-1">
                        <MapPin className="w-3 h-3 text-pink-600 flex-shrink-0" />
                        <span className="truncate">{r.from}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="truncate">{r.to}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.time}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{r.seats} seats</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{r.rating}</span>
                        {r.escort && <Badge className="text-[9px] bg-pink-100 text-pink-700 border-0">Escort</Badge>}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Safe Stops */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-pink-600" />
            <h2 className="font-display font-bold text-xl text-foreground">Verified Safe Stops</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {safeStops.map((s) => (
              <Card key={s.name} className="p-4 border-pink-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-semibold text-sm">{s.name}</span>
                  {s.cctv && <Badge variant="outline" className="text-[9px] border-emerald-300 text-emerald-700">CCTV</Badge>}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Lighting: {"⭐".repeat(s.lighting)}</span>
                  <span>•</span>
                  <span>Footfall: {s.footfall}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
