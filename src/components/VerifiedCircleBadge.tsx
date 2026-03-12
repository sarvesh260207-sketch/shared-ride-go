import { ShieldCheck, GraduationCap, Building2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface VerifiedCircleBadgeProps {
  verified?: boolean;
  college?: string;
  department?: string;
  compact?: boolean;
}

const VerifiedCircleBadge = ({ verified, college, department, compact = false }: VerifiedCircleBadgeProps) => {
  if (!verified && !college) return null;

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            {verified && (
              <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
                <ShieldCheck className="w-3 h-3 text-primary" />
              </div>
            )}
            {college && (
              <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center">
                <GraduationCap className="w-3 h-3 text-accent-foreground" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-0.5">
            {verified && <p className="font-semibold">✅ ID Verified</p>}
            {college && <p>🎓 {college}</p>}
            {department && <p>🏢 {department}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {verified && (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
          <ShieldCheck className="w-3 h-3" />
          ID Verified
        </div>
      )}
      {college && (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground text-[10px] font-bold border border-accent/20">
          <GraduationCap className="w-3 h-3" />
          {college}
        </div>
      )}
      {department && (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-foreground text-[10px] font-bold border border-border">
          <Building2 className="w-3 h-3" />
          {department}
        </div>
      )}
    </div>
  );
};

export default VerifiedCircleBadge;
