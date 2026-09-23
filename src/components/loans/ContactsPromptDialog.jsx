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
  const [loanNumber, setLoanNumber] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [salesPrice, setSalesPrice] = useState("");
  const [sellersConcession, setSellersConcession] = useState("");
  const [sellersConcessionOnContract, setSellersConcessionOnContract] = useState("");
  const [ltv, setLtv] = useState("");
  const [loanType, setLoanType] = useState("");
  const [financeContingencyDate, setFinanceContingencyDate] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [lockDate, setLockDate] = useState("");

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
    setLoanNumber(loan.loan_number || "");
    setPropertyAddress(loan.property_address || "");
    setSalesPrice(loan.sales_price ?? "");
    setSellersConcession(loan.sellers_concession ?? "");
    setSellersConcessionOnContract(loan.sellers_concession_on_contract ?? "");
    setLtv(loan.ltv ?? "");
    setLoanType(loan.loan_type || "");
    setFinanceContingencyDate(loan.finance_contingency_date || "");
    setClosingDate(loan.closing_date || "");
    setLockDate(loan.lock_date || "");
  }, [loan, open]);

  function updateField(key, value) {
    setContacts((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    onSave({
      ...contacts,
      loan_number: loanNumber,
      property_address: propertyAddress,
      sales_price: salesPrice === "" ? null : Number(salesPrice),
      sellers_concession: sellersConcession === "" ? null : Number(sellersConcession),
      sellers_concession_on_contract: sellersConcessionOnContract === "" ? null : Number(sellersConcessionOnContract),
      ltv: ltv === "" ? null : Number(ltv),
      loan_type: loanType,
      finance_contingency_date: financeContingencyDate,
      closing_date: closingDate,
      lock_date: lockDate,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add Transaction Details</DialogTitle>
          <DialogDescription>
            This loan is now Under Contract. Add the loan details, dates, and contacts involved in this transaction.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[55vh] overflow-y-auto space-y-3 pr-1">
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="text-sm font-semibold text-foreground">Loan &amp; Property</div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Loan Number</Label>
              <Input
                placeholder="Enter text"
                value={loanNumber}
                onChange={(e) => setLoanNumber(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Property Address</Label>
              <Input
                placeholder="Enter text"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Sales Price</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="Enter text"
                  value={salesPrice}
                  onChange={(e) => setSalesPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Sellers Concession Needed</Label>
                <Input
                  type="number"
                  min="0"
                  step="500"
                  placeholder="Enter text"
                  value={sellersConcession}
                  onChange={(e) => setSellersConcession(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">LTV (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder="Enter text"
                  value={ltv}
                  onChange={(e) => setLtv(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Loan Type</Label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select...</option>
                  <option value="DPA FHA">DPA FHA</option>
                  <option value="DPA Conventional">DPA Conventional</option>
                  <option value="30 Year FHA">30 Year FHA</option>
                  <option value="FHA 203k">FHA 203k</option>
                  <option value="30 Year Conventional">30 Year Conventional</option>
                  <option value="Jumbo">Jumbo</option>
                  <option value="DSCR">DSCR</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Sellers Concession on Contract</Label>
              <Input
                type="number"
                min="0"
                step="500"
                placeholder="Enter text"
                value={sellersConcessionOnContract}
                onChange={(e) => setSellersConcessionOnContract(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Finance Contingency Date</Label>
              <Input
                type="date"
                value={financeContingencyDate}
                onChange={(e) => setFinanceContingencyDate(e.target.value)}
                className="h-11 text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Closing Date</Label>
              <Input
                type="date"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className="h-11 text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Lock Date</Label>
              <Input
                type="date"
                value={lockDate}
                onChange={(e) => setLockDate(e.target.value)}
                className="h-11 text-base"
              />
            </div>
          </div>
          {CONTACT_ROLES.map((r) => {
            const nameLabel = r.key === "closing_attorney" ? "Closing Office Name" : "Name";
            return (
              <div key={r.key} className="space-y-2 rounded-lg border border-border p-3">
                <div className="text-sm font-semibold text-foreground">{r.label}</div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">{nameLabel}</Label>
                  <Input
                    placeholder="Enter text"
                    value={contacts[`${r.key}_name`] || ""}
                    onChange={(e) => updateField(`${r.key}_name`, e.target.value)}
                  />
                </div>
                {r.key === "closing_attorney" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Representative Name</Label>
                    <Input
                      placeholder="Enter text"
                      value={contacts[`${r.key}_representative_name`] || ""}
                      onChange={(e) => updateField(`${r.key}_representative_name`, e.target.value)}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Phone Number</Label>
                    <Input
                      placeholder="Enter text"
                      value={contacts[`${r.key}_phone`] || ""}
                      onChange={(e) => updateField(`${r.key}_phone`, e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Email</Label>
                    <Input
                      placeholder="Enter text"
                      value={contacts[`${r.key}_email`] || ""}
                      onChange={(e) => updateField(`${r.key}_email`, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
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