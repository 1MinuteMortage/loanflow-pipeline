import React from "react";
import { Input } from "@/components/ui/input";
import { User, Phone, Mail } from "lucide-react";
import { CONTACT_ROLES } from "@/lib/loan-utils";

export default function ContactsTab({ loan, onUpdate }) {
  const update = (key, value) => onUpdate(loan.id, { [key]: value });

  return (
    <div className="space-y-4">
      {CONTACT_ROLES.map((role) => {
        const p = role.key;
        return (
          <div key={role.key} className="rounded-lg border border-border p-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold">{role.label}</span>
            </div>
            <Input
              placeholder={role.key === "closing_attorney" ? "Office Name" : "Name"}
              value={loan[`${p}_name`] || ""}
              onChange={(e) => update(`${p}_name`, e.target.value)}
            />
            {role.key === "closing_attorney" && (
              <Input
                placeholder="Representative Name"
                value={loan[`${p}_representative_name`] || ""}
                onChange={(e) => update(`${p}_representative_name`, e.target.value)}
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Phone"
                value={loan[`${p}_phone`] || ""}
                onChange={(e) => update(`${p}_phone`, e.target.value)}
              />
              <Input
                placeholder="Email"
                value={loan[`${p}_email`] || ""}
                onChange={(e) => update(`${p}_email`, e.target.value)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}