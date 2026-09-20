import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function PropertyTab({ form, setForm, saveField }) {
  return (
    <>
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

      <div className="space-y-2.5 rounded-lg border border-border p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Realtor (Referral)</div>
        <Input
          placeholder="Realtor full name"
          value={form.realtor_name}
          onChange={(e) => {
            setForm({ ...form, realtor_name: e.target.value });
            saveField({ realtor_name: e.target.value });
          }}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Phone"
            value={form.realtor_phone}
            onChange={(e) => {
              setForm({ ...form, realtor_phone: e.target.value });
              saveField({ realtor_phone: e.target.value });
            }}
          />
          <Input
            placeholder="Email"
            value={form.realtor_email}
            onChange={(e) => {
              setForm({ ...form, realtor_email: e.target.value });
              saveField({ realtor_email: e.target.value });
            }}
          />
        </div>
        <Input
          placeholder="Brokerage"
          value={form.realtor_brokerage}
          onChange={(e) => {
            setForm({ ...form, realtor_brokerage: e.target.value });
            saveField({ realtor_brokerage: e.target.value });
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SLA Due Date</Label>
        <Input
          type="date"
          value={form.due_date}
          onChange={(e) => {
            setForm({ ...form, due_date: e.target.value });
            saveField({ due_date: e.target.value });
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</Label>
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