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

const LOAN_TYPES = [
  "DPA FHA",
  "30 Year FHA",
  "FHA 203k",
  "30 Year Conventional",
  "VA Loan",
  "Jumbo",
  "DSCR",
];

export default function PreapprovalPromptDialog({ open, onOpenChange, loan, onSave }) {
  const [amount, setAmount] = useState("");
  const [loanType, setLoanType] = useState("");
  const [concession, setConcession] = useState("");
  const [rate, setRate] = useState("");

  useEffect(() => {
    if (loan) {
      setAmount(loan.preapproval_amount != null ? String(loan.preapproval_amount) : "");
      setLoanType(loan.loan_type || "");
      setConcession(loan.sellers_concession != null ? String(loan.sellers_concession) : "");
      setRate(loan.interest_rate != null ? String(loan.interest_rate) : "");
    }
  }, [loan, open]);

  function handleSave() {
    const parsedAmount = parseFloat(amount);
    const parsedConcession = parseFloat(concession);
    const parsedRate = parseFloat(rate);
    onSave({
      preapproval_amount: isNaN(parsedAmount) ? null : parsedAmount,
      loan_type: loanType || null,
      sellers_concession: isNaN(parsedConcession) ? null : parsedConcession,
      interest_rate: isNaN(parsedRate) ? null : parsedRate,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Pre-Approval Details</DialogTitle>
          <DialogDescription>
            Enter the pre-approved amount, loan type, interest rate, and seller concessions for this borrower.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pre-Approved Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="number"
                min="0"
                step="1000"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter text"
                className="pl-7"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Loan Type</Label>
            <select
              value={loanType}
              onChange={(e) => setLoanType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select...</option>
              {LOAN_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Interest Rate</Label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                step="0.001"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="Enter text"
                className="pr-7"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sellers Concession Needed</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="number"
                min="0"
                step="500"
                value={concession}
                onChange={(e) => setConcession(e.target.value)}
                placeholder="Enter text"
                className="pl-7"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Skip for now
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}