import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { formatUSD } from "@/lib/loan-calculator";
import { FIELD_INFO } from "@/components/calculator/field-info-texts";
import FieldInfo from "@/components/calculator/FieldInfo";

export default function DownPaymentSlider({ percent, minPercent, maxPercent, locked, amount, onChange }) {
  const displayPercent = Number.isInteger(percent) ? String(percent) : Number(percent).toFixed(1);
  return (
    <div className="space-y-2 rounded-lg border border-border bg-secondary/30 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Down Payment
          </Label>
          <FieldInfo title="Down Payment" text={FIELD_INFO.downPayment} />
        </div>
        <p className="text-sm font-semibold text-foreground">
          {displayPercent}%{" "}
          <span className="text-muted-foreground font-normal">· {formatUSD(amount)}</span>
        </p>
      </div>
      <Slider
        value={[percent]}
        min={minPercent}
        max={maxPercent}
        step={0.5}
        disabled={locked}
        onValueChange={(values) => onChange(values[0])}
        aria-label="Down payment percentage"
      />
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Minimum {minPercent}%</span>
        <span>Maximum {maxPercent}%</span>
      </div>
      {locked && <p className="text-xs text-muted-foreground">Covered by down payment assistance.</p>}
    </div>
  );
}