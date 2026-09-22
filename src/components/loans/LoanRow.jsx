import React from "react";
import { MoreHorizontal, ChevronRight } from "lucide-react";
import { STAGE_MAP, fullName, documentsNeededSummary, dateCountdown } from "@/lib/loan-utils";
import ContactsCell from "./ContactsCell";
import AssignedToCell from "./AssignedToCell";

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

function DatesCell({ loan }) {
  const fc = dateCountdown(loan.finance_contingency_date);
  const close = dateCountdown(loan.closing_date);
  if (!fc && !close) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <span className="text-xs font-semibold text-foreground/80 whitespace-nowrap">
      {fc || "—"}{fc && close ? " / " : ""}{close || ""}
    </span>
  );
}

function TbdPill() {
  return (
    <span className="text-sm text-foreground/80">TBD</span>
  );
}

export default function LoanRow({ loan, onOpen, currentUser, onAccept }) {
  const needed = documentsNeededSummary(loan);

  const showTbd =
    loan.stage === "pending" ||
    loan.stage === "preapproved" ||
    loan.address_tbd ||
    !loan.property_address;

  return (
    <tr
      onClick={() => onOpen(loan)}
      className="group border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
    >
      {/* Stage */}
      <td className="px-4 py-3">
        <StageBadge stage={loan.stage} />
        {loan.stage === "preapproved" && loan.preapproval_amount != null && (
          <div className="mt-1 text-xs font-semibold text-emerald-700 tabular-nums">
            ${Number(loan.preapproval_amount).toLocaleString()}
          </div>
        )}
      </td>
      {/* Borrower */}
      <td className="px-4 py-3">
        <div className="font-semibold text-foreground text-sm">{fullName(loan)}</div>
      </td>
      {/* Assigned To */}
      <td className="px-4 py-3">
        <AssignedToCell loan={loan} currentUser={currentUser} onAccept={onAccept} />
      </td>
      {/* Property */}
      <td className="px-4 py-3">
        {showTbd ? (
          <TbdPill />
        ) : (
          <span className="text-sm text-foreground/80">{loan.property_address}</span>
        )}
      </td>
      {/* Finance Contingency / Closing */}
      <td className="px-4 py-3">
        <DatesCell loan={loan} />
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
      {/* Contacts */}
      <td className="px-4 py-3">
        <ContactsCell loan={loan} />
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