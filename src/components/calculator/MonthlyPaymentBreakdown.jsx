import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { formatUSD } from "@/lib/loan-calculator";

const SLICES = [
  { key: "principalAndInterest", label: "Principal & Interest", color: "#2563eb" },
  { key: "taxes", label: "Property Taxes", color: "#16a34a" },
  { key: "insuranceMonthly", label: "Homeowners Insurance", color: "#f97316" },
  { key: "hoa", label: "HOA Dues", color: "#8b5cf6" },
  { key: "pmi", label: "Mortgage Insurance", color: "#14b8a6" },
];

export default function MonthlyPaymentBreakdown({ quote }) {
  if (!quote) return null;
  const total = Number(quote.monthlyPayment) || 0;
  const slices = SLICES.map((s) => ({ ...s, amount: Number(quote[s.key]) || 0 })).filter(
    (s) => s.amount > 0
  );
  if (slices.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <h2 className="font-heading text-lg font-bold text-foreground">
        Your Estimated Monthly Mortgage Payment
      </h2>
      <p className="text-sm text-muted-foreground">See exactly where your money goes!</p>

      <div className="mt-4 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-full max-w-[240px] aspect-square shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="amount"
                nameKey="label"
                innerRadius="62%"
                outerRadius="96%"
                stroke="none"
                isAnimationActive={false}
              >
                {slices.map((s) => (
                  <Cell key={s.key} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-[58%] text-center">
              <p className="text-[10px] font-medium leading-tight text-muted-foreground">
                Estimated Mortgage Payment
              </p>
              <p className="mt-1 text-base font-bold leading-tight text-foreground">
                {formatUSD(total, 2)}
              </p>
            </div>
          </div>
        </div>

        <ul className="w-full space-y-2">
          {slices.map((s) => (
            <li key={s.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-foreground">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
              <span className="font-semibold text-foreground">{formatUSD(s.amount)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary/60 px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Total Monthly Payment</span>
        <span className="text-lg font-bold text-foreground">{formatUSD(total, 2)}</span>
      </div>
    </div>
  );
}