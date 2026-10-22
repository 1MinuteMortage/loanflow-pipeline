import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { STAGES, DEFAULT_PRE_UW_DOCUMENTS, DEFAULT_UW_CONDITIONS } from "@/lib/loan-utils";

export default function NewLoanDialog({ open, onOpenChange, onCreate }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    property_address: "",
    address_tbd: false,
    stage: "pending",
    realtor_name: "",
    realtor_phone: "",
    realtor_email: "",
    realtor_brokerage: "",
  });

  const reset = () =>
    setForm({ first_name: "", last_name: "", property_address: "", address_tbd: false, stage: "pending", realtor_name: "", realtor_phone: "", realtor_email: "", realtor_brokerage: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) return;
    const payload = {
      ...form,
      needed_items: DEFAULT_PRE_UW_DOCUMENTS.map((label) => ({ label, completed: false })),
    };
    if (form.stage === "under_contract") {
      payload.uw_conditions = DEFAULT_UW_CONDITIONS.map((label) => ({ label, completed: false }));
    }
    onCreate(payload);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">New Loan Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="max-h-[55vh] overflow-y-auto space-y-4 pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="first_name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  placeholder="Enter text"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  placeholder="Enter text"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stage" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pipeline Stage
              </Label>
              <select
                id="stage"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="property_address" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Property Address
                </Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="address_tbd" className="text-xs text-muted-foreground">
                    TBD / Pre-approval
                  </Label>
                  <Switch
                    id="address_tbd"
                    checked={form.address_tbd}
                    onCheckedChange={(v) => setForm({ ...form, address_tbd: v })}
                  />
                </div>
              </div>
              <Input
                id="property_address"
                value={form.property_address}
                disabled={form.address_tbd}
                onChange={(e) => setForm({ ...form, property_address: e.target.value })}
                placeholder="Enter text"
              />
            </div>

            <div className="space-y-2.5 rounded-lg border border-border p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Realtor (Referral)</div>
              <Input
                placeholder="Enter text"
                value={form.realtor_name}
                onChange={(e) => setForm({ ...form, realtor_name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Enter text"
                  value={form.realtor_phone}
                  onChange={(e) => setForm({ ...form, realtor_phone: e.target.value })}
                />
                <Input
                  placeholder="Enter text"
                  value={form.realtor_email}
                  onChange={(e) => setForm({ ...form, realtor_email: e.target.value })}
                />
              </div>
              <Input
                placeholder="Enter text"
                value={form.realtor_brokerage}
                onChange={(e) => setForm({ ...form, realtor_brokerage: e.target.value })}
              />
            </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}