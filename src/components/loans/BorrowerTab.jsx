import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BorrowerTab({ form, setForm, saveField }) {
  return (
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date of Birth</Label>
          <Input
            type="date"
            value={form.date_of_birth || ""}
            onChange={(e) => {
              setForm({ ...form, date_of_birth: e.target.value });
              saveField({ date_of_birth: e.target.value });
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SSN</Label>
          <Input
            value={form.ssn || ""}
            placeholder="XXX-XX-XXXX"
            onChange={(e) => {
              setForm({ ...form, ssn: e.target.value });
              saveField({ ssn: e.target.value });
            }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Employment</Label>
        <Input
          value={form.employment || ""}
          placeholder="Employer / position"
          onChange={(e) => {
            setForm({ ...form, employment: e.target.value });
            saveField({ employment: e.target.value });
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Annual Income</Label>
          <Input
            type="number"
            value={form.income ?? ""}
            placeholder="0"
            onChange={(e) => {
              const v = e.target.value === "" ? "" : Number(e.target.value);
              setForm({ ...form, income: v });
              saveField({ income: v });
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Credit Score</Label>
          <Input
            type="number"
            value={form.credit_score ?? ""}
            placeholder="0"
            onChange={(e) => {
              const v = e.target.value === "" ? "" : Number(e.target.value);
              setForm({ ...form, credit_score: v });
              saveField({ credit_score: v });
            }}
          />
        </div>
      </div>
    </>
  );
}