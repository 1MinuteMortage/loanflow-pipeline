import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { STAGE_MAP, fullName, documentsNeededSummary } from "@/lib/loan-utils";
import { dateUrgency } from "@/lib/date-urgency";
import ContactsCell from "./ContactsCell";
import { getContacts } from "@/lib/loan-utils";
import { canOpenLoanDetails, needsFileAccept } from "@/lib/permissions";

export default function LoanCard({ loan, onOpen, currentUser, onAccept }) {
  const [expanded, setExpanded] = useState(false);
  const needed = documentsNeededSummary(loan);
  const stage = STAGE_MAP[loan.stage];

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
      <div
        onClick={handleClick}
        className="rounded-lg border border-dashed border-border bg-muted/70 opacity-75 p-4 cursor-pointer active:bg-muted/90"
      >
        <div className="text-sm font-semibold text-muted-foreground">Unaccepted File</div>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          Accept this file to view borrower details and documents.
        </p>
        <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-900">
          Tap to Accept File
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`rounded-lg border border-border bg-card p-4 transition-colors ${
        canOpen
          ? "active:bg-muted/40 cursor-pointer"
          : "bg-muted/60 opacity-60 cursor-not-allowed"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-heading text-lg font-bold text-foreground truncate">{fullName(loan)}</div>
          <div className="mt-1.5">
            {loan.stage === "pending" || loan.stage === "preapproved" || loan.address_tbd || !loan.property_address ? (
              <span className="text-sm text-foreground/80">TBD</span>
            ) : (
              <span className="text-sm text-muted-foreground line-clamp-1">{loan.property_address}</span>
            )}
          </div>
          {getContacts(loan).length > 0 && (
            <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
              <ContactsCell loan={loan} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
            style={{ backgroundColor: stage.bg, color: stage.text }}
          >
            {stage.label}
          </span>
          {loan.stage === "preapproved" && loan.preapproval_amount != null && (
            <div className="mt-1 text-xs font-semibold text-emerald-700 tabular-nums text-center">
              ${Number(loan.preapproval_amount).toLocaleString()}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {needed.remaining} docs needed · {needed.done}/{needed.total} done
        </span>
      </div>

      {(loan.finance_contingency_date || loan.closing_date) && (
        <div className="mt-3 flex flex-col gap-1.5">
          {loan.finance_contingency_date && (() => {
            const u = dateUrgency(loan.finance_contingency_date);
            if (!u) return null;
            return (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold w-fit"
                style={{ backgroundColor: u.bg, color: u.text }}
              >
                FC: {u.label}
              </span>
            );
          })()}
          {loan.closing_date && (() => {
            const u = dateUrgency(loan.closing_date);
            if (!u) return null;
            return (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold w-fit"
                style={{ backgroundColor: u.bg, color: u.text }}
              >
                Close: {u.label}
              </span>
            );
          })()}
        </div>
      )}

      {needed.labels.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="mt-3 flex items-center gap-1 text-xs text-muted-foreground w-full"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          Documents needed
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