import { fullName } from "@/lib/loan-utils";

// Builds the professional, underwriter-ready explanation text for a Loan Officer income calculation
export function buildExplanationText(loan, calc) {
  const incomeTypeLabel = calc.income_type === "w2" ? "W-2" : "1099 / Self-Employed";
  const lines = [
    "Income Calculation Summary",
    `Borrower: ${fullName(loan)}`,
  ];
  if (loan.loan_number) lines.push(`Loan Number: ${loan.loan_number}`);
  lines.push(`Income Type: ${incomeTypeLabel}`);
  lines.push(`Income Years Reviewed: ${calc.year_recent} and ${calc.year_prior}`);
  lines.push(`${calc.year_recent} ${incomeTypeLabel === "W-2" ? "W-2 Income" : "AGI"}: $${Number(calc.year_recent_amount).toLocaleString()}`);
  lines.push(`${calc.year_prior} ${incomeTypeLabel === "W-2" ? "W-2 Income" : "AGI"}: $${Number(calc.year_prior_amount).toLocaleString()}`);
  lines.push("");
  const fmt = (n) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  lines.push(
    `Qualifying Income Calculation: The lower of $${fmt(calc.year_recent_amount)} (${calc.year_recent}) or $${fmt(calc.year_prior_amount)} (${calc.year_prior}) = $${fmt(calc.annual_income ?? calc.calculated_income * 12)} annually`
  );
  lines.push(`Monthly Qualifying Income: $${fmt(calc.calculated_income)} per month`);

  lines.push("");
  lines.push(
    `The preliminary qualifying income was calculated using the conservative (lower) of the two most recent applicable ${incomeTypeLabel} income figures entered into the loan processing system, consistent with standard underwriting practice. The resulting figure was used as the preliminary qualifying income for the Loan Officer's pre-approval analysis. Final income eligibility and qualifying income remain subject to review and approval by the lender/underwriter in accordance with applicable underwriting guidelines and documentation requirements.`
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