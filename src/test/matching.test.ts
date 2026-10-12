import { describe, it, expect } from "vitest";
import { isMatch, routeOverlap } from "@/lib/matching";
import { PLATFORM_FEE } from "@/lib/pricing";

const tambaram = { lat: 12.9249, lng: 80.1 };
const guindy = { lat: 13.0067, lng: 80.2206 };
const chromepet = { lat: 12.9516, lng: 80.1462 };
const annaNagar = { lat: 13.085, lng: 80.2101 };

describe("route matching (75% rule)", () => {
  it("matches when rider trip lies fully on the ride route", () => {
    expect(isMatch(tambaram, guindy, chromepet, guindy)).toBe(true);
  });
  it("rejects opposite direction", () => {
    expect(isMatch(tambaram, guindy, guindy, chromepet)).toBe(false);
  });
  it("rejects when under 75% of rider trip is covered", () => {
    expect(routeOverlap(tambaram, chromepet, tambaram, guindy).score).toBeLessThan(0.75);
    expect(isMatch(tambaram, chromepet, tambaram, guindy)).toBe(false);
  });
  it("rejects far-off destinations", () => {
    expect(isMatch(tambaram, guindy, chromepet, annaNagar)).toBe(false);
  });
});

describe("pricing", () => {
  it("has no platform fee for now", () => {
    expect(PLATFORM_FEE).toBe(0);
  });
});
