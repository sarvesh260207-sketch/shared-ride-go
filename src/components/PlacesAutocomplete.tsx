import { useState, useRef, useEffect } from "react";
import { MapPin } from "lucide-react";
import { mockRides } from "@/data/mockRides";
import { popularLocations } from "@/data/mockRides";

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  iconColor?: string;
  className?: string;
}

// Extract all unique location names from rides + checkpoints
const getAllLocations = (): string[] => {
  const locs = new Set<string>();
  popularLocations.forEach((l) => locs.add(l));
  mockRides.forEach((r) => {
    locs.add(r.from);
    locs.add(r.to);
    r.checkpoints.forEach((cp) => locs.add(cp.name));
  });
  return Array.from(locs);
};

const allLocations = getAllLocations();

const PlacesAutocomplete = ({ value, onChange, placeholder, iconColor = "text-primary", className = "" }: PlacesAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (val: string) => {
    onChange(val);
    if (val.length >= 2) {
      const q = val.toLowerCase();
      setFiltered(allLocations.filter((l) => l.toLowerCase().includes(q)).slice(0, 8));
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const handleSelect = (loc: string) => {
    onChange(loc);
    setOpen(false);
  };

  const handleFocus = () => {
    if (value.length >= 2) {
      const q = value.toLowerCase();
      setFiltered(allLocations.filter((l) => l.toLowerCase().includes(q)).slice(0, 8));
      setOpen(true);
    } else {
      // Show popular locations on focus
      setFiltered(popularLocations.slice(0, 6));
      setOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {filtered.map((loc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(loc)}
              className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              {loc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacesAutocomplete;
