/** Helpers for LOS Loan.notes — internal CRM tag vs LO-entered remarks. */

const CLIENT_ID_PREFIX = "1MM_CLIENT_ID:";

export function extractClientIdFromNotes(notes) {
  if (typeof notes !== "string") return null;
  const m = notes.match(/1MM_CLIENT_ID:([0-9a-f-]{36})/i);
  return m?.[1] || null;
}

/** Strip internal CRM/LOA sync blocks — what the LO should see and edit. */
export function stripInternalNotesTags(notes) {
  if (typeof notes !== "string") return "";
  return notes
    .replace(/^1MM_CLIENT_ID:[0-9a-f-]{36}\n?/i, "")
    .replace(/^Borrower phone:.*$/gim, "")
    .replace(/^LOA profile:[\s\S]*?(?=\n\n|$)/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function loRemarksDisplay(notes) {
  return stripInternalNotesTags(notes);
}

/** Persist LO text while keeping the hidden CRM client-id tag for sync.
 * IMPORTANT: do not trim while the user is typing — trailing spaces must remain
 * or the remarks box appears to "eat" spaces / break sentence formatting.
 */
export function mergeLoRemarks(existingNotes, loRemarkText, { trim = false } = {}) {
  const clientId = extractClientIdFromNotes(existingNotes);
  let text = String(loRemarkText ?? "");
  if (trim) text = text.trim();
  const tag = clientId ? `${CLIENT_ID_PREFIX}${clientId}` : "";
  if (tag && text) return `${tag}\n${text}`;
  if (tag) return tag;
  return text;
}
