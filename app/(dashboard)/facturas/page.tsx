"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Cambiar el título de la página
if (typeof document !== "undefined") {
  document.title = "Facturas | Óptica Omega";
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  FileText,
  Receipt,
  Filter,
  AlertCircle,
  Users,
  MoreHorizontal,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { FacturaResumen, EstadoFactura } from "@/types/facturas";
import NuevaFacturaDialog from "@/components/facturas/NuevaFacturaDialog";
import FacturaDetallesDialog from "@/components/facturas/FacturaDetallesDialog";
import FacturasListSkeleton from "@/components/facturas/FacturasListSkeleton";
import DeleteConfirmation from "@/components/ui/delete-confirmation";

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<FacturaResumen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFacturaId, setSelectedFacturaId] = useState<string | null>(
    null
  );
  const [facturaToDelete, setFacturaToDelete] = useState<{
    id: string;
    folio: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Detectar si se debe abrir el diálogo desde otra página
  useEffect(() => {
    const openDialog = searchParams?.get("openDialog");
    if (openDialog === "true") {
      setIsDialogOpen(true);
    }
  }, [searchParams]);

  // Cargar facturas desde Supabase
  const fetchFacturas = async () => {
    try {
      setIsLoading(true);

      let query = supabase.from("vista_facturas_resumen").select("*");

      // Aplicar filtro por estado
      if (statusFilter !== "todos") {
        query = query.eq("estado", statusFilter);
      }

      // Aplicar búsqueda por folio
      if (debouncedSearchTerm) {
        query = query.ilike("folio", `%${debouncedSearchTerm}%`);
      }

      // Ordenar por fecha descendente
      query = query.order("fecha", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      setFacturas(data || []);
    } catch (error) {
      console.error("Error al cargar facturas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las facturas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacturas();
  }, [debouncedSearchTerm, statusFilter]);

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  // Obtener color de badge según estado
  const getStatusColor = (status: EstadoFactura) => {
    switch (status) {
      case "pagado":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelado":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: EstadoFactura) => {
    const labels = {
      pendiente: "Pendiente",
      pagado: "Pagado",
      cancelado: "Cancelado",
    };
    return labels[status] || status;
  };

  // Eliminar factura
  const handleDeleteFactura = async () => {
    if (!facturaToDelete) return;

    setIsDeleting(true);
    try {
      // Eliminar la factura (las relaciones se eliminan en cascada gracias a ON DELETE CASCADE)
      const { error } = await supabase
        .from("facturas")
        .delete()
        .eq("id", facturaToDelete.id);

      if (error) throw error;

      toast({
        title: "Factura eliminada",
        description: "La factura ha sido eliminada correctamente",
      });

      // Recargar facturas
      fetchFacturas();
    } catch (error) {
      console.error("Error al eliminar factura:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la factura",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setFacturaToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
              <p className="text-sm text-muted-foreground">
                Gestión de ventas y cobros
              </p>
            </div>
          </div>
        </div>
        <Button
          size="lg"
          className="gap-2 shadow-sm flex-shrink-0"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-5 w-5" />
          Nueva Factura
        </Button>
      </div>

      {/* Tabla de Facturas */}
      <Card>
        <CardContent className="p-6">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por folio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="pagado">Pagados</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contenido */}
          {isLoading ? (
            <FacturasListSkeleton />
          ) : facturas.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No hay facturas todavía
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Crea tu primera factura para comenzar a gestionar tus ventas
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Factura
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {facturas.map((factura) => (
                <Card
                  key={factura.id}
                  className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer"
                  onClick={() => setSelectedFacturaId(factura.id)}
                >
                  <CardContent className="p-6">
                    {/* Header con Folio, Estado y Menú */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="space-y-1">
                        <code className="text-base font-mono font-semibold text-foreground">
                          {factura.folio}
                        </code>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            new Date(factura.fecha),
                            "dd 'de' MMMM, yyyy",
                            { locale: es }
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(factura.estado)}>
                          {getStatusLabel(factura.estado)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Más opciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFacturaId(factura.id);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFacturaToDelete({
                                  id: factura.id,
                                  folio: factura.folio,
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Información de Pacientes */}
                    <div className="mb-5 pb-5 border-b">
                      <div className="flex items-center gap-2.5 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium">
                          {factura.total_pacientes}{" "}
                          {factura.total_pacientes === 1
                            ? "paciente"
                            : "pacientes"}
                        </span>
                        {factura.total_items > 0 && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {factura.total_items}{" "}
                              {factura.total_items === 1 ? "item" : "items"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Montos */}
                    <div className="space-y-3 mb-5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          Total:
                        </span>
                        <span className="font-bold text-xl">
                          {formatCurrency(factura.total)}
                        </span>
                      </div>
                      {factura.total_pagado > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Pagado:
                          </span>
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(factura.total_pagado)}
                          </span>
                        </div>
                      )}
                      {factura.saldo > 0 && (
                        <div className="flex justify-between items-center p-2 rounded-md bg-orange-50 dark:bg-orange-950/20">
                          <span className="text-sm font-medium text-orange-900 dark:text-orange-200">
                            Saldo pendiente:
                          </span>
                          <span className="text-base font-bold text-orange-600 dark:text-orange-400">
                            {formatCurrency(factura.saldo)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo Nueva Factura */}
      <NuevaFacturaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchFacturas}
      />

      {/* Diálogo Detalles de Factura */}
      <FacturaDetallesDialog
        facturaId={selectedFacturaId}
        open={!!selectedFacturaId}
        onOpenChange={(open) => {
          if (!open) setSelectedFacturaId(null);
        }}
        onUpdate={fetchFacturas}
      />

      {/* Diálogo de Confirmación de Eliminación */}
      <DeleteConfirmation
        open={!!facturaToDelete}
        onOpenChange={(open) => {
          if (!open) setFacturaToDelete(null);
        }}
        onConfirm={handleDeleteFactura}
        title="¿Eliminar factura?"
        description="Esta acción no se puede deshacer. La factura y todos sus registros relacionados (items, pagos, referencias a recetas) serán eliminados permanentemente."
        itemName={facturaToDelete?.folio}
      />
    </div>
  );
}
