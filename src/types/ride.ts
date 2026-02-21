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
  pricePerKm: number;
  totalDistance: number;
  totalPrice: number;
  departureTime: string;
  arrivalTime: string;
  checkpoints: Checkpoint[];
  from: string;
  to: string;
}

export const PRICE_PER_KM = {
  car: 5,
  bike: 3,
} as const;
