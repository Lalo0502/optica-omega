"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Calendar, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

interface UsuarioCardProps {
  usuario: Usuario;
  index: number;
  onSelectUsuario: (usuario: Usuario) => void;
}

export default function UsuarioCard({ usuario, index, onSelectUsuario }: UsuarioCardProps) {
  // Obtener iniciales del email o nombre
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

  // Formatear fecha relativa (ej: "Hace 2 horas")
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Card 
        className="relative overflow-hidden border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all h-full cursor-pointer"
        onClick={() => onSelectUsuario(usuario)}
      >
        {/* Gradient decorativo superior - Tonos slate */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600 dark:from-slate-600 dark:via-slate-500 dark:to-slate-400" />
        
        <CardContent className="p-6">
          {/* Header con Avatar */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-white dark:border-slate-800 shadow-md">
                <AvatarFallback className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xl">
                  {getInitials(usuario)}
                </AvatarFallback>
              </Avatar>
              {/* Indicador online */}
              <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 bg-green-500 border-[3px] border-white dark:border-slate-900 rounded-full" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-1 truncate">
                {getNombreCompleto(usuario)}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{usuario.email || "Sin email"}</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                Activo
              </Badge>
            </div>

            {/* Botón para ver detalles */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onSelectUsuario(usuario);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-4" />

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Calendar className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Registro</p>
                <p className="font-semibold text-sm">{formatDateRelative(usuario.created_at)}</p>
                <p className="text-xs text-muted-foreground">{formatDate(usuario.created_at)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Clock className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Último acceso</p>
                <p className="font-semibold text-sm">{formatDateRelative(usuario.last_sign_in_at)}</p>
                <p className="text-xs text-muted-foreground">{formatDate(usuario.last_sign_in_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
