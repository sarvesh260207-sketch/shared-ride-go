import { Tag, IndianRupee, Fuel, Shield, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { VEHICLE_CATALOG, PLATFORM_FEE, INSURANCE_FEE, FUEL_PRICE, calcPrice, fuelLabel } from "@/lib/pricing";

const SAMPLE_KM = 10;

const PricingDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm" className="gap-1.5 font-display text-xs rounded-lg">
        <Tag className="w-3.5 h-3.5" />
        Pricing
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="font-display flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-primary" />
          Transparent Pricing
        </DialogTitle>
        <DialogDescription>
          Cost share = real fuel burn (distance ÷ ARAI mileage × fuel price) + ₹{PLATFORM_FEE} platform fee. Optional ₹{INSURANCE_FEE} insurance.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-1 text-muted-foreground"><Fuel className="w-3 h-3" /> Petrol</div>
            <div className="font-semibold text-foreground">₹{FUEL_PRICE.petrol}/L</div>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-1 text-muted-foreground"><Fuel className="w-3 h-3" /> Diesel</div>
            <div className="font-semibold text-foreground">₹{FUEL_PRICE.diesel}/L</div>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-1 text-primary"><Receipt className="w-3 h-3" /> Platform fee</div>
            <div className="font-semibold text-primary">₹{PLATFORM_FEE} / ride</div>
          </div>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted/40 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <div className="col-span-5">Vehicle</div>
            <div className="col-span-3">Mileage</div>
            <div className="col-span-2 text-right">10 km</div>
            <div className="col-span-2 text-right">Source</div>
          </div>
          {VEHICLE_CATALOG.map((v) => {
            const p = calcPrice(v, SAMPLE_KM);
            return (
              <div key={v.id} className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-border text-xs items-center">
                <div className="col-span-5 font-medium text-foreground">{v.name}</div>
                <div className="col-span-3 text-muted-foreground">{fuelLabel(v)} · {v.fuel}</div>
                <div className="col-span-2 text-right font-semibold text-primary">₹{p.total}</div>
                <div className="col-span-2 text-right text-[10px] text-muted-foreground">{v.source}</div>
              </div>
            );
          })}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20 text-xs">
          <Shield className="w-4 h-4 text-accent-foreground mt-0.5 flex-shrink-0" />
          <p className="text-foreground">
            Optional <span className="font-semibold">Ride Insurance</span> at ₹{INSURANCE_FEE}/ride covers the rider for the calendar month. Toggle it when you book.
          </p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default PricingDialog;
