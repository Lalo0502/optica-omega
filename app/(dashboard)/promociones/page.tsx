"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ImageUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Promocion {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_url: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  activa: boolean;
  orden: number;
  created_at: string;
}

interface PromocionForm {
  titulo: string;
  descripcion: string;
  imagen_url: string;
  fecha_inicio: string;
  fecha_fin: string;
  activa: boolean;
  orden: number;
}

export default function PromocionesPage() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promocion | null>(null);
  const [formData, setFormData] = useState<PromocionForm>({
    titulo: "",
    descripcion: "",
    imagen_url: "",
    fecha_inicio: "",
    fecha_fin: "",
    activa: true,
    orden: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPromociones();

    // Suscripción en tiempo real
    const channel = supabase
      .channel("promociones-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "promociones",
        },
        () => {
          fetchPromociones();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPromociones = async () => {
    try {
      const { data, error } = await supabase
        .from("promociones")
        .select("*")
        .order("orden", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPromociones(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las promociones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPromo) {
        // Actualizar
        const { error } = await supabase
          .from("promociones")
          .update(formData)
          .eq("id", editingPromo.id);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Promoción actualizada correctamente",
        });
      } else {
        // Crear nueva
        const { error } = await supabase.from("promociones").insert([formData]);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Promoción creada correctamente",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchPromociones();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la promoción",
        variant: "destructive",
      });
    }
  };

  const toggleActiva = async (id: string, activa: boolean) => {
    try {
      const { error } = await supabase
        .from("promociones")
        .update({ activa: !activa })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Promoción ${!activa ? "activada" : "desactivada"}`,
      });

      fetchPromociones();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta promoción?")) return;

    try {
      const { error } = await supabase
        .from("promociones")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Promoción eliminada correctamente",
      });

      fetchPromociones();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la promoción",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (promo: Promocion) => {
    setEditingPromo(promo);
    setFormData({
      titulo: promo.titulo,
      descripcion: promo.descripcion,
      imagen_url: promo.imagen_url || "",
      fecha_inicio: promo.fecha_inicio.split("T")[0],
      fecha_fin: promo.fecha_fin.split("T")[0],
      activa: promo.activa,
      orden: promo.orden,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPromo(null);
    setFormData({
      titulo: "",
      descripcion: "",
      imagen_url: "",
      fecha_inicio: "",
      fecha_fin: "",
      activa: true,
      orden: 0,
    });
  };

  const isPromocionVigente = (inicio: string, fin: string) => {
    const now = new Date();
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    return now >= fechaInicio && now <= fechaFin;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-slate-900 tracking-tight">
            Promociones
          </h1>
          <p className="text-slate-600 mt-1">
            Gestiona las promociones que aparecen en el landing
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Promoción
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPromo ? "Editar Promoción" : "Nueva Promoción"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  placeholder="2x1 en Lentes"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  placeholder="Segundo par con 50% de descuento"
                  rows={3}
                  required
                />
              </div>

              <ImageUpload
                currentImageUrl={formData.imagen_url}
                onImageUploaded={(url) =>
                  setFormData({ ...formData, imagen_url: url })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha_inicio">Fecha Inicio *</Label>
                  <Input
                    id="fecha_inicio"
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) =>
                      setFormData({ ...formData, fecha_inicio: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fecha_fin">Fecha Fin *</Label>
                  <Input
                    id="fecha_fin"
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) =>
                      setFormData({ ...formData, fecha_fin: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orden">Orden de Aparición</Label>
                  <Input
                    id="orden"
                    type="number"
                    value={formData.orden}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orden: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Menor número aparece primero
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="activa"
                    checked={formData.activa}
                    onChange={(e) =>
                      setFormData({ ...formData, activa: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="activa" className="cursor-pointer">
                    Mostrar en landing
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPromo ? "Actualizar" : "Crear"} Promoción
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Promociones */}
      {promociones.length === 0 ? (
        <Card className="p-12 text-center">
          <Tag className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No hay promociones
          </h3>
          <p className="text-slate-600 mb-4">
            Crea tu primera promoción para mostrarla en el landing
          </p>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Crear Promoción
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {promociones.map((promo) => {
            const vigente = isPromocionVigente(
              promo.fecha_inicio,
              promo.fecha_fin
            );
            return (
              <Card
                key={promo.id}
                className="p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Imagen (si existe) */}
                  {promo.imagen_url && (
                    <div className="w-full lg:w-32 h-32 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={promo.imagen_url}
                        alt={promo.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Contenido */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-slate-900">
                            {promo.titulo}
                          </h3>
                          <Badge
                            variant={promo.activa ? "default" : "outline"}
                            className={
                              promo.activa
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-slate-100 text-slate-600"
                            }
                          >
                            {promo.activa ? "Activa" : "Inactiva"}
                          </Badge>
                          {vigente && promo.activa && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              Vigente
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-600">{promo.descripcion}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(promo.fecha_inicio), "d MMM", {
                            locale: es,
                          })}{" "}
                          -{" "}
                          {format(new Date(promo.fecha_fin), "d MMM yyyy", {
                            locale: es,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Orden:</span>
                        <span className="font-medium">{promo.orden}</span>
                      </div>
                    </div>

                    {!vigente && (
                      <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg w-fit">
                        <AlertCircle className="w-4 h-4" />
                        <span>
                          Esta promoción no está vigente según las fechas
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex lg:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActiva(promo.id, promo.activa)}
                      className="gap-2"
                    >
                      {promo.activa ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Mostrar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(promo)}
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(promo.id)}
                      className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
