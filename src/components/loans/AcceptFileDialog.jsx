import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function AcceptFileDialog({ open, onOpenChange, loan, role, onConfirm }) {
  const borrower = loan ? `${loan.first_name} ${loan.last_name}` : "";

  // When a role is pre-selected (from AssignedToCell), confirm directly.
  // When role is null (row click on a pending loan), let the user pick.
  const handlePick = (pickedRole) => {
    onConfirm(pickedRole);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Accept this file?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to accept{" "}
            <span className="font-semibold text-foreground">{borrower}</span>'s file. You will be
            assigned to this loan and granted access to view the profile.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {role ? (
          <AlertDialogFooter>
            <AlertDialogCancel>No, don't accept</AlertDialogCancel>
            <Button onClick={() => handlePick(role)}>Yes, accept file</Button>
          </AlertDialogFooter>
        ) : (
          <div className="flex flex-col gap-2 pt-1">
            <Button
              className="w-full justify-start"
              onClick={() => handlePick("officer")}
            >
              Accept as Loan Officer
            </Button>
            <Button
              className="w-full justify-start"
              variant="secondary"
              onClick={() => handlePick("processor")}
            >
              Accept as Loan Processor
            </Button>
            <AlertDialogFooter className="mt-1">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}