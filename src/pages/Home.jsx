import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import FolderBar from "@/components/loans/FolderBar";
import LoanTable from "@/components/loans/LoanTable";
import LoanCard from "@/components/loans/LoanCard";
import LoanDrawer from "@/components/loans/LoanDrawer";
import NewLoanDialog from "@/components/loans/NewLoanDialog";
import AcceptFileDialog from "@/components/loans/AcceptFileDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { STAGES } from "@/lib/loan-utils";
import { isWithin8Days } from "@/lib/date-urgency";
import {
  canClaimAsOfficer,
  canClaimAsProcessor,
  canCreateLoan,
  canManageUsers,
  canViewLoan,
  isAdmin,
  ROLE_LABELS,
  normalizeRole,
} from "@/lib/permissions";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const isMobile = useIsMobile();
  const { logout } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState("all");
  const [search, setSearch] = useState("");
  const [drawerLoan, setDrawerLoan] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [acceptTarget, setAcceptTarget] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  const handleAccept = (loan, role) => {
    if (!currentUser) return;
    if (role === "officer" && !canClaimAsOfficer(currentUser)) return;
    if (role === "processor" && !canClaimAsProcessor(currentUser)) return;
    const name = currentUser.full_name || currentUser.email || "Team member";
    if (role === "officer") {
      handleUpdate(loan.id, {
        loan_officer_id: currentUser.id,
        loan_officer_name: name,
        assigned_to_id: currentUser.id,
        assigned_to_name: name,
      });
    } else if (role === "processor") {
      handleUpdate(loan.id, {
        loan_processor_id: currentUser.id,
        loan_processor_name: name,
        assigned_to_id: currentUser.id,
        assigned_to_name: name,
      });
    } else {
      handleUpdate(loan.id, { assigned_to_id: currentUser.id, assigned_to_name: name });
    }
  };

  const requestAccept = (loan, role) => setAcceptTarget({ loan, role });
  const confirmAccept = (pickedRole) => {
    if (acceptTarget) handleAccept(acceptTarget.loan, pickedRole);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Loan.list("-created_date", 200);
      setLoans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visibleLoans = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin(currentUser)) return loans;
    return loans.filter((l) => canViewLoan(currentUser, l));
  }, [loans, currentUser]);

  const counts = useMemo(() => {
    const c = { all: visibleLoans.length, urgent: 0 };
    STAGES.forEach((s) => (c[s.key] = 0));
    visibleLoans.forEach((l) => {
      if (c[l.stage] !== undefined) c[l.stage]++;
      if (isWithin8Days(l.finance_contingency_date)) c.urgent++;
    });
    c.unassigned = loans.filter((l) => !l.loan_officer_id).length;
    c.unassignedProcessor = loans.filter(
      (l) => l.stage === "under_contract" && !l.loan_processor_id
    ).length;
    return c;
  }, [visibleLoans]);

  const filtered = useMemo(() => {
    let list = visibleLoans;
    if (activeFolder === "urgent") {
      list = list.filter((l) => isWithin8Days(l.finance_contingency_date));
    } else if (activeFolder !== "all") {
      list = list.filter((l) => l.stage === activeFolder);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          `${l.first_name} ${l.last_name}`.toLowerCase().includes(q) ||
          (l.property_address || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [visibleLoans, activeFolder, search]);

  const openDrawer = (loan) => {
    setDrawerLoan(loan);
    setDrawerOpen(true);
  };

  const handleUpdate = async (id, patch) => {
    setLoans((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    setDrawerLoan((prev) => (prev ? { ...prev, ...patch } : prev));
    try {
      await base44.entities.Loan.update(id, patch);
      if (
        "preapproval_amount" in patch ||
        "loan_type" in patch ||
        "sellers_concession" in patch ||
        patch.stage === "preapproved"
      ) {
        base44.functions
          .invoke("notify-crm-preapproval", { loanId: id })
          .catch((e) => console.error("CRM preapproval sync failed:", e));
      }
      if ("notes" in patch) {
        base44.functions
          .invoke("notify-crm-lo-notes", { loanId: id })
          .catch((e) => console.error("CRM notes sync failed:", e));
      }
    } catch (e) {
      console.error(e);
      load();
    }
  };

  const handleCreate = async (data) => {
    try {
      const created = await base44.entities.Loan.create(data);
      setLoans((prev) => [created, ...prev]);
      setNewOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const roleLabel = ROLE_LABELS[normalizeRole(currentUser)] || "User";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 gap-3">
          <div className="min-w-0">
            <h1 className="font-heading text-lg sm:text-2xl font-bold text-foreground truncate">
              Loan Processing Pipeline
            </h1>
            {currentUser && (
              <p className="text-[11px] text-muted-foreground truncate">
                {currentUser.full_name || currentUser.email} · {roleLabel}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search borrowers..."
                className="h-9 w-56 rounded-md border border-input bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            {canManageUsers(currentUser) && (
              <Button asChild variant="outline" className="hidden sm:inline-flex">
                <Link to="/team">
                  <Users className="w-4 h-4 mr-1.5" /> Team
                </Link>
              </Button>
            )}
            {canCreateLoan(currentUser) && (
              <Button onClick={() => setNewOpen(true)} className="hidden sm:inline-flex">
                <Plus className="w-4 h-4 mr-1.5" /> New Loan Application
              </Button>
            )}
            {canCreateLoan(currentUser) && (
              <Button
                onClick={() => setNewOpen(true)}
                size="icon"
                className="sm:hidden rounded-full h-11 w-11 shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              title="Sign out"
              onClick={() => logout?.()}
              className="text-muted-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {isMobile && (
          <div className="px-4 pb-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search borrowers..."
                className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            {canManageUsers(currentUser) && (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/team">
                  <Users className="w-4 h-4 mr-1.5" /> Team & Permissions
                </Link>
              </Button>
            )}
          </div>
        )}
      </header>

      <div className="sticky top-[57px] sm:top-[61px] z-20">
        <FolderBar
          active={activeFolder}
          counts={counts}
          onChange={setActiveFolder}
          unassignedCount={counts.unassigned || 0}
          unassignedProcessorCount={counts.unassignedProcessor || 0}
        />
      </div>

      <main className="px-4 sm:px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : isMobile ? (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm">
                {isAdmin(currentUser)
                  ? "No loans in this folder yet."
                  : "No assigned loans in this folder. Claim a file or ask an admin to assign you."}
              </div>
            ) : (
              filtered.map((loan) => (
                <LoanCard key={loan.id} loan={loan} onOpen={openDrawer} currentUser={currentUser} onAccept={requestAccept} />
              ))
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <LoanTable loans={filtered} onOpen={openDrawer} currentUser={currentUser} onAccept={requestAccept} />
          </div>
        )}
      </main>

      <LoanDrawer
        loan={drawerLoan}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onUpdate={handleUpdate}
        currentUser={currentUser}
      />

      <AcceptFileDialog
        open={!!acceptTarget}
        onOpenChange={(o) => !o && setAcceptTarget(null)}
        loan={acceptTarget?.loan}
        role={acceptTarget?.role}
        onConfirm={confirmAccept}
      />

      <NewLoanDialog open={newOpen} onOpenChange={setNewOpen} onCreate={handleCreate} />
    </div>
  );
}
