import { useState } from "react";
import {
  Bus, Train, Car, Bike, Footprints, MapPin, Clock, IndianRupee,
  ArrowRight, ChevronDown, Navigation, CheckCircle2, XCircle, AlertTriangle,
  Calendar, Users, Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

/* ─── Static example data ─── */

interface ExampleStep {
  mode: "walk" | "bus" | "train" | "auto" | "bike";
  label: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  distance: string;
  cost: number | null;
  details: string;
  frequency: string;
  availability: "available" | "limited" | "unavailable";
  vehicleNumber?: string;
  platform?: string;
  stops?: number;
}

interface ExampleRoute {
  id: string;
  name: string;
  type: "bus" | "train" | "cab" | "mixed";
  totalDuration: string;
  totalDistance: string;
  totalCost: number;
  departureTime: string;
  arrivalTime: string;
  rating: number;
  steps: ExampleStep[];
  pros: string[];
  cons: string[];
}

const EXAMPLE_ROUTES: ExampleRoute[] = [
  {
    id: "bus-direct",
    name: "Direct Bus (SETC / TNSTC)",
    type: "bus",
    totalDuration: "3h 45m",
    totalDistance: "162 km",
    totalCost: 245,
    departureTime: "06:30 AM",
    arrivalTime: "10:15 AM",
    rating: 4,
    steps: [
      {
        mode: "walk", label: "Walk to Tambaram Bus Stand", from: "MCC College, Tambaram",
        to: "Tambaram Bus Stand", departure: "06:10 AM", arrival: "06:25 AM",
        duration: "15 min", distance: "1.1 km", cost: null,
        details: "Walk east on College Rd → turn right at Main Rd → Bus Stand on left",
        frequency: "—", availability: "available",
      },
      {
        mode: "bus", label: "SETC Bus #803 → Pondicherry", from: "Tambaram Bus Stand",
        to: "Pondicherry Bus Stand (Mofussil)", departure: "06:30 AM", arrival: "09:45 AM",
        duration: "3h 15m", distance: "155 km", cost: 195,
        details: "Semi-Deluxe A/C bus via ECR. Stops at Chengalpattu, Tindivanam, Villupuram.",
        frequency: "Every 30 min (6 AM – 10 PM)", availability: "available",
        vehicleNumber: "TN 01 AN 0803", stops: 4,
      },
      {
        mode: "auto", label: "Auto to Pondicherry Beach", from: "Pondicherry Bus Stand",
        to: "Pondicherry Beach (Promenade)", departure: "09:50 AM", arrival: "10:15 AM",
        duration: "15 min", distance: "3.2 km", cost: 50,
        details: "Auto-rickshaw from bus stand. Negotiate fare or use Rapido/Ola auto.",
        frequency: "Always available", availability: "available",
      },
    ],
    pros: ["Most affordable option", "Frequent departures", "Direct route"],
    cons: ["Longer travel time", "Can be crowded during peak hours"],
  },
  {
    id: "train-route",
    name: "Train (Chennai → Villupuram → Pondy)",
    type: "train",
    totalDuration: "4h 10m",
    totalDistance: "170 km",
    totalCost: 165,
    departureTime: "07:00 AM",
    arrivalTime: "11:10 AM",
    rating: 4,
    steps: [
      {
        mode: "walk", label: "Walk to Tambaram Railway Station", from: "MCC College, Tambaram",
        to: "Tambaram Railway Station", departure: "06:40 AM", arrival: "06:55 AM",
        duration: "15 min", distance: "1.0 km", cost: null,
        details: "Walk south on College Rd → Railway Station is 1 km from campus",
        frequency: "—", availability: "available",
      },
      {
        mode: "train", label: "EMU / Express to Villupuram Jn", from: "Tambaram (TBM)",
        to: "Villupuram Junction (VM)", departure: "07:00 AM", arrival: "09:15 AM",
        duration: "2h 15m", distance: "130 km", cost: 55,
        details: "Train #16053 Tambaram–Villupuram Express. Unreserved 2nd class.",
        frequency: "5 trains between 6–10 AM", availability: "available",
        vehicleNumber: "16053", platform: "Platform 3", stops: 8,
      },
      {
        mode: "train", label: "Passenger Train to Pondicherry", from: "Villupuram Junction",
        to: "Pondicherry (PDY)", departure: "09:45 AM", arrival: "10:50 AM",
        duration: "1h 05m", distance: "36 km", cost: 15,
        details: "Train #56501 Villupuram–Pondicherry Passenger. Runs daily.",
        frequency: "3 trains between 9–11 AM", availability: "limited",
        vehicleNumber: "56501", platform: "Platform 1", stops: 5,
      },
      {
        mode: "auto", label: "Auto to Beach", from: "Pondicherry Railway Station",
        to: "Pondicherry Beach (Promenade)", departure: "10:55 AM", arrival: "11:10 AM",
        duration: "10 min", distance: "2.5 km", cost: 40,
        details: "Short auto ride from station to beach promenade.",
        frequency: "Always available", availability: "available",
      },
    ],
    pros: ["Cheapest overall", "Scenic route", "No traffic delays"],
    cons: ["Requires train change at Villupuram", "Limited trains on Villupuram–Pondy stretch"],
  },
  {
    id: "cab-direct",
    name: "Cab / Taxi (Direct)",
    type: "cab",
    totalDuration: "2h 45m",
    totalDistance: "158 km",
    totalCost: 2850,
    departureTime: "Any time",
    arrivalTime: "~2h 45m later",
    rating: 5,
    steps: [
      {
        mode: "walk", label: "Pickup from MCC College", from: "MCC College, Tambaram",
        to: "MCC College Gate", departure: "—", arrival: "—",
        duration: "5 min", distance: "0.2 km", cost: null,
        details: "Book Ola/Uber/InDrive from college gate.",
        frequency: "—", availability: "available",
      },
      {
        mode: "auto", label: "Cab via ECR / GST Road", from: "MCC College, Tambaram",
        to: "Pondicherry Beach (Promenade)", departure: "On demand", arrival: "~2h 40m",
        duration: "2h 40m", distance: "158 km", cost: 2850,
        details: "Route: Tambaram → Chengalpattu → Tindivanam → Pondicherry via NH32/ECR. Ola Prime Sedan / Uber Go. Toll: ~₹150 extra.",
        frequency: "24/7 on-demand", availability: "available",
        vehicleNumber: "Ola / Uber / InDrive",
      },
    ],
    pros: ["Fastest & most comfortable", "Door-to-door", "Available 24/7"],
    cons: ["Most expensive", "Toll charges extra (~₹150)", "Surge pricing possible"],
  },
  {
    id: "mixed-optimal",
    name: "Suburban Train + Bus (Best Value)",
    type: "mixed",
    totalDuration: "4h 00m",
    totalDistance: "165 km",
    totalCost: 185,
    departureTime: "06:15 AM",
    arrivalTime: "10:15 AM",
    rating: 4,
    steps: [
      {
        mode: "train", label: "Suburban EMU to Chennai Mofussil", from: "Tambaram (TBM)",
        to: "Chennai Egmore (MS)", departure: "06:15 AM", arrival: "06:50 AM",
        duration: "35 min", distance: "22 km", cost: 10,
        details: "MRTS / EMU suburban train. Very frequent service.",
        frequency: "Every 10–15 min", availability: "available",
        platform: "Platform 1", stops: 6,
      },
      {
        mode: "walk", label: "Walk to CMBT / Koyambedu", from: "Chennai Egmore",
        to: "CMBT Koyambedu", departure: "06:55 AM", arrival: "07:15 AM",
        duration: "20 min", distance: "Auto ₹30", cost: 30,
        details: "Take a share auto from Egmore to CMBT (₹30) or Metro Rail to Koyambedu.",
        frequency: "—", availability: "available",
      },
      {
        mode: "bus", label: "SETC Volvo to Pondicherry", from: "CMBT Koyambedu",
        to: "Pondicherry Bus Stand", departure: "07:30 AM", arrival: "10:00 AM",
        duration: "2h 30m", distance: "150 km", cost: 105,
        details: "SETC Ultra Deluxe / Volvo A/C bus. Comfortable seats, direct service.",
        frequency: "Every 20 min (6 AM – 11 PM)", availability: "available",
        vehicleNumber: "SETC Volvo UD", stops: 2,
      },
      {
        mode: "auto", label: "Auto to Beach", from: "Pondicherry Bus Stand",
        to: "Pondicherry Beach", departure: "10:05 AM", arrival: "10:15 AM",
        duration: "10 min", distance: "3 km", cost: 40,
        details: "Auto or Rapido bike taxi to beach promenade.",
        frequency: "Always available", availability: "available",
      },
    ],
    pros: ["Good balance of cost & comfort", "A/C Volvo bus option", "Reliable timings"],
    cons: ["Extra transfer at Chennai", "Slightly longer than direct bus"],
  },
];

/* ─── Helpers ─── */

const modeIcon = (m: string) => {
  switch (m) {
    case "bus": return <Bus className="w-4 h-4" />;
    case "train": return <Train className="w-4 h-4" />;
    case "auto": return <Car className="w-4 h-4" />;
    case "bike": return <Bike className="w-4 h-4" />;
    default: return <Footprints className="w-4 h-4" />;
  }
};

const availBadge = (a: string) => {
  switch (a) {
    case "available":
      return <Badge variant="outline" className="text-xs border-green-500/30 text-green-600 bg-green-500/10 gap-1"><CheckCircle2 className="w-3 h-3" />Available Now</Badge>;
    case "limited":
      return <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-600 bg-yellow-500/10 gap-1"><AlertTriangle className="w-3 h-3" />Limited</Badge>;
    default:
      return <Badge variant="outline" className="text-xs border-red-500/30 text-red-600 bg-red-500/10 gap-1"><XCircle className="w-3 h-3" />Unavailable</Badge>;
  }
};

const typeColor = (t: string) => {
  switch (t) {
    case "bus": return "bg-blue-500/10 text-blue-600";
    case "train": return "bg-emerald-500/10 text-emerald-600";
    case "cab": return "bg-amber-500/10 text-amber-600";
    default: return "bg-primary/10 text-primary";
  }
};

/* ─── Component ─── */

const ExampleTripShowcase = () => {
  const [expandedRoute, setExpandedRoute] = useState<string>("bus-direct");

  return (
    <section className="container mx-auto px-4 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
            <Zap className="w-3 h-3 mr-1" /> Example Trip
          </Badge>
          <h2 className="font-display font-bold text-2xl text-foreground mb-1">
            MCC College, Tambaram → Pondicherry Beach
          </h2>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> ~160 km · 4 travel options compared
            <span className="mx-1">·</span>
            <Calendar className="w-3.5 h-3.5" /> Schedule as of today
          </p>
        </div>

        {/* Cost comparison bar */}
        <Card className="p-4 mb-6 border-border bg-card">
          <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-primary" /> Quick Cost Comparison
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {EXAMPLE_ROUTES.map((r) => (
              <button
                key={r.id}
                onClick={() => setExpandedRoute(r.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  expandedRoute === r.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${typeColor(r.type)}`}>
                  {r.type === "bus" && <Bus className="w-3 h-3" />}
                  {r.type === "train" && <Train className="w-3 h-3" />}
                  {r.type === "cab" && <Car className="w-3 h-3" />}
                  {r.type === "mixed" && <Navigation className="w-3 h-3" />}
                  {r.type.charAt(0).toUpperCase() + r.type.slice(1)}
                </div>
                <div className="flex items-center gap-1 text-lg font-bold text-foreground">
                  <IndianRupee className="w-4 h-4" />{r.totalCost}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{r.totalDuration}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Detailed routes */}
        <Tabs value={expandedRoute} onValueChange={setExpandedRoute}>
          <TabsList className="bg-muted w-full flex overflow-x-auto">
            {EXAMPLE_ROUTES.map((r) => (
              <TabsTrigger key={r.id} value={r.id} className="text-xs font-display flex-1 min-w-0">
                <span className="truncate">{r.name.split("(")[0].trim()}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {EXAMPLE_ROUTES.map((route) => (
            <TabsContent key={route.id} value={route.id}>
              {/* Summary card */}
              <Card className="p-4 mb-4 border-border bg-card">
                <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <Clock className="w-4 h-4 text-primary" />{route.totalDuration}
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground">
                    <MapPin className="w-4 h-4 text-muted-foreground" />{route.totalDistance}
                  </div>
                  <div className="text-muted-foreground">{route.departureTime} → {route.arrivalTime}</div>
                  <div className="flex items-center gap-1 text-primary font-bold">
                    <IndianRupee className="w-3.5 h-3.5" />{route.totalCost}
                  </div>
                </div>

                {/* Pros/Cons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    {route.pros.map((p, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-green-600">
                        <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" /><span>{p}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {route.cons.map((c, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-muted-foreground">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /><span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Step-by-step journey */}
              <Accordion type="single" collapsible defaultValue="steps">
                <AccordionItem value="steps" className="border-border">
                  <AccordionTrigger className="font-display text-sm text-foreground hover:no-underline">
                    Step-by-Step Journey Details
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-0">
                      {route.steps.map((step, si) => (
                        <div key={si} className="flex gap-3 relative">
                          {/* Timeline dot */}
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                              step.mode === "walk" ? "bg-muted text-muted-foreground" :
                              step.mode === "bus" ? "bg-blue-500/15 text-blue-600" :
                              step.mode === "train" ? "bg-emerald-500/15 text-emerald-600" :
                              "bg-amber-500/15 text-amber-600"
                            }`}>
                              {modeIcon(step.mode)}
                            </div>
                            {si < route.steps.length - 1 && (
                              <div className="w-0.5 flex-1 bg-border my-1" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="pb-5 flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <p className="font-semibold text-sm text-foreground">{step.label}</p>
                                <p className="text-xs text-muted-foreground">{step.from} → {step.to}</p>
                              </div>
                              {availBadge(step.availability)}
                            </div>

                            <Card className="p-3 mt-2 border-border bg-muted/30">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-2">
                                <div>
                                  <span className="text-muted-foreground block">Depart</span>
                                  <span className="font-medium text-foreground">{step.departure}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block">Arrive</span>
                                  <span className="font-medium text-foreground">{step.arrival}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block">Duration</span>
                                  <span className="font-medium text-foreground">{step.duration}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block">Cost</span>
                                  <span className="font-medium text-foreground">
                                    {step.cost !== null ? `₹${step.cost}` : "Free"}
                                  </span>
                                </div>
                              </div>

                              <p className="text-xs text-muted-foreground mb-2">{step.details}</p>

                              <div className="flex flex-wrap gap-2 text-xs">
                                {step.vehicleNumber && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <Bus className="w-3 h-3" />{step.vehicleNumber}
                                  </Badge>
                                )}
                                {step.platform && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <MapPin className="w-3 h-3" />{step.platform}
                                  </Badge>
                                )}
                                {step.stops != null && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <Users className="w-3 h-3" />{step.stops} stops
                                  </Badge>
                                )}
                                {step.frequency !== "—" && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <Clock className="w-3 h-3" />{step.frequency}
                                  </Badge>
                                )}
                              </div>
                            </Card>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default ExampleTripShowcase;
