import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bus, Train, Footprints, Car, Bike, MapPin, Clock, IndianRupee,
  ArrowRight, ChevronDown, Navigation, AlertCircle, Route, Users,
} from "lucide-react";
import ExampleTripShowcase from "@/components/ExampleTripShowcase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import {
  getTransitDirections, getLastMileOptions,
  TransitRoute, LastMileOption,
} from "@/lib/transitDirections";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

const vehicleIcon = (type: string) => {
  switch (type) {
    case "BUS": return <Bus className="w-4 h-4" />;
    case "RAIL":
    case "HEAVY_RAIL":
    case "COMMUTER_TRAIN":
    case "METRO_RAIL":
    case "SUBWAY":
      return <Train className="w-4 h-4" />;
    default: return <Bus className="w-4 h-4" />;
  }
};

const lastMileIcon = (mode: string) => {
  switch (mode) {
    case "auto": return <Car className="w-4 h-4" />;
    case "bike": return <Bike className="w-4 h-4" />;
    case "walk": return <Footprints className="w-4 h-4" />;
    default: return <Navigation className="w-4 h-4" />;
  }
};

const TravelPlanner = () => {
  const { toast } = useToast();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromPlace, setFromPlace] = useState<google.maps.places.PlaceResult>();
  const [toPlace, setToPlace] = useState<google.maps.places.PlaceResult>();
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [lastMile, setLastMile] = useState<LastMileOption[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(0);

  const handleSearch = async () => {
    if (!fromPlace?.geometry?.location || !toPlace?.geometry?.location) {
      toast({ title: "Select both locations", description: "Please pick locations from the suggestions dropdown.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setRoutes([]);
    setLastMile([]);
    setSearched(true);
    setSelectedRoute(0);

    const origin = { lat: fromPlace.geometry.location.lat(), lng: fromPlace.geometry.location.lng() };
    const dest = { lat: toPlace.geometry.location.lat(), lng: toPlace.geometry.location.lng() };

    try {
      const transitRoutes = await getTransitDirections(origin, dest);
      setRoutes(transitRoutes);

      // Get last-mile from the arrival stop of the first route's last transit step to the final destination
      if (transitRoutes.length > 0) {
        const steps = transitRoutes[0].steps;
        const lastTransit = [...steps].reverse().find((s) => s.mode === "TRANSIT");
        if (lastTransit) {
          const lm = await getLastMileOptions(lastTransit.endLocation, dest);
          setLastMile(lm);
        }
      }
    } catch (err: any) {
      console.error("Transit error:", err);
      toast({
        title: "No transit routes found",
        description: "Google Maps couldn't find public transit routes for this trip. Try different locations or check if transit data is available.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 saathi-gradient-bg opacity-5" />
        <div className="container mx-auto px-4 py-10 sm:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2 tracking-tight">
              <Route className="inline w-8 h-8 mr-2 text-primary" />
              Multi-Modal <span className="saathi-gradient-text">Travel Planner</span>
            </h1>
            <p className="text-muted-foreground">
              Find the exact bus, train, and last-mile options to reach your destination in Tamil Nadu.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="max-w-3xl mx-auto">
            <Card className="p-4 sm:p-6 border-border bg-card">
              <div className="flex flex-col sm:flex-row gap-3">
                <PlacesAutocomplete
                  value={from}
                  onChange={(val) => { setFrom(val); }}
                  placeholder="Starting point (e.g. Chennai Egmore)"
                  iconColor="text-primary"
                  className="flex-1"
                />
                <div className="hidden sm:flex items-center">
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
                <PlacesAutocomplete
                  value={to}
                  onChange={(val, place) => { setTo(val); if (place) setToPlace(place); }}
                  placeholder="Destination (e.g. Pondicherry Cafe)"
                  iconColor="text-accent"
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  size="lg"
                  className="saathi-gradient-bg rounded-xl font-display font-semibold gap-2 px-6 text-primary-foreground border-0 hover:opacity-90 transition-opacity"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Finding…
                    </span>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      Plan Trip
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      {searched && (
        <section className="container mx-auto px-4 pb-16">
          <AnimatePresence>
            {routes.length === 0 && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No transit routes available for this trip. Try different locations.</p>
              </motion.div>
            )}

            {routes.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
                {/* Route alternatives tabs */}
                <Tabs defaultValue="0" onValueChange={(v) => setSelectedRoute(Number(v))}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-bold text-xl text-foreground">
                      Transit Routes
                      <span className="ml-2 text-sm font-normal text-muted-foreground">({routes.length} options)</span>
                    </h2>
                    {routes.length > 1 && (
                      <TabsList className="bg-muted">
                        {routes.map((_, i) => (
                          <TabsTrigger key={i} value={String(i)} className="text-xs font-display">
                            Route {i + 1}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    )}
                  </div>

                  {routes.map((route, ri) => (
                    <TabsContent key={ri} value={String(ri)}>
                      {/* Route summary */}
                      <Card className="p-4 mb-4 border-border bg-card">
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <Clock className="w-4 h-4 text-primary" />
                            {route.totalDuration}
                          </div>
                          <div className="flex items-center gap-1.5 text-foreground">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {route.totalDistance}
                          </div>
                          {route.departureTime && (
                            <div className="text-muted-foreground">
                              {route.departureTime} → {route.arrivalTime}
                            </div>
                          )}
                          {route.fare && (
                            <div className="flex items-center gap-1 text-primary font-semibold">
                              <IndianRupee className="w-3.5 h-3.5" />
                              {route.fare}
                            </div>
                          )}
                        </div>

                        {/* Visual route strip */}
                        <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
                          {route.steps.map((step, si) => (
                            <div key={si} className="flex items-center gap-1">
                              {si > 0 && <ChevronDown className="w-3 h-3 text-muted-foreground rotate-[-90deg] shrink-0" />}
                              <div
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
                                  step.mode === "TRANSIT"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {step.mode === "TRANSIT"
                                  ? vehicleIcon(step.transitDetails?.vehicleType || "BUS")
                                  : <Footprints className="w-3 h-3" />}
                                <span>
                                  {step.mode === "TRANSIT"
                                    ? step.transitDetails?.lineShortName || step.transitDetails?.lineName || "Transit"
                                    : `Walk ${step.duration}`}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>

                      {/* Detailed steps */}
                      <Accordion type="single" collapsible defaultValue="steps" className="mb-6">
                        <AccordionItem value="steps" className="border-border">
                          <AccordionTrigger className="font-display text-sm text-foreground hover:no-underline">
                            Detailed Journey Steps
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-0">
                              {route.steps.map((step, si) => (
                                <div key={si} className="flex gap-3 relative">
                                  {/* Timeline */}
                                  <div className="flex flex-col items-center">
                                    <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${
                                      step.mode === "TRANSIT" ? "bg-primary" : "bg-muted-foreground/40"
                                    }`} />
                                    {si < route.steps.length - 1 && (
                                      <div className="w-0.5 flex-1 bg-border my-1" />
                                    )}
                                  </div>

                                  {/* Content */}
                                  <div className="pb-4 flex-1 min-w-0">
                                    {step.mode === "TRANSIT" && step.transitDetails ? (
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          {vehicleIcon(step.transitDetails.vehicleType)}
                                          <span className="font-semibold text-foreground text-sm">
                                            {step.transitDetails.vehicleType === "BUS" ? "Bus" : "Train"}{" "}
                                            {step.transitDetails.lineShortName && (
                                              <span
                                                className="px-1.5 py-0.5 rounded text-xs text-primary-foreground ml-1"
                                                style={{ backgroundColor: step.transitDetails.lineColor || "hsl(var(--primary))" }}
                                              >
                                                {step.transitDetails.lineShortName}
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                          {step.transitDetails.lineName}
                                        </p>
                                        <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
                                          <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="font-medium text-foreground">{step.transitDetails.departureStop}</span>
                                            <span className="text-muted-foreground ml-auto">{step.transitDetails.departureTime}</span>
                                          </div>
                                          <div className="ml-1 border-l-2 border-dashed border-border pl-3 py-1 text-muted-foreground">
                                            {step.transitDetails.numStops} stops · {step.duration} · {step.distance}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-accent" />
                                            <span className="font-medium text-foreground">{step.transitDetails.arrivalStop}</span>
                                            <span className="text-muted-foreground ml-auto">{step.transitDetails.arrivalTime}</span>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <Footprints className="w-3.5 h-3.5 text-muted-foreground" />
                                          <span className="text-sm text-foreground font-medium">Walk</span>
                                          <span className="text-xs text-muted-foreground">{step.duration} · {step.distance}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{step.instruction}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      {route.warnings.length > 0 && (
                        <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/20 text-xs text-accent-foreground">
                          <AlertCircle className="w-3.5 h-3.5 inline mr-1.5" />
                          {route.warnings[0]}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>

                {/* Last Mile */}
                {lastMile.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h3 className="font-display font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-accent" />
                      Last Mile — Reach Your Exact Destination
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {lastMile.map((opt) => (
                        <Card key={opt.mode} className="p-4 border-border bg-card hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              {lastMileIcon(opt.mode)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                              <p className="text-xs text-muted-foreground">{opt.distance} · {opt.duration}</p>
                            </div>
                          </div>
                          {opt.estimatedCost && (
                            <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                              <IndianRupee className="w-3.5 h-3.5" />
                              {opt.estimatedCost}
                              <span className="text-xs font-normal text-muted-foreground ml-1">(est.)</span>
                            </div>
                          )}
                          {(opt.mode === "auto" || opt.mode === "bike") && (
                            <Link to="/" className="mt-3 block">
                              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs font-display rounded-lg border-primary/30 text-primary hover:bg-primary/5">
                                <Users className="w-3.5 h-3.5" />
                                Search for Commutes
                              </Button>
                            </Link>
                          )}
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* Example trip showcase + How it works */}
      {!searched && (
        <>
          <ExampleTripShowcase />
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display font-bold text-lg text-foreground mb-4">How It Works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: MapPin, title: "Pick Locations", desc: "Enter your starting point and final destination" },
                  { icon: Bus, title: "Get Transit Routes", desc: "See exact bus & train options with timings" },
                  { icon: Navigation, title: "Last Mile Info", desc: "Auto, bike taxi, or walk options to your door" },
                ].map((item) => (
                  <Card key={item.title} className="p-4 border-border bg-card text-center">
                    <item.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="font-display font-semibold text-sm text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default TravelPlanner;
