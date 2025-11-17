"use client";

import { motion, AnimatePresence } from "framer-motion";
import UsuarioCard from "./UsuarioCard";
import { Users } from "lucide-react";

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

interface UsuarioListProps {
  usuarios: Usuario[];
  isLoading: boolean;
  onSelectUsuario: (usuario: Usuario) => void;
}

export default function UsuarioList({ usuarios, isLoading, onSelectUsuario }: UsuarioListProps) {
  // Estado de carga
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[280px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Estado vacío
  if (usuarios.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 px-4"
      >
        <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-4">
          <Users className="h-12 w-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No hay usuarios registrados</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Comienza creando tu primer usuario con el botón "Nuevo Usuario" en la parte superior.
        </p>
      </motion.div>
    );
  }

  // Lista de usuarios
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence mode="popLayout">
        {usuarios.map((usuario, index) => (
          <UsuarioCard
            key={usuario.id}
            usuario={usuario}
            index={index}
            onSelectUsuario={onSelectUsuario}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
