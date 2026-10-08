import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { STAGES, STAGE_MAP, fullName, neededSummary, DEFAULT_UW_CONDITIONS, DEFAULT_PRE_UW_DOCUMENTS } from "@/lib/loan-utils";
import BorrowerTab from "./BorrowerTab";
import PropertyTab from "./PropertyTab";
import ContactsTab from "./ContactsTab";
import ChecklistTab from "./ChecklistTab";
import DraggableTabs from "./DraggableTabs";
import { Button } from "@/components/ui/button";
import ContactsPromptDialog from "./ContactsPromptDialog";
import PreapprovalPromptDialog from "./PreapprovalPromptDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  canChangeStage,
  canEditBorrower,
  canEditDocuments,
  canEditPreapproval,
  canEditUwConditions,
  canOpenLoanDetails,
  isAdmin,
} from "@/lib/permissions";

const DEFAULT_TAB_ORDER = ["borrower", "property", "contacts", "docs", "uw", "ai_assist"];
const TAB_LABELS = {
  borrower: "Borrower's Information",
  property: "Loan Information",
  contacts: "Contacts",
  docs: "Pre UnderWrite Documents",
  ai_assist: "AI Assist",
  uw: "UW Conditions",
};

function loadTabOrder() {
  let order = DEFAULT_TAB_ORDER;
  try {
    const saved = localStorage.getItem("loanflow_tab_order");
    if (saved) {
      const parsed = JSON.parse(saved);
      const known = parsed.filter((k) => DEFAULT_TAB_ORDER.includes(k));
      DEFAULT_TAB_ORDER.forEach((k) => {
        if (!known.includes(k)) known.push(k);
      });
      order = known;
    }
  } catch {}
  // AI Assist is always pinned to the far right
  const withoutAi = order.filter((k) => k !== "ai_assist");
  withoutAi.push("ai_assist");
  return withoutAi;
}

