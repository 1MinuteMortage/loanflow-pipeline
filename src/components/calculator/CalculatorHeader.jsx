import React from "react";
import { Image } from "@/components/ui/image";

const LOGO_URL = "https://www.1minutemortgageform.com/images/logo.png";

export default function CalculatorHeader({ firstName }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
            {firstName ? `${firstName}'s Mortgage Calculator` : "Mortgage Calculator"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
            Estimate your monthly payment and out-of-pocket costs.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Image
            src={LOGO_URL}
            alt="One Minute Mortgage Form"
            fittingType="fit"
            className="h-10 w-10 object-contain"
          />
          <span className="font-heading text-[11px] sm:text-sm font-semibold leading-tight text-foreground max-w-[110px] sm:max-w-none">
            One Minute Mortgage Form
          </span>
        </div>
      </div>
    </header>
  );
}