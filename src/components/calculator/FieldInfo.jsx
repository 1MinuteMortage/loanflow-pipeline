import React from "react";
import { Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function FieldInfo({ title, text }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`More about ${title}`}
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="pr-6 text-left font-heading text-base font-bold text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm leading-relaxed text-foreground/85">{text}</p>
      </DialogContent>
    </Dialog>
  );
}