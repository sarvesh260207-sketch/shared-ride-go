import { Link } from "react-router-dom";
import { User, PlusCircle, Route, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import zhoopLogo from "@/assets/zhoop-logo-new.jpeg";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={zhoopLogo} alt="Zhoop logo" className="h-10 w-10 rounded-full object-cover" />
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
          {user ? (
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-lg">
                <User className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="gap-1.5 font-display text-xs rounded-lg">
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
