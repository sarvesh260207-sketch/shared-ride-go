export interface Checkpoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  arrivalTime: string;
}

export interface Ride {
  id: string;
  driverName: string;
  driverAvatar: string;
  driverRating: number;
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
  bookedPassengers?: BookedPassenger[];
}

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
