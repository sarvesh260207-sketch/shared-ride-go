import { useEffect, useState } from "react";
import { Leaf, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const THEME_STORAGE_KEY = "zhoop-layout-theme";

type LayoutTheme = "original" | "yellow-green";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<LayoutTheme>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === "yellow-green" ? "yellow-green" : "original";
    } catch {
      return "original";
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("yellow-green", theme === "yellow-green");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // The selected theme still works when browser storage is unavailable.
    }
  }, [theme]);

  const isYellowGreen = theme === "yellow-green";
  const nextThemeLabel = isYellowGreen ? "Switch to original layout" : "Switch to yellow and green layout";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setTheme(isYellowGreen ? "original" : "yellow-green")}
          aria-label={nextThemeLabel}
          aria-pressed={isYellowGreen}
          className="h-9 gap-1.5 rounded-lg px-2.5 font-display text-xs"
        >
          {isYellowGreen ? <Palette className="w-3.5 h-3.5" /> : <Leaf className="w-3.5 h-3.5" />}
          <span className="hidden lg:inline">{isYellowGreen ? "Original" : "Yellow + Green"}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{nextThemeLabel}</TooltipContent>
    </Tooltip>
  );
};

export default ThemeSwitcher;