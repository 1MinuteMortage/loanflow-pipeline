import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatUSD } from "@/lib/loan-calculator";

const FIELDS = [
  { key: "salesPrice", label: "Sales Price" },
  { key: "taxes", label: "Monthly Property Taxes" },
  { key: "hoa", label: "HOA Dues" },
  { key: "concession", label: "Requested Seller's Concession" },
];

export default function CalculatorFields({ form, onChange, preapprovalAmount, exceedsPreapproval }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {FIELDS.map((f) => (
        <div key={f.key} className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {f.label}
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form[f.key]}
              onChange={(e) => onChange(f.key, e.target.value)}
              className="pl-7"
              aria-invalid={f.key === "salesPrice" && exceedsPreapproval}
            />
          </div>
          {f.key === "salesPrice" && exceedsPreapproval && (
            <p className="text-xs text-destructive">
              Your maximum pre-approved purchase price is {formatUSD(preapprovalAmount)}. Please enter a
              sales price within your approved amount.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}