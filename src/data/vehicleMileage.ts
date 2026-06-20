// ARAI-certified mileage figures for popular Indian vehicles
// Sources: official manufacturer websites (marutisuzuki.com, hondacarindia.com,
// tatamotors.com, hyundai.com/in, mahindra.com, bajajauto.com, tvsmotor.com,
// heromotocorp.com, royalenfield.com, olaelectric.com, atherenergy.com)
// EV figures use km per "fuel-equivalent litre" derived from kWh range.

export type FuelType = "petrol" | "diesel" | "ev" | "cng";

export interface IndianVehicle {
  make: string;
  model: string;
  fuel: FuelType;
  mileage: number; // km/L (or km per equivalent unit for EVs)
  category: "bike" | "car";
}

export const INDIAN_VEHICLES: IndianVehicle[] = [
  // Bikes / Scooters (ARAI / mfr-claimed)
  { make: "Honda",        model: "Activa 6G",           fuel: "petrol", mileage: 47,  category: "bike" },
  { make: "Honda",        model: "Shine 125",           fuel: "petrol", mileage: 55,  category: "bike" },
  { make: "Hero",         model: "Splendor Plus",       fuel: "petrol", mileage: 70,  category: "bike" },
  { make: "Hero",         model: "HF Deluxe",           fuel: "petrol", mileage: 65,  category: "bike" },
  { make: "Bajaj",        model: "Pulsar 150",          fuel: "petrol", mileage: 50,  category: "bike" },
  { make: "Bajaj",        model: "Platina 110",         fuel: "petrol", mileage: 70,  category: "bike" },
  { make: "TVS",          model: "Jupiter 125",         fuel: "petrol", mileage: 57,  category: "bike" },
  { make: "TVS",          model: "Apache RTR 160",      fuel: "petrol", mileage: 45,  category: "bike" },
  { make: "Royal Enfield",model: "Classic 350",         fuel: "petrol", mileage: 37,  category: "bike" },
  { make: "Royal Enfield",model: "Hunter 350",          fuel: "petrol", mileage: 36,  category: "bike" },
  { make: "Yamaha",       model: "FZ-S V3",             fuel: "petrol", mileage: 45,  category: "bike" },
  { make: "Suzuki",       model: "Access 125",          fuel: "petrol", mileage: 52,  category: "bike" },
  { make: "Ola Electric", model: "S1 Pro",              fuel: "ev",     mileage: 120, category: "bike" },
  { make: "Ather",        model: "450X",                fuel: "ev",     mileage: 110, category: "bike" },
  { make: "TVS",          model: "iQube",               fuel: "ev",     mileage: 100, category: "bike" },

  // Cars (ARAI / mfr-claimed)
  { make: "Maruti Suzuki",model: "Alto K10",            fuel: "petrol", mileage: 24.39, category: "car" },
  { make: "Maruti Suzuki",model: "Swift",               fuel: "petrol", mileage: 24.80, category: "car" },
  { make: "Maruti Suzuki",model: "Wagon R 1.0",         fuel: "petrol", mileage: 24.35, category: "car" },
  { make: "Maruti Suzuki",model: "Baleno",              fuel: "petrol", mileage: 22.94, category: "car" },
  { make: "Maruti Suzuki",model: "Dzire",               fuel: "petrol", mileage: 24.79, category: "car" },
  { make: "Maruti Suzuki",model: "Ertiga",              fuel: "petrol", mileage: 20.51, category: "car" },
  { make: "Maruti Suzuki",model: "Wagon R CNG",         fuel: "cng",    mileage: 34.05, category: "car" },
  { make: "Hyundai",      model: "i20",                 fuel: "petrol", mileage: 20.35, category: "car" },
  { make: "Hyundai",      model: "Grand i10 Nios",      fuel: "petrol", mileage: 20.7,  category: "car" },
  { make: "Hyundai",      model: "Creta",               fuel: "petrol", mileage: 17.7,  category: "car" },
  { make: "Hyundai",      model: "Verna",               fuel: "petrol", mileage: 20.6,  category: "car" },
  { make: "Tata",         model: "Tiago",               fuel: "petrol", mileage: 19.01, category: "car" },
  { make: "Tata",         model: "Nexon",               fuel: "petrol", mileage: 17.44, category: "car" },
  { make: "Tata",         model: "Punch",               fuel: "petrol", mileage: 18.97, category: "car" },
  { make: "Tata",         model: "Nexon EV",            fuel: "ev",     mileage: 45,    category: "car" },
  { make: "Tata",         model: "Tiago EV",            fuel: "ev",     mileage: 48,    category: "car" },
  { make: "Mahindra",     model: "XUV300",              fuel: "diesel", mileage: 20,    category: "car" },
  { make: "Mahindra",     model: "Scorpio-N",           fuel: "diesel", mileage: 15.4,  category: "car" },
  { make: "Mahindra",     model: "XUV700",              fuel: "petrol", mileage: 13,    category: "car" },
  { make: "Honda",        model: "City",                fuel: "petrol", mileage: 17.8,  category: "car" },
  { make: "Honda",        model: "Amaze",               fuel: "petrol", mileage: 18.65, category: "car" },
  { make: "Toyota",       model: "Innova Crysta",       fuel: "diesel", mileage: 15.1,  category: "car" },
  { make: "Kia",          model: "Seltos",              fuel: "petrol", mileage: 17,    category: "car" },
  { make: "MG",           model: "ZS EV",               fuel: "ev",     mileage: 40,    category: "car" },
];

// Approx city fuel prices (Tamil Nadu, refreshed quarterly — update as needed)
export const FUEL_PRICE: Record<FuelType, number> = {
  petrol: 102.6, // ₹/L Chennai
  diesel: 94.3,  // ₹/L Chennai
  cng:    81.5,  // ₹/kg
  ev:     11.0,  // ₹/equivalent unit (slow charge, derived)
};

export const PLATFORM_FEE = 5; // ₹ per ride, charged to each rider

export interface FareBreakdown {
  distanceKm: number;
  mileage: number;
  fuelType: FuelType;
  fuelPrice: number;
  fuelCost: number;       // total ride fuel cost
  perRiderShare: number;  // fuelCost / (seats+1)
  platformFee: number;
  total: number;          // perRiderShare + platformFee
}

/**
 * Cost-share fare:
 *   fuel cost = (distance / mileage) * fuel_price
 *   per rider = fuel cost / (riders + 1 host)
 *   total to rider = per rider share + ₹5 platform fee
 */
export const calcFare = (
  distanceKm: number,
  mileage: number,
  fuelType: FuelType,
  seatsShared: number = 1
): FareBreakdown => {
  const fuelPrice = FUEL_PRICE[fuelType];
  const fuelCost = (distanceKm / Math.max(mileage, 1)) * fuelPrice;
  const splitAmong = Math.max(seatsShared + 1, 2); // host + riders
  const perRiderShare = fuelCost / splitAmong;
  return {
    distanceKm: Math.round(distanceKm * 100) / 100,
    mileage,
    fuelType,
    fuelPrice,
    fuelCost: Math.round(fuelCost * 100) / 100,
    perRiderShare: Math.round(perRiderShare * 100) / 100,
    platformFee: PLATFORM_FEE,
    total: Math.round((perRiderShare + PLATFORM_FEE) * 100) / 100,
  };
};
