import React from "react";
import { MoreHorizontal, ChevronRight } from "lucide-react";
import { STAGE_MAP, fullName, documentsNeededSummary } from "@/lib/loan-utils";
import { dateUrgency } from "@/lib/date-urgency";
import AssignedToCell from "./AssignedToCell";
import { canOpenLoanDetails, needsFileAccept } from "@/lib/permissions";

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

function UrgencyBadge({ dateStr, type }) {
  const u = dateUrgency(dateStr);
  if (!u) return null;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap w-fit"
      style={{ backgroundColor: u.bg, color: u.text }}
    >
      {type}: {u.label}
    </span>
  );
}

function DatesCell({ loan }) {
  const fc = loan.finance_contingency_date;
  const close = loan.closing_date;
  if (!fc && !close) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-col gap-1.5">
      {fc && <UrgencyBadge dateStr={fc} type="FC" />}
      {close && <UrgencyBadge dateStr={close} type="Close" />}
    </div>
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

  const canOpen = canOpenLoanDetails(currentUser, loan);
  const mustAccept = needsFileAccept(currentUser, loan);

  const handleClick = () => {
    if (mustAccept) {
      onAccept(loan, null);
      return;
    }
    if (canOpen) onOpen(loan);
  };

  if (mustAccept) {
    return (
      <tr
        onClick={handleClick}
        className="group border-b border-border last:border-0 bg-muted/60 opacity-75 hover:bg-muted/80 cursor-pointer"
      >
        <td className="px-4 py-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-muted text-muted-foreground">
            Unaccepted
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="font-semibold text-foreground text-sm">{fullName(loan)}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Accept file to view details</p>
        </td>
        <td className="px-4 py-3">
          <AssignedToCell loan={loan} currentUser={currentUser} onAccept={onAccept} />
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground">—</td>
        <td className="px-4 py-3 text-xs text-muted-foreground">—</td>
        <td className="px-4 py-3 text-xs text-muted-foreground">—</td>
        <td className="px-4 py-3">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </td>
      </tr>
    );
  }

  return (
    <tr
      onClick={handleClick}
      className={`group border-b border-border last:border-0 transition-colors ${
        canOpen
          ? "hover:bg-muted/40 cursor-pointer"
          : "bg-muted/50 opacity-60 cursor-not-allowed"
      }`}
    >
      {/* Stage */}
      <td className="px-4 py-3">
        <StageBadge stage={loan.stage} />
        {loan.stage === "preapproved" && loan.preapproval_amount != null && (
          <div className="mt-1 text-xs font-semibold text-emerald-700 tabular-nums text-center">
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
      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end">
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </td>
    </tr>
  );
}