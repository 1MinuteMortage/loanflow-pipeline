// Stage metadata for the loan pipeline
export const STAGES = [
  { key: "pending", label: "App Pending", color: "#f59e0b", bg: "#fef3c7", text: "#92400e" },
  { key: "preapproved", label: "Pre-approved", color: "#10b981", bg: "#d1fae5", text: "#065f46" },
  { key: "under_contract", label: "Under Contract", color: "#8b5cf6", bg: "#ede9fe", text: "#5b21b6" },
  { key: "follow_up", label: "Follow-up", color: "#0284c7", bg: "#e0f2fe", text: "#075985" }
];

export const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.key, s]));

export function fullName(loan) {
  return `${loan.first_name || ""} ${loan.last_name || ""}`.trim() || "Unnamed borrower";
}

// Days remaining until due_date (negative if overdue)
export function daysRemaining(loan) {
  if (!loan.due_date) return null;
  const due = new Date(loan.due_date + "T23:59:59");
  const now = new Date();
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

// SLA urgency color based on days remaining
export function slaColor(days) {
  if (days === null) return "#64748b";
  if (days < 0) return "#ef4444";
  if (days < 2) return "#ef4444";
  if (days < 5) return "#f59e0b";
  return "#10b981";
}

export function slaLabel(days) {
  if (days === null) return "No SLA";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  return `${days}d left`;
}

export function neededSummary(loan) {
  const items = loan.needed_items || [];
  if (items.length === 0) return { total: 0, done: 0, remaining: 0, labels: [] };
  const done = items.filter((i) => i.completed).length;
  return {
    total: items.length,
    done,
    remaining: items.length - done,
    labels: items.filter((i) => !i.completed).map((i) => i.label)
  };
}

// Default checklist templates per stage
export const DEFAULT_CHECKLISTS = {
  pending: ["Credit report", "Income documents (W-2 / paystubs / tax returns)", "Bank statements", "ID verification", "Loan application signed"],
  preapproved: ["Updated credit pull", "Pre-approval letter issued", "Property criteria confirmed"],
  under_contract: ["Purchase contract", "Appraisal ordered", "Title commitment", "Homeowners insurance", "Final loan approval"],
  follow_up: ["Re-contact borrower", "Updated documents", "Decision on resubmission"]
};