import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Car, Bike, Star, Clock, MapPin, Users, IndianRupee, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockRides } from "@/data/mockRides";
import MapView from "@/components/MapView";
import { motion } from "framer-motion";

const RideDetail = () => {
  const { id } = useParams();
  const ride = mockRides.find((r) => r.id === id);

  if (!ride) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Ride not found</h2>
          <Link to="/" className="text-primary hover:underline text-sm">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to rides
        </Link>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="flex-1 space-y-4">
            {/* Driver Info */}
            <div className="saathi-card p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full saathi-gradient-bg flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
                  {ride.driverAvatar}
                </div>
                <div className="flex-1">
                  <h2 className="font-display font-bold text-xl text-foreground">{ride.driverName}</h2>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-sm text-muted-foreground">{ride.driverRating} rating</span>
                  </div>
                </div>
                <div className={ride.vehicleType === 'car' ? 'saathi-chip-car' : 'saathi-chip-bike'}>
                  {ride.vehicleType === 'car' ? <Car className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
                  {ride.vehicleName}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2 rounded-lg text-sm">
                  <Phone className="w-4 h-4" /> Call
                </Button>
                <Button variant="outline" className="flex-1 gap-2 rounded-lg text-sm">
                  <MessageCircle className="w-4 h-4" /> Message
                </Button>
              </div>
            </div>

            {/* Route Checkpoints */}
            <div className="saathi-card p-5">
              <h3 className="font-display font-semibold text-foreground mb-4">Route & Checkpoints</h3>
              <div className="space-y-0">
                {ride.checkpoints.map((cp, i) => (
                  <div key={cp.id} className="flex items-start gap-3 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full z-10 ${i === 0 ? 'bg-primary' : i === ride.checkpoints.length - 1 ? 'bg-accent' : 'bg-border'}`} />
                      {i < ride.checkpoints.length - 1 && <div className="w-0.5 h-8 bg-border" />}
                    </div>
                    <div className="pb-6 -mt-0.5">
                      <p className="text-sm font-medium text-foreground">{cp.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {cp.arrivalTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="saathi-card p-5">
              <h3 className="font-display font-semibold text-foreground mb-3">Fare Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="text-foreground font-medium">{ride.totalDistance} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate ({ride.vehicleType})</span>
                  <span className="text-foreground font-medium">₹{ride.pricePerKm}/km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seats available</span>
                  <span className="text-foreground font-medium">{ride.seatsAvailable}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-display font-semibold text-foreground">Your Share</span>
                  <span className="font-display font-bold text-primary text-lg flex items-center gap-0.5">
                    <IndianRupee className="w-4 h-4" />{ride.totalPrice}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Map */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="lg:w-[400px]">
            <div className="sticky top-20">
              <MapView checkpoints={ride.checkpoints} className="h-[450px]" />
              <Button className="w-full mt-4 saathi-gradient-bg rounded-xl font-display font-semibold text-primary-foreground border-0 hover:opacity-90 transition-opacity h-12 text-base gap-2">
                <Users className="w-5 h-5" /> Request to Join
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RideDetail;
