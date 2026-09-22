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
import { CONTACT_ROLES } from "@/lib/loan-utils";

export default function ContactsPromptDialog({ open, onOpenChange, loan, onSave }) {
  const [contacts, setContacts] = useState({});
  const [propertyAddress, setPropertyAddress] = useState("");
  const [loanNumber, setLoanNumber] = useState("");
  const [financeContingencyDate, setFinanceContingencyDate] = useState("");
  const [closingDate, setClosingDate] = useState("");

  useEffect(() => {
    if (!loan) return;
    const next = {};
    CONTACT_ROLES.forEach((r) => {
      next[`${r.key}_name`] = loan[`${r.key}_name`] || "";
      if (r.key === "closing_attorney") {
        next[`${r.key}_representative_name`] = loan[`${r.key}_representative_name`] || "";
      }
      next[`${r.key}_phone`] = loan[`${r.key}_phone`] || "";
      next[`${r.key}_email`] = loan[`${r.key}_email`] || "";
    });
    setContacts(next);
    setPropertyAddress(loan.property_address || "");
    setLoanNumber(loan.loan_number || "");
    setFinanceContingencyDate(loan.finance_contingency_date || "");
    setClosingDate(loan.closing_date || "");
  }, [loan, open]);

  function updateField(key, value) {
    setContacts((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    onSave({
      ...contacts,
      property_address: propertyAddress,
      loan_number: loanNumber,
      finance_contingency_date: financeContingencyDate,
      closing_date: closingDate,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add Transaction Details</DialogTitle>
          <DialogDescription>
            This loan is now Under Contract. Add the loan number, property address, dates, and contacts involved in this transaction.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[55vh] overflow-y-auto space-y-3 pr-1">
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="text-sm font-semibold text-foreground">Loan &amp; Property</div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Loan Number</Label>
              <Input
                placeholder="e.g. 1234567890"
                value={loanNumber}
                onChange={(e) => setLoanNumber(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Property Address</Label>
              <Input
                placeholder="123 Main St, Austin, TX 78701"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Finance Contingency</Label>
                <Input
                  type="date"
                  value={financeContingencyDate}
                  onChange={(e) => setFinanceContingencyDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Closing Date</Label>
                <Input
                  type="date"
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          {CONTACT_ROLES.map((r) => (
            <div key={r.key} className="space-y-2 rounded-lg border border-border p-3">
              <div className="text-sm font-semibold text-foreground">{r.label}</div>
              {r.key === "closing_attorney" ? (
                <>
                  <Input
                    placeholder="Office Name"
                    value={contacts[`${r.key}_name`] || ""}
                    onChange={(e) => updateField(`${r.key}_name`, e.target.value)}
                  />
                  <Input
                    placeholder="Representative Name"
                    value={contacts[`${r.key}_representative_name`] || ""}
                    onChange={(e) => updateField(`${r.key}_representative_name`, e.target.value)}
                  />
                </>
              ) : (
                <Input
                  placeholder="Name"
                  value={contacts[`${r.key}_name`] || ""}
                  onChange={(e) => updateField(`${r.key}_name`, e.target.value)}
                />
              )}
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Phone"
                  value={contacts[`${r.key}_phone`] || ""}
                  onChange={(e) => updateField(`${r.key}_phone`, e.target.value)}
                />
                <Input
                  placeholder="Email"
                  value={contacts[`${r.key}_email`] || ""}
                  onChange={(e) => updateField(`${r.key}_email`, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Skip for now
          </Button>
          <Button onClick={handleSave}>Save Details</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}