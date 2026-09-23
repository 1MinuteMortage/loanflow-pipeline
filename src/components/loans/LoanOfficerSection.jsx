import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import IncomeCalculatorModal from "./IncomeCalculatorModal";

export default function LoanOfficerSection({ form, setForm, saveField, loan }) {
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const calc = loan.income_calculation;

  function handleConfirm(finalIncome, calculation) {
    setForm({ ...form, income: finalIncome });
    saveField({ income: finalIncome, income_calculation: calculation });
    setCalculatorOpen(false);
  }

  return (
    <div className="mt-8 rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-heading text-sm font-semibold text-primary">Loan Officer</h3>
        <span className="text-[10px] font-medium uppercase tracking-wide text-primary/60 bg-primary/10 px-2 py-0.5 rounded">Internal</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Assets</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              type="number"
              value={form.total_assets ?? ""}
              placeholder="Enter text"
              className="pl-7"
              onChange={(e) => {
                const v = e.target.value === "" ? "" : Number(e.target.value);
                setForm({ ...form, total_assets: v });
                saveField({ total_assets: v });
              }}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Credit Score</Label>
          <Input
            type="number"
            value={form.credit_score ?? ""}
            placeholder="Enter text"
            onChange={(e) => {
              const v = e.target.value === "" ? "" : Number(e.target.value);
              setForm({ ...form, credit_score: v });
              saveField({ credit_score: v });
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Monthly Income</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              type="number"
              value={form.income ?? ""}
              placeholder="Enter text"
              className="pl-7"
              onChange={(e) => {
                const v = e.target.value === "" ? "" : Number(e.target.value);
                setForm({ ...form, income: v });
                saveField({ income: v });
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => setCalculatorOpen(true)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {calc ? "Recalculate Income" : "Calculate Income"}
          </button>
        </div>
      </div>

      {calc && (
        <p className="text-xs text-muted-foreground">
          Calculated {calc.completed_date} by {calc.loan_officer_name || "N/A"} — preliminary, subject to underwriter review.
        </p>
      )}

      <IncomeCalculatorModal
        open={calculatorOpen}
        onOpenChange={setCalculatorOpen}
        loan={loan}
        existingCalculation={calc}
        onConfirm={handleConfirm}
      />
    </div>
  );
}