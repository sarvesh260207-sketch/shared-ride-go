import { useState, useEffect } from "react";
import { Star, Car, Shield, Pencil, BookOpen, Leaf, Crown, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CarbonLedger from "@/components/CarbonLedger";
import { COLLEGES, DEPARTMENTS } from "@/components/CircleOfTrustFilter";

const TIERS = [
  { name: "Earth Guardian", icon: Crown, minRides: 100, color: "text-accent" },
  { name: "Carbon Captain", icon: Medal, minRides: 50, color: "text-primary" },
  { name: "Green Rider", icon: Leaf, minRides: 20, color: "text-primary" },
  { name: "Rookie", icon: Star, minRides: 0, color: "text-muted-foreground" },
];

const getTier = (rides: number) => TIERS.find((t) => rides >= t.minRides) || TIERS[TIERS.length - 1];

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setProfile(data);
      setDisplayName(data.display_name || "");
      setCollege(data.college || "");
      setDepartment(data.department || "");
      setLocation(data.location || "");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, college, department, location })
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated!");
      setEditing(false);
      fetchProfile();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  const initials = (displayName || user?.email || "U").slice(0, 2).toUpperCase();
  const tier = getTier(profile?.total_rides || 0);
  const TierIcon = tier.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="profile" className="font-display text-sm">Profile</TabsTrigger>
            <TabsTrigger value="ledger" className="font-display text-sm gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> The Ledger
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Profile Card */}
              <div className="zhoop-card p-6 text-center">
                <div className="w-20 h-20 rounded-full zhoop-gradient-bg mx-auto flex items-center justify-center text-primary-foreground font-display font-bold text-2xl mb-3">
                  {initials}
                </div>

                {/* Tier badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-xs font-bold mb-3">
                  <TierIcon className={`w-3.5 h-3.5 ${tier.color}`} />
                  <span className={tier.color}>{tier.name}</span>
                </div>

                {editing ? (
                  <div className="space-y-3 text-left">
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" className="rounded-xl" />
                    <Select value={college} onValueChange={setCollege}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select College" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLLEGES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="rounded-xl" />
                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="flex-1 zhoop-gradient-bg text-primary-foreground rounded-xl">Save</Button>
                      <Button variant="outline" onClick={() => setEditing(false)} className="rounded-xl">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="font-display font-bold text-xl text-foreground">{profile?.display_name || "Set your name"}</h2>
                    <p className="text-sm text-muted-foreground mb-0.5">{profile?.college || "No college set"}</p>
                    {profile?.department && (
                      <p className="text-xs text-muted-foreground mb-1">🏢 {profile.department}</p>
                    )}
                    <p className="text-sm text-muted-foreground mb-3">{profile?.location || "No location set"}</p>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-accent text-accent" /> {profile?.rating || "4.5"}</span>
                      <span className="flex items-center gap-1"><Car className="w-4 h-4" /> {profile?.total_rides || 0} rides</span>
                      {profile?.verified && <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-primary" /> Verified</span>}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5 rounded-xl">
                      <Pencil className="w-3.5 h-3.5" /> Edit Profile
                    </Button>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Saved", value: `₹${profile?.money_saved || 0}`, icon: "💰" },
                  { label: "CO₂ Saved", value: `${profile?.co2_saved || 0} kg`, icon: "🌱" },
                  { label: "Connections", value: `${profile?.connections || 0}`, icon: "🤝" },
                ].map((stat) => (
                  <div key={stat.label} className="zhoop-card p-4 text-center">
                    <span className="text-2xl mb-1 block">{stat.icon}</span>
                    <p className="font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-center text-muted-foreground">{user?.email}</p>
              <Button variant="outline" onClick={handleSignOut} className="w-full rounded-xl">Sign Out</Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="ledger">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <CarbonLedger />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
