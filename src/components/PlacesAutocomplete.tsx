import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { loadGoogleMaps } from "@/lib/googleMaps";

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string, placeDetails?: google.maps.places.PlaceResult) => void;
  placeholder: string;
  iconColor?: string;
  className?: string;
}

const PlacesAutocomplete = ({ value, onChange, placeholder, iconColor = "text-primary", className = "" }: PlacesAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadGoogleMaps().then(() => setIsLoaded(true)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "in" },
      bounds: new google.maps.LatLngBounds(
        { lat: 8.0, lng: 76.2 },  // SW Tamil Nadu
        { lat: 13.5, lng: 80.4 }  // NE Tamil Nadu
      ),
      strictBounds: false,
      fields: ["place_id", "geometry", "name", "formatted_address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place?.name) {
        onChange(place.formatted_address || place.name, place);
      }
    });

    autocompleteRef.current = autocomplete;
  }, [isLoaded]);

  return (
    <div className={`relative ${className}`}>
      <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
      />
    </div>
  );
};

export default PlacesAutocomplete;
