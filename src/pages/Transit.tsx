import { motion } from "framer-motion";
import { Bus, Train, TrainFront, MapPin, Clock, Users, AlertCircle, Navigation, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const busArrivals = [
  { route: "M70", dest: "Broadway → Tambaram", eta: 3, crowd: "okay", delayed: false },
  { route: "21G", dest: "T. Nagar → Sholinganallur", eta: 7, crowd: "packed", delayed: true },
  { route: "27B", dest: "Anna Nagar → Adyar", eta: 12, crowd: "empty", delayed: false },
  { route: "55M", dest: "Velachery → Central", eta: 18, crowd: "okay", delayed: false },
];

const metroArrivals = [
  { line: "Blue", dest: "Wimco Nagar → Airport", eta: 2, platform: 1, crowd: "okay" },
  { line: "Green", dest: "Central → St. Thomas Mount", eta: 5, platform: 2, crowd: "packed" },
  { line: "Blue", dest: "Airport → Wimco Nagar", eta: 9, platform: 2, crowd: "empty" },
];

const trainArrivals = [
  { num: "43851", dest: "Beach → Tambaram (Local)", eta: 4, platform: 3, coach: "Ladies coach: front" },
  { num: "43652", dest: "Velachery → Beach", eta: 11, platform: 1, coach: "Ladies coach: rear" },
  { num: "66021", dest: "Chengalpattu Fast", eta: 22, platform: 4, coach: "Standard layout" },
];

const crowdColor = (c: string) =>
  c === "packed" ? "bg-rose-100 text-rose-700" : c === "okay" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";

export default function Transit() {
  const notify = (route: string) => toast.success(`🔔 You'll be alerted 5 min before ${route} arrives`);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">
              <Navigation className="w-3 h-3 mr-1" /> Live Public Transit
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2 tracking-tight">
              Real-time <span className="zhoop-gradient-text">Transit</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Unified live tracking for MTC buses, Chennai Metro, and suburban trains — with crowd density, platform info, and Zhoop last-mile chaining.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
        {/* Live disruption */}
        <Card className="p-4 border-amber-300 bg-amber-50 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-display font-semibold text-sm text-amber-900">Service Update</p>
            <p className="text-xs text-amber-800">Blue line minor delay near Egmore (~4 min). Auto-rerouter suggests bus 27B + Zhoop pool for faster ETA.</p>
          </div>
          <Button size="sm" variant="outline" className="border-amber-400 text-amber-900">Reroute</Button>
        </Card>

        <Tabs defaultValue="bus">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-6">
            <TabsTrigger value="bus" className="gap-1.5"><Bus className="w-3.5 h-3.5" /> MTC Bus</TabsTrigger>
            <TabsTrigger value="metro" className="gap-1.5"><Train className="w-3.5 h-3.5" /> Metro</TabsTrigger>
            <TabsTrigger value="train" className="gap-1.5"><TrainFront className="w-3.5 h-3.5" /> Local Train</TabsTrigger>
          </TabsList>

          <TabsContent value="bus" className="space-y-3">
            {busArrivals.map((b) => (
              <motion.div key={b.route} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
                    {b.route}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-semibold text-sm truncate">{b.dest}</span>
                      {b.delayed && <Badge variant="outline" className="text-[9px] border-rose-300 text-rose-700">Delayed</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.eta} min</span>
                      <Badge className={`text-[9px] border-0 ${crowdColor(b.crowd)}`}>
                        <Users className="w-2.5 h-2.5 mr-1" />{b.crowd}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => notify(b.route)}>
                    <Bell className="w-3 h-3" /> Alert
                  </Button>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="metro" className="space-y-3">
            {metroArrivals.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-4 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-display font-bold text-white ${m.line === "Blue" ? "bg-blue-500" : "bg-emerald-500"}`}>
                    {m.line[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-sm mb-1 truncate">{m.dest}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.eta} min</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />Platform {m.platform}</span>
                      <Badge className={`text-[9px] border-0 ${crowdColor(m.crowd)}`}>{m.crowd}</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => notify(`${m.line} line`)}>
                    <Bell className="w-3 h-3" /> Alert
                  </Button>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="train" className="space-y-3">
            {trainArrivals.map((t) => (
              <motion.div key={t.num} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-accent/15 flex items-center justify-center font-display font-bold text-accent text-xs">
                    {t.num.slice(-3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-sm mb-1 truncate">{t.dest}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.eta} min</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />Pf {t.platform}</span>
                      <span className="text-pink-700">{t.coach}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => notify(`Train ${t.num}`)}>
                    <Bell className="w-3 h-3" /> Alert
                  </Button>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Last-mile chain */}
        <Card className="p-5 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <h3 className="font-display font-bold text-lg mb-2">Chain a Zhoop Last-Mile</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Auto-book a verified carpool seat that syncs to your train/metro arrival time — zero waiting at the station.
          </p>
          <Button className="saathi-gradient-bg text-primary-foreground gap-1.5">
            <Navigation className="w-4 h-4" /> Plan Combined Trip
          </Button>
        </Card>
      </div>
    </div>
  );
}
