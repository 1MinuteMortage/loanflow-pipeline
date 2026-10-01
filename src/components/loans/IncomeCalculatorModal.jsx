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
import { fullName } from "@/lib/loan-utils";
import { buildExplanationText, exportExplanationPdf } from "@/lib/income-calculator-utils";
import { base44 } from "@/api/base44Client";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

export default function IncomeCalculatorModal({ open, onOpenChange, loan, existingCalculation, onConfirm }) {
  const currentYear = new Date().getFullYear();
  const yearRecent = currentYear - 1;
  const yearPrior = currentYear - 2;

  const [incomeType, setIncomeType] = useState("");
  const [amountRecent, setAmountRecent] = useState("");
  const [amountPrior, setAmountPrior] = useState("");
  const [payFrequency, setPayFrequency] = useState("");
  const [hoursPerPayPeriod, setHoursPerPayPeriod] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [loanOfficerName, setLoanOfficerName] = useState("");
  const [explanationText, setExplanationText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (existingCalculation) {
      setIncomeType(existingCalculation.income_type || "");
      setAmountRecent(existingCalculation.year_recent_amount != null ? String(existingCalculation.year_recent_amount) : "");
      setAmountPrior(existingCalculation.year_prior_amount != null ? String(existingCalculation.year_prior_amount) : "");
      setPayFrequency(existingCalculation.pay_frequency || "");
      setHoursPerPayPeriod(existingCalculation.hours_per_pay_period != null ? String(existingCalculation.hours_per_pay_period) : "");
      setHourlyRate(existingCalculation.hourly_rate != null ? String(existingCalculation.hourly_rate) : "");
      setLoanOfficerName(existingCalculation.loan_officer_name || "");
      setExplanationText(existingCalculation.explanation_text || "");
    } else {
      setIncomeType("");
      setAmountRecent("");
      setAmountPrior("");
      setPayFrequency("");
      setHoursPerPayPeriod("");
      setHourlyRate("");
      setExplanationText("");
      base44.auth.me().then((u) => setLoanOfficerName(loan.loan_officer_name || u?.full_name || "")).catch(() => {
        setLoanOfficerName(loan.loan_officer_name || "");
      });
    }
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const PAY_PERIODS_PER_YEAR = { weekly: 52, biweekly: 26, semimonthly: 24 };

  // Conservative calculation: use the lower of the two years, then divide by 12 for monthly
  const annualIncome =
    incomeType === "hourly"
      ? payFrequency && hoursPerPayPeriod !== "" && hourlyRate !== ""
        ? Number(hoursPerPayPeriod) * Number(hourlyRate) * PAY_PERIODS_PER_YEAR[payFrequency]
        : null
      : amountRecent !== "" && amountPrior !== ""
        ? Math.min(Number(amountRecent), Number(amountPrior))
        : null;
  const calculatedIncome = annualIncome != null ? Math.round((annualIncome / 12) * 100) / 100 : null;

  function buildCalculation() {
    return {
      income_type: incomeType,
      pay_frequency: incomeType === "hourly" ? payFrequency : null,
      hours_per_pay_period: incomeType === "hourly" ? Number(hoursPerPayPeriod) : null,
      hourly_rate: incomeType === "hourly" ? Number(hourlyRate) : null,
      year_recent: incomeType === "hourly" ? null : yearRecent,
      year_recent_amount: incomeType === "hourly" ? null : Number(amountRecent),
      year_prior: incomeType === "hourly" ? null : yearPrior,
      year_prior_amount: incomeType === "hourly" ? null : Number(amountPrior),
      calculated_income: calculatedIncome,
      annual_income: annualIncome,
      override_amount: null,
      override_reason: "",
      final_income: calculatedIncome,
      loan_officer_name: loanOfficerName,
      completed_date: new Date().toISOString().slice(0, 10),
      explanation_text: explanationText,
    };
  }

  function validate() {
    if (!incomeType) return "Select an income type.";
    if (incomeType === "hourly") {
      if (!payFrequency) return "Select the pay frequency (weekly, biweekly, or semimonthly).";
      if (hoursPerPayPeriod === "") return "Enter the hours worked per pay period.";
      if (hourlyRate === "") return "Enter the hourly rate.";
    } else {
      if (amountRecent === "" || amountPrior === "") return `Enter ${yearRecent} and ${yearPrior} income amounts to calculate.`;
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
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Income Type</Label>
            <select value={incomeType} onChange={(e) => setIncomeType(e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              <option value="w2">W-2</option>
              <option value="1099">1099 / Self-Employed</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>

          {incomeType === "hourly" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pay Frequency</Label>
                <select value={payFrequency} onChange={(e) => setPayFrequency(e.target.value)} className={selectClass}>
                  <option value="">Select...</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="semimonthly">Semimonthly (twice/month)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hours Per Pay Period</Label>
                  <Input
                    type="number"
                    value={hoursPerPayPeriod}
                    onChange={(e) => setHoursPerPayPeriod(e.target.value)}
                    placeholder="Enter hours"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hourly Rate</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="Enter rate"
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {incomeType && incomeType !== "hourly" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {yearRecent} {incomeType === "w2" ? "W-2 Income" : "AGI"}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    value={amountRecent}
                    onChange={(e) => setAmountRecent(e.target.value)}
                    placeholder="Enter text"
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {yearPrior} {incomeType === "w2" ? "W-2 Income" : "AGI"}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    value={amountPrior}
                    onChange={(e) => setAmountPrior(e.target.value)}
                    placeholder="Enter text"
                    className="pl-7"
                  />
                </div>
              </div>
            </div>
          )}

          {calculatedIncome !== null && (
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm space-y-1">
              {incomeType === "hourly" ? (
                <>
                  <p className="text-muted-foreground">
                    Gross Per Pay Period = {Number(hoursPerPayPeriod)} hrs × ${Number(hourlyRate).toLocaleString()}/hr = ${(Number(hoursPerPayPeriod) * Number(hourlyRate)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-muted-foreground">
                    Annual Income = ${(Number(hoursPerPayPeriod) * Number(hourlyRate)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × {PAY_PERIODS_PER_YEAR[payFrequency]} {payFrequency === "semimonthly" ? "pay periods" : "weeks"} / yr
                  </p>
                  <p className="text-muted-foreground">
                    Monthly Qualifying Income = ${annualIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ÷ 12
                  </p>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">
                    Conservative Annual Income = lower of ${Number(amountRecent).toLocaleString()} or ${Number(amountPrior).toLocaleString()}
                  </p>
                  <p className="text-muted-foreground">
                    Monthly Qualifying Income = ${annualIncome.toLocaleString()} ÷ 12
                  </p>
                </>
              )}
              <p className="font-semibold">
                Preliminary Monthly Qualifying Income: ${calculatedIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
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
          <Button type="button" variant="secondary" onClick={handleExplain} disabled={calculatedIncome === null}>
            Explain Income Calculation
          </Button>
          <Button onClick={handleConfirm} disabled={calculatedIncome === null}>
            Confirm &amp; Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}