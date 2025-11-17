"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import UsuarioList from "@/components/usuarios/UsuarioList";
import NuevoUsuarioDialog from "@/components/usuarios/NuevoUsuarioDialog";
import UsuarioDetallesDialog from "@/components/usuarios/UsuarioDetallesDialog";
import { supabase } from "@/lib/supabase";

// Cambiar el título de la página
if (typeof document !== "undefined") {
  document.title = "Usuarios | Óptica Omega";
}

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

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [showDetallesDialog, setShowDetallesDialog] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Obtener usuario actual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Cargar usuarios
  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/usuarios');
      
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }

      const data = await response.json();
      const usuariosConEmail = (data.users || []).filter((u: Usuario) => u.email);
      setUsuarios(usuariosConEmail);
    } catch (error: any) {
      console.error("Error al cargar usuarios:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Manejar selección de usuario
  const handleSelectUsuario = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setShowDetallesDialog(true);
  };

  // Manejar eliminación de usuario
  const handleUsuarioEliminado = () => {
    setShowDetallesDialog(false);
    setUsuarioSeleccionado(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {usuarios.length} usuarios en el sistema
              </p>
            </div>
          </div>
        </div>
        <Button size="lg" className="gap-2 shadow-sm" onClick={() => setIsDialogOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Crear Usuario
        </Button>
      </motion.div>

      {/* Lista de usuarios usando componente */}
      <UsuarioList 
        usuarios={usuarios}
        isLoading={isLoading}
        onSelectUsuario={handleSelectUsuario}
      />

      {/* Diálogo de crear usuario */}
      <NuevoUsuarioDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onRecargar={fetchUsuarios}
      />

      {/* Diálogo de detalles del usuario */}
      <UsuarioDetallesDialog
        open={showDetallesDialog}
        onOpenChange={setShowDetallesDialog}
        usuario={usuarioSeleccionado}
        onRecargar={fetchUsuarios}
        onUsuarioEliminado={handleUsuarioEliminado}
        currentUserId={currentUserId}
      />
    </div>
  );
}
