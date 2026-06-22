import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Car, Bike, Leaf, Crown, TrendingUp, Check, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const SUBSCRIPTION_PRICE = 49;
const CARBON_CREDIT_PRICE = 250; // ₹ per credit (1 credit = 1 tonne CO₂e)

interface CorporatePool {
  id: string;
  company: string;
  mode: "car" | "bike";
  from: string;
  to: string;
  seats: number;
  time: string;
  perSeat: number;
}

const SAMPLE_POOLS: CorporatePool[] = [
  { id: "c1", company: "TCS Siruseri", mode: "car",  from: "Velachery",   to: "Siruseri IT Park", seats: 3, time: "08:30 AM", perSeat: 42 },
  { id: "c2", company: "Infosys Mahindra City", mode: "car", from: "Tambaram", to: "Mahindra World City", seats: 2, time: "08:00 AM", perSeat: 38 },
  { id: "c3", company: "Zoho Estancia", mode: "bike", from: "Pallavaram", to: "Zoho Estancia", seats: 1, time: "09:15 AM", perSeat: 22 },
  { id: "c4", company: "Cognizant CTS", mode: "car",  from: "Adyar",      to: "Thoraipakkam", seats: 2, time: "08:45 AM", perSeat: 35 },
];

const Corporate = () => {
  const [subscribed, setSubscribed] = useState<boolean>(() => localStorage.getItem("zhoop_corp_sub") === "1");
  const [creditsSaved] = useState(12.4); // demo: tonnes CO₂e accumulated by employees
  const [sellAmount, setSellAmount] = useState("");

  const subscribe = () => {
    localStorage.setItem("zhoop_corp_sub", "1");
    setSubscribed(true);
    toast.success("Priority matching active", { description: `₹${SUBSCRIPTION_PRICE}/month — employees get top-of-list rides.` });
  };

  const sellCredits = () => {
    const n = parseFloat(sellAmount);
    if (!n || n <= 0) return toast.error("Enter a valid credit amount");
    if (n > creditsSaved) return toast.error("Not enough credits in ledger");
    toast.success(`Listed ${n} credits for sale`, { description: `Estimated payout ₹${(n * CARBON_CREDIT_PRICE).toFixed(0)}` });
    setSellAmount("");
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">Corporate Pooling</h1>
              <p className="text-sm text-muted-foreground">Cars & bikes pooled within your company domain.</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="pools">
          <TabsList className="grid grid-cols-3 max-w-md">
            <TabsTrigger value="pools">Pools</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="carbon">Carbon Market</TabsTrigger>
          </TabsList>

          {/* POOLS */}
          <TabsContent value="pools" className="space-y-3 mt-4">
            {SAMPLE_POOLS.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    {p.mode === "car" ? <Car className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-semibold text-sm">{p.company}</span>
                      {subscribed && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold flex items-center gap-1"><Crown className="w-3 h-3" /> Priority</span>}
                    </div>
                    <p className="text-sm text-foreground">{p.from} → {p.to}</p>
                    <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span>{p.time}</span>
                      <span>{p.seats} seat{p.seats > 1 ? "s" : ""}</span>
                      <span className="text-primary font-semibold flex items-center"><IndianRupee className="w-3 h-3" />{p.perSeat}/seat</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Join</Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* SUBSCRIPTION */}
          <TabsContent value="subscription" className="mt-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-6 h-6 text-amber-500" />
                <h3 className="font-display font-bold text-xl">Priority Matching</h3>
              </div>
              <p className="text-3xl font-bold mb-1">₹{SUBSCRIPTION_PRICE}<span className="text-sm font-normal text-muted-foreground">/employee/month</span></p>
              <ul className="space-y-2 text-sm my-4">
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Top placement in colleagues' search results</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Guaranteed seat-hold for 10 minutes</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Detailed monthly commute report for HR</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Carbon-credit ledger access (sellable)</li>
              </ul>
              {subscribed ? (
                <div className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold inline-flex items-center gap-2">
                  <Check className="w-4 h-4" /> Subscription active
                </div>
              ) : (
                <Button onClick={subscribe} className="w-full sm:w-auto">Subscribe — ₹{SUBSCRIPTION_PRICE}/month</Button>
              )}
            </Card>
          </TabsContent>

          {/* CARBON MARKET */}
          <TabsContent value="carbon" className="mt-4 space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Leaf className="w-6 h-6 text-primary" />
                <h3 className="font-display font-bold text-xl">Company Carbon Ledger</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Credits saved this month</p>
                  <p className="text-3xl font-bold flex items-center gap-1">{creditsSaved}<span className="text-sm font-normal text-muted-foreground">tCO₂e</span></p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Market value</p>
                  <p className="text-3xl font-bold flex items-center"><IndianRupee className="w-5 h-5" />{(creditsSaved * CARBON_CREDIT_PRICE).toFixed(0)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Sell carbon credits
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Credits are tracked per vehicle based on each employee's saved CO₂. Sell them on the open market at ₹{CARBON_CREDIT_PRICE}/credit.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Label htmlFor="amt" className="text-xs">Credits (tCO₂e)</Label>
                  <Input id="amt" type="number" step="0.1" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} placeholder="e.g. 5" />
                </div>
                <Button onClick={sellCredits} className="sm:self-end">List for sale</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default Corporate;
