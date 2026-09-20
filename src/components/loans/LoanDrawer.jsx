import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { STAGES, STAGE_MAP, fullName, neededSummary, DEFAULT_UW_CONDITIONS } from "@/lib/loan-utils";
import ChecklistTab from "./ChecklistTab";

export default function LoanDrawer({ loan, open, onOpenChange, onUpdate }) {
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (loan) {
      setForm({
        first_name: loan.first_name || "",
        last_name: loan.last_name || "",
        property_address: loan.property_address || "",
        address_tbd: !!loan.address_tbd,
        stage: loan.stage || "pending",
        due_date: loan.due_date || "",
        notes: loan.notes || "",
        realtor_name: loan.realtor_name || "",
        realtor_phone: loan.realtor_phone || "",
        realtor_email: loan.realtor_email || "",
        realtor_brokerage: loan.realtor_brokerage || "",
      });
    }
  }, [loan]);

  if (!form) return null;

  const needed = neededSummary(loan);
  const stage = STAGE_MAP[loan.stage];

  const saveField = (patch) => onUpdate(loan.id, patch);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-[560px] p-0 flex flex-col" side="right">
          {/* Header */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <SheetTitle className="font-heading text-2xl truncate">{fullName(loan)}</SheetTitle>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
                    style={{ backgroundColor: stage.bg, color: stage.text }}
                  >
                    {stage.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {needed.remaining} item{needed.remaining !== 1 ? "s" : ""} needed
                  </span>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Tabs */}
          <div className="flex border-b border-border px-6">
            {[
              { key: "info", label: "Borrower & Property Info" },
              { key: "docs", label: "Pre UnderWrite Documents" },
              ...(loan.stage === "under_contract"
                ? [{ key: "uw", label: "UW Conditions" }]
                : []),
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-1 py-3 mr-6 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {tab === "info" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">First Name</Label>
                    <Input
                      value={form.first_name}
                      onChange={(e) => {
                        setForm({ ...form, first_name: e.target.value });
                        saveField({ first_name: e.target.value });
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last Name</Label>
                    <Input
                      value={form.last_name}
                      onChange={(e) => {
                        setForm({ ...form, last_name: e.target.value });
                        saveField({ last_name: e.target.value });
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pipeline Stage</Label>
                  <select
                    value={form.stage}
                    onChange={(e) => {
                      const newStage = e.target.value;
                      setForm({ ...form, stage: newStage });
                      const patch = { stage: newStage };
                      if (newStage === "under_contract" && (!loan.uw_conditions || loan.uw_conditions.length === 0)) {
                        patch.uw_conditions = DEFAULT_UW_CONDITIONS.map((label) => ({ label, completed: false }));
                      }
                      onUpdate(loan.id, patch);
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
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
            )}

            {tab === "docs" && (
              <ChecklistTab
                loan={loan}
                field="needed_items"
                title="Pre UnderWrite Documents"
                onUpdate={onUpdate}
              />
            )}

            {tab === "uw" && loan.stage === "under_contract" && (
              <ChecklistTab
                loan={loan}
                field="uw_conditions"
                title="UW Conditions"
                onUpdate={onUpdate}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}