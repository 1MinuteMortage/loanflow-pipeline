import { fullName } from "@/lib/loan-utils";
import { derivePayFrequency, PAY_PERIODS_PER_YEAR } from "@/components/loans/IncomeSourceFields";

// Builds the professional, underwriter-ready explanation text for a Loan Officer income calculation
export function buildExplanationText(loan, calc) {
  const fmt = (n) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const incomeTypeLabel = (t) => (t === "hourly" ? "Hourly" : t === "w2" ? "W-2" : "1099 / Self-Employed");

  const lines = [
    "Income Calculation Summary",
    `Borrower: ${fullName(loan)}`,
  ];
  if (loan.loan_number) lines.push(`Loan Number: ${loan.loan_number}`);
  lines.push(`Income Type: ${incomeTypeLabel(calc.income_type)}`);

  function pushSourceDetails(prefix, incomeType, payFreq, payStart, payEnd, hours, rate, yrRecent, amtRecent, yrPrior, amtPrior, monthlyIncome) {
    const label = incomeTypeLabel(incomeType);
    if (incomeType === "hourly") {
      const freqLabel = payFreq === "semimonthly" ? "Semimonthly (twice per month)" : payFreq === "biweekly" ? "Biweekly" : "Weekly";
      const periodsPerYear = PAY_PERIODS_PER_YEAR[payFreq] || 0;
      lines.push(`${prefix} Pay Period: ${payStart} to ${payEnd}`);
      lines.push(`${prefix} Pay Frequency: ${freqLabel} (${periodsPerYear} pay periods/year) — derived from pay period dates`);
      lines.push(`${prefix} Hours Per Pay Period: ${hours}`);
      lines.push(`${prefix} Hourly Rate: $${fmt(rate)}/hr`);
      lines.push("");
      const perPayPeriod = Number(hours) * Number(rate);
      lines.push(`${prefix} Gross Per Pay Period: ${hours} hrs × $${fmt(rate)}/hr = $${fmt(perPayPeriod)}`);
      lines.push(`${prefix} Annual Income: $${fmt(perPayPeriod)} × ${periodsPerYear} pay periods annually`);
      lines.push(`${prefix} Monthly Qualifying Income: $${fmt(monthlyIncome)} per month`);
    } else {
      lines.push(`${prefix} Income Years Reviewed: ${yrRecent} and ${yrPrior}`);
      lines.push(`${prefix} ${yrRecent} ${label === "W-2" ? "W-2 Income" : "AGI"}: $${Number(amtRecent).toLocaleString()}`);
      lines.push(`${prefix} ${yrPrior} ${label === "W-2" ? "W-2 Income" : "AGI"}: $${Number(amtPrior).toLocaleString()}`);
      lines.push("");
      lines.push(`${prefix} Qualifying Income: The lower of $${fmt(amtRecent)} (${yrRecent}) or $${fmt(amtPrior)} (${yrPrior}) annually`);
      lines.push(`${prefix} Monthly Qualifying Income: $${fmt(monthlyIncome)} per month`);
    }
  }

  pushSourceDetails(
    "Primary —",
    calc.income_type,
    calc.pay_frequency,
    calc.pay_period_start_date,
    calc.pay_period_end_date,
    calc.hours_per_pay_period,
    calc.hourly_rate,
    calc.year_recent,
    calc.year_recent_amount,
    calc.year_prior,
    calc.year_prior_amount,
    calc.has_secondary_income ? calc.calculated_income - (calc.secondary_calculated_income || 0) : calc.calculated_income
  );

  if (calc.has_secondary_income) {
    lines.push("");
    pushSourceDetails(
      "Additional —",
      calc.secondary_income_type,
      calc.secondary_pay_frequency,
      calc.secondary_pay_period_start_date,
      calc.secondary_pay_period_end_date,
      calc.secondary_hours_per_pay_period,
      calc.secondary_hourly_rate,
      calc.secondary_year_recent,
      calc.secondary_year_recent_amount,
      calc.secondary_year_prior,
      calc.secondary_year_prior_amount,
      calc.secondary_calculated_income
    );
    lines.push("");
    lines.push(`Total Monthly Qualifying Income: $${fmt(calc.calculated_income)} per month (Primary + Additional)`);
    lines.push(`Total Annual Income: $${fmt(calc.annual_income)} annually`);
  }

  lines.push("");
  lines.push(
    `The preliminary qualifying income was calculated using the conservative (lower) of the two most recent applicable income figures entered into the loan processing system, consistent with standard underwriting practice. The resulting figure was used as the preliminary qualifying income for the Loan Officer's pre-approval analysis. Final income eligibility and qualifying income remain subject to review and approval by the lender/underwriter in accordance with applicable underwriting guidelines and documentation requirements.`
  );
  lines.push("");
  lines.push(`Calculation Completed By: ${calc.loan_officer_name || "N/A"}`);
  lines.push(`Date Completed: ${calc.completed_date}`);
  lines.push("");
  lines.push(
    "This is a preliminary Loan Officer calculation and remains subject to lender/underwriter review and applicable underwriting guidelines."
  );

  return lines.join("\n");
}

// Exports the explanation as a professionally formatted PDF
export async function exportExplanationPdf(loan, explanationText) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const marginX = 15;
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Loan Officer Income Calculation — Underwriter Explanation", marginX, y);
  y += 10;

  doc.setDrawColor(200);
  doc.line(marginX, y, 195, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(explanationText, 180);
  lines.forEach((line) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, marginX, y);
    y += 5.5;
  });

  const safeName = fullName(loan).replace(/\s+/g, "_");
  doc.save(`Income_Explanation_${safeName}.pdf`);
}