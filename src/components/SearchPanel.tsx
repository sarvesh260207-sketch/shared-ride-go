import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import { motion } from "framer-motion";

interface SearchPanelProps {
  onSearch: (from: string, to: string, fromPlace?: google.maps.places.PlaceResult, toPlace?: google.maps.places.PlaceResult) => void;
}

const SearchPanel = ({ onSearch }: SearchPanelProps) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromPlace, setFromPlace] = useState<google.maps.places.PlaceResult | undefined>();
  const [toPlace, setToPlace] = useState<google.maps.places.PlaceResult | undefined>();

  const handleSearch = () => {
    if (from && to) onSearch(from, to, fromPlace, toPlace);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <PlacesAutocomplete
          value={from}
          onChange={(val, place) => { setFrom(val); if (place) setFromPlace(place); }}
          placeholder="Pickup location in Tamil Nadu"
          iconColor="text-primary"
          className="flex-1"
        />

        <div className="hidden sm:flex items-center">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </div>

        <PlacesAutocomplete
          value={to}
          onChange={(val, place) => { setTo(val); if (place) setToPlace(place); }}
          placeholder="Drop location in Tamil Nadu"
          iconColor="text-accent"
          className="flex-1"
        />

        <Button onClick={handleSearch} size="lg" className="saathi-gradient-bg rounded-xl font-display font-semibold gap-2 px-6 text-primary-foreground border-0 hover:opacity-90 transition-opacity">
          <Search className="w-4 h-4" />
          Find Rides
        </Button>
      </div>
    </div>
  );
};

export default SearchPanel;
