/** Role helpers for Loan Flow Pipeline (Base44 User.role). */

export const APP_ROLES = [
  "admin",
  "loan_officer",
  "loan_officer_assistant",
  "processor",
  "user", // legacy Base44 default — treated like limited LOA
];

export const ROLE_LABELS = {
  admin: "Admin",
  loan_officer: "Loan Officer",
  loan_officer_assistant: "Loan Officer Assistant",
  processor: "Processor",
  user: "User",
};

export function normalizeRole(user) {
  const raw = String(user?.role || user?.app_role || "user").toLowerCase();
  if (raw === "admin") return "admin";
  if (raw === "loan_officer" || raw === "loanofficer" || raw === "lo") return "loan_officer";
  if (
    raw === "loan_officer_assistant" ||
    raw === "loanofficerassistant" ||
    raw === "loa" ||
    raw === "assistant"
  ) {
    return "loan_officer_assistant";
  }
  if (raw === "processor" || raw === "loan_processor") return "processor";
  return "user";
}

export function isAdmin(user) {
  return normalizeRole(user) === "admin";
}

export function isAssignedToLoan(user, loan) {
  if (!user?.id || !loan) return false;
  return (
    loan.loan_officer_id === user.id ||
    loan.loan_processor_id === user.id ||
    loan.assigned_to_id === user.id
  );
}

/** Open full file details only after Accept File (or admin). */
export function canOpenLoanDetails(user, loan) {
  if (!user || !loan) return false;
  if (isAdmin(user)) return true;
  return isAssignedToLoan(user, loan);
}

/** Unassigned file waiting for LOA/LO accept. */
export function needsFileAccept(user, loan) {
  if (!user || !loan) return false;
  if (isAdmin(user) || isAssignedToLoan(user, loan)) return false;
  return !loan.loan_officer_id && !loan.assigned_to_id;
}

/** Whether this user may see the loan in the pipeline list. */
export function canViewLoan(user, loan) {
  if (!user || !loan) return false;
  if (isAdmin(user)) return true;
  if (isAssignedToLoan(user, loan)) return true;
  const role = normalizeRole(user);
  // Allow claiming unassigned files
  if (
    (role === "loan_officer" || role === "loan_officer_assistant") &&
    !loan.loan_officer_id
  ) {
    return true;
  }
  if (role === "processor" && loan.stage === "under_contract" && !loan.loan_processor_id) {
    return true;
  }
  return false;
}

export function canCreateLoan(user) {
  const role = normalizeRole(user);
  return role === "admin" || role === "loan_officer" || role === "loan_officer_assistant";
}

export function canClaimAsOfficer(user) {
  const role = normalizeRole(user);
  return role === "admin" || role === "loan_officer" || role === "loan_officer_assistant";
}

export function canClaimAsProcessor(user) {
  const role = normalizeRole(user);
  return role === "admin" || role === "processor";
}

export function canEditBorrower(user, loan) {
  if (isAdmin(user)) return true;
  const role = normalizeRole(user);
  if (!isAssignedToLoan(user, loan)) return false;
  return (
    role === "loan_officer" ||
    role === "loan_officer_assistant" ||
    role === "user" ||
    role === "processor"
  );
}

export function canEditPreapproval(user, loan) {
  if (isAdmin(user)) return true;
  const role = normalizeRole(user);
  if (!isAssignedToLoan(user, loan)) return false;
  return role === "loan_officer";
}

export function canEditDocuments(user, loan) {
  if (isAdmin(user)) return true;
  if (!isAssignedToLoan(user, loan)) return false;
  const role = normalizeRole(user);
  return (
    role === "loan_officer" ||
    role === "loan_officer_assistant" ||
    role === "processor" ||
    role === "user"
  );
}

export function canEditUwConditions(user, loan) {
  if (isAdmin(user)) return true;
  const role = normalizeRole(user);
  if (!isAssignedToLoan(user, loan)) return false;
  return role === "processor" || role === "loan_officer";
}

export function canChangeStage(user, loan, nextStage) {
  if (isAdmin(user)) return true;
  if (!isAssignedToLoan(user, loan)) return false;
  const role = normalizeRole(user);
  if (role === "loan_officer") {
    return ["pending", "preapproved", "needs_review", "follow_up", "under_contract"].includes(nextStage);
  }
  if (role === "processor") {
    return ["under_contract", "ctc", "closed", "needs_review", "follow_up"].includes(nextStage);
  }
  if (role === "loan_officer_assistant" || role === "user") {
    return ["pending", "follow_up", "needs_review"].includes(nextStage);
  }
  return false;
}

export function canManageUsers(user) {
  return isAdmin(user);
}

export function visibleTabsForRole(user, loan, tabOrder) {
  const role = normalizeRole(user);
  const propertyLocked = !["preapproved", "under_contract", "ctc", "closed"].includes(loan?.stage);
  const contactsLocked = !["under_contract", "ctc", "closed"].includes(loan?.stage);

  return tabOrder
    .map((key) => {
      const tab = { key };
      if (key === "contacts") tab.disabled = contactsLocked;
      if (key === "property") tab.disabled = propertyLocked;
      if (key === "uw") {
        tab.disabled = loan?.stage !== "under_contract" && loan?.stage !== "ctc" && loan?.stage !== "closed";
      }
      // LOA: hide AI assist editing surface for now (read borrower/docs/notes)
      if ((role === "loan_officer_assistant" || role === "user") && key === "ai_assist") {
        tab.disabled = true;
      }
      // Processor focuses on docs/UW/contacts; still can open borrower read/edit lightly
      return tab;
    })
    .filter((t) => {
      if (t.key === "uw") {
        return ["under_contract", "ctc", "closed"].includes(loan?.stage);
      }
      return true;
    });
}
