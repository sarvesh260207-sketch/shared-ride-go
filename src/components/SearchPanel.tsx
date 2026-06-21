import { useState, useEffect } from "react";
import { Search, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";

interface SearchPanelProps {
  onSearch: (from: string, to: string) => void;
  femaleOnly: boolean;
  onFemaleOnlyChange: (val: boolean) => void;
}

// Mock search hints cycle in the placeholder, showing real Indian-mileage prices.
const FROM_HINTS = [
  "T. Nagar, Chennai · Activa 6G ₹26",
  "Anna Nagar · Ather 450X ₹8",
  "Adyar · Swift ₹56",
  "Madurai Periyar Stand · Splendor ₹20",
  "Coimbatore Gandhipuram · Honda City ₹62",
];
const TO_HINTS = [
  "Tambaram · ₹5 platform fee included",
  "OMR Thoraipakkam · split with 3 riders",
  "Tidel Park · ₹5 insurance optional",
  "Mattuthavani · ARAI mileage based",
  "Peelamedu · transparent fuel pricing",
];

const SearchPanel = ({ onSearch, femaleOnly, onFemaleOnlyChange }: SearchPanelProps) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [hintIdx, setHintIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setHintIdx((i) => (i + 1) % FROM_HINTS.length), 2800);
    return () => clearInterval(t);
  }, []);

  const handleSearch = () => {
    if (from && to) onSearch(from, to);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <PlacesAutocomplete
          value={from}
          onChange={setFrom}
          placeholder={`From: ${FROM_HINTS[hintIdx]}`}
          iconColor="text-primary"
          className="flex-1"
        />

        <div className="hidden sm:flex items-center">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </div>

        <PlacesAutocomplete
          value={to}
          onChange={setTo}
          placeholder={`To: ${TO_HINTS[hintIdx]}`}
          iconColor="text-accent"
          className="flex-1"
        />

        <Button onClick={handleSearch} size="lg" className="saathi-gradient-bg rounded-xl font-display font-semibold gap-2 px-6 text-primary-foreground border-0 hover:opacity-90 transition-opacity">
          <Search className="w-4 h-4" />
          Find Rides
        </Button>
      </div>

      <div className="flex items-center gap-2.5 px-1">
        <Switch
          id="female-only"
          checked={femaleOnly}
          onCheckedChange={onFemaleOnlyChange}
          className="data-[state=checked]:bg-pink-500"
        />
        <Label htmlFor="female-only" className="flex items-center gap-1.5 text-sm cursor-pointer text-foreground">
          <ShieldCheck className="w-4 h-4 text-pink-500" />
          Female Only Mode
        </Label>
        <span className="text-xs text-muted-foreground">— Show rides with verified female drivers & passengers</span>
      </div>
    </div>
  );
};

export default SearchPanel;
