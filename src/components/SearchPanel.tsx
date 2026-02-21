import { useState } from "react";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { popularLocations } from "@/data/mockRides";
import { motion } from "framer-motion";

interface SearchPanelProps {
  onSearch: (from: string, to: string) => void;
}

const SearchPanel = ({ onSearch }: SearchPanelProps) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const filteredFrom = popularLocations.filter((loc) =>
    loc.toLowerCase().includes(from.toLowerCase())
  );
  const filteredTo = popularLocations.filter((loc) =>
    loc.toLowerCase().includes(to.toLowerCase())
  );

  const handleSearch = () => {
    if (from && to) onSearch(from, to);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            onFocus={() => setShowFromSuggestions(true)}
            onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
            placeholder="Pickup location"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
          {showFromSuggestions && from && filteredFrom.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full mt-1 left-0 right-0 bg-card border rounded-xl shadow-lg z-50 overflow-hidden">
              {filteredFrom.slice(0, 5).map((loc) => (
                <button key={loc} onMouseDown={() => { setFrom(loc); setShowFromSuggestions(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 text-foreground">
                  <MapPin className="w-3 h-3 text-muted-foreground" /> {loc}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <div className="hidden sm:flex items-center">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            onFocus={() => setShowToSuggestions(true)}
            onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
            placeholder="Drop location"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
          {showToSuggestions && to && filteredTo.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full mt-1 left-0 right-0 bg-card border rounded-xl shadow-lg z-50 overflow-hidden">
              {filteredTo.slice(0, 5).map((loc) => (
                <button key={loc} onMouseDown={() => { setTo(loc); setShowToSuggestions(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 text-foreground">
                  <MapPin className="w-3 h-3 text-muted-foreground" /> {loc}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <Button onClick={handleSearch} size="lg" className="saathi-gradient-bg rounded-xl font-display font-semibold gap-2 px-6 text-primary-foreground border-0 hover:opacity-90 transition-opacity">
          <Search className="w-4 h-4" />
          Find Rides
        </Button>
      </div>
    </div>
  );
};

export default SearchPanel;
