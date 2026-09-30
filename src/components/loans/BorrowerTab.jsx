import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoanOfficerSection from "./LoanOfficerSection";
import DocumentUploadTab from "./DocumentUploadTab";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

export default function BorrowerTab({ form, setForm, saveField, loan }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">First Name</Label>
          <Input
            value={form.first_name}
            placeholder="Enter text"
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
            placeholder="Enter text"
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
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email Address</Label>
          <Input
            type="email"
            value={form.email || ""}
            placeholder="Enter text"
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              saveField({ email: e.target.value });
            }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Social Security Number</Label>
        <Input
          value={form.ssn || ""}
          placeholder="Enter text"
          maxLength={11}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
            let formatted = digits;
            if (digits.length > 3) formatted = digits.slice(0, 3) + "-" + digits.slice(3);
            if (digits.length > 5) formatted = digits.slice(0, 3) + "-" + digits.slice(3, 5) + "-" + digits.slice(5);
            setForm({ ...form, ssn: formatted });
            saveField({ ssn: formatted });
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current Residence</Label>
        <Input
          value={form.current_residence || ""}
          placeholder="Enter text"
          onChange={(e) => {
            setForm({ ...form, current_residence: e.target.value });
            saveField({ current_residence: e.target.value });
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Occupancy Type</Label>
        <select
          value={form.occupancy_type || ""}
          onChange={(e) => {
            setForm({ ...form, occupancy_type: e.target.value });
            saveField({ occupancy_type: e.target.value });
          }}
          className={selectClass}
        >
          <option value="">Select...</option>
          <option value="primary">Primary</option>
          <option value="investment">Investment</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Residence Two Years Plus</Label>
          <select
            value={form.residence_two_years ? "yes" : "no"}
            onChange={(e) => {
              const v = e.target.value === "yes";
              setForm({ ...form, residence_two_years: v });
              saveField({ residence_two_years: v });
            }}
            className={selectClass}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Marital Status</Label>
          <select
            value={form.marital_status || ""}
            onChange={(e) => {
              setForm({ ...form, marital_status: e.target.value });
              saveField({ marital_status: e.target.value });
            }}
            className={selectClass}
          >
            <option value="">Select...</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">US Citizen</Label>
          <select
            value={form.us_citizen ? "yes" : "no"}
            onChange={(e) => {
              const v = e.target.value === "yes";
              setForm({ ...form, us_citizen: v });
              saveField({ us_citizen: v });
            }}
            className={selectClass}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bankruptcy in Last Two Years</Label>
          <select
            value={form.bankruptcy_last_two_years ? "yes" : "no"}
            onChange={(e) => {
              const v = e.target.value === "yes";
              setForm({ ...form, bankruptcy_last_two_years: v });
              saveField({ bankruptcy_last_two_years: v });
            }}
            className={selectClass}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">VA Status</Label>
          <select
            value={form.va_status ? "yes" : "no"}
            onChange={(e) => {
              const v = e.target.value === "yes";
              setForm({ ...form, va_status: v });
              saveField({ va_status: v });
            }}
            className={selectClass}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Self-Employed</Label>
          <select
            value={form.self_employed ? "yes" : "no"}
            onChange={(e) => {
              const v = e.target.value === "yes";
              setForm({ ...form, self_employed: v });
              saveField({ self_employed: v });
            }}
            className={selectClass}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estimated Available Funds</Label>
        <Input
          type="number"
          value={form.estimated_available_funds ?? ""}
          placeholder="Enter text"
          onChange={(e) => {
            const v = e.target.value === "" ? "" : Number(e.target.value);
            setForm({ ...form, estimated_available_funds: v });
            saveField({ estimated_available_funds: v });
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Employer Name</Label>
          <Input
            value={form.employment || ""}
            placeholder="Enter text"
            onChange={(e) => {
              setForm({ ...form, employment: e.target.value });
              saveField({ employment: e.target.value });
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Employment Duration</Label>
          <select
            value={form.employment_duration || ""}
            onChange={(e) => {
              setForm({ ...form, employment_duration: e.target.value });
              saveField({ employment_duration: e.target.value });
            }}
            className={selectClass}
          >
            <option value="">Select...</option>
            <option value="two_years_plus">Two Years Plus</option>
            <option value="two_years_or_less">Two Years or Less</option>
          </select>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <DocumentUploadTab
          loan={loan}
          field="client_id_documents"
          title="Client ID"
          onUpdate={(id, patch) => saveField(patch)}
        />
        <DocumentUploadTab
          loan={loan}
          field="pay_stubs_documents"
          title="Pay Stubs"
          onUpdate={(id, patch) => saveField(patch)}
        />
        <DocumentUploadTab
          loan={loan}
          field="w2_tax_returns_documents"
          title="W-2s / Tax Returns"
          onUpdate={(id, patch) => saveField(patch)}
        />
        <DocumentUploadTab
          loan={loan}
          field="bank_statements_documents"
          title="Bank Statements"
          onUpdate={(id, patch) => saveField(patch)}
        />
      </div>

      <LoanOfficerSection form={form} setForm={setForm} saveField={saveField} loan={loan} />
    </>
  );
}