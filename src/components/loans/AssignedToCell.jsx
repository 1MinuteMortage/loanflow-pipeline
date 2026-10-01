import React from "react";
import { UserCheck, Hand, Lock } from "lucide-react";
import { canClaimAsOfficer, canClaimAsProcessor } from "@/lib/permissions";

export default function AssignedToCell({ loan, currentUser, onAccept }) {
  const isUnderContract = loan.stage === "under_contract";
  const officerName = loan.loan_officer_name;
  const processorName = loan.loan_processor_name;
  const canOfficer = canClaimAsOfficer(currentUser);
  const canProcessor = canClaimAsProcessor(currentUser);

  const renderRole = (role, name, enabled) => {
    if (name) {
      const isMine =
        currentUser &&
        (role === "officer"
          ? loan.loan_officer_id === currentUser.id
          : loan.loan_processor_id === currentUser.id);
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${
            isMine ? "text-primary" : "text-foreground/80"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
          {isMine ? "You" : name}
        </span>
      );
    }

    const allowed = role === "officer" ? canOfficer : canProcessor;
    if (!enabled || !allowed) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-muted/60 text-muted-foreground/50 border border-border whitespace-nowrap cursor-not-allowed">
          <Lock className="w-3.5 h-3.5" />
          {role === "officer" ? "Loan Officer" : "Loan Processor"}
        </span>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAccept(loan, role);
        }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 transition-colors whitespace-nowrap"
      >
        <Hand className="w-3.5 h-3.5" />
        {role === "officer" ? "Loan Officer" : "Loan Processor"}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground w-16 shrink-0">
          Officer
        </span>
        {renderRole("officer", officerName, true)}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground w-16 shrink-0">
          Processor
        </span>
        {renderRole("processor", processorName, isUnderContract)}
      </div>
    </div>
  );
}
