import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  from?: { lat: number; lng: number } | null;
  to?: { lat: number; lng: number } | null;
  live?: { lat: number; lng: number } | null;
  className?: string;
}

const dot = (cls: string) =>
  L.divIcon({ className: "", html: `<div class="${cls}" style="width:16px;height:16px;border-radius:9999px;border:3px solid white;box-shadow:0 0 0 2px rgba(0,0,0,.2)"></div>`, iconSize: [16, 16] });

export default function LiveMap({ from, to, live, className }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const liveMarker = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current).setView([13.0827, 80.2707], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap", maxZoom: 19,
    }).addTo(map.current);
    return () => { map.current?.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m || !from || !to) return;
    const a = L.marker([from.lat, from.lng], { icon: dot("bg-primary") }).addTo(m);
    const b = L.marker([to.lat, to.lng], { icon: dot("bg-accent") }).addTo(m);
    const line = L.polyline([[from.lat, from.lng], [to.lat, to.lng]], { dashArray: "6 6" }).addTo(m);
    m.fitBounds(line.getBounds(), { padding: [30, 30] });
    return () => { a.remove(); b.remove(); line.remove(); };
  }, [from?.lat, from?.lng, to?.lat, to?.lng]);

  useEffect(() => {
    const m = map.current;
    if (!m || !live) return;
    if (!liveMarker.current) liveMarker.current = L.marker([live.lat, live.lng], { icon: dot("bg-destructive") }).addTo(m);
    else liveMarker.current.setLatLng([live.lat, live.lng]);
  }, [live?.lat, live?.lng]);

  return <div ref={el} className={className ?? "h-64 w-full rounded-xl overflow-hidden border border-border"} />;
}
