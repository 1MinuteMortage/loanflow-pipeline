import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Clock, CheckCircle2 } from "lucide-react";
import { STAGES, STAGE_MAP, fullName, daysRemaining, slaColor, slaLabel, neededSummary } from "@/lib/loan-utils";

export default function LoanDrawer({ loan, open, onOpenChange, onUpdate }) {
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState(null);
  const [newItem, setNewItem] = useState("");

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
        needed_items: (loan.needed_items || []).map((i) => ({ ...i })),
      });
    }
  }, [loan]);

  if (!form) return null;

  const days = daysRemaining(loan);
  const needed = neededSummary(loan);
  const color = slaColor(days);
  const stage = STAGE_MAP[loan.stage];

  const saveField = (patch) => onUpdate(loan.id, patch);

  const toggleItem = (idx) => {
    const items = form.needed_items.map((it, i) =>
      i === idx ? { ...it, completed: !it.completed } : it
    );
    setForm({ ...form, needed_items: items });
    saveField({ needed_items: items });
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const items = [...form.needed_items, { label: newItem.trim(), completed: false }];
    setForm({ ...form, needed_items: items });
    saveField({ needed_items: items });
    setNewItem("");
  };

  const removeItem = (idx) => {
    const items = form.needed_items.filter((_, i) => i !== idx);
    setForm({ ...form, needed_items: items });
    saveField({ needed_items: items });
  };

  return (
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
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold font-mono tabular-nums"
                  style={{ backgroundColor: `${color}14`, color }}
                >
                  <Clock className="w-3 h-3" />
                  {slaLabel(days)}
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
            { key: "docs", label: "Document Requirements & SLA" },
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
                    setForm({ ...form, stage: e.target.value });
                    saveField({ stage: e.target.value });
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
            <>
              {/* SLA Tracker */}
              <div className="rounded-lg border border-border p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SLA Countdown</div>
                    <div className="mt-1 font-mono text-2xl font-semibold tabular-nums" style={{ color }}>
                      {slaLabel(days)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Due Date</div>
                    <div className="mt-1 text-sm font-medium">
                      {loan.due_date
                        ? new Date(loan.due_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "Not set"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Needed items checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold">Needed Items</div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {needed.done} of {needed.total} complete
                  </span>
                </div>

                <div className="space-y-1.5">
                  {form.needed_items.length === 0 && (
                    <div className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
                      No items yet — add one below.
                    </div>
                  )}
                  {form.needed_items.map((item, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center gap-2.5 rounded-md border border-border px-3 py-2 hover:bg-muted/40 transition-colors"
                    >
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(idx)}
                      />
                      <span className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {item.label}
                      </span>
                      {item.completed && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      <button
                        onClick={() => removeItem(idx)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addItem()}
                    placeholder="Add a needed item..."
                    className="text-sm"
                  />
                  <Button type="button" size="sm" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}