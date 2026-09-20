import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Phone, Mail, Building2, User } from "lucide-react";

export default function RealtorCell({ loan }) {
  const name = loan.realtor_name?.trim();
  if (!name) {
    return <span className="text-sm text-muted-foreground/50">—</span>;
  }
  const hasContact = loan.realtor_phone || loan.realtor_email || loan.realtor_brokerage;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-medium text-primary hover:underline text-left inline-flex items-center gap-1"
        >
          <User className="w-3.5 h-3.5 opacity-70" />
          <span className="truncate max-w-[150px]">{name}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" onClick={(e) => e.stopPropagation()} align="start">
        <div className="flex items-center gap-2 pb-2 mb-2 border-b border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-sm truncate">{name}</span>
        </div>
        {hasContact ? (
          <div className="space-y-2 text-sm">
            {loan.realtor_phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{loan.realtor_phone}</span>
              </div>
            )}
            {loan.realtor_email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{loan.realtor_email}</span>
              </div>
            )}
            {loan.realtor_brokerage && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{loan.realtor_brokerage}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">No contact info on file.</div>
        )}
      </PopoverContent>
    </Popover>
  );
}