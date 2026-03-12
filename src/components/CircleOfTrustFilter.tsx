import { useState } from "react";
import { ShieldCheck, Building2, GraduationCap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLLEGES = [
  "Anna University",
  "MCC",
  "Loyola College",
  "SRM University",
  "VIT Chennai",
  "Sathyabama",
  "SSN College",
  "Stella Maris College",
  "Women's Christian College",
  "Ethiraj College",
  "Madras Christian College",
  "IIT Madras",
];

const DEPARTMENTS = [
  "Computer Science (CSE)",
  "Mechanical (MECH)",
  "Electronics (ECE)",
  "Electrical (EEE)",
  "Civil",
  "Information Technology (IT)",
  "Biomedical",
  "Chemical",
  "Commerce",
  "Arts & Humanities",
];

interface CircleOfTrustFilterProps {
  collegeFilter: string;
  departmentFilter: string;
  onCollegeChange: (val: string) => void;
  onDepartmentChange: (val: string) => void;
  circleOnly: boolean;
  onCircleOnlyChange: (val: boolean) => void;
}

const CircleOfTrustFilter = ({
  collegeFilter,
  departmentFilter,
  onCollegeChange,
  onDepartmentChange,
  circleOnly,
  onCircleOnlyChange,
}: CircleOfTrustFilterProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3 px-1">
      <div className="flex items-center gap-2">
        <Switch
          id="circle-trust"
          checked={circleOnly}
          onCheckedChange={onCircleOnlyChange}
          className="data-[state=checked]:bg-primary"
        />
        <Label htmlFor="circle-trust" className="flex items-center gap-1.5 text-sm cursor-pointer text-foreground font-medium">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Circle of Trust
        </Label>
      </div>

      {circleOnly && (
        <>
          <Select value={collegeFilter} onValueChange={onCollegeChange}>
            <SelectTrigger className="w-[180px] h-8 text-xs rounded-lg">
              <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-primary" />
              <SelectValue placeholder="Any College" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any College</SelectItem>
              {COLLEGES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={onDepartmentChange}>
            <SelectTrigger className="w-[180px] h-8 text-xs rounded-lg">
              <Building2 className="w-3.5 h-3.5 mr-1.5 text-accent" />
              <SelectValue placeholder="Any Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Department</SelectItem>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  );
};

export { COLLEGES, DEPARTMENTS };
export default CircleOfTrustFilter;
