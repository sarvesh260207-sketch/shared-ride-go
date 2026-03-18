import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Car, Star, Clock, MapPin, Users, IndianRupee, Phone, MessageCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRideById } from "@/hooks/useRides";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";

const RideDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: ride, isLoading, error } = useRideById(id);
  const [requesting, setRequesting] = useState(false);

  const handleRequestJoin = async () => {
    if (!user || !id) return;

    // Check if already requested
    const { data: existing } = await supabase
      .from("ride_requests")
      .select("id")
      .eq("ride_id", id)
      .eq("requester_id", user.id)
      .maybeSingle();

    if (existing) {
      toast.info("You've already requested to join this ride");
      return;
    }

    setRequesting(true);
    const { error } = await supabase.from("ride_requests").insert({
      ride_id: id,
      requester_id: user.id,
      seats_requested: 1,
      message: null,
    });
    setRequesting(false);

    if (error) {
      toast.error("Failed to send request: " + error.message);
    } else {
      toast.success("Request sent! The driver will be notified 🎉");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Ride not found</h2>
          <Link to="/" className="text-primary hover:underline text-sm">Back to home</Link>
        </div>
      </div>
    );
  }

  const profile = (ride as any).profile;
  const driverName = profile?.display_name || "Driver";
  const initials = driverName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  const rating = profile?.rating ?? 4.5;
  const isOwnRide = user?.id === ride.user_id;
  const seatsLeft = ride.seats_available - ((ride as any).acceptedCount ?? 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to rides
        </Link>

        <div className="space-y-4">
          {/* Driver Info */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="saathi-card p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full saathi-gradient-bg flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
                {initials}
              </div>
              <div className="flex-1">
                <h2 className="font-display font-bold text-xl text-foreground">{driverName}</h2>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="text-sm text-muted-foreground">{rating} rating</span>
                  {profile?.verified && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">✓ Verified</span>}
                </div>
                {ride.driver_college && (
                  <span className="text-xs text-muted-foreground">{ride.driver_college} {ride.driver_department && `• ${ride.driver_department}`}</span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Route */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="saathi-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Route Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-primary mt-1" />
                <div>
                  <p className="text-sm font-medium text-foreground">{ride.origin}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {format(new Date(ride.departure_time), "hh:mm a, MMM d yyyy")}
                  </p>
                </div>
              </div>
              <div className="ml-1.5 w-0.5 h-6 bg-border" />
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-accent mt-1" />
                <div>
                  <p className="text-sm font-medium text-foreground">{ride.destination}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pricing */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="saathi-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-3">Ride Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seats available</span>
                <span className="text-foreground font-medium">{seatsLeft} of {ride.seats_available}</span>
              </div>
              {ride.price && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost share per rider</span>
                  <span className="font-display font-bold text-primary text-lg flex items-center gap-0.5">
                    <IndianRupee className="w-4 h-4" />{ride.price}
                  </span>
                </div>
              )}
              {ride.notes && (
                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground">Notes:</span>
                  <p className="text-foreground mt-1">{ride.notes}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action buttons */}
          {!isOwnRide && seatsLeft > 0 && (
            <Button
              onClick={handleRequestJoin}
              disabled={requesting}
              className="w-full saathi-gradient-bg rounded-xl font-display font-semibold text-primary-foreground border-0 hover:opacity-90 transition-opacity h-12 text-base gap-2"
            >
              {requesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
              {requesting ? "Sending request..." : "Request to Join"}
            </Button>
          )}

          {isOwnRide && (
            <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium text-primary">This is your ride</p>
              <p className="text-xs text-muted-foreground mt-1">Check your profile for incoming ride requests</p>
            </div>
          )}

          {seatsLeft <= 0 && !isOwnRide && (
            <div className="text-center p-4 rounded-xl bg-muted border border-border">
              <p className="text-sm font-medium text-foreground">This ride is fully booked</p>
            </div>
          )}

          {/* SOS */}
          <Button
            variant="destructive"
            className="w-full rounded-xl font-display font-semibold h-12 text-base gap-2 animate-pulse hover:animate-none"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = 'tel:112';
              }
            }}
          >
            <AlertTriangle className="w-5 h-5" /> SOS Emergency
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">Calls national emergency helpline 112</p>
        </div>
      </div>
    </div>
  );
};

export default RideDetail;
