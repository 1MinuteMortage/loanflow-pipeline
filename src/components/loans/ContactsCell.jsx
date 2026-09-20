import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Users, Phone, Mail } from "lucide-react";
import { getContacts } from "@/lib/loan-utils";

export default function ContactsCell({ loan }) {
  const contacts = getContacts(loan);
  if (contacts.length === 0) {
    return <span className="text-sm text-muted-foreground/50">—</span>;
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Users className="w-3.5 h-3.5" />
          <span>
            {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" onClick={(e) => e.stopPropagation()} align="start">
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {contacts.map((c, i) => (
            <div key={i} className={i > 0 ? "pt-3 border-t border-border" : ""}>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {c.role}
              </div>
              <div className="font-medium text-sm mt-0.5">{c.name}</div>
              <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                {c.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 shrink-0" /> {c.phone}
                  </span>
                )}
                {c.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 shrink-0" /> {c.email}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}