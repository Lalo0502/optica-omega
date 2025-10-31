"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Edit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Cita {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fecha_preferida: string;
  hora_preferida: string;
  motivo: string;
  notas: string | null;
  estado: "pendiente" | "confirmada" | "rechazada";
  created_at: string;
}

export default function CitasPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "todas" | "pendiente" | "confirmada" | "rechazada"
  >("todas");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCitas();

    // Suscripción en tiempo real para nuevas citas
    const channel = supabase
      .channel("citas-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "solicitudes_citas",
        },
        () => {
          fetchCitas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCitas = async () => {
    try {
      const { data, error } = await supabase
        .from("solicitudes_citas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCitas(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las citas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEstado = async (
    id: string,
    estado: "confirmada" | "rechazada"
  ) => {
    try {
      const { error } = await supabase
        .from("solicitudes_citas")
        .update({ estado })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Cita ${
          estado === "confirmada" ? "confirmada" : "rechazada"
        } correctamente`,
      });

      fetchCitas();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (cita: Cita) => {
    setEditingCita(cita);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCita) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("solicitudes_citas")
        .update({
          nombre: editingCita.nombre,
          apellido: editingCita.apellido,
          telefono: editingCita.telefono,
          email: editingCita.email,
          fecha_preferida: editingCita.fecha_preferida,
          hora_preferida: editingCita.hora_preferida,
          motivo: editingCita.motivo,
          notas: editingCita.notas,
        })
        .eq("id", editingCita.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Cita actualizada correctamente",
      });

      setIsEditDialogOpen(false);
      setEditingCita(null);
      fetchCitas();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la cita",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const citasFiltradas = citas.filter((cita) => {
    if (filter === "todas") return true;
    return cita.estado === filter;
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pendiente
          </Badge>
        );
      case "confirmada":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Confirmada
          </Badge>
        );
      case "rechazada":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Rechazada
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-slate-900 tracking-tight">
          Gestión de Citas
        </h1>
        <p className="text-slate-600 mt-1">
          Administra las solicitudes de citas de tus pacientes
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "todas" ? "default" : "outline"}
          onClick={() => setFilter("todas")}
          size="sm"
        >
          Todas ({citas.length})
        </Button>
        <Button
          variant={filter === "pendiente" ? "default" : "outline"}
          onClick={() => setFilter("pendiente")}
          size="sm"
          className="gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          Pendientes ({citas.filter((c) => c.estado === "pendiente").length})
        </Button>
        <Button
          variant={filter === "confirmada" ? "default" : "outline"}
          onClick={() => setFilter("confirmada")}
          size="sm"
          className="gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Confirmadas ({citas.filter((c) => c.estado === "confirmada").length})
        </Button>
        <Button
          variant={filter === "rechazada" ? "default" : "outline"}
          onClick={() => setFilter("rechazada")}
          size="sm"
          className="gap-2"
        >
          <XCircle className="w-4 h-4" />
          Rechazadas ({citas.filter((c) => c.estado === "rechazada").length})
        </Button>
      </div>

      {/* Lista de Citas */}
      {citasFiltradas.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No hay citas
          </h3>
          <p className="text-slate-600">
            {filter === "todas"
              ? "No se han recibido solicitudes de citas aún"
              : `No hay citas ${filter}s`}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {citasFiltradas.map((cita) => (
            <Card
              key={cita.id}
              className="p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Info Principal */}
                <div className="space-y-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {cita.nombre} {cita.apellido}
                        </h3>
                        {getEstadoBadge(cita.estado)}
                      </div>
                      <p className="text-sm text-slate-600">
                        Solicitada:{" "}
                        {format(
                          new Date(cita.created_at),
                          "d 'de' MMMM 'a las' HH:mm",
                          { locale: es }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Datos de Contacto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{cita.telefono}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{cita.email}</span>
                    </div>
                  </div>

                  {/* Fecha y Hora Preferida */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-900 font-medium">
                        {format(
                          new Date(cita.fecha_preferida),
                          "d 'de' MMMM, yyyy",
                          { locale: es }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-900 font-medium">
                        {cita.hora_preferida}
                      </span>
                    </div>
                  </div>

                  {/* Motivo */}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Motivo de la cita:
                    </p>
                    <p className="text-sm text-slate-900">{cita.motivo}</p>
                  </div>

                  {/* Notas */}
                  {cita.notas && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs font-medium text-blue-700 mb-1">
                        Notas adicionales:
                      </p>
                      <p className="text-sm text-blue-900">{cita.notas}</p>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex lg:flex-col gap-2">
                  <Button
                    onClick={() => openEditDialog(cita)}
                    variant="outline"
                    className="gap-2"
                    size="sm"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                  {cita.estado === "pendiente" && (
                    <>
                      <Button
                        onClick={() => updateEstado(cita.id, "confirmada")}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirmar
                      </Button>
                      <Button
                        onClick={() => updateEstado(cita.id, "rechazada")}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4" />
                        Rechazar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para Editar Cita */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cita</DialogTitle>
          </DialogHeader>
          {editingCita && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={editingCita.nombre}
                    onChange={(e) =>
                      setEditingCita({ ...editingCita, nombre: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    value={editingCita.apellido}
                    onChange={(e) =>
                      setEditingCita({
                        ...editingCita,
                        apellido: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={editingCita.telefono}
                    onChange={(e) =>
                      setEditingCita({
                        ...editingCita,
                        telefono: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingCita.email}
                    onChange={(e) =>
                      setEditingCita({ ...editingCita, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_preferida">Fecha Preferida *</Label>
                  <Input
                    id="fecha_preferida"
                    type="date"
                    value={editingCita.fecha_preferida}
                    onChange={(e) =>
                      setEditingCita({
                        ...editingCita,
                        fecha_preferida: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora_preferida">Hora Preferida *</Label>
                  <Input
                    id="hora_preferida"
                    type="time"
                    value={editingCita.hora_preferida}
                    onChange={(e) =>
                      setEditingCita({
                        ...editingCita,
                        hora_preferida: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo *</Label>
                <Textarea
                  id="motivo"
                  value={editingCita.motivo}
                  onChange={(e) =>
                    setEditingCita({ ...editingCita, motivo: e.target.value })
                  }
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Notas Adicionales</Label>
                <Textarea
                  id="notas"
                  value={editingCita.notas || ""}
                  onChange={(e) =>
                    setEditingCita({ ...editingCita, notas: e.target.value })
                  }
                  rows={3}
                  placeholder="Agregar notas internas..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingCita(null);
                  }}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
