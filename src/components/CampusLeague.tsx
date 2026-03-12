import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Crown, Medal, Star, TrendingUp, Leaf } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DepartmentScore {
  college: string;
  department: string;
  totalRides: number;
  co2Saved: number;
  members: number;
}

// Mock leaderboard data — in production from campus_league table
const MOCK_LEADERBOARD: DepartmentScore[] = [
  { college: "Anna University", department: "CSE", totalRides: 342, co2Saved: 890, members: 78 },
  { college: "Anna University", department: "MECH", totalRides: 298, co2Saved: 756, members: 65 },
  { college: "SRM University", department: "CSE", totalRides: 275, co2Saved: 702, members: 52 },
  { college: "MCC", department: "Commerce", totalRides: 245, co2Saved: 623, members: 41 },
  { college: "Loyola College", department: "ECE", totalRides: 218, co2Saved: 554, members: 38 },
  { college: "VIT Chennai", department: "IT", totalRides: 196, co2Saved: 498, members: 35 },
  { college: "SSN College", department: "CSE", totalRides: 178, co2Saved: 452, members: 30 },
  { college: "IIT Madras", department: "MECH", totalRides: 165, co2Saved: 419, members: 28 },
];

const TIERS = [
  { name: "Earth Guardian", icon: Crown, minRides: 100, color: "text-accent", bg: "bg-accent/10", border: "border-accent/30", desc: "Top 1% in Chennai" },
  { name: "Carbon Captain", icon: Medal, minRides: 50, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", desc: "50+ rides provided" },
  { name: "Green Rider", icon: Leaf, minRides: 20, color: "text-primary", bg: "bg-primary/5", border: "border-primary/20", desc: "20+ rides shared" },
  { name: "Rookie", icon: Star, minRides: 0, color: "text-muted-foreground", bg: "bg-muted", border: "border-border", desc: "Just getting started" },
];

const getTier = (rides: number) => TIERS.find((t) => rides >= t.minRides) || TIERS[TIERS.length - 1];

const CampusLeague = () => {
  const [tab, setTab] = useState("leaderboard");

  const podium = MOCK_LEADERBOARD.slice(0, 3);
  const rest = MOCK_LEADERBOARD.slice(3);

  return (
    <section className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent-foreground text-xs font-bold border border-accent/20 mb-3">
            <Trophy className="w-3.5 h-3.5" />
            CAMPUS LEAGUE
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground">
            Greenest Departments in Chennai
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Department-level rivalry for the planet 🌍</p>
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
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 0, 2].map((idx) => {
                const dept = podium[idx];
                if (!dept) return null;
                const rank = idx + 1;
                const isFirst = idx === 0;
                return (
                  <motion.div
                    key={dept.department + dept.college}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rank * 0.1 }}
                    className={`zhoop-card p-4 text-center ${isFirst ? "ring-2 ring-accent/40 -mt-2" : ""}`}
                  >
                    <div className={`text-2xl mb-1 ${isFirst ? "" : "text-xl"}`}>
                      {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                    </div>
                    <p className="font-display font-bold text-sm text-foreground">{dept.department}</p>
                    <p className="text-[10px] text-muted-foreground">{dept.college}</p>
                    <div className="mt-2 flex items-center justify-center gap-1 text-primary">
                      <Leaf className="w-3 h-3" />
                      <span className="font-display font-bold text-sm">{dept.co2Saved} kg</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{dept.totalRides} rides • {dept.members} riders</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Rest of rankings */}
            <div className="space-y-2">
              {rest.map((dept, i) => (
                <motion.div
                  key={dept.department + dept.college}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (i + 3) * 0.06 }}
                  className="zhoop-card p-3 flex items-center gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center font-display font-bold text-xs text-muted-foreground">
                    {i + 4}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm text-foreground">{dept.department}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{dept.college}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-primary text-xs font-bold">
                      <Leaf className="w-3 h-3" />
                      {dept.co2Saved} kg
                    </div>
                    <p className="text-[10px] text-muted-foreground">{dept.totalRides} rides</p>
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
    </section>
  );
};

export default CampusLeague;
