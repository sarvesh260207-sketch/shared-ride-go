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

export const PRICING: Record<VehicleCategory, PricingTier> = {
  bike_petrol: { baseFare: 10, perKm: 4.5, appFee: 15, label: 'Bike (Petrol)' },
  bike_ev:     { baseFare: 10, perKm: 4.5, appFee: 15, label: 'Bike (EV)' },
  car_petrol:  { baseFare: 30, perKm: 8.0, appFee: 30, label: 'Car (Petrol)' },
  car_ev:      { baseFare: 30, perKm: 8.0, appFee: 30, label: 'Car (EV)' },
};

export const calcRidePrice = (category: VehicleCategory, distanceKm: number): number => {
  const t = PRICING[category];
  return t.baseFare + t.perKm * distanceKm + t.appFee;
};

// Legacy compat
export const PRICE_PER_KM = {
  car: 8,
  bike: 4.5,
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
