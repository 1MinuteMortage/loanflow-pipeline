import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Banknote } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function normalizeAccounts(arr) {
  const base = Array.isArray(arr) ? arr.slice(0, 3) : [];
  while (base.length < 3) base.push({ bank_name: "", statement_balance: "" });
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

  function handleSave() {
    const total = draftTotal();
    setForm({ ...form, asset_accounts: draft, total_verified_assets: total });
    saveField({ asset_accounts: draft, total_verified_assets: total });
    setOpen(false);
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={openDialog}
        className="w-full justify-start"
      >
        <Banknote className="w-4 h-4 mr-2" />
        Asset Information
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Asset Information</DialogTitle>
            <DialogDescription>
              Enter up to three bank accounts. The balances will total into Total Verified Assets.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {draft.map((acct, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
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
              </div>
            ))}
          </div>

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