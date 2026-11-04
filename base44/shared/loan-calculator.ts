// Locked loan-program rules (copied from MortgageMaster Pro) shared by the
// public calculator functions.
export const PROGRAM_RULES = {
  "DPA FHA": { downPercent: 0.035, downInOutOfPocket: false, pmi: 45, maxConcessionPercent: 0.06 },
  "30 Year FHA": { downPercent: 0.035, downInOutOfPocket: true, pmi: 45, maxConcessionPercent: 0.06 },
  "FHA 203k": { downPercent: 0.035, downInOutOfPocket: true, pmi: 45, maxConcessionPercent: 0.06 },
  "30 Year Conventional": { downPercent: 0.03, downInOutOfPocket: true, pmi: 45, maxConcessionPercent: 0.03 },
  "Jumbo": { downPercent: 0.03, downInOutOfPocket: true, pmi: 45, maxConcessionPercent: 0.03 },
  "DSCR": { downPercent: 0.2, downInOutOfPocket: true, pmi: 0, maxConcessionPercent: 0.03 },
  "VA Loan": { downPercent: 0, downInOutOfPocket: true, pmi: 0, maxConcessionPercent: 0.04 },
};

export function getProgramRules(loanType) {
  return PROGRAM_RULES[loanType] || null;
}