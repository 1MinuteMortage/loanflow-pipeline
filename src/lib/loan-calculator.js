// Client-side calculator rules copied from MortgageMaster Pro.
// Mirrors base44/shared/loan-calculator.ts (the platform keeps server and
// frontend code in separate bundles, so the locked program table lives in both).
export const PROGRAM_RULES = {
  "DPA FHA": { downPercent: 0.035, downInOutOfPocket: false, pmi: 45, maxConcessionPercent: 0.06 },
  "30 Year FHA": { downPercent: 0.035, downInOutOfPocket: true, pmi: 45, maxConcessionPercent: 0.06 },
  "FHA 203k": { downPercent: 0.035, downInOutOfPocket: true, pmi: 45, maxConcessionPercent: 0.06 },
  "30 Year Conventional": { downPercent: 0.03, downInOutOfPocket: true, pmi: 45, maxConcessionPercent: 0.03 },
  "Jumbo": { downPercent: 0.03, downInOutOfPocket: true, pmi: 45, maxConcessionPercent: 0.03 },
  "DSCR": { downPercent: 0.2, downInOutOfPocket: true, pmi: 0, maxConcessionPercent: 0.03 },
  "VA Loan": { downPercent: 0, downInOutOfPocket: true, pmi: 0, maxConcessionPercent: 0.04 },
};

export const INSURANCE_MONTHLY = 125;

export function getProgramRules(loanType) {
  return PROGRAM_RULES[loanType] || null;
}

export function calcMonthlyPI(loanAmount, annualRatePercent) {
  const n = 360; // 30-year fixed
  const amount = Math.max(0, Number(loanAmount) || 0);
  const r = (Number(annualRatePercent) || 0) / 100 / 12;
  if (amount === 0) return 0;
  if (r === 0) return amount / n;
  return (amount * r) / (1 - Math.pow(1 + r, -n));
}

export function calculateQuote({ loanType, interestRate, salesPrice, monthlyTaxes, hoaDues, concession }) {
  const rules = getProgramRules(loanType);
  if (!rules) return null;
  const sales = Math.max(0, Number(salesPrice) || 0);
  const taxes = Math.max(0, Number(monthlyTaxes) || 0);
  const hoa = Math.max(0, Number(hoaDues) || 0);
  const requested = Math.max(0, Number(concession) || 0);
  const maxConcession = sales * rules.maxConcessionPercent;
  const effectiveConcession = Math.min(requested, maxConcession);
  const downPayment = sales * rules.downPercent;
  const loanAmount = sales - downPayment;
  const principalAndInterest = calcMonthlyPI(loanAmount, interestRate);
  const monthlyPayment =
    principalAndInterest + taxes + hoa + INSURANCE_MONTHLY + rules.pmi;
  const closingCosts = sales * 0.03;
  const downOutOfPocket = rules.downInOutOfPocket ? downPayment : 0;
  const totalOutOfPocket = Math.max(0, downOutOfPocket + closingCosts - effectiveConcession);
  return {
    rules,
    downPayment,
    loanAmount,
    principalAndInterest,
    monthlyPayment,
    closingCosts,
    maxConcession,
    effectiveConcession,
    concessionCapped: requested > maxConcession && sales > 0,
    totalOutOfPocket,
  };
}

export function formatUSD(value, decimals = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value) || 0);
}