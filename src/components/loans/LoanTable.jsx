import React from "react";
import LoanRow from "./LoanRow";

const COLUMNS = [
  { key: "borrower", label: "Borrower Name", className: "w-[14%]" },
  { key: "assigned", label: "Assigned To", className: "w-[11%]" },
  { key: "stage", label: "Stage", className: "w-[9%]" },
  { key: "property", label: "Property Address", className: "w-[17%]" },
  { key: "dates", label: "FC / Closing", className: "w-[11%]" },
  { key: "needed", label: "Documents Needed", className: "w-[21%]" },
  { key: "contacts", label: "Contacts", className: "w-[12%]" },
  { key: "actions", label: "", className: "w-[5%]" }
];

export default function LoanTable({ loans, onOpen, currentUser, onAccept }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-2.5 text-left ${col.className} text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loans.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="px-4 py-16 text-center">
                <div className="text-muted-foreground text-sm">No loans in this folder yet.</div>
              </td>
            </tr>
          ) : (
            loans.map((loan) => (
              <LoanRow key={loan.id} loan={loan} onOpen={onOpen} currentUser={currentUser} onAccept={onAccept} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}