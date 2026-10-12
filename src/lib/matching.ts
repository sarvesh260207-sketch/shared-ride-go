// Route-overlap matching: a posted ride (A→B) matches a rider trip (P→Q)
// when at least MATCH_THRESHOLD of the rider's trip lies along the ride's
// route, in the same direction, with pickup/drop within MAX_DETOUR_KM.

export const MATCH_THRESHOLD = 0.75;
export const MAX_DETOUR_KM = 2;

export interface LatLng { lat: number; lng: number }

// Equirectangular projection to km around a reference latitude (accurate at city scale)
function toXY(p: LatLng, refLat: number) {
  const k = 111.32;
  return { x: p.lng * k * Math.cos((refLat * Math.PI) / 180), y: p.lat * 110.574 };
}

export function routeOverlap(rideFrom: LatLng, rideTo: LatLng, riderFrom: LatLng, riderTo: LatLng) {
  const ref = (rideFrom.lat + rideTo.lat) / 2;
  const A = toXY(rideFrom, ref), B = toXY(rideTo, ref);
  const P = toXY(riderFrom, ref), Q = toXY(riderTo, ref);
  const abx = B.x - A.x, aby = B.y - A.y;
  const abLen2 = abx * abx + aby * aby;
  const riderLen = Math.hypot(Q.x - P.x, Q.y - P.y);
  if (abLen2 === 0 || riderLen === 0) return { score: 0, detourKm: Infinity };

  const proj = (pt: { x: number; y: number }) => {
    const t = ((pt.x - A.x) * abx + (pt.y - A.y) * aby) / abLen2;
    const ct = Math.max(0, Math.min(1, t));
    const dist = Math.hypot(pt.x - (A.x + ct * abx), pt.y - (A.y + ct * aby));
    return { t, ct, dist };
  };
  const p = proj(P), q = proj(Q);
  if (q.t <= p.t) return { score: 0, detourKm: Math.max(p.dist, q.dist) }; // opposite direction
  const covered = (q.ct - p.ct) * Math.sqrt(abLen2);
  const score = Math.min(1, covered / riderLen);
  return { score, detourKm: Math.max(p.dist, q.dist) };
}

export function isMatch(rideFrom: LatLng, rideTo: LatLng, riderFrom: LatLng, riderTo: LatLng) {
  const { score, detourKm } = routeOverlap(rideFrom, rideTo, riderFrom, riderTo);
  return score >= MATCH_THRESHOLD && detourKm <= MAX_DETOUR_KM;
}
