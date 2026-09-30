import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function normalizeAccounts(arr) {
  const base = Array.isArray(arr) && arr.length > 0 ? arr.slice() : [{ bank_name: "", statement_balance: "" }];
  return base.map((a) => ({
    bank_name: a.bank_name || "",
    statement_balance: a.statement_balance === undefined || a.statement_balance === null ? "" : Number(a.statement_balance),
  }));
}

export default function AssetInformationSection({ form, setForm, saveField }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(normalizeAccounts(form.asset_accounts));

  function openDialog() {
    setDraft(normalizeAccounts(form.asset_accounts));
    setOpen(true);
  }

  function draftTotal() {
    return draft.reduce(
      (sum, a) => sum + (typeof a.statement_balance === "number" && !isNaN(a.statement_balance) ? a.statement_balance : 0),
      0
    );
  }

  function updateDraft(index, patch) {
    setDraft((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  function addAccount() {
    setDraft((prev) => [...prev, { bank_name: "", statement_balance: "" }]);
  }

  function removeAccount(index) {
    setDraft((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  function handleSave() {
    const total = draftTotal();
    const cleaned = draft
      .filter((a) => a.bank_name || a.statement_balance !== "")
      .map((a) => ({ ...a, statement_balance: a.statement_balance === "" ? 0 : Number(a.statement_balance) }));
    setForm({ ...form, asset_accounts: cleaned, total_verified_assets: total });
    saveField({ asset_accounts: cleaned, total_verified_assets: total });
    setOpen(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={openDialog}
        className="text-xs font-medium text-primary hover:underline"
      >
        Asset Information
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Asset Information</DialogTitle>
            <DialogDescription>
              Enter bank name and last statement balance. The balances will total into Total Verified Assets.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[55vh] overflow-y-auto pr-1">
            {draft.map((acct, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Bank Name</Label>
                  <Input
                    value={acct.bank_name}
                    placeholder="Enter bank name"
                    onChange={(e) => updateDraft(i, { bank_name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Last Statement Balance</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      value={acct.statement_balance}
                      placeholder="Enter amount"
                      className="pl-7"
                      onChange={(e) => {
                        const v = e.target.value === "" ? "" : Number(e.target.value);
                        updateDraft(i, { statement_balance: v });
                      }}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAccount(i)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" size="sm" onClick={addAccount} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Bank Account
          </Button>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold text-foreground">
              Total: ${draftTotal().toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}