import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Property Address</Label>
          <div className="flex items-center gap-2">
            <Label htmlFor="tbd" className="text-xs text-muted-foreground">TBD / Pre-approval</Label>
            <Switch
              id="tbd"
              checked={form.address_tbd}
              onCheckedChange={(v) => {
                setForm({ ...form, address_tbd: v });
                saveField({ address_tbd: v });
              }}
            />
          </div>
        </div>
        <Input
          value={form.property_address}
          disabled={form.address_tbd}
          onChange={(e) => {
            setForm({ ...form, property_address: e.target.value });
            saveField({ property_address: e.target.value });
          }}
          placeholder={form.address_tbd ? "No property under contract yet" : "123 Main St, Austin, TX 78701"}
        />
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
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lock Date</Label>
          <Input
            type="date"
            value={form.lock_date || ""}
            onChange={(e) => {
              setForm({ ...form, lock_date: e.target.value });
              saveField({ lock_date: e.target.value });
            }}
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