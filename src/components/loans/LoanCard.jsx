import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { STAGE_MAP, fullName, daysRemaining, slaColor, slaLabel, neededSummary } from "@/lib/loan-utils";

export default function LoanCard({ loan, onOpen }) {
  const [expanded, setExpanded] = useState(false);
  const days = daysRemaining(loan);
  const needed = neededSummary(loan);
  const color = slaColor(days);
  const stage = STAGE_MAP[loan.stage];

  return (
    <div
      onClick={() => onOpen(loan)}
      className="rounded-lg border border-border bg-card p-4 active:bg-muted/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-heading text-lg font-bold text-foreground truncate">{fullName(loan)}</div>
          <div className="mt-1.5">
            {loan.address_tbd || !loan.property_address ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                TBD / Pre-approval
              </span>
            ) : (
              <span className="text-sm text-muted-foreground line-clamp-1">{loan.property_address}</span>
            )}
          </div>
        </div>
        <span
          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold font-mono tabular-nums shrink-0"
          style={{ backgroundColor: `${color}14`, color }}
        >
          {slaLabel(days)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
          style={{ backgroundColor: stage.bg, color: stage.text }}
        >
          {stage.label}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {needed.remaining} needed · {needed.done}/{needed.total} done
        </span>
      </div>

      {needed.labels.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="mt-3 flex items-center gap-1 text-xs text-muted-foreground w-full"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          Items needed
        </button>
      )}
      {expanded && needed.labels.length > 0 && (
        <ul className="mt-2 space-y-1 pl-4">
          {needed.labels.map((label, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}