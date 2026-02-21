import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Bike, Users, IndianRupee, MapPin, Shield, Leaf } from "lucide-react";
import SearchPanel from "@/components/SearchPanel";
import RideCard from "@/components/RideCard";
import MapView from "@/components/MapView";
import { mockRides } from "@/data/mockRides";
import { Ride } from "@/types/ride";

const Index = () => {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<Ride[]>([]);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (from: string, to: string) => {
    const results = mockRides.filter(
      (r) =>
        r.from.toLowerCase().includes(from.toLowerCase()) ||
        r.to.toLowerCase().includes(to.toLowerCase()) ||
        r.checkpoints.some((cp) =>
          cp.name.toLowerCase().includes(from.toLowerCase()) ||
          cp.name.toLowerCase().includes(to.toLowerCase())
        )
    );
    setSearchResults(results.length > 0 ? results : mockRides);
    setSelectedRide(null);
    setHasSearched(true);
  };

  const handleRideClick = (ride: Ride) => {
    setSelectedRide(ride);
    navigate(`/ride/${ride.id}`);
  };

  const features = [
    { icon: IndianRupee, title: "₹5/km Car • ₹3/km Bike", desc: "Share costs, not compromise" },
    { icon: Shield, title: "Verified Commuters", desc: "Corporate verified riders" },
    { icon: Leaf, title: "Eco Friendly", desc: "Reduce carbon footprint" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 saathi-gradient-bg opacity-5" />
        <div className="container mx-auto px-4 py-12 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-8"
          >
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-3 tracking-tight">
              Your Daily Commute,{" "}
              <span className="saathi-gradient-text">Shared.</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Connect with co-commuters heading your way. Save money, make friends, go green.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <SearchPanel onSearch={handleSearch} />
          </motion.div>

          {/* Feature chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm">
                <f.icon className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">{f.title}</span>
                <span className="text-muted-foreground hidden sm:inline">— {f.desc}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Results */}
      {hasSearched && (
        <section className="container mx-auto px-4 pb-16">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Ride List */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-foreground">
                  Available Rides
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({searchResults.length} found)
                  </span>
                </h2>
                <div className="flex gap-2">
                  <button className="saathi-chip-car"><Car className="w-3 h-3" /> Car</button>
                  <button className="saathi-chip-bike"><Bike className="w-3 h-3" /> Bike</button>
                </div>
              </div>
              <div className="space-y-3">
                {searchResults.map((ride, i) => (
                  <RideCard key={ride.id} ride={ride} index={i} onClick={handleRideClick} />
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="lg:w-[420px]">
              <div className="sticky top-20">
                <h3 className="font-display font-semibold text-sm text-muted-foreground mb-3">Route Preview</h3>
                <MapView
                  checkpoints={selectedRide?.checkpoints || searchResults[0]?.checkpoints || []}
                  className="h-[400px]"
                />
                {(selectedRide || searchResults[0]) && (
                  <div className="mt-3 space-y-2">
                    {(selectedRide?.checkpoints || searchResults[0]?.checkpoints || []).map((cp, i) => (
                      <div key={cp.id} className="flex items-center gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : i === (selectedRide?.checkpoints || searchResults[0]?.checkpoints || []).length - 1 ? 'bg-accent' : 'bg-muted-foreground/40'}`} />
                        <span className="text-foreground flex-1">{cp.name}</span>
                        <span className="text-muted-foreground text-xs">{cp.arrivalTime}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {!hasSearched && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="font-display font-bold text-xl text-foreground text-center mb-6">Popular Routes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {mockRides.slice(0, 3).map((ride, i) => (
              <RideCard key={ride.id} ride={ride} index={i} onClick={handleRideClick} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
