import { User, Star, Car, MapPin, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Profile Card */}
          <div className="saathi-card p-6 text-center">
            <div className="w-20 h-20 rounded-full saathi-gradient-bg mx-auto flex items-center justify-center text-primary-foreground font-display font-bold text-2xl mb-3">
              YU
            </div>
            <h2 className="font-display font-bold text-xl text-foreground">Your Name</h2>
            <p className="text-sm text-muted-foreground mb-3">Bangalore, Karnataka</p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-accent text-accent" /> 4.8</span>
              <span className="flex items-center gap-1"><Car className="w-4 h-4" /> 24 rides</span>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-primary" /> Verified</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Saved", value: "₹2,400", icon: "💰" },
              { label: "CO₂ Saved", value: "18 kg", icon: "🌱" },
              { label: "Connections", value: "12", icon: "🤝" },
            ].map((stat) => (
              <div key={stat.label} className="saathi-card p-4 text-center">
                <span className="text-2xl mb-1 block">{stat.icon}</span>
                <p className="font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Rides */}
          <div className="saathi-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-3">Recent Rides</h3>
            <div className="space-y-3">
              {[
                { from: "Whitefield", to: "Electronic City", date: "Today, 8:30 AM", price: 60 },
                { from: "HSR Layout", to: "Indiranagar", date: "Yesterday, 9:00 AM", price: 18 },
              ].map((ride, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{ride.from} → {ride.to}</p>
                    <p className="text-xs text-muted-foreground">{ride.date}</p>
                  </div>
                  <span className="font-display font-semibold text-primary text-sm">₹{ride.price}</span>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full rounded-xl">Sign Out</Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
