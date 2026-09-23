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
  const [overrideValue, setOverrideValue] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [loanOfficerName, setLoanOfficerName] = useState("");
  const [explanationText, setExplanationText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (existingCalculation) {
      setIncomeType(existingCalculation.income_type || "");
      setAmountRecent(existingCalculation.year_recent_amount != null ? String(existingCalculation.year_recent_amount) : "");
      setAmountPrior(existingCalculation.year_prior_amount != null ? String(existingCalculation.year_prior_amount) : "");
      setOverrideValue(existingCalculation.final_income != null ? String(existingCalculation.final_income) : "");
      setOverrideReason(existingCalculation.override_reason || "");
      setLoanOfficerName(existingCalculation.loan_officer_name || "");
      setExplanationText(existingCalculation.explanation_text || "");
    } else {
      setIncomeType("");
      setAmountRecent("");
      setAmountPrior("");
      setOverrideValue("");
      setOverrideReason("");
      setExplanationText("");
      base44.auth.me().then((u) => setLoanOfficerName(loan.loan_officer_name || u?.full_name || "")).catch(() => {
        setLoanOfficerName(loan.loan_officer_name || "");
      });
    }
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const calculatedIncome =
    amountRecent !== "" && amountPrior !== ""
      ? (Number(amountRecent) + Number(amountPrior)) / 2
      : null;

  useEffect(() => {
    if (calculatedIncome !== null && overrideValue === "") {
      setOverrideValue(String(Math.round(calculatedIncome)));
    }
  }, [calculatedIncome]);

  function buildCalculation() {
    const finalIncome = overrideValue === "" ? calculatedIncome : Number(overrideValue);
    const isOverride = calculatedIncome !== null && finalIncome !== Math.round(calculatedIncome) && finalIncome !== calculatedIncome;
    return {
      income_type: incomeType,
      year_recent: yearRecent,
      year_recent_amount: Number(amountRecent),
      year_prior: yearPrior,
      year_prior_amount: Number(amountPrior),
      calculated_income: calculatedIncome,
      override_amount: isOverride ? finalIncome : null,
      override_reason: isOverride ? overrideReason : "",
      final_income: finalIncome,
      loan_officer_name: loanOfficerName,
      completed_date: new Date().toISOString().slice(0, 10),
      explanation_text: explanationText,
    };
  }

  function validate() {
    if (!incomeType) return "Select whether the borrower has W-2 or 1099 / Self-Employed income.";
    if (amountRecent === "" || amountPrior === "") return `Enter ${yearRecent} and ${yearPrior} income amounts to calculate.`;
    const finalIncome = overrideValue === "" ? calculatedIncome : Number(overrideValue);
    if (finalIncome !== calculatedIncome && !overrideReason.trim()) {
      return "An override reason is required when changing the calculated income.";
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
            Determine the preliminary qualifying income using two years of source income figures.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Income Type</Label>
            <select value={incomeType} onChange={(e) => setIncomeType(e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              <option value="w2">W-2</option>
              <option value="1099">1099 / Self-Employed</option>
            </select>
          </div>

          {incomeType && (
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
              <p className="text-muted-foreground">
                Qualifying Income = (${Number(amountRecent).toLocaleString()} + ${Number(amountPrior).toLocaleString()}) ÷ 2
              </p>
              <p className="font-semibold">
                Calculated Preliminary Qualifying Income: ${Math.round(calculatedIncome).toLocaleString()}
              </p>
            </div>
          )}

          {calculatedIncome !== null && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Final Income (edit to override the calculated value)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>
          )}

          {calculatedIncome !== null && Number(overrideValue) !== Math.round(calculatedIncome) && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Override Reason (required)</Label>
              <Input
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Explain why the calculated income was adjusted"
              />
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