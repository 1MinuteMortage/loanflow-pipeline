import React, { useState, useEffect, useRef } from "react";
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
import { Plus, Trash2, CheckCircle2, Paperclip, FileText, Loader2, Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { STAGES, STAGE_MAP, fullName, neededSummary } from "@/lib/loan-utils";
import DocPreview from "./DocPreview";

export default function LoanDrawer({ loan, open, onOpenChange, onUpdate }) {
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const fileRefs = useRef([]);

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
        needed_items: (loan.needed_items || []).map((i) => ({ ...i })),
      });
    }
  }, [loan]);

  if (!form) return null;

  const needed = neededSummary(loan);
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

  const handleUpload = async (idx, file) => {
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      const file_url = res.file_url;
      const items = form.needed_items.map((it, i) =>
        i === idx ? { ...it, file_url, file_name: file.name } : it
      );
      setForm({ ...form, needed_items: items });
      saveField({ needed_items: items });
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingIdx(null);
    }
  };

  const openPreview = (item) => {
    if (item.file_url) {
      setPreviewDoc({ url: item.file_url, name: item.file_name || "Document" });
    }
  };

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
              { key: "docs", label: "Document Requirements" },
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
                      className="group rounded-md border border-border px-3 py-2 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
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

                      {/* Document upload / preview row */}
                      <div className="mt-2 pl-7 flex items-center gap-2">
                        {uploadingIdx === idx ? (
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                          </span>
                        ) : item.file_url ? (
                          <button
                            onClick={() => openPreview(item)}
                            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[200px]">{item.file_name || "View document"}</span>
                            <Eye className="w-3.5 h-3.5 ml-1" />
                          </button>
                        ) : (
                          <button
                            onClick={() => fileRefs.current[idx]?.click()}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
                          >
                            <Paperclip className="w-3.5 h-3.5" /> Upload PDF
                          </button>
                        )}
                        <input
                          ref={(el) => (fileRefs.current[idx] = el)}
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(idx, file);
                            e.target.value = "";
                          }}
                        />
                      </div>
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
            )}
          </div>
        </SheetContent>
      </Sheet>

      <DocPreview doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </>
  );
}