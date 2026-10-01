import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { APP_ROLES, ROLE_LABELS, canManageUsers } from "@/lib/permissions";
import { ArrowLeft, RefreshCw, Users } from "lucide-react";
import { Link } from "react-router-dom";

const MANAGEABLE_ROLES = APP_ROLES.filter((r) => r !== "user");

export default function Team() {
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("loan_officer");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const current = await base44.auth.me();
      setMe(current);
      if (!canManageUsers(current)) {
        setUsers([]);
        return;
      }
      const list = await base44.entities.User.list("-created_date", 200);
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = async (userId, role) => {
    setSavingId(userId);
    setError("");
    try {
      await base44.entities.User.update(userId, { role });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to update role");
    } finally {
      setSavingId(null);
    }
  };

  const inviteUser = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteBusy(true);
    setInviteMsg("");
    setError("");
    try {
      // Prefer Base44 invite API when available; fall back to create + note.
      if (base44.users?.inviteUser) {
        await base44.users.inviteUser(inviteEmail.trim(), inviteRole);
        setInviteMsg(`Invite sent to ${inviteEmail.trim()}`);
      } else if (base44.auth?.inviteUser) {
        await base44.auth.inviteUser({ email: inviteEmail.trim(), role: inviteRole });
        setInviteMsg(`Invite sent to ${inviteEmail.trim()}`);
      } else {
        setInviteMsg(
          "Use Base44 Dashboard → Users → Invite to add this email, then set their role here.",
        );
      }
      setInviteEmail("");
      await load();
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Invite failed. Add the user from Base44 Dashboard → Users, then assign a role here.",
      );
    } finally {
      setInviteBusy(false);
    }
  };

  if (!loading && me && !canManageUsers(me)) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to pipeline
        </Link>
        <div className="mt-10 text-center text-muted-foreground">
          Admin access is required to manage team members.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-heading text-lg sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5" /> Team & Permissions
              </h1>
              <p className="text-xs text-muted-foreground">
                Assign Admin, Loan Officer, LOA, or Processor roles. Each person should use their own login.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-4xl mx-auto space-y-6">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        {inviteMsg && (
          <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
            {inviteMsg}
          </div>
        )}

        <section className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h2 className="font-semibold text-sm">Invite teammate</h2>
          <p className="text-xs text-muted-foreground">
            Prefer inviting from Base44 Dashboard if the in-app invite is unavailable. After they accept,
            set their role below.
          </p>
          <form onSubmit={inviteUser} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@company.com"
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              {MANAGEABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={inviteBusy}>
              {inviteBusy ? "Sending…" : "Invite"}
            </Button>
          </form>
        </section>

        <section className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-sm">Team members</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No users found.</div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">
                      {u.full_name || u.email || "User"}
                      {me?.id === u.id ? (
                        <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  </div>
                  <select
                    value={u.role || "user"}
                    disabled={savingId === u.id || me?.id === u.id}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-60"
                    title={me?.id === u.id ? "You cannot change your own role here" : "Change role"}
                  >
                    {[...MANAGEABLE_ROLES, "user"].map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r] || r}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground text-sm">Role access summary</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong>Admin</strong> — full access, including team management and all loans.
            </li>
            <li>
              <strong>Loan Officer</strong> — assigned loans; borrower info, pre-approvals, programs,
              concessions, documents, status.
            </li>
            <li>
              <strong>Loan Officer Assistant</strong> — assigned borrowers; info, documents, notes
              (Send to LOS stays in the CRM LOA admin).
            </li>
            <li>
              <strong>Processor</strong> — assigned loans; conditions, documents, contacts, and moving
              toward CTC/closed.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
