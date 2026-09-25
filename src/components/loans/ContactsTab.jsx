import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { CONTACT_ROLES } from "@/lib/loan-utils";

export default function ContactsTab({ loan, onUpdate }) {
  const update = (key, value) => onUpdate(loan.id, { [key]: value });

  return (
    <div className="space-y-4">
      {CONTACT_ROLES.map((role) => {
        const p = role.key;
        const nameLabel = role.key === "closing_attorney" ? "Closing Office Name" : role.key === "underwriter" ? "Underwriter's Name" : "Name";
        return (
          <div key={role.key} className="rounded-lg border border-border p-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold">{role.label}</span>
            </div>
            {role.key === "underwriter" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Lender Name</Label>
                <Input
                  placeholder="Enter text"
                  value={loan.lender_name || ""}
                  onChange={(e) => update("lender_name", e.target.value)}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{nameLabel}</Label>
              <Input
                placeholder="Enter text"
                value={loan[`${p}_name`] || ""}
                onChange={(e) => update(`${p}_name`, e.target.value)}
              />
            </div>
            {role.key === "closing_attorney" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Representative Name</Label>
                <Input
                  placeholder="Enter text"
                  value={loan[`${p}_representative_name`] || ""}
                  onChange={(e) => update(`${p}_representative_name`, e.target.value)}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Phone Number</Label>
                <Input
                  placeholder="Enter text"
                  value={loan[`${p}_phone`] || ""}
                  onChange={(e) => update(`${p}_phone`, e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                <Input
                  placeholder="Enter text"
                  value={loan[`${p}_email`] || ""}
                  onChange={(e) => update(`${p}_email`, e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}