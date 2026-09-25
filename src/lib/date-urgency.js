// Urgency helpers for finance contingency / closing date countdowns.
// Returns a color object for a date string based on days remaining.
// Color scale (8-day window): 8+ days = green/neutral, 5-7 = yellow, 3-4 = orange, 1-2 = red, 0 or overdue = deep red.

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const due = new Date(dateStr + "T23:59:59");
  const now = new Date();
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

export function dateUrgency(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return null;

  let bg, text, label;
  if (days < 0) {
    bg = "#fee2e2";
    text = "#991b1b";
    label = `${Math.abs(days)}d overdue`;
  } else if (days === 0) {
    bg = "#fecaca";
    text = "#7f1d1d";
    label = "Today";
  } else if (days <= 2) {
    bg = "#fecaca";
    text = "#991b1b";
    label = `${days}d left`;
  } else if (days <= 4) {
    bg = "#fed7aa";
    text = "#9a3412";
    label = `${days}d left`;
  } else if (days <= 7) {
    bg = "#fef3c7";
    text = "#92400e";
    label = `${days}d left`;
  } else {
    bg = "#dcfce7";
    text = "#166534";
    label = `${days}d left`;
  }

  // Progress: 0% at day 8+ (safe), 100% at day 0 (urgent)
  const progress = days <= 0 ? 100 : Math.max(0, Math.min(100, ((8 - days) / 8) * 100));

  return { days, bg, text, label, progress };
}

export function isWithin8Days(dateStr) {
  const days = daysUntil(dateStr);
  return days !== null && days <= 8;
}