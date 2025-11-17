"use client";

import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, Clock, Phone, User, Edit, X, Save, Loader2, Trash2, Key, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DeleteConfirmation from "@/components/ui/delete-confirmation";
import { Separator } from "@/components/ui/separator";

interface Usuario {
  id: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string | null;
  user_metadata?: {
    primer_nombre?: string;
    segundo_nombre?: string;
    primer_apellido?: string;
    segundo_apellido?: string;
    telefono?: string;
    fecha_nacimiento?: string;
    edad?: number;
    nombre_completo?: string;
  };
}

interface UsuarioDetallesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  onRecargar: () => void;
  onUsuarioEliminado?: () => void;
  currentUserId?: string | null;
}

export default function UsuarioDetallesDialog({ 
  open, 
  onOpenChange, 
  usuario, 
  onRecargar,
  onUsuarioEliminado,
  currentUserId
}: UsuarioDetallesDialogProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(usuario);
  const [formDataEdit, setFormDataEdit] = useState({
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    telefono: "",
    fecha_nacimiento: "",
  });
  const { toast } = useToast();

  // Actualizar usuario actual cuando cambia el prop
  useEffect(() => {
    setUsuarioActual(usuario);
  }, [usuario]);

  // Obtener iniciales
  const getInitials = (usuario: Usuario) => {
    if (usuario.user_metadata?.primer_nombre && usuario.user_metadata?.primer_apellido) {
      return `${usuario.user_metadata.primer_nombre.charAt(0)}${usuario.user_metadata.primer_apellido.charAt(0)}`.toUpperCase();
    }
    if (usuario.email) {
      const parts = usuario.email.split("@")[0];
      return parts.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  // Obtener nombre completo
  const getNombreCompleto = (usuario: Usuario) => {
    if (usuario.user_metadata?.nombre_completo) {
      return usuario.user_metadata.nombre_completo;
    }
    if (usuario.user_metadata?.primer_nombre || usuario.user_metadata?.primer_apellido) {
      return `${usuario.user_metadata.primer_nombre || ''} ${usuario.user_metadata.primer_apellido || ''}`.trim();
    }
    return usuario.email?.split("@")[0] || "Sin nombre";
  };

  // Formatear fecha
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Nunca";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  // Formatear fecha relativa
  const formatDateRelative = (dateString: string | null | undefined) => {
    if (!dateString) return "Nunca";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Hoy";
      if (diffDays === 1) return "Ayer";
      if (diffDays < 7) return `Hace ${diffDays} días`;
      if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
      if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
      return `Hace ${Math.floor(diffDays / 365)} años`;
    } catch {
      return "Fecha inválida";
    }
  };

  // Iniciar modo edición
  const iniciarEdicion = () => {
    if (usuarioActual) {
      setFormDataEdit({
        primer_nombre: usuarioActual.user_metadata?.primer_nombre || "",
        segundo_nombre: usuarioActual.user_metadata?.segundo_nombre || "",
        primer_apellido: usuarioActual.user_metadata?.primer_apellido || "",
        segundo_apellido: usuarioActual.user_metadata?.segundo_apellido || "",
        telefono: usuarioActual.user_metadata?.telefono || "",
        fecha_nacimiento: usuarioActual.user_metadata?.fecha_nacimiento || "",
      });
      setIsEditMode(true);
    }
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setIsEditMode(false);
  };

  // Generar contraseña aleatoria
  const generarPasswordAleatoria = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    password += special[Math.floor(Math.random() * special.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = password.length; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setPasswordData({
      newPassword: password,
      confirmPassword: password
    });

    toast({
      title: "Contraseña generada",
      description: "Se ha generado una contraseña segura de 16 caracteres",
    });
  };

  // Cambiar contraseña
  const handleChangePassword = async () => {
    if (!usuarioActual) return;

    // Validaciones
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Debes ingresar la nueva contraseña y confirmarla",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 10) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 10 caracteres",
        variant: "destructive",
      });
      return;
    }

    const specialChars = passwordData.newPassword.match(/[!@#$%^&*(),.?":{}|<>_+\-=[\]\\;'/]/g);
    if (!specialChars || specialChars.length < 2) {
      toast({
        title: "Error",
        description: "La contraseña debe contener al menos 2 caracteres especiales",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsChangingPassword(true);

      const response = await fetch(`/api/admin/usuarios/${usuarioActual.id}/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar contraseña');
      }

      // Copiar contraseña al portapapeles
      try {
        await navigator.clipboard.writeText(passwordData.newPassword);
        toast({
          title: "✅ Contraseña actualizada",
          description: "La nueva contraseña se ha copiado al portapapeles",
          duration: 5000,
        });
      } catch (clipboardError) {
        toast({
          title: "✅ Contraseña actualizada",
          description: `Nueva contraseña: ${passwordData.newPassword}`,
          duration: 10000,
        });
      }

      // Limpiar y cerrar
      setPasswordData({ newPassword: "", confirmPassword: "" });
      setShowChangePassword(false);
    } catch (error: any) {
      console.error("Error al cambiar contraseña:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar la contraseña",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async () => {
    if (!usuarioActual) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/admin/usuarios/${usuarioActual.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar usuario');
      }

      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente del sistema",
      });

      // Cerrar diálogos
      onOpenChange(false);
      
      // Recargar usuarios
      onRecargar();
      
      // Callback opcional
      if (onUsuarioEliminado) {
        onUsuarioEliminado();
      }
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Actualizar usuario
  const handleUpdateUser = async () => {
    if (!usuarioActual) return;

    // Validaciones
    if (!formDataEdit.primer_nombre || !formDataEdit.primer_apellido || !formDataEdit.telefono || !formDataEdit.fecha_nacimiento) {
      toast({
        title: "Error",
        description: "Los campos Primer Nombre, Primer Apellido, Teléfono y Fecha de Nacimiento son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);

      // Calcular edad
      const edad = new Date().getFullYear() - new Date(formDataEdit.fecha_nacimiento).getFullYear();

      const response = await fetch(`/api/admin/usuarios/${usuarioActual.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primer_nombre: formDataEdit.primer_nombre,
          segundo_nombre: formDataEdit.segundo_nombre || null,
          primer_apellido: formDataEdit.primer_apellido,
          segundo_apellido: formDataEdit.segundo_apellido || null,
          telefono: formDataEdit.telefono,
          fecha_nacimiento: formDataEdit.fecha_nacimiento,
          edad,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar usuario');
      }

      toast({
        title: "Usuario actualizado",
        description: "Los cambios se guardaron exitosamente",
      });

      // Recargar usuarios
      onRecargar();
      
      // Actualizar el usuario actual con los nuevos datos
      const usuarioActualizado: Usuario = {
        ...usuarioActual,
        user_metadata: {
          ...usuarioActual.user_metadata,
          primer_nombre: formDataEdit.primer_nombre,
          segundo_nombre: formDataEdit.segundo_nombre || undefined,
          primer_apellido: formDataEdit.primer_apellido,
          segundo_apellido: formDataEdit.segundo_apellido || undefined,
          telefono: formDataEdit.telefono,
          fecha_nacimiento: formDataEdit.fecha_nacimiento,
          edad,
          nombre_completo: `${formDataEdit.primer_nombre} ${formDataEdit.segundo_nombre || ''} ${formDataEdit.primer_apellido} ${formDataEdit.segundo_apellido || ''}`.trim(),
        },
      };
      setUsuarioActual(usuarioActualizado);
      setIsEditMode(false);
    } catch (error: any) {
      console.error("Error al actualizar usuario:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!usuarioActual) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        setIsEditMode(false);
      }
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-slate-200 dark:border-slate-700">
              <AvatarFallback className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-lg">
                {getInitials(usuarioActual)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">
                {getNombreCompleto(usuarioActual)}
              </h3>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800 mt-1">
                Activo
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Información completa del usuario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información Personal */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase">Información Personal</h4>
            
            {!isEditMode ? (
              /* Modo Vista */
              <div className="grid grid-cols-2 gap-4">
                {usuarioActual.user_metadata?.primer_nombre && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Primer Nombre</Label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{usuarioActual.user_metadata.primer_nombre}</span>
                    </div>
                  </div>
                )}

                {usuarioActual.user_metadata?.segundo_nombre && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Segundo Nombre</Label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{usuarioActual.user_metadata.segundo_nombre}</span>
                    </div>
                  </div>
                )}

                {usuarioActual.user_metadata?.primer_apellido && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Primer Apellido</Label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{usuarioActual.user_metadata.primer_apellido}</span>
                    </div>
                  </div>
                )}

                {usuarioActual.user_metadata?.segundo_apellido && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Segundo Apellido</Label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{usuarioActual.user_metadata.segundo_apellido}</span>
                    </div>
                  </div>
                )}

                {usuarioActual.user_metadata?.edad && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Edad</Label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{usuarioActual.user_metadata.edad} años</span>
                    </div>
                  </div>
                )}

                {usuarioActual.user_metadata?.fecha_nacimiento && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Fecha de Nacimiento</Label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(usuarioActual.user_metadata.fecha_nacimiento), "dd/MM/yyyy", { locale: es })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Modo Edición */
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_primer_nombre">
                    Primer Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_primer_nombre"
                    value={formDataEdit.primer_nombre}
                    onChange={(e) => setFormDataEdit({ ...formDataEdit, primer_nombre: e.target.value })}
                    disabled={isUpdating}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_segundo_nombre">Segundo Nombre</Label>
                  <Input
                    id="edit_segundo_nombre"
                    value={formDataEdit.segundo_nombre}
                    onChange={(e) => setFormDataEdit({ ...formDataEdit, segundo_nombre: e.target.value })}
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_primer_apellido">
                    Primer Apellido <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_primer_apellido"
                    value={formDataEdit.primer_apellido}
                    onChange={(e) => setFormDataEdit({ ...formDataEdit, primer_apellido: e.target.value })}
                    disabled={isUpdating}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_segundo_apellido">Segundo Apellido</Label>
                  <Input
                    id="edit_segundo_apellido"
                    value={formDataEdit.segundo_apellido}
                    onChange={(e) => setFormDataEdit({ ...formDataEdit, segundo_apellido: e.target.value })}
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit_fecha_nacimiento">
                    Fecha de Nacimiento <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_fecha_nacimiento"
                    type="date"
                    value={formDataEdit.fecha_nacimiento}
                    onChange={(e) => setFormDataEdit({ ...formDataEdit, fecha_nacimiento: e.target.value })}
                    disabled={isUpdating}
                    required
                  />
                  {formDataEdit.fecha_nacimiento && (
                    <p className="text-sm text-muted-foreground">
                      Edad: {new Date().getFullYear() - new Date(formDataEdit.fecha_nacimiento).getFullYear()} años
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Información de Contacto */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase">Información de Contacto</h4>
            
            {!isEditMode ? (
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Correo Electrónico</Label>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium truncate">{usuarioActual.email}</span>
                  </div>
                </div>

                {usuarioActual.user_metadata?.telefono && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Teléfono</Label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{usuarioActual.user_metadata.telefono}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Correo Electrónico (no editable)</Label>
                  <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-md opacity-60">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium truncate">{usuarioActual.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_telefono">
                    Teléfono <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_telefono"
                    type="tel"
                    value={formDataEdit.telefono}
                    onChange={(e) => setFormDataEdit({ ...formDataEdit, telefono: e.target.value })}
                    disabled={isUpdating}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Información de la Cuenta (Solo en modo vista) */}
          {!isEditMode && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase">Información de la Cuenta</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Fecha de Registro</Label>
                  <div className="space-y-1 p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{formatDateRelative(usuarioActual.created_at)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">{formatDate(usuarioActual.created_at)}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Último Acceso</Label>
                  <div className="space-y-1 p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{formatDateRelative(usuarioActual.last_sign_in_at)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">{formatDate(usuarioActual.last_sign_in_at)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">ID del Usuario</Label>
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                  <code className="text-xs font-mono text-muted-foreground">{usuarioActual.id}</code>
                </div>
              </div>
            </div>
          )}

          {/* Cambiar Contraseña (Solo para el usuario actual) */}
          {!isEditMode && currentUserId === usuarioActual?.id && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Cambiar Contraseña</h4>
                  {!showChangePassword && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChangePassword(true)}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Cambiar
                    </Button>
                  )}
                </div>

                {showChangePassword && (
                  <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="newPassword">Nueva Contraseña</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={generarPasswordAleatoria}
                          disabled={isChangingPassword}
                          className="h-7"
                        >
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Generar
                        </Button>
                      </div>
                      <Input
                        id="newPassword"
                        type="text"
                        placeholder="Mín. 10 caracteres con 2 especiales"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        disabled={isChangingPassword}
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type="text"
                        placeholder="Repite la contraseña"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        disabled={isChangingPassword}
                        className="font-mono"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowChangePassword(false);
                          setPasswordData({ newPassword: "", confirmPassword: "" });
                        }}
                        disabled={isChangingPassword}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        className="flex-1"
                      >
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!isEditMode ? (
            <>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
                className="sm:mr-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Usuario
              </Button>
              <div className="flex gap-2 sm:ml-auto">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cerrar
                </Button>
                <Button onClick={iniciarEdicion}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={cancelarEdicion}
                disabled={isUpdating}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button 
                onClick={handleUpdateUser}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Componente de confirmación de eliminación */}
      <DeleteConfirmation
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteUser}
        title="¿Eliminar este usuario?"
        description="Esta acción no se puede deshacer. Se eliminará permanentemente el usuario del sistema y perderá acceso a la aplicación."
        confirmText="ELIMINAR"
        itemName={usuarioActual ? `${getNombreCompleto(usuarioActual)} (${usuarioActual.email})` : ""}
      />
    </Dialog>
  );
}
