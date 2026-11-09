import React from "react";
import { formatUSD } from "@/lib/loan-calculator";
import MonthlyPaymentBreakdown from "@/components/calculator/MonthlyPaymentBreakdown";

export default function CalculatorResults({ quote }) {
  if (!quote) return null;
  const { rules } = quote;
  const coveredByDPA = !rules.downInOutOfPocket;
  return (
    <div className="space-y-4">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg bg-primary text-primary-foreground p-4">
          <p className="text-xs font-medium opacity-90">Estimated Monthly Payment</p>
          <p className="text-2xl font-bold mt-1">{formatUSD(quote.monthlyPayment, 2)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 space-y-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Estimated Down Payment</p>
              {coveredByDPA && (
                <p className="text-[11px] text-muted-foreground">Covered by down payment assistance</p>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground">{formatUSD(quote.downPayment)}</p>
          </div>
          <div className="flex items-baseline justify-between gap-2 border-t border-border pt-2.5">
            <p className="text-xs font-medium text-muted-foreground">Estimated Closing Costs</p>
            <p className="text-sm font-semibold text-foreground">{formatUSD(quote.closingCosts)}</p>
          </div>
          <div className="flex items-baseline justify-between gap-2 border-t border-border pt-2.5">
            <p className="text-xs font-semibold text-foreground">Estimated Total Out of Pocket</p>
            <p className="text-lg font-bold text-foreground">{formatUSD(quote.totalOutOfPocket)}</p>
          </div>
        </div>
      </div>

      <MonthlyPaymentBreakdown quote={quote} />

      {quote.concessionCapped && (
        <p className="text-xs text-muted-foreground">
          Your requested concession exceeds this program's maximum. The maximum seller concession for this
          program is {formatUSD(quote.maxConcession)} ({Math.round(rules.maxConcessionPercent * 100)}% of
          sales price), and that amount is used in the estimate.
        </p>
      )}
    </div>
  );
}