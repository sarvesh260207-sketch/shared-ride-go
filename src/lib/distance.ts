/** Haversine distance in km between two lat/lng points */
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Well-known landmarks with coordinates for resolving user search text */
export const KNOWN_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  // Chennai areas
  "t. nagar": { lat: 13.0418, lng: 80.2341 },
  "t. nagar, chennai": { lat: 13.0418, lng: 80.2341 },
  "anna nagar": { lat: 13.0850, lng: 80.2101 },
  "anna nagar, chennai": { lat: 13.0850, lng: 80.2101 },
  "tambaram": { lat: 12.9249, lng: 80.1000 },
  "tambaram, chennai": { lat: 12.9249, lng: 80.1000 },
  "chromepet": { lat: 12.9516, lng: 80.1462 },
  "guindy": { lat: 13.0067, lng: 80.2206 },
  "guindy, chennai": { lat: 13.0067, lng: 80.2206 },
  "velachery": { lat: 12.9823, lng: 80.2184 },
  "velachery, chennai": { lat: 12.9823, lng: 80.2184 },
  "adyar": { lat: 13.0063, lng: 80.2574 },
  "adyar, chennai": { lat: 13.0063, lng: 80.2574 },
  "omr": { lat: 12.9367, lng: 80.2336 },
  "omr, chennai": { lat: 12.9367, lng: 80.2336 },
  "omr thoraipakkam": { lat: 12.9367, lng: 80.2336 },
  "saidapet": { lat: 13.0225, lng: 80.2231 },
  "koyambedu": { lat: 13.0694, lng: 80.1948 },
  "vadapalani": { lat: 13.0520, lng: 80.2122 },
  "thiruvanmiyur": { lat: 12.9830, lng: 80.2594 },
  "pallavaram": { lat: 12.9675, lng: 80.1497 },
  "nanganallur": { lat: 12.9787, lng: 80.1872 },
  "perungudi": { lat: 12.9611, lng: 80.2441 },
  // Madurai
  "madurai": { lat: 9.9195, lng: 78.1193 },
  "madurai meenakshi temple": { lat: 9.9195, lng: 78.1193 },
  "madurai mattuthavani": { lat: 9.9356, lng: 78.1481 },
  // General
  "coimbatore": { lat: 11.0168, lng: 76.9558 },
  "trichy": { lat: 10.7905, lng: 78.7047 },
  "salem": { lat: 11.6643, lng: 78.1460 },
  "tirunelveli": { lat: 8.7139, lng: 77.7567 },
};

/** Try to resolve a search string to coordinates */
export function resolveLocation(text: string): { lat: number; lng: number } | null {
  const key = text.toLowerCase().trim();
  if (KNOWN_LOCATIONS[key]) return KNOWN_LOCATIONS[key];
  // partial match
  for (const [k, v] of Object.entries(KNOWN_LOCATIONS)) {
    if (k.includes(key) || key.includes(k)) return v;
  }
  return null;
}
