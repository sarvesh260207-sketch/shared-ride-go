import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Checkpoint } from "@/types/ride";

interface MapViewProps {
  checkpoints: Checkpoint[];
  className?: string;
  simulateDriver?: boolean;
}

const MapView = ({ checkpoints, className = "", simulateDriver = false }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapRef.current || checkpoints.length === 0) return;

    // Clean previous
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    polylineRef.current?.remove();

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([checkpoints[0].lat, checkpoints[0].lng], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapInstance.current);
    }

    const bounds = L.latLngBounds([]);

    checkpoints.forEach((cp, i) => {
      const isFirst = i === 0;
      const isLast = i === checkpoints.length - 1;

      const marker = L.circleMarker([cp.lat, cp.lng], {
        radius: isFirst || isLast ? 10 : 6,
        fillColor: isFirst ? "#0f9d6e" : isLast ? "#e8982a" : "#94a3b8",
        fillOpacity: 1,
        color: "#ffffff",
        weight: 2,
      }).addTo(mapInstance.current!);

      marker.bindPopup(
        `<div style="font-family:'Space Grotesk',sans-serif;font-size:13px;padding:2px;">
          <strong>${cp.name}</strong><br/>
          <span style="color:#64748b;">${cp.arrivalTime}</span>
        </div>`
      );

      markersRef.current.push(marker);
      bounds.extend([cp.lat, cp.lng]);
    });

    const path = checkpoints.map((cp) => [cp.lat, cp.lng] as [number, number]);
    const polyline = L.polyline(path, {
      color: "#0f9d6e",
      opacity: 0.8,
      weight: 3,
    }).addTo(mapInstance.current);
    polylineRef.current = polyline;

    mapInstance.current.fitBounds(bounds, { padding: [40, 40] });
  }, [checkpoints]);

  useEffect(() => {
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className={`w-full rounded-xl overflow-hidden ${className}`}
        style={{ minHeight: 250 }}
      />
    </div>
  );
};

export default MapView;
