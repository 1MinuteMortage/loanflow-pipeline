import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PropertyTab({ form, setForm, saveField, stage }) {
  const isUnderContract = ["under_contract", "ctc", "closed"].includes(stage);
  const isPreapproved = stage === "preapproved";
  const preapprovalEnabled = isPreapproved || isUnderContract;

  const calculatedLoanAmount =
    form.sales_price && form.ltv
      ? (Number(form.sales_price) * Number(form.ltv)) / 100
      : null;

  const fmtCurrency = (n) =>
    n != null && !isNaN(n)
      ? n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 })
      : "—";

  return (
    <>
      {isUnderContract && (
        <div className="sticky top-0 z-10 -mx-6 px-6 py-3 mb-2 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">Calculated Loan Amount</div>
            <div className="text-2xl font-bold text-primary font-heading">
              {fmtCurrency(calculatedLoanAmount)}
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>Sales Price × LTV</div>
            <div className="font-medium text-foreground">
              {form.sales_price ? fmtCurrency(Number(form.sales_price)) : "—"} × {form.ltv ? `${form.ltv}%` : "—"}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pre-Approved Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
          <Input
            type="number"
            min="0"
            step="1000"
            disabled={!preapprovalEnabled}
            value={form.preapproval_amount ?? ""}
            onChange={(e) => {
              const val = e.target.value === "" ? "" : Number(e.target.value);
              setForm({ ...form, preapproval_amount: val });
              saveField({ preapproval_amount: val });
            }}
            placeholder="Enter text"
            className="pl-7"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Loan Number</Label>
        <Input
          disabled={!isUnderContract}
          value={form.loan_number || ""}
          onChange={(e) => {
            setForm({ ...form, loan_number: e.target.value });
            saveField({ loan_number: e.target.value });
          }}
          placeholder="Enter text"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Property Address</Label>
        <Input
          disabled={!isUnderContract}
          value={form.property_address || ""}
          onChange={(e) => {
            setForm({ ...form, property_address: e.target.value });
            saveField({ property_address: e.target.value });
          }}
          placeholder="Enter text"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Property Type</Label>
          <select
            disabled={!isUnderContract}
            value={form.property_type || ""}
            onChange={(e) => {
              setForm({ ...form, property_type: e.target.value });
              saveField({ property_type: e.target.value });
            }}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select…</option>
            <option value="Detached Home">Detached Home</option>
            <option value="Attached Home">Attached Home</option>
            <option value="Condominium">Condominium</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Number of Units</Label>
          <select
            disabled={!isUnderContract}
            value={form.unit_count || ""}
            onChange={(e) => {
              setForm({ ...form, unit_count: e.target.value });
              saveField({ unit_count: e.target.value });
            }}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select…</option>
            <option value="Single-Family">Single-Family (1)</option>
            <option value="Duplex">Duplex (2)</option>
            <option value="Triplex">Triplex (3)</option>
            <option value="Fourplex">Fourplex (4)</option>
          </select>
        </div>
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
              disabled={!isUnderContract}
              value={form.sales_price ?? ""}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                setForm({ ...form, sales_price: val });
                saveField({ sales_price: val });
              }}
              placeholder="Enter text"
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
              disabled={!isUnderContract}
              value={form.sellers_concession ?? ""}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                setForm({ ...form, sellers_concession: val });
                saveField({ sellers_concession: val });
              }}
              placeholder="Enter text"
              className="pl-7"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">LTV (%)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.5"
            disabled={!isUnderContract}
            value={form.ltv ?? ""}
            onChange={(e) => {
              const val = e.target.value === "" ? "" : Number(e.target.value);
              setForm({ ...form, ltv: val });
              saveField({ ltv: val });
            }}
            placeholder="Enter text"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Loan Type</Label>
          <select
            disabled={!isUnderContract}
            value={form.loan_type || ""}
            onChange={(e) => {
              setForm({ ...form, loan_type: e.target.value });
              saveField({ loan_type: e.target.value });
            }}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Finance Contingency Date</Label>
        <Input
          type="date"
          disabled={!isUnderContract}
          value={form.finance_contingency_date || ""}
          onChange={(e) => {
            setForm({ ...form, finance_contingency_date: e.target.value });
            saveField({ finance_contingency_date: e.target.value });
          }}
          className="h-[3.2rem] text-lg"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Closing Date</Label>
        <Input
          type="date"
          disabled={!isUnderContract}
          value={form.closing_date || ""}
          onChange={(e) => {
            setForm({ ...form, closing_date: e.target.value });
            saveField({ closing_date: e.target.value });
          }}
          className="h-[3.2rem] text-lg"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lock Date</Label>
        <Input
          type="date"
          disabled={!isUnderContract}
          value={form.lock_date || ""}
          onChange={(e) => {
            setForm({ ...form, lock_date: e.target.value });
            saveField({ lock_date: e.target.value });
          }}
          className="h-[3.2rem] text-lg"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Loan Officer Remarks</Label>
        <textarea
          disabled={!isUnderContract}
          value={form.notes}
          onChange={(e) => {
            setForm({ ...form, notes: e.target.value });
            saveField({ notes: e.target.value });
          }}
          rows={3}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Add any notes about this borrower..."
        />
      </div>
    </>
  );
}