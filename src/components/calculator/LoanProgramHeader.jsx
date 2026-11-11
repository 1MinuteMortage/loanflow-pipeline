import React from "react";
import { Lock } from "lucide-react";
import { formatUSD } from "@/lib/loan-calculator";

export default function LoanProgramHeader({ preapprovalAmount, interestRate, loanType }) {
  const items = [
    {
      label: "Pre-Approved Amount",
      value: preapprovalAmount != null ? formatUSD(preapprovalAmount) : "Not set",
    },
    { label: "Interest Rate", value: interestRate != null ? `${interestRate}%` : "Not set" },
    { label: "Loan Program", value: loanType || "Not set" },
  ];

  return (
    <div className="rounded-lg border border-border bg-secondary/50 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="grid flex-1 grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item.label}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <p className="font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Lock className="h-3 w-3" />
          Locked
        </span>
      </div>
    </div>
  );
}