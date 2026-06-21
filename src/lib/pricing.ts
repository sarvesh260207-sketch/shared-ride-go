// Indian vehicle pricing — official ARAI / manufacturer mileage figures
// Fuel prices (Tamil Nadu, indicative): Petrol ₹102/L, Diesel ₹94/L
// EV "fuel" cost computed as energy ₹/km from rated efficiency
//
// Formula:
//   fuelCost = (distanceKm / mileageKmpl) * fuelRate
//   total    = fuelCost + PLATFORM_FEE  (+ INSURANCE_FEE if opted)

export const PLATFORM_FEE = 5;          // ₹5 flat per ride
export const INSURANCE_FEE = 5;         // ₹5 per ride (covers month-long policy)
export const FUEL_PRICE = { petrol: 102, diesel: 94 } as const;

export type FuelType = "petrol" | "diesel" | "electric";

export interface VehicleSpec {
  id: string;
  name: string;            // shown to user
  category: "bike" | "car";
  fuel: FuelType;
  // For petrol/diesel: km per litre (ARAI / official).
  // For electric: equivalent km per "litre" derived from energy cost
  //   so the same formula works. (₹/km energy × 1 = fuelRate; mileage = 1)
  mileageKmpl: number;
  energyRupeesPerKm?: number;     // EV only
  source: string;
}

// Source: ARAI certifications and OEM brochures (Honda, TVS, Hero, Bajaj,
// Royal Enfield, Yamaha, Maruti Suzuki, Hyundai, Tata, Mahindra, Toyota, Ather, Ola).
export const VEHICLE_CATALOG: VehicleSpec[] = [
  // ---- Bikes / Scooters (petrol) ----
  { id: "activa6g",   name: "Honda Activa 6G",       category: "bike", fuel: "petrol", mileageKmpl: 47, source: "Honda 2WI" },
  { id: "splendor",   name: "Hero Splendor Plus",    category: "bike", fuel: "petrol", mileageKmpl: 65, source: "Hero MotoCorp" },
  { id: "jupiter",    name: "TVS Jupiter 110",       category: "bike", fuel: "petrol", mileageKmpl: 55, source: "TVS" },
  { id: "pulsar150",  name: "Bajaj Pulsar 150",      category: "bike", fuel: "petrol", mileageKmpl: 50, source: "Bajaj Auto" },
  { id: "fzs",        name: "Yamaha FZ-S V3",        category: "bike", fuel: "petrol", mileageKmpl: 45, source: "Yamaha India" },
  { id: "re350",      name: "Royal Enfield Classic 350", category: "bike", fuel: "petrol", mileageKmpl: 35, source: "Royal Enfield" },
  // ---- Bikes / Scooters (EV) ----
  { id: "ather450x",  name: "Ather 450X",            category: "bike", fuel: "electric", mileageKmpl: 1, energyRupeesPerKm: 0.30, source: "Ather Energy" },
  { id: "iqube",      name: "TVS iQube",             category: "bike", fuel: "electric", mileageKmpl: 1, energyRupeesPerKm: 0.40, source: "TVS" },
  { id: "olas1pro",   name: "Ola S1 Pro",            category: "bike", fuel: "electric", mileageKmpl: 1, energyRupeesPerKm: 0.35, source: "Ola Electric" },
  // ---- Cars (petrol / diesel) ----
  { id: "wagonr",     name: "Maruti Wagon R",        category: "car", fuel: "petrol", mileageKmpl: 24.35, source: "ARAI" },
  { id: "swift",      name: "Maruti Swift",          category: "car", fuel: "petrol", mileageKmpl: 22.38, source: "ARAI" },
  { id: "i20",        name: "Hyundai i20",           category: "car", fuel: "petrol", mileageKmpl: 20.35, source: "ARAI" },
  { id: "city",       name: "Honda City",            category: "car", fuel: "petrol", mileageKmpl: 17.8,  source: "ARAI" },
  { id: "nexon",      name: "Tata Nexon",            category: "car", fuel: "petrol", mileageKmpl: 17.3,  source: "ARAI" },
  { id: "innova",     name: "Toyota Innova Crysta",  category: "car", fuel: "diesel", mileageKmpl: 15.0,  source: "ARAI" },
  // ---- Cars (EV) ----
  { id: "nexonev",    name: "Tata Nexon EV",         category: "car", fuel: "electric", mileageKmpl: 1, energyRupeesPerKm: 1.10, source: "Tata Motors" },
  { id: "kona",       name: "Hyundai Kona EV",       category: "car", fuel: "electric", mileageKmpl: 1, energyRupeesPerKm: 1.30, source: "Hyundai" },
  { id: "zsev",       name: "MG ZS EV",              category: "car", fuel: "electric", mileageKmpl: 1, energyRupeesPerKm: 1.50, source: "MG Motor" },
];

export function getVehicle(id: string): VehicleSpec | undefined {
  return VEHICLE_CATALOG.find((v) => v.id === id);
}

export interface PriceBreakdown {
  fuelCost: number;
  platformFee: number;
  insuranceFee: number;
  total: number;
  perSeat: number;
}

export function calcPrice(
  spec: VehicleSpec,
  distanceKm: number,
  opts?: { seats?: number; insurance?: boolean }
): PriceBreakdown {
  const seats = Math.max(1, opts?.seats ?? 1);
  let fuelCost: number;
  if (spec.fuel === "electric") {
    fuelCost = (spec.energyRupeesPerKm ?? 1.0) * distanceKm;
  } else {
    const rate = FUEL_PRICE[spec.fuel];
    fuelCost = (distanceKm / spec.mileageKmpl) * rate;
  }
  const insuranceFee = opts?.insurance ? INSURANCE_FEE : 0;
  const total = fuelCost + PLATFORM_FEE + insuranceFee;
  return {
    fuelCost: round(fuelCost),
    platformFee: PLATFORM_FEE,
    insuranceFee,
    total: round(total),
    perSeat: round(total / seats),
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

export function fuelLabel(spec: VehicleSpec) {
  if (spec.fuel === "electric") return `${spec.energyRupeesPerKm}/km`;
  return `${spec.mileageKmpl} km/L`;
}
