import React from "react";
import { MoreHorizontal, ChevronRight } from "lucide-react";
import { STAGE_MAP, fullName, daysRemaining, slaColor, slaLabel, neededSummary } from "@/lib/loan-utils";

function StageBadge({ stage }) {
  const s = STAGE_MAP[stage];
  if (!s) return null;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

function TbdPill() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
      TBD / Pre-approval
    </span>
  );
}

export default function LoanRow({ loan, onOpen }) {
  const days = daysRemaining(loan);
  const needed = neededSummary(loan);
  const color = slaColor(days);

  return (
    <tr
      onClick={() => onOpen(loan)}
      className="group border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
    >
      {/* Borrower */}
      <td className="px-4 py-3">
        <div className="font-semibold text-foreground text-sm">{fullName(loan)}</div>
      </td>
      {/* Property */}
      <td className="px-4 py-3">
        {loan.address_tbd || !loan.property_address ? (
          <TbdPill />
        ) : (
          <span className="text-sm text-foreground/80">{loan.property_address}</span>
        )}
      </td>
      {/* Stage */}
      <td className="px-4 py-3">
        <StageBadge stage={loan.stage} />
      </td>
      {/* Needed items */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground tabular-nums">
            {needed.done}/{needed.total}
          </span>
          <div className="flex-1 max-w-[220px]">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: needed.total ? `${(needed.done / needed.total) * 100}%` : "0%" }}
              />
            </div>
          </div>
          {needed.remaining > 0 && (
            <span className="text-xs text-muted-foreground hidden lg:inline truncate max-w-[140px]">
              {needed.labels[0]}{needed.remaining > 1 ? ` +${needed.remaining - 1}` : ""}
            </span>
          )}
        </div>
      </td>
      {/* SLA */}
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold font-mono tabular-nums"
          style={{ backgroundColor: `${color}14`, color }}
        >
          {slaLabel(days)}
        </span>
      </td>
      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end">
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </td>
    </tr>
  );
}