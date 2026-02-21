import { Car, Bike, Star, Clock, MapPin, Users, IndianRupee } from "lucide-react";
import { Ride } from "@/types/ride";
import { motion } from "framer-motion";

interface RideCardProps {
  ride: Ride;
  index: number;
  onClick: (ride: Ride) => void;
}

const RideCard = ({ ride, index, onClick }: RideCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onClick={() => onClick(ride)}
      className="saathi-card p-4 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full saathi-gradient-bg flex items-center justify-center text-primary-foreground font-display font-semibold text-sm">
            {ride.driverAvatar}
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground text-sm">{ride.driverName}</h3>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="w-3 h-3 fill-accent text-accent" />
              <span className="text-xs">{ride.driverRating}</span>
            </div>
          </div>
        </div>
        <div className={ride.vehicleType === 'car' ? 'saathi-chip-car' : 'saathi-chip-bike'}>
          {ride.vehicleType === 'car' ? <Car className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
          {ride.vehicleName}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex flex-col items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-primary/30" />
          <div className="w-0.5 h-6 bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-accent border-2 border-accent/30" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground truncate">{ride.from}</p>
            <span className="text-xs text-muted-foreground">{ride.departureTime}</span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm font-medium text-foreground truncate">{ride.to}</p>
            <span className="text-xs text-muted-foreground">{ride.arrivalTime}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs">{ride.seatsAvailable} seat{ride.seatsAvailable > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs">{ride.totalDistance} km</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 font-display font-bold text-primary">
          <IndianRupee className="w-4 h-4" />
          <span className="text-lg">{ride.totalPrice}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RideCard;
