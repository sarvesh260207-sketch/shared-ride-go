import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Crown, Medal, Star, Leaf } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CollegeScore {
  college: string;
  totalRides: number;
  co2Saved: number;
  members: number;
}

const MOCK_LEADERBOARD: CollegeScore[] = [
  { college: "MCC", totalRides: 720, co2Saved: 1832, members: 156 },
  { college: "Anna University", totalRides: 640, co2Saved: 1646, members: 143 },
  { college: "SRM University", totalRides: 275, co2Saved: 702, members: 52 },
  { college: "Loyola College", totalRides: 218, co2Saved: 554, members: 38 },
  { college: "VIT Chennai", totalRides: 196, co2Saved: 498, members: 35 },
  { college: "Guru Nanak College", totalRides: 185, co2Saved: 470, members: 33 },
  { college: "SSN College", totalRides: 178, co2Saved: 452, members: 30 },
  { college: "IIT Madras", totalRides: 165, co2Saved: 419, members: 28 },
  { college: "Stella Maris College", totalRides: 142, co2Saved: 361, members: 24 },
];

const TIERS = [
  { name: "Earth Guardian", icon: Crown, minRides: 100, color: "text-accent", bg: "bg-accent/10", border: "border-accent/30", desc: "Top 1% in Chennai" },
  { name: "Carbon Captain", icon: Medal, minRides: 50, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", desc: "50+ rides provided" },
  { name: "Green Rider", icon: Leaf, minRides: 20, color: "text-primary", bg: "bg-primary/5", border: "border-primary/20", desc: "20+ rides shared" },
  { name: "Rookie", icon: Star, minRides: 0, color: "text-muted-foreground", bg: "bg-muted", border: "border-border", desc: "Just getting started" },
];

const CampusLeague = () => {
  const [tab, setTab] = useState("leaderboard");
  const podium = MOCK_LEADERBOARD.slice(0, 3);
  const rest = MOCK_LEADERBOARD.slice(3);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent-foreground text-xs font-bold border border-accent/20 mb-3">
            <Trophy className="w-3.5 h-3.5" />
            CAMPUS LEAGUE
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground">
            Greenest Colleges in Chennai
          </h2>
          <p className="text-muted-foreground text-sm mt-1">College-level rivalry for the planet 🌍</p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="leaderboard" className="font-display text-sm gap-1.5">
              <Flame className="w-3.5 h-3.5" /> Leaderboard
            </TabsTrigger>
            <TabsTrigger value="tiers" className="font-display text-sm gap-1.5">
              <Crown className="w-3.5 h-3.5" /> Tiers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 0, 2].map((idx) => {
                const col = podium[idx];
                if (!col) return null;
                const rank = idx + 1;
                const isFirst = idx === 0;
                return (
                  <motion.div
                    key={col.college}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rank * 0.1 }}
                    className={`zhoop-card p-4 text-center ${isFirst ? "ring-2 ring-accent/40 -mt-2" : ""}`}
                  >
                    <div className={`text-2xl mb-1 ${isFirst ? "" : "text-xl"}`}>
                      {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                    </div>
                    <p className="font-display font-bold text-sm text-foreground">{col.college}</p>
                    <div className="mt-2 flex items-center justify-center gap-1 text-primary">
                      <Leaf className="w-3 h-3" />
                      <span className="font-display font-bold text-sm">{col.co2Saved} kg</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{col.totalRides} rides • {col.members} riders</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="space-y-2">
              {rest.map((col, i) => (
                <motion.div
                  key={col.college}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (i + 3) * 0.06 }}
                  className="zhoop-card p-3 flex items-center gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center font-display font-bold text-xs text-muted-foreground">
                    {i + 4}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm text-foreground truncate">{col.college}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-primary text-xs font-bold">
                      <Leaf className="w-3 h-3" />
                      {col.co2Saved} kg
                    </div>
                    <p className="text-[10px] text-muted-foreground">{col.totalRides} rides</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tiers">
            <div className="space-y-3">
              {TIERS.map((tier, i) => {
                const Icon = tier.icon;
                return (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`zhoop-card p-4 flex items-center gap-4 border ${tier.border}`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${tier.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${tier.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-display font-bold text-base ${tier.color}`}>{tier.name}</p>
                      <p className="text-xs text-muted-foreground">{tier.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-foreground">
                        {tier.minRides === 0 ? "Start here" : `${tier.minRides}+ rides`}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              <p className="text-[11px] text-center text-muted-foreground mt-4">
                🏷️ Earth Guardians get a physical sticker for their vehicle — free marketing!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default CampusLeague;
