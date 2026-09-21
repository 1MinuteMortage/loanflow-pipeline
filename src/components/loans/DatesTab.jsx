import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DatesTab({ form, setForm, saveField }) {
  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Finance Contingency Date</Label>
        <Input
          type="date"
          value={form.finance_contingency_date || ""}
          onChange={(e) => {
            setForm({ ...form, finance_contingency_date: e.target.value });
            saveField({ finance_contingency_date: e.target.value });
          }}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Closing Date</Label>
        <Input
          type="date"
          value={form.closing_date || ""}
          onChange={(e) => {
            setForm({ ...form, closing_date: e.target.value });
            saveField({ closing_date: e.target.value });
          }}
        />
      </div>
    </>
  );
}