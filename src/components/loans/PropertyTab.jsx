import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PropertyTab({ form, setForm, saveField }) {
  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Loan Number</Label>
        <Input
          value={form.loan_number || ""}
          onChange={(e) => {
            setForm({ ...form, loan_number: e.target.value });
            saveField({ loan_number: e.target.value });
          }}
          placeholder="e.g. 1234567890"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Property Address</Label>
        <Input
          value={form.property_address || ""}
          onChange={(e) => {
            setForm({ ...form, property_address: e.target.value });
            saveField({ property_address: e.target.value });
          }}
          placeholder="123 Main St, Austin, TX 78701"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sales Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              type="number"
              min="0"
              step="1000"
              value={form.sales_price ?? ""}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                setForm({ ...form, sales_price: val });
                saveField({ sales_price: val });
              }}
              placeholder="350000"
              className="pl-7"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sellers Concession</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              type="number"
              min="0"
              step="500"
              value={form.sellers_concession ?? ""}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                setForm({ ...form, sellers_concession: val });
                saveField({ sellers_concession: val });
              }}
              placeholder="5000"
              className="pl-7"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pre-Approved Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              type="number"
              min="0"
              step="1000"
              value={form.preapproval_amount ?? ""}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                setForm({ ...form, preapproval_amount: val });
                saveField({ preapproval_amount: val });
              }}
              placeholder="350000"
              className="pl-7"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">LTV (%)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={form.ltv ?? ""}
            onChange={(e) => {
              const val = e.target.value === "" ? "" : Number(e.target.value);
              setForm({ ...form, ltv: val });
              saveField({ ltv: val });
            }}
            placeholder="80"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Loan Type</Label>
        <select
          value={form.loan_type || ""}
          onChange={(e) => {
            setForm({ ...form, loan_type: e.target.value });
            saveField({ loan_type: e.target.value });
          }}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Select loan type…</option>
          <option value="DPA FHA">DPA FHA</option>
          <option value="DPA Conventional">DPA Conventional</option>
          <option value="30 Year FHA">30 Year FHA</option>
          <option value="FHA 203k">FHA 203k</option>
          <option value="30 Year Conventional">30 Year Conventional</option>
          <option value="Jumbo">Jumbo</option>
          <option value="DSCR">DSCR</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lock Date</Label>
          <Input
            type="date"
            value={form.lock_date || ""}
            onChange={(e) => {
              setForm({ ...form, lock_date: e.target.value });
              saveField({ lock_date: e.target.value });
            }}
            className="h-11 text-base"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Finance Contingency Date</Label>
          <Input
            type="date"
            value={form.finance_contingency_date || ""}
            onChange={(e) => {
              setForm({ ...form, finance_contingency_date: e.target.value });
              saveField({ finance_contingency_date: e.target.value });
            }}
            className="h-11 text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Closing Date</Label>
          <Input
            type="date"
            value={form.closing_date || ""}
            onChange={(e) => {
              setForm({ ...form, closing_date: e.target.value });
              saveField({ closing_date: e.target.value });
            }}
            className="h-11 text-base"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Loan Officer Remarks</Label>
        <textarea
          value={form.notes}
          onChange={(e) => {
            setForm({ ...form, notes: e.target.value });
            saveField({ notes: e.target.value });
          }}
          rows={3}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          placeholder="Add any notes about this borrower..."
        />
      </div>
    </>
  );
}