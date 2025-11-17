"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  password: string;
  email: string;
  nombre: string;
  onClose: () => void;
}

export default function PasswordSuccessDialog({
  open,
  onOpenChange,
  password,
  email,
  nombre,
  onClose
}: PasswordSuccessDialogProps) {
  const [passwordCopiada, setPasswordCopiada] = useState(false);
  const { toast } = useToast();

  // Copiar contraseña al portapapeles
  const copiarPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setPasswordCopiada(true);
      setTimeout(() => setPasswordCopiada(false), 2000);
      toast({
        title: "¡Copiado!",
        description: "La contraseña se copió al portapapeles",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo copiar la contraseña",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setPasswordCopiada(false);
    onClose();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            ¡Usuario Creado Exitosamente!
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-4">
            <div className="space-y-2">
              <p className="text-sm">
                El usuario <strong>{nombre}</strong> ha sido creado con el email:
              </p>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-sm font-mono font-semibold">{email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                ⚠️ Contraseña del usuario (guárdala en un lugar seguro):
              </p>
              <div className="relative">
                <Input
                  value={password}
                  readOnly
                  className="font-mono font-bold text-lg pr-12 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={copiarPassword}
                >
                  {passwordCopiada ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Guarda esta contraseña. El usuario la necesitará para iniciar sesión.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleClose}>
            Entendido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
