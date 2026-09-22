// Stage metadata for the loan pipeline (active stages shown in folders & dropdown)
export const STAGES = [
  { key: "pending", label: "App Pending", color: "#f59e0b", bg: "#fef3c7", text: "#92400e" },
  { key: "preapproved", label: "Pre-approved", color: "#10b981", bg: "#d1fae5", text: "#065f46" },
  { key: "under_contract", label: "Under Contract", color: "#8b5cf6", bg: "#ede9fe", text: "#5b21b6" },
  { key: "ctc", label: "CTC", color: "#0284c7", bg: "#e0f2fe", text: "#075985" },
  { key: "closed", label: "Closed", color: "#059669", bg: "#d1fae5", text: "#065f46" }
];

// Full map (includes retired stages so existing loans still render their badge)
export const STAGE_MAP = {
  pending: { key: "pending", label: "App Pending", color: "#f59e0b", bg: "#fef3c7", text: "#92400e" },
  preapproved: { key: "preapproved", label: "Pre-approved", color: "#10b981", bg: "#d1fae5", text: "#065f46" },
  under_contract: { key: "under_contract", label: "Under Contract", color: "#8b5cf6", bg: "#ede9fe", text: "#5b21b6" },
  ctc: { key: "ctc", label: "CTC", color: "#0284c7", bg: "#e0f2fe", text: "#075985" },
  closed: { key: "closed", label: "Closed", color: "#059669", bg: "#d1fae5", text: "#065f46" },
  needs_review: { key: "needs_review", label: "Needs Review", color: "#f43f5e", bg: "#ffe4e6", text: "#9f1239" },
  follow_up: { key: "follow_up", label: "Follow-up", color: "#0284c7", bg: "#e0f2fe", text: "#075985" }
};

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

// Days-remaining countdown for a date string (e.g. "9 days", "Today", "3d overdue")
export function dateCountdown(dateStr) {
  if (!dateStr) return null;
  const due = new Date(dateStr + "T23:59:59");
  const now = new Date();
  const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  return `${days} days`;
}

// Outstanding documents to reach out about — UW conditions when under contract, else pre-UW documents
export function documentsNeededSummary(loan) {
  const items = loan.stage === "under_contract" ? (loan.uw_conditions || []) : (loan.needed_items || []);
  if (items.length === 0) return { total: 0, done: 0, remaining: 0, labels: [] };
  const done = items.filter((i) => i.completed).length;
  return {
    total: items.length,
    done,
    remaining: items.length - done,
    labels: items.filter((i) => !i.completed).map((i) => i.label)
  };
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

// Pre UnderWrite documents — same default set for every profile
export const DEFAULT_PRE_UW_DOCUMENTS = [
  "ID",
  "Paystubs",
  "W-2 / Tax Returns",
  "Bank Statements",
  "Credit Report"
];

export const DEFAULT_UW_CONDITIONS = [
  "1003",
  "Purchase and Sale",
  "Loan Estimate",
  "Home Insurance",
  "VWOE / Work Number",
  "Title Commitment, CPL, E&O, Tax cert, Wire Instructions, Title Invoice",
  "Appraisal"
];

export const CONTACT_ROLES = [
  { key: "buyer_agent", label: "Buyer Agent" },
  { key: "selling_agent", label: "Selling Agent" },
  { key: "underwriter", label: "Underwriter" },
  { key: "closing_attorney", label: "Closing Attorney" },
  { key: "appraiser", label: "Appraiser" }
];

export function getContacts(loan) {
  return CONTACT_ROLES.map((r) => {
    const name = loan[`${r.key}_name`] || "";
    const repName = r.key === "closing_attorney" ? (loan[`${r.key}_representative_name`] || "") : "";
    const displayName = repName ? `${name} — ${repName}` : name;
    return {
      role: r.label,
      name: displayName,
      phone: loan[`${r.key}_phone`] || "",
      email: loan[`${r.key}_email`] || ""
    };
  }).filter((c) => c.name);
}