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
import { Button } from "@/components/ui/button";

export default function PreapprovalPromptDialog({ open, onOpenChange, loan, onSave }) {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (loan) {
      setAmount(loan.preapproval_amount != null ? String(loan.preapproval_amount) : "");
    }
  }, [loan, open]);

  function handleSave() {
    const parsed = parseFloat(amount);
    onSave({ preapproval_amount: isNaN(parsed) ? null : parsed });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Pre-Approval Amount</DialogTitle>
          <DialogDescription>
            Enter the pre-approved loan dollar amount for this borrower.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              type="number"
              min="0"
              step="1000"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="350000"
              className="pl-7"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Skip for now
          </Button>
          <Button onClick={handleSave}>Save Amount</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}