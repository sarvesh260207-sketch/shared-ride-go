import { loadGoogleMaps } from "./googleMaps";

export interface TransitStep {
  mode: "WALKING" | "TRANSIT" | "DRIVING";
  instruction: string;
  distance: string;
  duration: string;
  transitDetails?: {
    lineName: string;
    lineShortName: string;
    vehicleType: string; // BUS, RAIL, SUBWAY, etc.
    departureStop: string;
    arrivalStop: string;
    departureTime: string;
    arrivalTime: string;
    numStops: number;
    lineColor?: string;
    vehicleIcon?: string;
  };
  startLocation: google.maps.LatLngLiteral;
  endLocation: google.maps.LatLngLiteral;
}

export interface TransitRoute {
  summary: string;
  totalDuration: string;
  totalDistance: string;
  departureTime: string;
  arrivalTime: string;
  steps: TransitStep[];
  fare?: string;
  warnings: string[];
}

export interface LastMileOption {
  mode: "auto" | "bike" | "walk";
  label: string;
  duration: string;
  distance: string;
  estimatedCost?: string;
  steps: { instruction: string; distance: string; duration: string }[];
}

function parseTransitStep(step: google.maps.DirectionsStep): TransitStep {
  const base: TransitStep = {
    mode: step.travel_mode as "WALKING" | "TRANSIT" | "DRIVING",
    instruction: step.instructions?.replace(/<[^>]*>/g, "") || "",
    distance: step.distance?.text || "",
    duration: step.duration?.text || "",
    startLocation: {
      lat: step.start_location.lat(),
      lng: step.start_location.lng(),
    },
    endLocation: {
      lat: step.end_location.lat(),
      lng: step.end_location.lng(),
    },
  };

  if (step.transit) {
    const t = step.transit;
    base.transitDetails = {
      lineName: t.line?.name || "",
      lineShortName: t.line?.short_name || "",
      vehicleType: t.line?.vehicle?.type || "BUS",
      departureStop: t.departure_stop?.name || "",
      arrivalStop: t.arrival_stop?.name || "",
      departureTime: t.departure_time?.text || "",
      arrivalTime: t.arrival_time?.text || "",
      numStops: t.num_stops || 0,
      lineColor: t.line?.color,
      vehicleIcon: t.line?.vehicle?.icon,
    };
  }

  return base;
}

export async function getTransitDirections(
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral
): Promise<TransitRoute[]> {
  await loadGoogleMaps();

  return new Promise((resolve, reject) => {
    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.TRANSIT,
        provideRouteAlternatives: true,
        transitOptions: {
          routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS,
        },
      },
      (result, status) => {
        if (status !== google.maps.DirectionsStatus.OK || !result) {
          reject(new Error(`Transit directions failed: ${status}`));
          return;
        }

        const routes: TransitRoute[] = result.routes.map((route) => {
          const leg = route.legs[0];
          return {
            summary: route.summary || "Transit route",
            totalDuration: leg.duration?.text || "",
            totalDistance: leg.distance?.text || "",
            departureTime: leg.departure_time?.text || "",
            arrivalTime: leg.arrival_time?.text || "",
            steps: leg.steps.map(parseTransitStep),
            fare: (leg as any).fare?.text,
            warnings: route.warnings || [],
          };
        });

        resolve(routes);
      }
    );
  });
}

export async function getLastMileOptions(
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral
): Promise<LastMileOption[]> {
  await loadGoogleMaps();
  const service = new google.maps.DirectionsService();

  const modes: { mode: google.maps.TravelMode; label: string; key: LastMileOption["mode"]; costPerKm?: number }[] = [
    { mode: google.maps.TravelMode.DRIVING, label: "Auto / Cab", key: "auto", costPerKm: 15 },
    { mode: google.maps.TravelMode.WALKING, label: "Walk", key: "walk" },
  ];

  const results: LastMileOption[] = [];

  for (const m of modes) {
    try {
      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        service.route(
          { origin, destination, travelMode: m.mode },
          (res, status) => {
            if (status === google.maps.DirectionsStatus.OK && res) resolve(res);
            else reject(new Error(status));
          }
        );
      });

      const leg = result.routes[0]?.legs[0];
      if (!leg) continue;

      const distKm = (leg.distance?.value || 0) / 1000;
      const option: LastMileOption = {
        mode: m.key,
        label: m.label,
        duration: leg.duration?.text || "",
        distance: leg.distance?.text || "",
        estimatedCost: m.costPerKm ? `₹${Math.round(distKm * m.costPerKm + 25)}` : undefined,
        steps: leg.steps.map((s) => ({
          instruction: s.instructions?.replace(/<[^>]*>/g, "") || "",
          distance: s.distance?.text || "",
          duration: s.duration?.text || "",
        })),
      };
      results.push(option);
    } catch {
      // skip failed mode
    }
  }

  // Add bike estimate (use driving distance with adjusted time/cost)
  const autoOption = results.find((r) => r.mode === "auto");
  if (autoOption) {
    const distVal = parseFloat(autoOption.distance) || 2;
    results.splice(1, 0, {
      mode: "bike",
      label: "Bike Taxi (Rapido/Uber)",
      duration: autoOption.duration,
      distance: autoOption.distance,
      estimatedCost: `₹${Math.round(distVal * 8 + 15)}`,
      steps: autoOption.steps,
    });
  }

  return results;
}
