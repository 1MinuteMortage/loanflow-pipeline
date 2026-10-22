import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LOAN_TYPES = [
  "DPA FHA",
  "DPA Conventional",
  "30 Year FHA",
  "FHA 203k",
  "30 Year Conventional",
  "Jumbo",
  "DSCR",
];

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed";

export default function PropertyTab({
  form,
  setForm,
  saveField,
  stage,
}) {
  const isUnderContract = ["under_contract", "ctc", "closed"].includes(stage);
  const isPreapproved = stage === "preapproved";
  const preapprovalEnabled = isPreapproved || isUnderContract;

  const calculatedLoanAmount =
    form.sales_price && form.ltv
      ? (Number(form.sales_price) * Number(form.ltv)) / 100
      : null;

  return (
    <>
      {/* === Pre-approval section — available in Pre-approved stage === */}
      <div className="grid grid-cols-2 gap-3">
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
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Loan Type</Label>
          <select
            disabled={!preapprovalEnabled}
            value={form.loan_type || ""}
            onChange={(e) => {
              setForm({ ...form, loan_type: e.target.value });
              saveField({ loan_type: e.target.value });
            }}
            className={selectClass}
          >
            <option value="">Select...</option>
            {LOAN_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
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
            disabled={!preapprovalEnabled}
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

      <hr className="border-border" />

      {/* === Under-contract fields — locked until Under Contract === */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lender's Name</Label>
        <Input
          disabled={!isUnderContract}
          value={form.lender_name || ""}
          onChange={(e) => {
            setForm({ ...form, lender_name: e.target.value });
            saveField({ lender_name: e.target.value });
          }}
          placeholder="Enter text"
        />
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
            className={selectClass}
          >
            <option value="">Select...</option>
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
            className={selectClass}
          >
            <option value="">Select...</option>
            <option value="Single-Family">Single-Family (1)</option>
            <option value="Duplex">Duplex (2)</option>
            <option value="Triplex">Triplex (3)</option>
            <option value="Fourplex">Fourplex (4)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">HOA Monthly Dues</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              type="number"
              min="0"
              step="50"
              disabled={!isUnderContract}
              value={form.hoa_dues ?? ""}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                setForm({ ...form, hoa_dues: val });
                saveField({ hoa_dues: val });
              }}
              placeholder="Enter text"
              className="pl-7"
            />
          </div>
        </div>
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
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Loan Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              readOnly
              disabled={!isUnderContract}
              value={calculatedLoanAmount != null ? calculatedLoanAmount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : ""}
              placeholder="Enter text"
              className="pl-7 bg-muted/50 cursor-not-allowed font-semibold"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sellers Concession on Contract</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
          <Input
            type="number"
            min="0"
            step="500"
            disabled={!isUnderContract}
            value={form.sellers_concession_on_contract ?? ""}
            onChange={(e) => {
              const val = e.target.value === "" ? "" : Number(e.target.value);
              setForm({ ...form, sellers_concession_on_contract: val });
              saveField({ sellers_concession_on_contract: val });
            }}
            placeholder="Enter text"
            className="pl-7"
          />
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
          className="h-[3.85rem] text-xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
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
            className="h-[3.85rem] text-xl"
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
            className="h-[3.85rem] text-xl"
          />
        </div>
      </div>
    </>
  );
}