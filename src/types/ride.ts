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

export interface Ride {
  id: string;
  driverName: string;
  driverAvatar: string;
  driverRating: number;
  driverVerified?: boolean;
  driverCollege?: string;
  driverDepartment?: string;
  vehicleType: 'car' | 'bike';
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

export const PRICE_PER_KM = {
  car: 12,
  bike: 7,
} as const;
