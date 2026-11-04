import React from "react";
import { Lock } from "lucide-react";
import { formatUSD } from "@/lib/loan-calculator";

export default function CalculatorResults({ quote, loanType, interestRate }) {
  if (!quote) return null;
  const { rules } = quote;
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-secondary/50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Loan Program</p>
          <p className="font-semibold text-foreground">{loanType}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Interest Rate</p>
          <p className="font-semibold text-foreground">{interestRate != null ? `${interestRate}%` : "Not set"}</p>
        </div>
        <Lock className="w-4 h-4 text-muted-foreground" aria-label="Program and rate are locked" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg bg-primary text-primary-foreground p-4">
          <p className="text-xs font-medium opacity-90">Estimated Monthly Payment</p>
          <p className="text-2xl font-bold mt-1">{formatUSD(quote.monthlyPayment, 2)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Total Out-of-Pocket</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{formatUSD(quote.totalOutOfPocket)}</p>
        </div>
      </div>

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