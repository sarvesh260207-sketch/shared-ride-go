import { useState } from "react";
import zhoopLogo from "@/assets/zhoop-logo-new.jpeg";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Bike, IndianRupee, Shield, Leaf, Search, Trophy, MapPinned, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchPanel from "@/components/SearchPanel";
import RideCard from "@/components/RideCard";
import MapView from "@/components/MapView";
import CollegeRideSelector from "@/components/CollegeRideSelector";
import BroCodeInvite from "@/components/BroCodeInvite";
import ImpactDashboard from "@/components/ImpactDashboard";
import CircleOfTrustFilter from "@/components/CircleOfTrustFilter";
import CampusLeague from "@/components/CampusLeague";
import VirtualBusStops from "@/components/VirtualBusStops";
import { mockRides } from "@/data/mockRides";
import { Ride, PRICING } from "@/types/ride";

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("rides");
  const [searchResults, setSearchResults] = useState<Ride[]>([]);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [femaleOnly, setFemaleOnly] = useState(false);

  const [circleOnly, setCircleOnly] = useState(false);
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const handleSearch = (from: string, to: string) => {
    let results = mockRides.filter(
      (r) =>
        r.from.toLowerCase().includes(from.toLowerCase()) ||
        r.to.toLowerCase().includes(to.toLowerCase()) ||
        r.checkpoints.some((cp) =>
          cp.name.toLowerCase().includes(from.toLowerCase()) ||
          cp.name.toLowerCase().includes(to.toLowerCase())
        )
    );
    if (results.length === 0) results = mockRides;
    if (femaleOnly) results = results.filter((r) => r.femaleOnly);
    if (circleOnly) {
      if (collegeFilter !== "all") results = results.filter((r) => r.driverCollege === collegeFilter);
      if (departmentFilter !== "all") results = results.filter((r) => r.driverDepartment === departmentFilter);
    }
    setSearchResults(results);
    setSelectedRide(null);
    setHasSearched(true);
  };

  const handleRideClick = (ride: Ride) => {
    setSelectedRide(ride);
    navigate(`/ride/${ride.id}`);
  };

  const displayCheckpoints = selectedRide?.checkpoints || searchResults[0]?.checkpoints || [];
  const featuredRides = mockRides.filter(r => r.bookedPassengers && r.bookedPassengers.length > 0);
  const regularRides = mockRides.filter(r => !r.bookedPassengers || r.bookedPassengers.length === 0).slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 saathi-gradient-bg opacity-5" />
        <div className="container mx-auto px-4 py-10 sm:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto mb-6">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-3 tracking-tight">
              Travel Green,{" "}
              <span className="zhoop-gradient-text">Earn Green.</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Connect with co-commuters heading your way in Tamil Nadu.
            </p>
          </motion.div>

          {/* Pricing chips */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-2 mb-6">
            {Object.values(PRICING).map((t) => (
              <div key={t.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs">
                <IndianRupee className="w-3 h-3 text-primary" />
                <span className="font-medium text-foreground">{t.label}</span>
                <span className="text-muted-foreground">₹{t.baseFare} + ₹{t.perKm}/km</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main tabs */}
      <div className="container mx-auto px-4 pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="rides" className="font-display text-sm gap-1.5">
              <Search className="w-3.5 h-3.5" /> Find Rides
            </TabsTrigger>
            <TabsTrigger value="impact" className="font-display text-sm gap-1.5">
              <Leaf className="w-3.5 h-3.5" /> Impact
            </TabsTrigger>
            <TabsTrigger value="league" className="font-display text-sm gap-1.5">
              <Trophy className="w-3.5 h-3.5" /> League
            </TabsTrigger>
            <TabsTrigger value="community" className="font-display text-sm gap-1.5">
              <Users className="w-3.5 h-3.5" /> Community
            </TabsTrigger>
          </TabsList>

          {/* ─── RIDES TAB ─── */}
          <TabsContent value="rides">
            <div className="max-w-3xl mx-auto space-y-3 mb-8">
              <SearchPanel onSearch={handleSearch} femaleOnly={femaleOnly} onFemaleOnlyChange={setFemaleOnly} />
              <CircleOfTrustFilter
                collegeFilter={collegeFilter}
                departmentFilter={departmentFilter}
                onCollegeChange={setCollegeFilter}
                onDepartmentChange={setDepartmentFilter}
                circleOnly={circleOnly}
                onCircleOnlyChange={setCircleOnly}
              />
            </div>

            {hasSearched ? (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-bold text-xl text-foreground">
                      Available Rides
                      <span className="ml-2 text-sm font-normal text-muted-foreground">({searchResults.length} found)</span>
                    </h2>
                    <div className="flex gap-2">
                      <button className="saathi-chip-car"><Car className="w-3 h-3" /> Car</button>
                      <button className="saathi-chip-bike"><Bike className="w-3 h-3" /> Bike</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {searchResults.map((ride, i) => (
                      <RideCard key={ride.id} ride={ride} index={i} onClick={handleRideClick} showDetailedMap={!!ride.bookedPassengers?.length} />
                    ))}
                  </div>
                </div>
                <div className="lg:w-[420px]">
                  <div className="sticky top-20">
                    <h3 className="font-display font-semibold text-sm text-muted-foreground mb-3">Route Preview</h3>
                    <MapView checkpoints={displayCheckpoints} className="h-[400px]" />
                    {displayCheckpoints.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {displayCheckpoints.map((cp, i) => (
                          <div key={cp.id} className="flex items-center gap-3 text-sm">
                            <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : i === displayCheckpoints.length - 1 ? 'bg-accent' : 'bg-muted-foreground/40'}`} />
                            <span className="text-foreground flex-1">{cp.name}</span>
                            {cp.arrivalTime && <span className="text-muted-foreground text-xs">{cp.arrivalTime}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-display font-bold text-xl text-foreground text-center mb-6">Popular Routes in Tamil Nadu</h2>
                {featuredRides.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-display font-semibold text-sm text-muted-foreground text-center mb-4">
                      🔥 Partially Booked — Join Now!
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl mx-auto">
                      {featuredRides.map((ride, i) => (
                        <RideCard key={ride.id} ride={ride} index={i} onClick={handleRideClick} showDetailedMap />
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
                  {regularRides.map((ride, i) => (
                    <RideCard key={ride.id} ride={ride} index={i} onClick={handleRideClick} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ─── IMPACT TAB ─── */}
          <TabsContent value="impact">
            <div className="max-w-3xl mx-auto space-y-8">
              <ImpactDashboard />
              <VirtualBusStops />
            </div>
          </TabsContent>

          {/* ─── LEAGUE TAB ─── */}
          <TabsContent value="league">
            <CampusLeague />
          </TabsContent>

          {/* ─── COMMUNITY TAB ─── */}
          <TabsContent value="community">
            <div className="space-y-8">
              <CollegeRideSelector />
              <BroCodeInvite />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
