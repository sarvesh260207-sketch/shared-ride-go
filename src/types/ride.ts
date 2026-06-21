export interface Checkpoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  arrivalTime: string;
}

export interface BroCodeLink {
  userId: string;
  name: string;
  avatar: string;
  college?: string;
}

export type VehicleCategory = 'bike_petrol' | 'bike_ev' | 'car_petrol' | 'car_ev';

export interface PricingTier {
  baseFare: number;
  perKm: number;
  appFee: number;
  label: string;
}

// Legacy tier table — kept for compatibility but recomputed from real fuel pricing.
// New code should import from '@/lib/pricing' (VEHICLE_CATALOG + calcPrice).
import { PLATFORM_FEE, FUEL_PRICE } from "@/lib/pricing";

export const PRICING: Record<VehicleCategory, PricingTier> = {
  bike_petrol: { baseFare: 0, perKm: +(FUEL_PRICE.petrol / 50).toFixed(2), appFee: PLATFORM_FEE, label: 'Bike (Petrol)' },
  bike_ev:     { baseFare: 0, perKm: 0.35,                                  appFee: PLATFORM_FEE, label: 'Bike (EV)' },
  car_petrol:  { baseFare: 0, perKm: +(FUEL_PRICE.petrol / 20).toFixed(2),  appFee: PLATFORM_FEE, label: 'Car (Petrol)' },
  car_ev:      { baseFare: 0, perKm: 1.20,                                  appFee: PLATFORM_FEE, label: 'Car (EV)' },
};

export const calcRidePrice = (category: VehicleCategory, distanceKm: number): number => {
  const t = PRICING[category];
  return Math.round(t.baseFare + t.perKm * distanceKm + t.appFee);
};

export const PRICE_PER_KM = {
  car: PRICING.car_petrol.perKm,
  bike: PRICING.bike_petrol.perKm,
} as const;

export interface Ride {
  id: string;
  driverName: string;
  driverAvatar: string;
  driverRating: number;
  driverVerified?: boolean;
  driverCollege?: string;
  driverDepartment?: string;
  vehicleType: 'car' | 'bike';
  vehicleCategory: VehicleCategory;
  vehicleName: string;
  seatsAvailable: number;
  totalSeats: number;
  pricePerKm: number;
  totalDistance: number;
  totalPrice: number;
  departureTime: string;
  arrivalTime: string;
  checkpoints: Checkpoint[];
  from: string;
  to: string;
  femaleOnly?: boolean;
  rideMood?: RideMood[];
  bookedPassengers?: BookedPassenger[];
  broCodeLinks?: BroCodeLink[];
}

export type RideMood = 'social' | 'networking' | 'silent';

export interface BookedPassenger {
  name: string;
  avatar: string;
  pickupCheckpoint: string;
  dropCheckpoint: string;
}
