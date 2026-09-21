import React from "react";
import { UserCheck, Hand } from "lucide-react";

export default function AssignedToCell({ loan, currentUser, onAccept }) {
  const isUnassignedPending = loan.stage === "pending" && !loan.assigned_to_name;

  if (isUnassignedPending) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAccept(loan);
        }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 transition-colors whitespace-nowrap"
      >
        <Hand className="w-3.5 h-3.5" />
        Accept
      </button>
    );
  }

  if (loan.assigned_to_name) {
    const isMine = currentUser && loan.assigned_to_id === currentUser.id;
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${
          isMine ? "text-primary" : "text-foreground/80"
        }`}
      >
        <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
        {isMine ? "You" : loan.assigned_to_name}
      </span>
    );
  }

  return <span className="text-xs text-muted-foreground">—</span>;
}