import { useState } from "react";
import { GraduationCap, MapPin, ChevronDown, Users, IndianRupee, Star, ShieldCheck, Car, Bike, MessageCircle, Handshake, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import MapView from "@/components/MapView";
import { Checkpoint, BookedPassenger } from "@/types/ride";

/* ─── College data ─── */

interface CollegeOption {
  id: string;
  name: string;
  shortName: string;
  area: string;
  lat: number;
  lng: number;
}

const COLLEGES: CollegeOption[] = [
  { id: "mcc", name: "Madras Christian College (MCC)", shortName: "MCC", area: "Tambaram", lat: 12.9229, lng: 80.1145 },
  { id: "loyola", name: "Loyola College", shortName: "Loyola", area: "Nungambakkam", lat: 13.0625, lng: 80.2357 },
  { id: "stella", name: "Stella Maris College", shortName: "Stella Maris", area: "Cathedral Rd", lat: 13.0595, lng: 80.2450 },
  { id: "srmist", name: "SRM Institute of Science & Technology", shortName: "SRM", area: "Kattankulathur", lat: 12.8231, lng: 80.0444 },
  { id: "anna", name: "Anna University (CEG)", shortName: "Anna Univ", area: "Guindy", lat: 13.0125, lng: 80.2329 },
  { id: "iitm", name: "IIT Madras", shortName: "IIT-M", area: "Adyar", lat: 12.9915, lng: 80.2337 },
  { id: "pachaiyappas", name: "Pachaiyappa's College", shortName: "Pachaiyappa's", area: "Chetpet", lat: 13.0736, lng: 80.2418 },
  { id: "wcc", name: "Women's Christian College (WCC)", shortName: "WCC", area: "College Rd", lat: 13.0487, lng: 80.2400 },
];

/* ─── Nearby checkpoints for colleges ─── */

interface NearbyCheckpoint {
  collegeId: string;
  checkpoints: { name: string; distance: string; lat: number; lng: number }[];
}

const COLLEGE_CHECKPOINTS: NearbyCheckpoint[] = [
  {
    collegeId: "mcc",
    checkpoints: [
      { name: "Tambaram Railway Station", distance: "1.0 km", lat: 12.9249, lng: 80.1000 },
      { name: "Tambaram Bus Stand", distance: "1.2 km", lat: 12.9260, lng: 80.1050 },
      { name: "MCC College Gate", distance: "0.1 km", lat: 12.9229, lng: 80.1145 },
      { name: "Chromepet Junction", distance: "3.5 km", lat: 12.9516, lng: 80.1462 },
    ],
  },
  {
    collegeId: "loyola",
    checkpoints: [
      { name: "Nungambakkam Railway Station", distance: "0.8 km", lat: 13.0607, lng: 80.2410 },
      { name: "Sterling Road Junction", distance: "0.5 km", lat: 13.0590, lng: 80.2380 },
      { name: "Loyola College Gate", distance: "0.1 km", lat: 13.0625, lng: 80.2357 },
    ],
  },
  {
    collegeId: "anna",
    checkpoints: [
      { name: "Guindy Railway Station", distance: "0.5 km", lat: 13.0067, lng: 80.2206 },
      { name: "Anna University Gate", distance: "0.1 km", lat: 13.0125, lng: 80.2329 },
      { name: "Sardar Patel Road", distance: "0.3 km", lat: 13.0100, lng: 80.2340 },
    ],
  },
];

/* ─── Example MCC → Egmore ride ─── */

const MCC_EGMORE_CHECKPOINTS: Checkpoint[] = [
  { id: "cg1", name: "MCC College Gate", lat: 12.9229, lng: 80.1145, arrivalTime: "08:00 AM" },
  { id: "cg2", name: "Tambaram Railway Station", lat: 12.9249, lng: 80.1000, arrivalTime: "08:10 AM" },
  { id: "cg3", name: "Chromepet", lat: 12.9516, lng: 80.1462, arrivalTime: "08:22 AM" },
  { id: "cg4", name: "Pallavaram", lat: 12.9675, lng: 80.1497, arrivalTime: "08:30 AM" },
  { id: "cg5", name: "Guindy", lat: 13.0067, lng: 80.2206, arrivalTime: "08:48 AM" },
  { id: "cg6", name: "Saidapet", lat: 13.0225, lng: 80.2231, arrivalTime: "08:55 AM" },
  { id: "cg7", name: "T. Nagar", lat: 13.0418, lng: 80.2341, arrivalTime: "09:02 AM" },
  { id: "cg8", name: "Egmore / Chennai Central", lat: 13.0732, lng: 80.2609, arrivalTime: "09:15 AM" },
];

const MCC_EGMORE_PASSENGERS: BookedPassenger[] = [
  { name: "Kavitha R", avatar: "KR", pickupCheckpoint: "MCC College Gate", dropCheckpoint: "Guindy" },
  { name: "Deepak S", avatar: "DS", pickupCheckpoint: "MCC College Gate", dropCheckpoint: "Egmore / Chennai Central" },
  { name: "Aishwarya M", avatar: "AM", pickupCheckpoint: "Tambaram Railway Station", dropCheckpoint: "T. Nagar" },
];

/* ─── Component ─── */

const CollegeRideSelector = () => {
  const [selectedCollege, setSelectedCollege] = useState<string>("mcc");
  const [direction, setDirection] = useState<"pickup" | "drop">("pickup");
  const [femaleOnly, setFemaleOnly] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const college = COLLEGES.find((c) => c.id === selectedCollege);
  const checkpoints = COLLEGE_CHECKPOINTS.find((c) => c.collegeId === selectedCollege)?.checkpoints || [];

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Badge className="mb-3 bg-[hsl(var(--zhoop-college))]/10 text-[hsl(var(--zhoop-college))] border-[hsl(var(--zhoop-college))]/20 hover:bg-[hsl(var(--zhoop-college))]/10">
            <GraduationCap className="w-3 h-3 mr-1" /> Campus Commute
          </Badge>
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            College Pickup & Drop
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Find peers from your college heading the same way. Share rides, split petrol costs, and save big on daily commutes.
          </p>
        </motion.div>

        {/* College selector + direction */}
        <Card className="p-5 mb-6 border-border bg-card">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* College dropdown */}
            <div className="flex-1 relative">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Select Your College</label>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted border border-input text-foreground text-sm hover:border-primary/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[hsl(var(--zhoop-college))]" />
                  {college?.name || "Choose college"}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>
              {showDropdown && (
                <div className="absolute z-20 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {COLLEGES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCollege(c.id); setShowDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center justify-between ${
                        selectedCollege === c.id ? "bg-primary/5 text-primary font-medium" : "text-foreground"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.area}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Direction toggle */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Direction</label>
              <div className="flex rounded-xl border border-input overflow-hidden">
                <button
                  onClick={() => setDirection("pickup")}
                  className={`px-5 py-3 text-sm font-medium transition-colors ${
                    direction === "pickup" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🏠 → 🎓 Going to College
                </button>
                <button
                  onClick={() => setDirection("drop")}
                  className={`px-5 py-3 text-sm font-medium transition-colors ${
                    direction === "drop" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🎓 → 🏠 Going Home
                </button>
              </div>
            </div>
          </div>

          {/* Female only */}
          <div className="flex items-center gap-2.5">
            <Switch
              id="college-female-only"
              checked={femaleOnly}
              onCheckedChange={setFemaleOnly}
              className="data-[state=checked]:bg-pink-500"
            />
            <Label htmlFor="college-female-only" className="flex items-center gap-1.5 text-sm cursor-pointer text-foreground">
              <ShieldCheck className="w-4 h-4 text-pink-500" />
              Female Only Mode
            </Label>
          </div>
        </Card>

        {/* Nearby checkpoints */}
        {checkpoints.length > 0 && (
          <Card className="p-5 mb-6 border-border bg-card">
            <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {direction === "pickup" ? "Select Pickup Point near" : "Select Drop Point near"} {college?.shortName}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {checkpoints.map((cp, i) => (
                <button
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{cp.name}</p>
                    <p className="text-xs text-muted-foreground">{cp.distance} from campus</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Example: MCC → Egmore ride */}
        <div className="mb-4">
          <Badge className="mb-3 bg-accent/10 text-accent-foreground border-accent/20 hover:bg-accent/10">
            🔥 Live Example
          </Badge>
          <h3 className="font-display font-bold text-lg text-foreground mb-1">
            MCC College → Egmore / Central Station
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            3 MCC students already sharing this morning ride — join them & split petrol costs!
          </p>
        </div>

        <Card className="p-5 border-border bg-card">
          {/* Driver info */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full zhoop-gradient-bg flex items-center justify-center text-primary-foreground font-display font-semibold text-sm">
                VK
              </div>
              <div>
                <h4 className="font-display font-semibold text-foreground">Vikram K</h4>
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Star className="w-3 h-3 fill-accent text-accent" /> 4.8
                  <span className="mx-1">·</span>
                  <GraduationCap className="w-3 h-3 text-[hsl(var(--zhoop-college))]" /> MCC Student
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="zhoop-chip-car">
                <Car className="w-3 h-3" /> Maruti Baleno
              </div>
            </div>
          </div>

          {/* Mood tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
              <MessageCircle className="w-2.5 h-2.5" /> Social Ride
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 text-accent-foreground border border-accent/20">
              <Handshake className="w-2.5 h-2.5" /> Networking
            </span>
          </div>

          {/* Booked passengers */}
          <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">3/4 seats booked</span>
              <span className="text-xs text-muted-foreground ml-auto">1 seat available!</span>
            </div>
            <div className="space-y-1.5">
              {MCC_EGMORE_PASSENGERS.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 rounded-full bg-[hsl(var(--zhoop-college))]/10 flex items-center justify-center text-[hsl(var(--zhoop-college))] font-semibold text-[10px]">
                    {p.avatar}
                  </div>
                  <span className="text-foreground font-medium">{p.name}</span>
                  <span className="text-muted-foreground">
                    {p.pickupCheckpoint} → {p.dropCheckpoint}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkpoint pills */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {MCC_EGMORE_CHECKPOINTS.map((cp) => {
              const isPickup = MCC_EGMORE_PASSENGERS.some((p) => p.pickupCheckpoint === cp.name);
              const isDrop = MCC_EGMORE_PASSENGERS.some((p) => p.dropCheckpoint === cp.name);
              return (
                <div
                  key={cp.id}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    isPickup
                      ? "bg-primary/10 text-primary border-primary/20"
                      : isDrop
                      ? "bg-accent/10 text-accent-foreground border-accent/20"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  <MapPin className="w-2.5 h-2.5" />
                  {cp.name}
                  <span className="text-muted-foreground">{cp.arrivalTime}</span>
                  {isPickup && <span className="text-primary font-bold ml-0.5">↑</span>}
                  {isDrop && <span className="text-accent font-bold ml-0.5">↓</span>}
                </div>
              );
            })}
          </div>

          {/* Map */}
          <div className="mb-4 rounded-lg overflow-hidden border border-border">
            <MapView checkpoints={MCC_EGMORE_CHECKPOINTS} className="h-[220px]" />
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">28 km</span> · ₹12/km
              <span className="mx-2">·</span>
              08:00 AM → 09:15 AM
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5 font-display font-bold text-primary">
                <IndianRupee className="w-4 h-4" />
                <span className="text-xl">84</span>
                <span className="text-xs text-muted-foreground font-normal ml-1">per person</span>
              </div>
              <Button className="zhoop-gradient-bg text-primary-foreground font-display font-semibold rounded-xl border-0 hover:opacity-90">
                Join Ride
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CollegeRideSelector;
