import { useState } from "react";
import { Car, Bike, Star, Clock, MapPin, Users, IndianRupee, ShieldCheck, UserCircle, MessageCircle, Handshake, VolumeX, Link2 } from "lucide-react";
import { RideMood, BroCodeLink } from "@/types/ride";
import { Ride } from "@/types/ride";
import { motion } from "framer-motion";
import MapView from "@/components/MapView";
import VerifiedCircleBadge from "@/components/VerifiedCircleBadge";
import GuardianShareButton from "@/components/GuardianShareButton";

interface RideCardProps {
  ride: Ride;
  index: number;
  onClick: (ride: Ride) => void;
  showDetailedMap?: boolean;
}

const RideCard = ({ ride, index, onClick, showDetailedMap = false }: RideCardProps) => {
  const bookedCount = ride.bookedPassengers?.length || 0;
  const isPartiallyBooked = bookedCount > 0 && ride.seatsAvailable > 0;
  const [selectedMoods, setSelectedMoods] = useState<RideMood[]>(ride.rideMood || []);

  const toggleMood = (mood: RideMood, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onClick={() => onClick(ride)}
      className="saathi-card p-4 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-2">
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
        <div className="flex items-center gap-2">
          {ride.femaleOnly && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 text-xs font-semibold border border-pink-500/20">
              <ShieldCheck className="w-3 h-3" />
              Female Only
            </div>
          )}
          <div className={ride.vehicleType === 'car' ? 'saathi-chip-car' : 'saathi-chip-bike'}>
            {ride.vehicleType === 'car' ? <Car className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
            {ride.vehicleName}
          </div>
        </div>
      </div>

      {/* Verified Circle Badge */}
      <div className="mb-2">
        <VerifiedCircleBadge
          verified={ride.driverVerified}
          college={ride.driverCollege}
          department={ride.driverDepartment}
        />
      </div>

      {/* Selectable ride mood tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={(e) => toggleMood('social', e)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
            selectedMoods.includes('social')
              ? 'bg-primary/15 text-primary border-primary/40 shadow-sm'
              : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/20'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" /> Social Ride
        </button>
        <button
          onClick={(e) => toggleMood('networking', e)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
            selectedMoods.includes('networking')
              ? 'bg-accent/15 text-accent-foreground border-accent/40 shadow-sm'
              : 'bg-muted/50 text-muted-foreground border-border hover:border-accent/20'
          }`}
        >
          <Handshake className="w-3.5 h-3.5" /> Networking
        </button>
        <button
          onClick={(e) => toggleMood('silent', e)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
            selectedMoods.includes('silent')
              ? 'bg-secondary text-foreground border-foreground/20 shadow-sm'
              : 'bg-muted/50 text-muted-foreground border-border hover:border-foreground/10'
          }`}
        >
          <VolumeX className="w-3.5 h-3.5" /> Silent Mode
        </button>
      </div>

      {/* Bro Code Links */}
      {ride.broCodeLinks && ride.broCodeLinks.length > 0 && (
        <div className="mb-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-1.5 mb-2">
            <Link2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">Bro Code 🤜🤛</span>
          </div>
          <div className="space-y-1.5">
            {ride.broCodeLinks.map((bro, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                  {bro.avatar}
                </div>
                <span className="text-foreground font-medium">{bro.name}</span>
                {bro.college && <span className="text-muted-foreground">• {bro.college}</span>}
                <span className="ml-auto text-primary text-[10px] font-bold">Connected</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Route with checkpoints */}
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

      {/* Booked passengers */}
      {isPartiallyBooked && (
        <div className="mb-3 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {bookedCount}/{ride.totalSeats} seats booked
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              {ride.seatsAvailable} available
            </span>
          </div>
          <div className="space-y-1.5">
            {ride.bookedPassengers!.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-[10px]">
                  {p.avatar}
                </div>
                <span className="text-foreground font-medium">{p.name}</span>
                <span className="text-muted-foreground">
                  {p.pickupCheckpoint} → {p.dropCheckpoint}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checkpoint pills */}
      {ride.checkpoints.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {ride.checkpoints.map((cp) => {
            const isPickup = ride.bookedPassengers?.some(p => p.pickupCheckpoint === cp.name);
            const isDrop = ride.bookedPassengers?.some(p => p.dropCheckpoint === cp.name);
            return (
              <div
                key={cp.id}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                  isPickup
                    ? "bg-primary/10 text-primary border-primary/20"
                    : isDrop
                    ? "bg-accent/10 text-accent-foreground border-accent/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                <MapPin className="w-2.5 h-2.5" />
                {cp.name}
                <span className="text-muted-foreground">{cp.arrivalTime}</span>
                {isPickup && <span className="text-primary font-bold ml-0.5">↑</span>}
                {isDrop && <span className="text-accent font-bold ml-0.5">↓</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Inline map */}
      {showDetailedMap && ride.checkpoints.length >= 2 && (
        <div className="mb-3 rounded-lg overflow-hidden border border-border">
          <MapView checkpoints={ride.checkpoints} className="h-[180px]" />
        </div>
      )}

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
          <GuardianShareButton rideId={ride.id} driverName={ride.driverName} />
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
