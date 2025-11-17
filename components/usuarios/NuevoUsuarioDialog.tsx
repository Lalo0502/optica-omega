"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NuevoUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecargar: () => void;
}

export default function NuevoUsuarioDialog({ 
  open, 
  onOpenChange,
  onRecargar
}: NuevoUsuarioDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
    password: "",
    confirmPassword: "",
  });
  const { toast } = useToast();

  // Generar contraseña aleatoria de 14 caracteres con caracteres especiales garantizados
  const generarPasswordAleatoria = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // Garantizar al menos 2 de cada tipo
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    password += special[Math.floor(Math.random() * special.length)];
    password += special[Math.floor(Math.random() * special.length)]; // 3 especiales mínimo
    
    // Completar hasta 16 caracteres con caracteres aleatorios
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = password.length; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mezclar la contraseña
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setFormData({ 
      ...formData, 
      password: password,
      confirmPassword: password 
    });

    toast({
      title: "Contraseña generada",
      description: "Se ha generado una contraseña segura de 16 caracteres",
    });
  };

  // Crear usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.primer_nombre || !formData.primer_apellido || !formData.email || !formData.telefono || !formData.fecha_nacimiento) {
      toast({
        title: "Error",
        description: "Los campos Primer Nombre, Primer Apellido, Email, Teléfono y Fecha de Nacimiento son obligatorios",
        variant: "destructive",
      });
      return;
    }

    // Validar contraseña
    if (!formData.password || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Debes ingresar la contraseña y confirmarla",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 10) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 10 caracteres",
        variant: "destructive",
      });
      return;
    }

    // Validar que tenga al menos 2 caracteres especiales
    const specialChars = formData.password.match(/[!@#$%^&*(),.?":{}|<>]/g);
    if (!specialChars || specialChars.length < 2) {
      toast({
        title: "Error",
        description: "La contraseña debe contener al menos 2 caracteres especiales (!@#$%^&*...)",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      // Calcular edad
      const edad = new Date().getFullYear() - new Date(formData.fecha_nacimiento).getFullYear();

      const response = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primer_nombre: formData.primer_nombre,
          segundo_nombre: formData.segundo_nombre || null,
          primer_apellido: formData.primer_apellido,
          segundo_apellido: formData.segundo_apellido || null,
          email: formData.email,
          telefono: formData.telefono,
          fecha_nacimiento: formData.fecha_nacimiento,
          edad,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear usuario');
      }

      // Copiar contraseña al portapapeles automáticamente
      try {
        await navigator.clipboard.writeText(formData.password);
        toast({
          title: "✅ Usuario creado exitosamente",
          description: `${formData.primer_nombre} ${formData.primer_apellido} - La contraseña se ha copiado al portapapeles`,
          duration: 5000,
        });
      } catch (clipboardError) {
        // Si falla el copiado, mostrar la contraseña en el toast
        toast({
          title: "✅ Usuario creado",
          description: `Contraseña: ${formData.password}`,
          duration: 10000,
        });
      }

      // Recargar usuarios
      onRecargar();

      // Limpiar formulario y cerrar diálogo
      setFormData({
        primer_nombre: "",
        segundo_nombre: "",
        primer_apellido: "",
        segundo_apellido: "",
        email: "",
        telefono: "",
        fecha_nacimiento: "",
        password: "",
        confirmPassword: "",
      });
      
      // Cerrar el diálogo
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Ingresa los datos del nuevo usuario del sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateUser}>
          <div className="space-y-4 py-4">
            {/* Nombres */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primer_nombre">
                  Primer Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="primer_nombre"
                  placeholder="Juan"
                  value={formData.primer_nombre}
                  onChange={(e) => setFormData({ ...formData, primer_nombre: e.target.value })}
                  disabled={isCreating}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="segundo_nombre">Segundo Nombre</Label>
                <Input
                  id="segundo_nombre"
                  placeholder="Carlos (opcional)"
                  value={formData.segundo_nombre}
                  onChange={(e) => setFormData({ ...formData, segundo_nombre: e.target.value })}
                  disabled={isCreating}
                />
              </div>
            </div>

            {/* Apellidos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primer_apellido">
                  Primer Apellido <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="primer_apellido"
                  placeholder="Pérez"
                  value={formData.primer_apellido}
                  onChange={(e) => setFormData({ ...formData, primer_apellido: e.target.value })}
                  disabled={isCreating}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="segundo_apellido">Segundo Apellido</Label>
                <Input
                  id="segundo_apellido"
                  placeholder="García (opcional)"
                  value={formData.segundo_apellido}
                  onChange={(e) => setFormData({ ...formData, segundo_apellido: e.target.value })}
                  disabled={isCreating}
                />
              </div>
            </div>

            {/* Email y Teléfono */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Correo Electrónico <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isCreating}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="1234567890"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  disabled={isCreating}
                  required
                />
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">
                Fecha de Nacimiento <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                disabled={isCreating}
                required
              />
              {formData.fecha_nacimiento && (
                <p className="text-sm text-muted-foreground">
                  Edad: {new Date().getFullYear() - new Date(formData.fecha_nacimiento).getFullYear()} años
                </p>
              )}
            </div>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Contraseña
                </span>
              </div>
            </div>

            {/* Campos de contraseña */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña <span className="text-red-500">*</span></Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generarPasswordAleatoria}
                  disabled={isCreating}
                  className="h-8"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                  Generar
                </Button>
              </div>
              <Input
                id="password"
                type="text"
                placeholder="Mín. 10 caracteres con 2 especiales (!@#$%...)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isCreating}
                required
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Debe tener al menos 10 caracteres y 2 caracteres especiales
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña <span className="text-red-500">*</span></Label>
              <Input
                id="confirmPassword"
                type="text"
                placeholder="Repite la contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={isCreating}
                required
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear Usuario
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
