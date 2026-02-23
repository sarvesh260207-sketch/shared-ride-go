import { useEffect, useRef, useState, useCallback } from "react";
import { Checkpoint } from "@/types/ride";
import { loadGoogleMaps } from "@/lib/googleMaps";

interface MapViewProps {
  checkpoints: Checkpoint[];
  className?: string;
  simulateDriver?: boolean;
}

const MapView = ({ checkpoints, className = "", simulateDriver = false }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    loadGoogleMaps().then(() => setLoaded(true)).catch(console.error);
  }, []);

  // Build the route path and render map
  useEffect(() => {
    if (!loaded || !mapRef.current || checkpoints.length === 0) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    polylineRef.current?.setMap(null);

    const center = checkpoints[0];

    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: center.lat, lng: center.lng },
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "simplified" }] },
        ],
      });
    }

    const bounds = new google.maps.LatLngBounds();

    checkpoints.forEach((cp, i) => {
      const isFirst = i === 0;
      const isLast = i === checkpoints.length - 1;

      const marker = new google.maps.Marker({
        position: { lat: cp.lat, lng: cp.lng },
        map: mapInstance.current!,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: isFirst ? "#0f9d6e" : isLast ? "#e8982a" : "#94a3b8",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: isFirst || isLast ? 10 : 6,
        },
        title: cp.name,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="font-family: 'Space Grotesk', sans-serif; font-size: 13px; padding: 2px;">
          <strong>${cp.name}</strong><br/>
          <span style="color: #64748b;">${cp.arrivalTime}</span>
        </div>`,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstance.current!, marker);
      });

      markersRef.current.push(marker);
      bounds.extend({ lat: cp.lat, lng: cp.lng });
    });

    const path = checkpoints.map((cp) => ({ lat: cp.lat, lng: cp.lng }));
    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: "#0f9d6e",
      strokeOpacity: 0.8,
      strokeWeight: 3,
    });
    polyline.setMap(mapInstance.current);
    polylineRef.current = polyline;

    mapInstance.current.fitBounds(bounds, 40);
  }, [loaded, checkpoints]);

  // Interpolate between points for smooth animation
  const interpolate = useCallback(
    (p1: google.maps.LatLngLiteral, p2: google.maps.LatLngLiteral, t: number): google.maps.LatLngLiteral => ({
      lat: p1.lat + (p2.lat - p1.lat) * t,
      lng: p1.lng + (p2.lng - p1.lng) * t,
    }),
    []
  );

  const startSimulation = useCallback(() => {
    if (!mapInstance.current || checkpoints.length < 2) return;

    // Clean up previous driver marker
    driverMarkerRef.current?.setMap(null);

    const driverMarker = new google.maps.Marker({
      position: { lat: checkpoints[0].lat, lng: checkpoints[0].lng },
      map: mapInstance.current,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        fillColor: "#2563eb",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        scale: 7,
        rotation: 0,
      },
      title: "Driver",
      zIndex: 999,
    });
    driverMarkerRef.current = driverMarker;

    const path = checkpoints.map((cp) => ({ lat: cp.lat, lng: cp.lng }));
    const totalSegments = path.length - 1;
    const durationPerSegment = 3000; // ms per segment
    const totalDuration = totalSegments * durationPerSegment;
    const startTime = performance.now();

    setTracking(true);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      const segFloat = progress * totalSegments;
      const segIndex = Math.min(Math.floor(segFloat), totalSegments - 1);
      const segProgress = segFloat - segIndex;

      const pos = interpolate(path[segIndex], path[segIndex + 1] || path[segIndex], segProgress);

      // Calculate rotation
      const next = path[segIndex + 1] || path[segIndex];
      const heading = google.maps.geometry?.spherical?.computeHeading(
        new google.maps.LatLng(path[segIndex].lat, path[segIndex].lng),
        new google.maps.LatLng(next.lat, next.lng)
      ) ?? 0;

      driverMarker.setPosition(pos);
      const icon = driverMarker.getIcon() as google.maps.Symbol;
      driverMarker.setIcon({ ...icon, rotation: heading });

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setTracking(false);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [checkpoints, interpolate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      driverMarkerRef.current?.setMap(null);
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className={`w-full rounded-xl overflow-hidden ${className}`}
        style={{ minHeight: 250 }}
      />
      {simulateDriver && loaded && checkpoints.length >= 2 && (
        <button
          onClick={startSimulation}
          disabled={tracking}
          className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-md transition-all ${
            tracking
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${tracking ? "bg-destructive animate-pulse" : "bg-primary-foreground"}`} />
          {tracking ? "Tracking…" : "Simulate Driver"}
        </button>
      )}
    </div>
  );
};

export default MapView;
