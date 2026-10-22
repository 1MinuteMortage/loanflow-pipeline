import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

export const PAY_PERIODS_PER_YEAR = { weekly: 52, biweekly: 26, semimonthly: 24 };

export function derivePayFrequency(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end)) return null;
  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  if (diffDays <= 10) return "weekly";
  if (diffDays <= 17) return "biweekly";
  return "semimonthly";
}

/** Returns { payFrequency, annualIncome, calculatedIncome } for a source object. */
export function calculateSourceIncome(source) {
  const { incomeType, amountRecent, amountPrior, payPeriodStart, payPeriodEnd, hoursPerPayPeriod, hourlyRate } = source;
  const payFrequency = incomeType === "hourly" ? derivePayFrequency(payPeriodStart, payPeriodEnd) : null;
  const annualIncome =
    incomeType === "hourly"
      ? payFrequency && hoursPerPayPeriod !== "" && hourlyRate !== ""
        ? Number(hoursPerPayPeriod) * Number(hourlyRate) * PAY_PERIODS_PER_YEAR[payFrequency]
        : null
      : amountRecent !== "" && amountPrior !== ""
        ? Math.min(Number(amountRecent), Number(amountPrior))
        : null;
  const calculatedIncome = annualIncome != null ? Math.round((annualIncome / 12) * 100) / 100 : null;
  return { payFrequency, annualIncome, calculatedIncome };
}

export function validateSource(source, yearRecent, yearPrior) {
  if (!source.incomeType) return "Select an income type.";
  if (source.incomeType === "hourly") {
    if (!source.payPeriodStart || !source.payPeriodEnd) return "Enter the start and end dates of the pay period.";
    const pf = derivePayFrequency(source.payPeriodStart, source.payPeriodEnd);
    if (!pf) return "Enter valid pay period dates so the system can determine the pay frequency.";
    if (source.hoursPerPayPeriod === "") return "Enter the hours worked per pay period.";
    if (source.hourlyRate === "") return "Enter the hourly rate.";
  } else {
    if (source.amountRecent === "" || source.amountPrior === "") return `Enter ${yearRecent} and ${yearPrior} income amounts to calculate.`;
  }
  return "";
}

export const EMPTY_SOURCE = {
  incomeType: "",
  amountRecent: "",
  amountPrior: "",
  payPeriodStart: "",
  payPeriodEnd: "",
  hoursPerPayPeriod: "",
  hourlyRate: "",
};

export default function IncomeSourceFields({ source, onChange, yearRecent, yearPrior, title }) {
  const { incomeType, amountRecent, amountPrior, payPeriodStart, payPeriodEnd, hoursPerPayPeriod, hourlyRate } = source;
  const { payFrequency, annualIncome, calculatedIncome } = calculateSourceIncome(source);

  const update = (patch) => {
    const next = { ...source, ...patch };
    const calc = calculateSourceIncome(next);
    onChange({ ...next, ...calc });
  };

  return (
    <div className="space-y-3">
      {title && (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      )}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Income Type</Label>
        <select value={incomeType} onChange={(e) => update({ incomeType: e.target.value })} className={selectClass}>
          <option value="">Select...</option>
          <option value="w2">W-2</option>
          <option value="1099">1099 / Self-Employed</option>
          <option value="hourly">Hourly</option>
        </select>
      </div>

      {incomeType === "hourly" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pay Period Start</Label>
              <Input
                type="date"
                value={payPeriodStart}
                onChange={(e) => update({ payPeriodStart: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pay Period End</Label>
              <Input
                type="date"
                value={payPeriodEnd}
                onChange={(e) => update({ payPeriodEnd: e.target.value })}
              />
            </div>
          </div>
          {payFrequency && (
            <p className="text-xs text-muted-foreground">
              Detected pay frequency:{" "}
              <span className="font-semibold text-foreground">
                {payFrequency === "semimonthly" ? "Semimonthly (twice/month)" : payFrequency === "biweekly" ? "Biweekly" : "Weekly"}
              </span>{" "}
              ({PAY_PERIODS_PER_YEAR[payFrequency]} pay periods/year)
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hours Per Pay Period</Label>
              <Input
                type="number"
                value={hoursPerPayPeriod}
                onChange={(e) => update({ hoursPerPayPeriod: e.target.value })}
                placeholder="Enter hours"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hourly Rate</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => update({ hourlyRate: e.target.value })}
                  placeholder="Enter rate"
                  className="pl-7"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {incomeType && incomeType !== "hourly" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {yearRecent} {incomeType === "w2" ? "W-2 Income" : "AGI"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="number"
                value={amountRecent}
                onChange={(e) => update({ amountRecent: e.target.value })}
                placeholder="Enter text"
                className="pl-7"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {yearPrior} {incomeType === "w2" ? "W-2 Income" : "AGI"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="number"
                value={amountPrior}
                onChange={(e) => update({ amountPrior: e.target.value })}
                placeholder="Enter text"
                className="pl-7"
              />
            </div>
          </div>
        </div>
      )}

      {calculatedIncome !== null && (
        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm space-y-1">
          {incomeType === "hourly" ? (
            <>
              <p className="text-muted-foreground">
                Pay Period: {payPeriodStart} → {payPeriodEnd} ({payFrequency === "semimonthly" ? "Semimonthly" : payFrequency === "biweekly" ? "Biweekly" : "Weekly"})
              </p>
              <p className="text-muted-foreground">
                Gross Per Pay Period = {Number(hoursPerPayPeriod)} hrs × ${Number(hourlyRate).toLocaleString()}/hr = ${(Number(hoursPerPayPeriod) * Number(hourlyRate)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-muted-foreground">
                Annual Income = ${(Number(hoursPerPayPeriod) * Number(hourlyRate)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × {PAY_PERIODS_PER_YEAR[payFrequency]} pay periods / yr
              </p>
              <p className="text-muted-foreground">
                Monthly Qualifying Income = ${annualIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ÷ 12
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                Conservative Annual Income = lower of ${Number(amountRecent).toLocaleString()} or ${Number(amountPrior).toLocaleString()}
              </p>
              <p className="text-muted-foreground">
                Monthly Qualifying Income = ${annualIncome.toLocaleString()} ÷ 12
              </p>
            </>
          )}
          <p className="font-semibold">
            Monthly Qualifying Income: ${calculatedIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
          </p>
        </div>
      )}
    </div>
  );
}