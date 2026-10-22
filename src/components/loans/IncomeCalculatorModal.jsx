import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import IncomeSourceFields, { calculateSourceIncome, validateSource, EMPTY_SOURCE } from "./IncomeSourceFields";
import { buildExplanationText, exportExplanationPdf } from "@/lib/income-calculator-utils";
import { base44 } from "@/api/base44Client";

export default function IncomeCalculatorModal({ open, onOpenChange, loan, existingCalculation, onConfirm }) {
  const currentYear = new Date().getFullYear();
  const yearRecent = currentYear - 1;
  const yearPrior = currentYear - 2;

  const [primarySource, setPrimarySource] = useState({ ...EMPTY_SOURCE });
  const [hasSecondary, setHasSecondary] = useState(false);
  const [secondarySource, setSecondarySource] = useState({ ...EMPTY_SOURCE });
  const [loanOfficerName, setLoanOfficerName] = useState("");
  const [explanationText, setExplanationText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (existingCalculation) {
      setPrimarySource({
        incomeType: existingCalculation.income_type || "",
        amountRecent: existingCalculation.year_recent_amount != null ? String(existingCalculation.year_recent_amount) : "",
        amountPrior: existingCalculation.year_prior_amount != null ? String(existingCalculation.year_prior_amount) : "",
        payPeriodStart: existingCalculation.pay_period_start_date || "",
        payPeriodEnd: existingCalculation.pay_period_end_date || "",
        hoursPerPayPeriod: existingCalculation.hours_per_pay_period != null ? String(existingCalculation.hours_per_pay_period) : "",
        hourlyRate: existingCalculation.hourly_rate != null ? String(existingCalculation.hourly_rate) : "",
      });
      const hasSec = !!existingCalculation.has_secondary_income;
      setHasSecondary(hasSec);
      setSecondarySource({
        incomeType: existingCalculation.secondary_income_type || "",
        amountRecent: existingCalculation.secondary_year_recent_amount != null ? String(existingCalculation.secondary_year_recent_amount) : "",
        amountPrior: existingCalculation.secondary_year_prior_amount != null ? String(existingCalculation.secondary_year_prior_amount) : "",
        payPeriodStart: existingCalculation.secondary_pay_period_start_date || "",
        payPeriodEnd: existingCalculation.secondary_pay_period_end_date || "",
        hoursPerPayPeriod: existingCalculation.secondary_hours_per_pay_period != null ? String(existingCalculation.secondary_hours_per_pay_period) : "",
        hourlyRate: existingCalculation.secondary_hourly_rate != null ? String(existingCalculation.secondary_hourly_rate) : "",
      });
      setLoanOfficerName(existingCalculation.loan_officer_name || "");
      setExplanationText(existingCalculation.explanation_text || "");
    } else {
      setPrimarySource({ ...EMPTY_SOURCE });
      setHasSecondary(false);
      setSecondarySource({ ...EMPTY_SOURCE });
      setExplanationText("");
      base44.auth.me().then((u) => setLoanOfficerName(loan.loan_officer_name || u?.full_name || "")).catch(() => {
        setLoanOfficerName(loan.loan_officer_name || "");
      });
    }
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const primaryCalc = calculateSourceIncome(primarySource);
  const secondaryCalc = hasSecondary ? calculateSourceIncome(secondarySource) : { calculatedIncome: null, annualIncome: null };
  const totalMonthly = (primaryCalc.calculatedIncome || 0) + (hasSecondary ? secondaryCalc.calculatedIncome || 0 : 0);
  const totalAnnual = (primaryCalc.annualIncome || 0) + (hasSecondary ? secondaryCalc.annualIncome || 0 : 0);
  const canCalculate = primaryCalc.calculatedIncome !== null && (!hasSecondary || secondaryCalc.calculatedIncome !== null);

  function buildCalculation() {
    return {
      income_type: primarySource.incomeType,
      pay_frequency: primarySource.incomeType === "hourly" ? primaryCalc.payFrequency : null,
      pay_period_start_date: primarySource.incomeType === "hourly" ? primarySource.payPeriodStart : null,
      pay_period_end_date: primarySource.incomeType === "hourly" ? primarySource.payPeriodEnd : null,
      hours_per_pay_period: primarySource.incomeType === "hourly" ? Number(primarySource.hoursPerPayPeriod) : null,
      hourly_rate: primarySource.incomeType === "hourly" ? Number(primarySource.hourlyRate) : null,
      year_recent: primarySource.incomeType === "hourly" ? null : yearRecent,
      year_recent_amount: primarySource.incomeType === "hourly" ? null : Number(primarySource.amountRecent),
      year_prior: primarySource.incomeType === "hourly" ? null : yearPrior,
      year_prior_amount: primarySource.incomeType === "hourly" ? null : Number(primarySource.amountPrior),
      calculated_income: totalMonthly,
      annual_income: totalAnnual,
      has_secondary_income: hasSecondary,
      secondary_income_type: hasSecondary ? secondarySource.incomeType : null,
      secondary_pay_frequency: hasSecondary && secondarySource.incomeType === "hourly" ? secondaryCalc.payFrequency : null,
      secondary_pay_period_start_date: hasSecondary && secondarySource.incomeType === "hourly" ? secondarySource.payPeriodStart : null,
      secondary_pay_period_end_date: hasSecondary && secondarySource.incomeType === "hourly" ? secondarySource.payPeriodEnd : null,
      secondary_hours_per_pay_period: hasSecondary && secondarySource.incomeType === "hourly" ? Number(secondarySource.hoursPerPayPeriod) : null,
      secondary_hourly_rate: hasSecondary && secondarySource.incomeType === "hourly" ? Number(secondarySource.hourlyRate) : null,
      secondary_year_recent: hasSecondary && secondarySource.incomeType !== "hourly" ? yearRecent : null,
      secondary_year_recent_amount: hasSecondary && secondarySource.incomeType !== "hourly" ? Number(secondarySource.amountRecent) : null,
      secondary_year_prior: hasSecondary && secondarySource.incomeType !== "hourly" ? yearPrior : null,
      secondary_year_prior_amount: hasSecondary && secondarySource.incomeType !== "hourly" ? Number(secondarySource.amountPrior) : null,
      secondary_calculated_income: hasSecondary ? secondaryCalc.calculatedIncome : null,
      secondary_annual_income: hasSecondary ? secondaryCalc.annualIncome : null,
      override_amount: null,
      override_reason: "",
      final_income: totalMonthly,
      loan_officer_name: loanOfficerName,
      completed_date: new Date().toISOString().slice(0, 10),
      explanation_text: explanationText,
    };
  }

  function validate() {
    const primaryErr = validateSource(primarySource, yearRecent, yearPrior);
    if (primaryErr) return primaryErr;
    if (hasSecondary) {
      const secondaryErr = validateSource(secondarySource, yearRecent, yearPrior);
      if (secondaryErr) return secondaryErr;
    }
    if (!loanOfficerName.trim()) return "Enter the name of the Loan Officer completing this calculation.";
    return "";
  }

  function handleExplain() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    const calc = buildCalculation();
    const text = buildExplanationText(loan, calc);
    setExplanationText(text);
  }

  function handleExportPdf() {
    const calc = buildCalculation();
    const text = explanationText || buildExplanationText(loan, calc);
    exportExplanationPdf(loan, text);
  }

  function handleConfirm() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    const calc = buildCalculation();
    const finalText = explanationText || buildExplanationText(loan, calc);
    onConfirm(calc.final_income, { ...calc, explanation_text: finalText });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Calculate Income</DialogTitle>
          <DialogDescription>
            Determine the preliminary qualifying income using two years of source income figures. The lower of the two years is used as the conservative qualifying income.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <IncomeSourceFields
            source={primarySource}
            onChange={setPrimarySource}
            yearRecent={yearRecent}
            yearPrior={yearPrior}
            title="Primary Source of Income"
          />

          {hasSecondary && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Additional Source of Income</p>
                <button
                  type="button"
                  onClick={() => { setHasSecondary(false); setSecondarySource({ ...EMPTY_SOURCE }); }}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remove
                </button>
              </div>
              <IncomeSourceFields
                source={secondarySource}
                onChange={setSecondarySource}
                yearRecent={yearRecent}
                yearPrior={yearPrior}
              />
            </div>
          )}

          {canCalculate && (
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm space-y-1">
              {hasSecondary && (
                <p className="text-muted-foreground">
                  Primary Monthly Income: ${(primaryCalc.calculatedIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                </p>
              )}
              {hasSecondary && (
                <p className="text-muted-foreground">
                  Additional Monthly Income: ${(secondaryCalc.calculatedIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                </p>
              )}
              <p className="font-semibold text-base">
                Total Monthly Qualifying Income: ${totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Loan Officer Name</Label>
            <Input
              value={loanOfficerName}
              onChange={(e) => setLoanOfficerName(e.target.value)}
              placeholder="Enter text"
            />
          </div>

          {!hasSecondary && (
            <button
              type="button"
              onClick={() => setHasSecondary(true)}
              className="text-xs font-medium text-primary hover:underline"
            >
              + Add Additional Source of Income
            </button>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {explanationText && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Underwriter-Ready Explanation
              </Label>
              <pre className="whitespace-pre-wrap rounded-md border border-border bg-muted/40 p-3 text-xs leading-relaxed font-body">
                {explanationText}
              </pre>
              <Button type="button" variant="outline" size="sm" onClick={handleExportPdf}>
                Export PDF
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="secondary" onClick={handleExplain} disabled={!canCalculate}>
            Explain Income Calculation
          </Button>
          <Button onClick={handleConfirm} disabled={!canCalculate}>
            Confirm &amp; Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}