import React from "react";
import { AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatUSD } from "@/lib/loan-calculator";
import { FIELD_INFO } from "@/components/calculator/field-info-texts";
import FieldInfo from "@/components/calculator/FieldInfo";
import DownPaymentSlider from "@/components/calculator/DownPaymentSlider";

const SIMPLE_FIELDS = [
  { key: "taxes", label: "Monthly Property Taxes", info: FIELD_INFO.taxes },
  { key: "hoa", label: "HOA Dues", info: FIELD_INFO.hoa },
];

function FieldLabel({ label, info }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <FieldInfo title={label} text={info} />
    </div>
  );
}

export default function CalculatorFields({
  form,
  onChange,
  preapprovalAmount,
  exceedsPreapproval,
  rules,
  downPercent,
  onDownPercentChange,
}) {
  const salesPrice = parseFloat(form.salesPrice) || 0;
  const downPayment = salesPrice * ((Number(downPercent) || 0) / 100);
  const requestedConcession = parseFloat(form.concession) || 0;
  const maxConcession = rules ? salesPrice * rules.maxConcessionPercent : 0;
  const concessionOverLimit = salesPrice > 0 && requestedConcession > maxConcession;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <FieldLabel label="Sales Price" info={FIELD_INFO.salesPrice} />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.salesPrice}
            onChange={(e) => onChange("salesPrice", e.target.value)}
            className="pl-7"
            aria-invalid={exceedsPreapproval}
          />
        </div>
        {exceedsPreapproval && (
          <p className="text-xs text-destructive">
            Your maximum pre-approved purchase price is {formatUSD(preapprovalAmount)}. Please enter a
            sales price within your approved amount.
          </p>
        )}
      </div>

      <DownPaymentSlider
        percent={Number(downPercent) || 0}
        minPercent={((rules?.minDownPercent ?? 0) * 100)}
        maxPercent={90}
        locked={!!rules?.downLocked}
        amount={downPayment}
        onChange={onDownPercentChange}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SIMPLE_FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <FieldLabel label={f.label} info={f.info} />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form[f.key]}
                onChange={(e) => onChange(f.key, e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
        ))}

        <div className="space-y-1.5 sm:col-span-2">
          <FieldLabel label="Requested Seller's Concession" info={FIELD_INFO.concession} />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.concession}
              onChange={(e) => onChange("concession", e.target.value)}
              className={concessionOverLimit ? "pl-7 pr-9" : "pl-7"}
              aria-invalid={concessionOverLimit}
            />
            {concessionOverLimit && (
              <AlertTriangle
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive"
                aria-hidden="true"
              />
            )}
          </div>
          {concessionOverLimit && (
            <p className="text-xs text-destructive">
              Your requested seller's concession exceeds the recommended limit for your loan program. The
              maximum recommended amount for this purchase is {formatUSD(maxConcession)}. Please review your
              request.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}