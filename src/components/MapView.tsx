import { useEffect, useRef, useState } from "react";
import { Checkpoint } from "@/types/ride";
import { loadGoogleMaps } from "@/lib/googleMaps";

interface MapViewProps {
  checkpoints: Checkpoint[];
  className?: string;
}

const MapView = ({ checkpoints, className = "" }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadGoogleMaps().then(() => setLoaded(true)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current || checkpoints.length === 0) return;

    // Clear previous markers and polyline
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

    // Draw route polyline
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

  return (
    <div
      ref={mapRef}
      className={`w-full rounded-xl overflow-hidden ${className}`}
      style={{ minHeight: 250 }}
    />
  );
};

export default MapView;
