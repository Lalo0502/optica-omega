"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface DeleteConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  itemName?: string;
}

export default function DeleteConfirmation({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "ELIMINAR",
  itemName,
}: DeleteConfirmationProps) {
  const [inputValue, setInputValue] = useState("");

  const handleConfirm = () => {
    if (inputValue === confirmText) {
      onConfirm();
      setInputValue("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setInputValue("");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {itemName && (
          <div className="my-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-sm font-medium text-destructive">
              Se eliminará: <span className="font-bold">{itemName}</span>
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="confirm-input" className="text-sm font-medium">
            Para confirmar, escribe{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm font-semibold">
              {confirmText}
            </code>
          </Label>
          <Input
            id="confirm-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Escribe "${confirmText}"`}
            className="font-mono"
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={inputValue !== confirmText}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
