import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function AcceptFileDialog({ open, onOpenChange, loan, role, onConfirm }) {
  const roleLabel = role === "officer" ? "Loan Officer" : "Loan Processor";
  const borrower = loan ? `${loan.first_name} ${loan.last_name}` : "";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Accept this file?</AlertDialogTitle>
          <AlertDialogDescription>
            Do you want to accept this file as the {roleLabel}? You will be granted access to{" "}
            <span className="font-semibold text-foreground">{borrower}</span>'s profile.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No, don't accept</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Yes, accept file
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}