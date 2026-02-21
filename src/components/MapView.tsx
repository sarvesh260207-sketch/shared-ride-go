import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Checkpoint } from "@/types/ride";

interface MapViewProps {
  checkpoints: Checkpoint[];
  className?: string;
}

const MapView = ({ checkpoints, className = "" }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || checkpoints.length === 0) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const bounds = L.latLngBounds([]);

    checkpoints.forEach((cp, i) => {
      const isFirst = i === 0;
      const isLast = i === checkpoints.length - 1;

      const color = isFirst ? "#0f9d6e" : isLast ? "#e8982a" : "#94a3b8";
      const radius = isFirst || isLast ? 10 : 6;

      L.circleMarker([cp.lat, cp.lng], {
        radius,
        fillColor: color,
        color: "white",
        weight: 2,
        fillOpacity: 1,
      })
        .bindPopup(
          `<div style="font-family: 'Space Grotesk', sans-serif; font-size: 13px;">
            <strong>${cp.name}</strong><br/>
            <span style="color: #64748b;">${cp.arrivalTime}</span>
          </div>`
        )
        .addTo(map);

      bounds.extend([cp.lat, cp.lng]);
    });

    // Draw route line
    const latlngs = checkpoints.map((cp) => [cp.lat, cp.lng] as [number, number]);
    L.polyline(latlngs, {
      color: "#0f9d6e",
      weight: 3,
      opacity: 0.7,
      dashArray: "8 6",
    }).addTo(map);

    map.fitBounds(bounds, { padding: [30, 30] });
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [checkpoints]);

  return <div ref={mapRef} className={`w-full rounded-xl overflow-hidden ${className}`} style={{ minHeight: 250 }} />;
};

export default MapView;
