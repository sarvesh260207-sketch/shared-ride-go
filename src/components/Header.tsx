import { Link, useLocation } from "react-router-dom";
import { User, PlusCircle, Route } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="font-display font-bold text-2xl text-foreground tracking-tight">Zhoop</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/travel-planner">
            <Button variant="outline" size="sm" className="gap-1.5 font-display text-xs rounded-lg">
              <Route className="w-3.5 h-3.5" />
              Plan Trip
            </Button>
          </Link>
          <Link to="/offer-ride">
            <Button variant="outline" size="sm" className="gap-1.5 font-display text-xs rounded-lg">
              <PlusCircle className="w-3.5 h-3.5" />
              Offer Ride
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost" size="icon" className="rounded-lg">
              <User className="w-4 h-4" />
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
