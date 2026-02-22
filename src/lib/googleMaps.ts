let loadPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error("Google Maps API key not configured"));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=__initGoogleMaps`;
    script.async = true;
    script.defer = true;

    (window as any).__initGoogleMaps = () => {
      delete (window as any).__initGoogleMaps;
      resolve();
    };

    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

export function getDirectionsRoute(
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral,
  waypoints?: google.maps.DirectionsWaypoint[]
): Promise<google.maps.DirectionsResult> {
  return new Promise((resolve, reject) => {
    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Directions failed: ${status}`));
        }
      }
    );
  });
}

export function generateCheckpointsFromRoute(
  route: google.maps.DirectionsRoute,
  numCheckpoints: number = 4
): { name: string; lat: number; lng: number }[] {
  const leg = route.legs[0];
  if (!leg) return [];

  const steps = leg.steps;
  const totalDistance = leg.distance?.value || 0;
  const interval = totalDistance / (numCheckpoints - 1);

  const checkpoints: { name: string; lat: number; lng: number }[] = [];

  // First checkpoint: start
  checkpoints.push({
    name: leg.start_address.split(",")[0],
    lat: leg.start_location.lat(),
    lng: leg.start_location.lng(),
  });

  // Intermediate checkpoints
  let accumulatedDistance = 0;
  let nextCheckpointDistance = interval;

  for (const step of steps) {
    const stepDistance = step.distance?.value || 0;

    if (accumulatedDistance + stepDistance >= nextCheckpointDistance && checkpoints.length < numCheckpoints - 1) {
      const instructions = step.instructions?.replace(/<[^>]*>/g, "") || "";
      const name = instructions.length > 40 ? instructions.substring(0, 40) + "..." : instructions || `Checkpoint ${checkpoints.length + 1}`;
      checkpoints.push({
        name,
        lat: step.end_location.lat(),
        lng: step.end_location.lng(),
      });
      nextCheckpointDistance += interval;
    }

    accumulatedDistance += stepDistance;
  }

  // Last checkpoint: end
  if (checkpoints.length < numCheckpoints) {
    checkpoints.push({
      name: leg.end_address.split(",")[0],
      lat: leg.end_location.lat(),
      lng: leg.end_location.lng(),
    });
  }

  return checkpoints;
}
