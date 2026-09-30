import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";

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
  const accounts = normalizeAccounts(form.asset_accounts);

  function totalVerified() {
    return accounts.reduce(
      (sum, a) => sum + (typeof a.statement_balance === "number" && !isNaN(a.statement_balance) ? a.statement_balance : 0),
      0
    );
  }

  function updateAccount(index, patch) {
    const next = accounts.map((a, i) => (i === index ? { ...a, ...patch } : a));
    const total = next.reduce(
      (sum, a) => sum + (typeof a.statement_balance === "number" && !isNaN(a.statement_balance) ? a.statement_balance : 0),
      0
    );
    setForm({ ...form, asset_accounts: next, total_verified_assets: total });
    saveField({ asset_accounts: next, total_verified_assets: total });
  }

  return (
    <div className="col-span-3 mt-1 rounded-md border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Asset Information</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-3 px-3 pb-3">
          {accounts.map((acct, i) => (
            <div key={i} className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Bank Name</Label>
                <Input
                  value={acct.bank_name}
                  placeholder="Enter bank name"
                  onChange={(e) => updateAccount(i, { bank_name: e.target.value })}
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
                      updateAccount(i, { statement_balance: v });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-end pt-1 border-t border-border">
            <div className="text-sm font-semibold text-foreground">
              Total Verified Assets: ${totalVerified().toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}