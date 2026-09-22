import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { STAGES, STAGE_MAP, fullName, neededSummary, DEFAULT_UW_CONDITIONS } from "@/lib/loan-utils";
import BorrowerTab from "./BorrowerTab";
import PropertyTab from "./PropertyTab";
import ContactsTab from "./ContactsTab";
import ChecklistTab from "./ChecklistTab";
import DraggableTabs from "./DraggableTabs";
import { Button } from "@/components/ui/button";
import ContactsPromptDialog from "./ContactsPromptDialog";
import PreapprovalPromptDialog from "./PreapprovalPromptDialog";

const DEFAULT_TAB_ORDER = ["borrower", "property", "contacts", "docs", "uw"];
const TAB_LABELS = {
  borrower: "Borrower's Information",
  property: "Loan Information",
  contacts: "Contacts",
  docs: "Pre UnderWrite Documents",
  uw: "UW Conditions",
};

function loadTabOrder() {
  try {
    const saved = localStorage.getItem("loanflow_tab_order");
    if (saved) {
      const parsed = JSON.parse(saved);
      const known = parsed.filter((k) => DEFAULT_TAB_ORDER.includes(k));
      DEFAULT_TAB_ORDER.forEach((k) => {
        if (!known.includes(k)) known.push(k);
      });
      return known;
    }
  } catch {}
  return DEFAULT_TAB_ORDER;
}

export default function LoanDrawer({ loan, open, onOpenChange, onUpdate }) {
  const [tab, setTab] = useState("borrower");
  const [tabOrder, setTabOrder] = useState(loadTabOrder);
  const [form, setForm] = useState(null);
  const [contactsPromptOpen, setContactsPromptOpen] = useState(false);
  const [preapprovalPromptOpen, setPreapprovalPromptOpen] = useState(false);

  useEffect(() => {
    if (loan) {
      setForm({
        first_name: loan.first_name || "",
        last_name: loan.last_name || "",
        date_of_birth: loan.date_of_birth || "",
        ssn: loan.ssn || "",
        email: loan.email || "",
        employment: loan.employment || "",
        employment_duration: loan.employment_duration || "",
        income: loan.income ?? "",
        credit_score: loan.credit_score ?? "",
        property_address: loan.property_address || "",
        address_tbd: !!loan.address_tbd,
        stage: loan.stage || "pending",
        due_date: loan.due_date || "",
        current_residence: loan.current_residence || "",
        residence_two_years: !!loan.residence_two_years,
        marital_status: loan.marital_status || "",
        occupancy_type: loan.occupancy_type || "",
        us_citizen: !!loan.us_citizen,
        va_status: !!loan.va_status,
        estimated_available_funds: loan.estimated_available_funds ?? "",
        loan_number: loan.loan_number || "",
        loan_type: loan.loan_type || "",
        preapproval_amount: loan.preapproval_amount ?? "",
        ltv: loan.ltv ?? "",
        sales_price: loan.sales_price ?? "",
        sellers_concession: loan.sellers_concession ?? "",
        hoa_dues: loan.hoa_dues ?? "",
        property_type: loan.property_type || "",
        unit_count: loan.unit_count || "",
        lock_date: loan.lock_date || "",
        finance_contingency_date: loan.finance_contingency_date || "",
        closing_date: loan.closing_date || "",
        notes: loan.notes || "",
        realtor_name: loan.realtor_name || "",
        realtor_phone: loan.realtor_phone || "",
        realtor_email: loan.realtor_email || "",
        realtor_brokerage: loan.realtor_brokerage || "",
      });
    }
  }, [loan]);

  useEffect(() => {
    if (loan) setTab("borrower");
  }, [loan?.id]);

  useEffect(() => {
    if (tab === "uw" && loan && loan.stage !== "under_contract") {
      setTab("borrower");
    }
  }, [loan, tab]);

  // Auto-seed standard UW conditions for under-contract loans that have none
  useEffect(() => {
    if (loan && loan.stage === "under_contract" && (!loan.uw_conditions || loan.uw_conditions.length === 0)) {
      onUpdate(loan.id, {
        uw_conditions: DEFAULT_UW_CONDITIONS.map((label) => ({ label, completed: false })),
      });
    }
  }, [loan?.id, loan?.stage, loan?.uw_conditions?.length]);

  if (!form) return null;

  const needed = neededSummary(loan);
  const stage = STAGE_MAP[loan.stage];

  const saveField = (patch) => onUpdate(loan.id, patch);

  function handleReorder(from, to) {
    setTabOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      localStorage.setItem("loanflow_tab_order", JSON.stringify(next));
      return next;
    });
  }

  function handleStageChange(newStage) {
    if (newStage === "under_contract") {
      const patch = { stage: newStage };
      if (!loan.uw_conditions || loan.uw_conditions.length === 0) {
        patch.uw_conditions = DEFAULT_UW_CONDITIONS.map((label) => ({ label, completed: false }));
      }
      onUpdate(loan.id, patch);
      setContactsPromptOpen(true);
    } else if (newStage === "preapproved") {
      onUpdate(loan.id, { stage: newStage });
      setPreapprovalPromptOpen(true);
    } else {
      onUpdate(loan.id, { stage: newStage });
    }
  }

  function handleContactsSave(contacts) {
    onUpdate(loan.id, contacts);
    setContactsPromptOpen(false);
  }

  const visibleTabs = tabOrder
    .map((key) => ({ key, label: TAB_LABELS[key] }))
    .filter((t) => t.key !== "uw" || loan.stage === "under_contract");

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-[1100px] p-0 flex flex-col" side="right">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between gap-3">
              <SheetTitle className="font-heading text-2xl truncate">{fullName(loan)}</SheetTitle>
              <select
                value={form.stage}
                onChange={(e) => {
                  const newStage = e.target.value;
                  setForm({ ...form, stage: newStage });
                  handleStageChange(newStage);
                }}
                style={{ backgroundColor: stage.bg, color: stage.text, marginRight: "0.5in" }}
                className="shrink-0 rounded-md border border-border px-2.5 py-1.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {needed.remaining} item{needed.remaining !== 1 ? "s" : ""} needed
              </span>
            </div>
          </SheetHeader>

          <DraggableTabs
            tabs={visibleTabs}
            activeTab={tab}
            onSelect={setTab}
            onReorder={handleReorder}
          />

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {tab === "borrower" && (
              <BorrowerTab form={form} setForm={setForm} saveField={saveField} />
            )}
            {tab === "property" && (
              <PropertyTab
                form={form}
                setForm={setForm}
                saveField={saveField}
                stage={loan.stage}
              />
            )}
            {tab === "contacts" && (
              <ContactsTab loan={loan} onUpdate={onUpdate} />
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

          <div className="border-t border-border px-6 py-3 flex justify-start">
            <Button onClick={() => onOpenChange(false)} className="bg-primary text-primary-foreground">
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <ContactsPromptDialog
        open={contactsPromptOpen}
        onOpenChange={setContactsPromptOpen}
        loan={loan}
        onSave={handleContactsSave}
      />

      <PreapprovalPromptDialog
        open={preapprovalPromptOpen}
        onOpenChange={setPreapprovalPromptOpen}
        loan={loan}
        onSave={(patch) => {
          onUpdate(loan.id, patch);
          setPreapprovalPromptOpen(false);
        }}
      />
    </>
  );
}