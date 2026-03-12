import { useState } from "react";
import { Shield, Share2, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface GuardianShareButtonProps {
  rideId?: string;
  driverName?: string;
  className?: string;
}

const GuardianShareButton = ({ rideId, driverName, className = "" }: GuardianShareButtonProps) => {
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [open, setOpen] = useState(false);

  const handleShare = () => {
    if (!guardianName || !guardianPhone) {
      toast.error("Please fill in guardian details");
      return;
    }

    // Generate WhatsApp share link
    const message = encodeURIComponent(
      `🛡️ Zhoop Guardian Alert\n\nI'm on a ride with ${driverName || "a verified driver"} on Zhoop.\n\n📍 Track my live location:\nhttps://zhoop.in/track/${rideId || "demo"}\n\n— Sent via Zhoop Safety`
    );
    const waLink = `https://wa.me/91${guardianPhone.replace(/\D/g, "")}?text=${message}`;
    window.open(waLink, "_blank");
    toast.success("Guardian link shared via WhatsApp!");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/5 ${className}`}
        >
          <Shield className="w-3.5 h-3.5" />
          Guardian Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Share with Guardian
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Send your live ride details to a trusted person via WhatsApp. They'll see the driver's info and your GPS location.
        </p>
        <div className="space-y-3 mt-2">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              placeholder="Guardian's name"
              className="pl-9 rounded-xl"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
              placeholder="WhatsApp number (e.g. 9876543210)"
              className="pl-9 rounded-xl"
              maxLength={10}
            />
          </div>
          <Button onClick={handleShare} className="w-full zhoop-gradient-bg text-primary-foreground rounded-xl gap-2">
            <Share2 className="w-4 h-4" />
            Share via WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuardianShareButton;
