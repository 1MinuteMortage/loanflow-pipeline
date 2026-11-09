import React from "react";
import { Lock } from "lucide-react";

export default function LoanProgramHeader({ loanType, interestRate }) {
  return (
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
  );
}