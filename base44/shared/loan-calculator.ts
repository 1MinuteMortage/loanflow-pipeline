// Locked loan-program rules (copied from MortgageMaster Pro) shared by the
// public calculator functions. downPercent is the program minimum for the
// client-chosen down payment; the calculator caps it at MAX_DOWN_PERCENT.
export const MAX_DOWN_PERCENT = 0.9;

export const PROGRAM_RULES = {
  "DPA FHA": { downPercent: 0, minDownPercent: 0, downLocked: true, downInOutOfPocket: false, pmi: 45, maxConcessionPercent: 0.06 },
  "30 Year FHA": { downPercent: 0.035, minDownPercent: 0.035, downLocked: false, downInOutOfPocket: true, pmi: 45, maxConcessionPercent: 0.06 },
  "FHA 203k": { downPercent: 0.035, minDownPercent: 0.035, downLocked: false, downInOutOfPocket: true, pmi: 45, maxConcessionPercent: 0.06 },
  "30 Year Conventional": { downPercent: 0.03, minDownPercent: 0.03, downLocked: false, downInOutOfPocket: true, pmi: 45, maxConcessionPercent: 0.03 },
  "VA Loan": { downPercent: 0, minDownPercent: 0, downLocked: false, downInOutOfPocket: true, pmi: 0, maxConcessionPercent: 0.04 },
  "Jumbo": { downPercent: 0.1, minDownPercent: 0.1, downLocked: false, downInOutOfPocket: true, pmi: 45, maxConcessionPercent: 0.03 },
  "DSCR": { downPercent: 0.2, minDownPercent: 0.2, downLocked: false, downInOutOfPocket: true, pmi: 0, maxConcessionPercent: 0.03 },
};

export function getProgramRules(loanType) {
  return PROGRAM_RULES[loanType] || null;
}

// Clamp a client-chosen down payment (percent units, e.g. 3.5) to the program
// minimum and the 90% cap. DPA FHA is always 0.
export function normalizeDownPaymentPercent(loanType, value) {
  const rules = getProgramRules(loanType);
  if (!rules) return null;
  if (rules.downLocked) return 0;
  const min = rules.minDownPercent * 100;
  const max = MAX_DOWN_PERCENT * 100;
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}