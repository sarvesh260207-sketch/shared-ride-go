import { useState, useMemo } from "react";
import zhoopLogo from "@/assets/zhoop-logo-new.jpeg";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IndianRupee, Leaf, Search, Trophy, Users, Scale, Clock, MapPin, Fuel, Receipt, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchPanel from "@/components/SearchPanel";
import CollegeRideSelector from "@/components/CollegeRideSelector";
import BroCodeInvite from "@/components/BroCodeInvite";
import ImpactDashboard from "@/components/ImpactDashboard";
import CircleOfTrustFilter from "@/components/CircleOfTrustFilter";
import CampusLeague from "@/components/CampusLeague";
import VirtualBusStops from "@/components/VirtualBusStops";
import WorkflowDownload from "@/components/WorkflowDownload";
import { PLATFORM_FEE, INSURANCE_FEE, FUEL_PRICE } from "@/lib/pricing";
import { useActiveRides, DbRide } from "@/hooks/useRides";
import { format } from "date-fns";

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("rides");
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [femaleOnly, setFemaleOnly] = useState(false);
  const [circleOnly, setCircleOnly] = useState(false);
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const { data: rides = [], isLoading } = useActiveRides();

  const handleSearch = (from: string, to: string) => {
    setSearchFrom(from);
    setSearchTo(to);
    setHasSearched(true);
  };

  const filteredRides = useMemo(() => {
    let results = [...rides];

    if (hasSearched && (searchFrom || searchTo)) {
      results = results.filter((r) => {
        const matchOrigin = r.origin.toLowerCase().includes(searchFrom.toLowerCase());
        const matchDest = r.destination.toLowerCase().includes(searchTo.toLowerCase());
        return matchOrigin || matchDest;
      });
      // If no text match, show all
      if (results.length === 0) results = [...rides];
    }

    if (circleOnly) {
      if (collegeFilter !== "all") results = results.filter((r) => r.driver_college === collegeFilter);
      if (departmentFilter !== "all") results = results.filter((r) => r.driver_department === departmentFilter);
    }

    return results;
  }, [rides, hasSearched, searchFrom, searchTo, circleOnly, collegeFilter, departmentFilter]);

  const handleRideClick = (ride: DbRide) => {
    navigate(`/ride/${ride.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 saathi-gradient-bg opacity-5" />
        <div className="container mx-auto px-4 py-10 sm:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center justify-center gap-4 max-w-2xl mx-auto mb-6">
            <img src={zhoopLogo} alt="Zhoop logo" className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover shadow-lg flex-shrink-0" />
            <div className="text-left">
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-1 tracking-tight">
                Travel Green,{" "}
                <span className="zhoop-gradient-text">Earn Green.</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Connect with co-commuters heading your way in Tamil Nadu.
              </p>
            </div>
          </motion.div>

          {/* Pricing chips — real fuel-based pricing */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-2 mb-6">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs">
              <Fuel className="w-3 h-3 text-primary" />
              <span className="font-medium text-foreground">Pay-by-fuel</span>
              <span className="text-muted-foreground">₹{FUEL_PRICE.petrol}/L petrol</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs">
              <Receipt className="w-3 h-3 text-primary" />
              <span className="font-medium text-foreground">Platform fee</span>
              <span className="text-muted-foreground">flat ₹{PLATFORM_FEE}/ride</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs">
              <ShieldCheck className="w-3 h-3 text-accent-foreground" />
              <span className="font-medium text-foreground">Insurance</span>
              <span className="text-muted-foreground">optional ₹{INSURANCE_FEE}/ride</span>
            </div>
          </motion.div>

          {/* Legal Disclaimer */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="max-w-xl mx-auto mb-6">
            <div className="relative p-4 rounded-xl border-2 border-primary/30 bg-primary/5 backdrop-blur-sm">
              <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Scale className="w-3 h-3" /> Legal Notice
              </div>
              <p className="text-sm text-foreground font-medium leading-relaxed mt-1">
                🚫 We are <span className="font-bold text-primary">NOT a taxi or cab aggregator.</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Zhoop is a <span className="font-semibold text-foreground">peer-to-peer cost-sharing platform</span>.
                Co-travellers split actual travel expenses (fuel, tolls) — no fares, no commissions.
                Fully compliant with the <span className="font-semibold text-foreground">Motor Vehicles Act, 1988</span>.
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                <div className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent-foreground">Bill Splitting Only</div>
                <div className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent-foreground">No Commercial Fares</div>
                <div className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent-foreground">Peer-to-Peer</div>
              </div>
            </div>
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

          {/* RIDES TAB */}
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

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredRides.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {hasSearched ? "No rides found for this route" : "No rides available yet"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {hasSearched
                    ? "Try a different route or be the first to offer a ride!"
                    : "Be the first to offer a ride and start the community!"}
                </p>
                <button
                  onClick={() => navigate("/offer-ride")}
                  className="px-6 py-2.5 rounded-xl saathi-gradient-bg text-primary-foreground font-display font-semibold text-sm"
                >
                  Offer a Ride
                </button>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-xl text-foreground">
                    {hasSearched ? "Available Rides" : "All Rides"}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">({filteredRides.length} found)</span>
                  </h2>
                </div>
                <div className="space-y-3">
                  {filteredRides.map((ride) => (
                    <DbRideCard key={ride.id} ride={ride} onClick={() => handleRideClick(ride)} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="impact">
            <div className="max-w-3xl mx-auto space-y-8">
              <ImpactDashboard />
              <VirtualBusStops />
            </div>
          </TabsContent>

          <TabsContent value="league">
            <CampusLeague />
          </TabsContent>

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

// Database ride card component
function DbRideCard({ ride, onClick }: { ride: DbRide; onClick: () => void }) {
  const driverName = (ride as any).profile?.display_name || "Driver";
  const initials = driverName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  const rating = (ride as any).profile?.rating ?? 4.5;
  const verified = (ride as any).profile?.verified ?? false;
  const departureDate = new Date(ride.departure_time);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="saathi-card p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full saathi-gradient-bg flex items-center justify-center text-primary-foreground font-display font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display font-semibold text-foreground text-sm">{driverName}</span>
            {verified && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">✓ Verified</span>}
            <span className="text-xs text-muted-foreground ml-auto">⭐ {rating}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-foreground truncate">{ride.origin}</span>
            <span className="text-muted-foreground mx-1">→</span>
            <span className="text-foreground truncate">{ride.destination}</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(departureDate, "hh:mm a, MMM d")}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {ride.seats_available} seat{ride.seats_available > 1 ? "s" : ""}
            </span>
            {ride.price && (
              <span className="flex items-center gap-0.5 text-primary font-semibold">
                <IndianRupee className="w-3 h-3" />
                {ride.price}
              </span>
            )}
            {ride.driver_college && (
              <span className="px-1.5 py-0.5 rounded-full bg-muted text-[10px] font-medium">{ride.driver_college}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Index;