export default function LoanDrawer({ loan, open, onOpenChange, onUpdate, currentUser }) {
  const [tab, setTab] = useState("borrower");
  const [tabOrder, setTabOrder] = useState(loadTabOrder);
  const [form, setForm] = useState(null);
  const [contactsPromptOpen, setContactsPromptOpen] = useState(false);
  const [preapprovalPromptOpen, setPreapprovalPromptOpen] = useState(false);
  const [pendingStage, setPendingStage] = useState(null);

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
        self_employed: !!loan.self_employed,
        has_cosigner: !!loan.has_cosigner,
        asset_accounts: Array.isArray(loan.asset_accounts) ? loan.asset_accounts : [],
        estimated_available_funds: loan.estimated_available_funds ?? "",
        total_assets: loan.total_assets ?? "",
        total_verified_assets: loan.total_verified_assets ?? "",
        lender_name: loan.lender_name || "",
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
    if (tab === "contacts" && loan && !["under_contract", "ctc", "closed"].includes(loan.stage)) {
      setTab("borrower");
    }
    if (tab === "property" && loan && !["preapproved", "under_contract", "ctc", "closed"].includes(loan.stage)) {
      setTab("borrower");
    }
  }, [loan, tab]);

  // Auto-seed standard UW conditions for under-contract loans, appending any missing defaults (e.g. Closing Disclosure)
  // Also standardizes the "Purchase and Sale (With Amendments)" label for existing loans
  useEffect(() => {
    if (!loan || loan.stage !== "under_contract") return;
    const conditions = loan.uw_conditions || [];
    const standardized = conditions.map((c) =>
      c.label === "Purchase and Sale" || c.label === "Purchase and Sale (Amendments)"
        ? { ...c, label: "Purchase and Sale (With Amendments)" }
        : c
    );
    const existingLabels = standardized.map((c) => c.label);
    const missing = DEFAULT_UW_CONDITIONS.filter((l) => !existingLabels.includes(l));
    if (missing.length > 0 || standardized.some((c, i) => c.label !== conditions[i].label)) {
      onUpdate(loan.id, {
        uw_conditions: [
          ...standardized,
          ...missing.map((label) => ({ label, completed: false })),
        ],
      });
    }
  }, [loan?.id, loan?.stage, loan?.uw_conditions?.length]);

  // Auto-seed pre-underwrite documents for loans that have none yet,
  // and migrate legacy "W-2s / Tax Returns" into separate items + append "Other / MISC"
  useEffect(() => {
    if (!loan) return;
    const items = loan.needed_items || [];
    if (items.length === 0) {
      onUpdate(loan.id, {
        needed_items: DEFAULT_PRE_UW_DOCUMENTS.map((label) => ({ label, completed: false })),
      });
      return;
    }
    let migrated = false;
    let normalized = items.map((item) => {
      if (item.label === "W-2s / Tax Returns") {
        migrated = true;
        return { ...item, label: "W-2s" };
      }
      return item;
    });
    if (migrated) {
      normalized = [...normalized, { label: "Tax Returns", completed: false }];
    }
    const existingLabels = normalized.map((c) => c.label);
    const missing = DEFAULT_PRE_UW_DOCUMENTS.filter((l) => !existingLabels.includes(l));
    if (migrated || missing.length > 0) {
      onUpdate(loan.id, {
        needed_items: [
          ...normalized,
          ...missing.map((label) => ({ label, completed: false })),
        ],
      });
    }
  }, [loan?.id, loan?.needed_items?.length]);

  // Block detail view until Accept File (admins always allowed)
  useEffect(() => {
    if (open && loan && currentUser && !canOpenLoanDetails(currentUser, loan)) {
      onOpenChange(false);
    }
  }, [open, loan, currentUser, onOpenChange]);

  if (!form) return null;
  if (currentUser && loan && !canOpenLoanDetails(currentUser, loan)) return null;

  const needed = neededSummary(loan);
  const stage = STAGE_MAP[loan.stage];
  const readOnlyBorrower = !canEditBorrower(currentUser, loan);
  const readOnlyDocs = !canEditDocuments(currentUser, loan);
  const readOnlyPreapproval = !canEditPreapproval(currentUser, loan);
  const readOnlyUw = !canEditUwConditions(currentUser, loan);
  const stageEditable = isAdmin(currentUser) || canEditBorrower(currentUser, loan) || canEditUwConditions(currentUser, loan);

  const saveField = (patch) => {
    if (patch.stage && !canChangeStage(currentUser, loan, patch.stage)) return;
    if (
      ("preapproval_amount" in patch || "loan_type" in patch || "sellers_concession" in patch) &&
      readOnlyPreapproval
    ) {
      return;
    }
    if (readOnlyBorrower) {
      const borrowerKeys = [
        "first_name",
        "last_name",
        "email",
        "date_of_birth",
        "ssn",
        "employment",
        "notes",
        "marital_status",
        "us_citizen",
        "va_status",
        "current_residence",
        "estimated_available_funds",
      ];
      if (borrowerKeys.some((k) => Object.prototype.hasOwnProperty.call(patch, k))) return;
    }
    onUpdate(loan.id, patch);
  };

  function handleReorder(from, to) {
    setTabOrder((prev) => {
      if (prev[from] === "ai_assist" || prev[to] === "ai_assist") return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      localStorage.setItem("loanflow_tab_order", JSON.stringify(next));
      return next;
    });
  }

  function handleStageChange(newStage) {
    if (!canChangeStage(currentUser, loan, newStage)) return;
    const stagesWithUW = ["under_contract", "ctc", "closed"];
    if (stagesWithUW.includes(newStage)) {
      const existingConditions = loan.uw_conditions || [];
      const existingLabels = existingConditions.map((c) => c.label);
      const preUWItems = DEFAULT_PRE_UW_DOCUMENTS
        .filter((label) => !existingLabels.includes(label))
        .map((label) => ({ label, completed: false }));
      const missingUW = DEFAULT_UW_CONDITIONS
        .filter((label) => !existingLabels.includes(label))
        .map((label) => ({ label, completed: false }));
      const patch = { stage: newStage };
      if (preUWItems.length > 0 || missingUW.length > 0 || existingConditions.length === 0) {
        patch.uw_conditions = [
          ...preUWItems,
          ...existingConditions,
          ...missingUW,
        ];
      }
      onUpdate(loan.id, patch);
      if (newStage === "under_contract") setContactsPromptOpen(true);
    } else if (newStage === "preapproved") {
      onUpdate(loan.id, { stage: newStage });
      setPreapprovalPromptOpen(true);
    } else {
      onUpdate(loan.id, { stage: newStage });
    }
  }

  function confirmStageChange() {
    if (pendingStage) {
      setForm({ ...form, stage: pendingStage });
      handleStageChange(pendingStage);
    }
    setPendingStage(null);
  }

  function handleContactsSave(contacts) {
    onUpdate(loan.id, contacts);
    setContactsPromptOpen(false);
  }

  const propertyLocked = !["preapproved", "under_contract", "ctc", "closed"].includes(loan.stage);
  const contactsLocked = !["under_contract", "ctc", "closed"].includes(loan.stage);
  const visibleTabs = tabOrder
    .map((key) => {
      const tab = { key, label: TAB_LABELS[key] };
      if (key === "contacts") tab.disabled = contactsLocked;
      if (key === "property") tab.disabled = propertyLocked;
      return tab;
    })
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
                disabled={!stageEditable}
                onChange={(e) => {
                  setPendingStage(e.target.value);
                }}
                style={{ backgroundColor: stage.bg, color: stage.text, marginRight: "0.5in" }}
                className="shrink-0 rounded-md border border-border px-2.5 py-1.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
              <BorrowerTab form={form} setForm={setForm} saveField={saveField} loan={loan} />
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
              <ContactsTab loan={loan} onUpdate={readOnlyBorrower ? () => {} : onUpdate} />
            )}
            {tab === "docs" && (
              <ChecklistTab
                loan={loan}
                field="needed_items"
                title="Pre UnderWrite Documents"
                onUpdate={readOnlyDocs ? () => {} : onUpdate}
                currentUser={currentUser}
                form={form}
                setForm={setForm}
                saveField={saveField}
              />
            )}
            {tab === "ai_assist" && (
              <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
                <p className="text-sm">AI Assist coming soon</p>
              </div>
            )}
            {tab === "uw" && ["under_contract", "ctc", "closed"].includes(loan.stage) && (
              <ChecklistTab
                loan={loan}
                field="uw_conditions"
                title="UW Conditions"
                onUpdate={readOnlyUw ? () => {} : onUpdate}
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

      <AlertDialog open={!!pendingStage} onOpenChange={(open) => { if (!open) setPendingStage(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to do this change?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to change the loan stage to "{STAGE_MAP[pendingStage]?.label}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStageChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}