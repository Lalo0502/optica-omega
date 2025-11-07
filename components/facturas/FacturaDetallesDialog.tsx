"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import {
  FileText,
  Users,
  Receipt,
  DollarSign,
  Calendar,
  CreditCard,
  Wallet,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  Printer,
  Edit,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { generateFacturaPDF } from "@/lib/pdf";
import EditarFacturaDialog from "@/components/facturas/EditarFacturaDialog";
import {
  Factura,
  FacturaItem,
  FacturaPago,
  EstadoFactura,
  MetodoPago,
} from "@/types/facturas";
import { Patient } from "@/types/pacientes";

interface FacturaDetallesDialogProps {
  facturaId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

interface FacturaCompleta extends Factura {
  pacientes: Patient[];
  items: FacturaItem[];
  pagos: FacturaPago[];
}

export default function FacturaDetallesDialog({
  facturaId,
  open,
  onOpenChange,
  onUpdate,
}: FacturaDetallesDialogProps) {
  const [factura, setFactura] = useState<FacturaCompleta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPagoDialog, setShowPagoDialog] = useState(false);
  const [showEstadoDialog, setShowEstadoDialog] = useState(false);
  const [showEditarDialog, setShowEditarDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para registro de pago
  const [pagoMonto, setPagoMonto] = useState("");
  const [pagoMetodo, setPagoMetodo] = useState<MetodoPago>("efectivo");
  const [pagoReferencia, setPagoReferencia] = useState("");
  const [pagoNotas, setPagoNotas] = useState("");

  // Estado para cambio de estado
  const [nuevoEstado, setNuevoEstado] = useState<EstadoFactura>("pendiente");

  const { toast } = useToast();

  // Función para descargar PDF
  const handleDescargarPDF = async () => {
    if (!factura) return;

    try {
      // Obtener el primer paciente
      const pacienteData = factura.pacientes?.[0];

      await generateFacturaPDF({
        id: factura.id,
        folio: factura.folio,
        fecha_emision: factura.fecha,
        fecha_vencimiento: null,
        subtotal: factura.subtotal,
        descuento: factura.descuento || 0,
        iva: factura.iva,
        total: factura.total,
        estado: factura.estado,
        aplicar_iva: factura.aplicar_iva,
        porcentaje_iva: factura.porcentaje_iva,
        aplicar_descuento: factura.aplicar_descuento || false,
        tipo_descuento: factura.tipo_descuento || null,
        valor_descuento: factura.valor_descuento || null,
        notas_descuento: factura.notas_descuento || null,
        notas: factura.notas,
        paciente: pacienteData
          ? {
              primer_nombre: pacienteData.primer_nombre,
              primer_apellido: pacienteData.primer_apellido,
              segundo_apellido: pacienteData.segundo_apellido || undefined,
              telefono: pacienteData.telefono,
              email: pacienteData.email || undefined,
              direccion: pacienteData.direccion || undefined,
            }
          : undefined,
        items: factura.items?.map((item) => ({
          descripcion:
            item.concepto + (item.descripcion ? ` - ${item.descripcion}` : ""),
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal,
        })),
        pagos: factura.pagos?.map((pago) => ({
          fecha_pago: pago.fecha,
          monto: pago.monto,
          metodo_pago: pago.metodo_pago,
        })),
      });

      toast({
        title: "PDF generado",
        description: "La factura se ha descargado correctamente",
      });
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

  // Cargar detalles de la factura
  const cargarFactura = async () => {
    if (!facturaId) return;

    setIsLoading(true);

    try {
      // 1. Cargar factura
      const { data: facturaData, error: facturaError } = await supabase
        .from("facturas")
        .select("*")
        .eq("id", facturaId)
        .single();

      if (facturaError) throw facturaError;

      // 2. Cargar pacientes
      const { data: pacientesData, error: pacientesError } = await supabase
        .from("facturas_pacientes")
        .select(
          `
          paciente_id,
          pacientes (*)
        `
        )
        .eq("factura_id", facturaId);

      if (pacientesError) throw pacientesError;

      // 3. Cargar items
      const { data: itemsData, error: itemsError } = await supabase
        .from("facturas_items")
        .select("*")
        .eq("factura_id", facturaId)
        .order("created_at", { ascending: true });

      if (itemsError) throw itemsError;

      // 4. Cargar pagos
      const { data: pagosData, error: pagosError } = await supabase
        .from("facturas_pagos")
        .select("*")
        .eq("factura_id", facturaId)
        .order("fecha", { ascending: false });

      if (pagosError) throw pagosError;

      setFactura({
        ...facturaData,
        pacientes: pacientesData.map((p: any) => p.pacientes),
        items: itemsData || [],
        pagos: pagosData || [],
      });

      setNuevoEstado(facturaData.estado);
    } catch (error) {
      console.error("Error cargando factura:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la factura",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Registrar pago
  const registrarPago = async () => {
    if (!factura || !pagoMonto) {
      toast({
        title: "Error",
        description: "Ingresa un monto válido",
        variant: "destructive",
      });
      return;
    }

    const monto = parseFloat(pagoMonto);

    if (isNaN(monto) || monto <= 0) {
      toast({
        title: "Error",
        description: "El monto debe ser mayor a 0",
        variant: "destructive",
      });
      return;
    }

    if (monto > factura.saldo) {
      toast({
        title: "Error",
        description: `El monto no puede ser mayor al saldo ($${formatCurrency(
          factura.saldo
        )})`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase.from("facturas_pagos").insert({
        factura_id: factura.id,
        fecha: format(new Date(), "yyyy-MM-dd"),
        monto,
        metodo_pago: pagoMetodo,
        referencia: pagoReferencia || null,
        notas: pagoNotas || null,
      });

      if (error) throw error;

      toast({
        title: "Pago registrado",
        description: "El pago se registró correctamente",
      });

      // Resetear formulario
      setPagoMonto("");
      setPagoReferencia("");
      setPagoNotas("");
      setShowPagoDialog(false);

      // Recargar factura
      await cargarFactura();
      onUpdate();
    } catch (error: any) {
      console.error("Error registrando pago:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar el pago",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Cambiar estado
  const cambiarEstado = async () => {
    if (!factura) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("facturas")
        .update({ estado: nuevoEstado })
        .eq("id", factura.id);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: "El estado de la factura se actualizó correctamente",
      });

      setShowEstadoDialog(false);
      await cargarFactura();
      onUpdate();
    } catch (error: any) {
      console.error("Error cambiando estado:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el estado",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  // Obtener info del estado
  const getEstadoInfo = (estado: EstadoFactura) => {
    switch (estado) {
      case "pagado":
        return {
          color:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          icon: CheckCircle2,
          label: "Pagado",
        };
      case "pendiente":
        return {
          color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
          icon: Clock,
          label: "Pendiente",
        };
      case "cancelado":
        return {
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
          icon: XCircle,
          label: "Cancelado",
        };
    }
  };

  // Obtener icono del método de pago
  const getMetodoPagoIcon = (metodo: MetodoPago) => {
    switch (metodo) {
      case "efectivo":
        return Wallet;
      case "tarjeta":
        return CreditCard;
      case "transferencia":
        return DollarSign;
    }
  };

  const getMetodoPagoLabel = (metodo: MetodoPago) => {
    const labels = {
      efectivo: "Efectivo",
      tarjeta: "Tarjeta",
      transferencia: "Transferencia",
    };
    return labels[metodo];
  };

  // Cargar cuando se abre el diálogo
  useEffect(() => {
    if (open && facturaId) {
      cargarFactura();
    }
  }, [open, facturaId]);

  if (!factura && !isLoading) {
    return null;
  }

  const estadoInfo = factura ? getEstadoInfo(factura.estado) : null;
  const EstadoIcon = estadoInfo?.icon;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-5xl max-h-[90vh] overflow-y-auto"
          hideCloseButton
        >
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">
                  {isLoading ? "Cargando..." : `Factura ${factura?.folio}`}
                </DialogTitle>
                <DialogDescription>
                  Detalles completos de la factura
                </DialogDescription>
              </div>
              {factura && estadoInfo && EstadoIcon && (
                <Badge
                  className={`${estadoInfo.color} flex items-center gap-2`}
                >
                  <EstadoIcon className="h-4 w-4" />
                  {estadoInfo.label}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : factura ? (
            <div className="space-y-6 py-4">
              {/* Información General y Totales */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Info General */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Información General
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Folio:
                      </span>
                      <span className="font-medium">{factura.folio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Fecha de Emisión:
                      </span>
                      <span>
                        {format(new Date(factura.fecha), "dd/MM/yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Registrada en Sistema:
                      </span>
                      <span className="text-sm">
                        {format(
                          new Date(factura.created_at),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </span>
                    </div>
                    {factura.notas && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Notas:
                          </p>
                          <p className="text-sm">{factura.notas}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Totales */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Totales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Subtotal:
                      </span>
                      <span>{formatCurrency(factura.subtotal)}</span>
                    </div>
                    {factura.aplicar_descuento && factura.descuento > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span className="text-sm">
                          Descuento{" "}
                          {factura.tipo_descuento === "porcentaje" &&
                          factura.valor_descuento
                            ? `(${factura.valor_descuento}%)`
                            : ""}
                          :
                        </span>
                        <span>-{formatCurrency(factura.descuento)}</span>
                      </div>
                    )}
                    {factura.aplicar_iva && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          IVA ({factura.porcentaje_iva || 16}%):
                        </span>
                        <span>{formatCurrency(factura.iva)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{formatCurrency(factura.total)}</span>
                    </div>
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span className="text-sm">Pagado:</span>
                      <span className="font-medium">
                        {formatCurrency(factura.total - factura.saldo)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Saldo:</span>
                      <span className="text-orange-600 dark:text-orange-400">
                        {formatCurrency(factura.saldo)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pacientes */}
              {factura.pacientes.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Pacientes ({factura.pacientes.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {factura.pacientes.map((paciente) => (
                        <div
                          key={paciente.id}
                          className="p-3 border rounded-md flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">
                              {paciente.primer_nombre}{" "}
                              {paciente.primer_apellido}
                              {paciente.segundo_apellido &&
                                ` ${paciente.segundo_apellido}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {paciente.telefono}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Items */}
              {factura.items.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-primary" />
                      Items ({factura.items.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Concepto</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-center">Cant.</TableHead>
                            <TableHead className="text-right">
                              P. Unit.
                            </TableHead>
                            <TableHead className="text-right">
                              Subtotal
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {factura.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {item.concepto}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {item.descripcion || "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.cantidad}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.precio_unitario)}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(item.subtotal)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Historial de Pagos */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-primary" />
                      Historial de Pagos ({factura.pagos.length})
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowEstadoDialog(true)}
                      >
                        Cambiar Estado
                      </Button>
                      {factura.estado !== "cancelado" && factura.saldo > 0 && (
                        <Button
                          size="sm"
                          onClick={() => setShowPagoDialog(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Registrar Pago
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {factura.pagos.length > 0 ? (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Método</TableHead>
                            <TableHead>Referencia</TableHead>
                            <TableHead>Notas</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {factura.pagos.map((pago) => {
                            const MetodoIcon = getMetodoPagoIcon(
                              pago.metodo_pago
                            );
                            return (
                              <TableRow key={pago.id}>
                                <TableCell>
                                  {format(new Date(pago.fecha), "dd/MM/yyyy")}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <MetodoIcon className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                      {getMetodoPagoLabel(pago.metodo_pago)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {pago.referencia || "-"}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {pago.notas || "-"}
                                </TableCell>
                                <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                                  {formatCurrency(pago.monto)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay pagos registrados
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Footer con acciones */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                title="Descargar PDF"
                onClick={handleDescargarPDF}
                disabled={!factura}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Imprimir">
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Editar factura"
                onClick={() => setShowEditarDialog(true)}
                disabled={!factura}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar factura */}
      <EditarFacturaDialog
        facturaId={facturaId}
        open={showEditarDialog}
        onOpenChange={setShowEditarDialog}
        onSuccess={() => {
          cargarFactura();
          onUpdate();
        }}
      />

      {/* Diálogo para registrar pago */}
      <AlertDialog open={showPagoDialog} onOpenChange={setShowPagoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar Pago</AlertDialogTitle>
            <AlertDialogDescription>
              Saldo pendiente: {factura && formatCurrency(factura.saldo)}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto *</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={pagoMonto}
                onChange={(e) => setPagoMonto(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metodo">Método de pago *</Label>
              <Select
                value={pagoMetodo}
                onValueChange={(value) => setPagoMetodo(value as MetodoPago)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {pagoMetodo !== "efectivo" && (
              <div className="space-y-2">
                <Label htmlFor="referencia">Referencia</Label>
                <Input
                  id="referencia"
                  placeholder="Número de referencia o últimos 4 dígitos"
                  value={pagoReferencia}
                  onChange={(e) => setPagoReferencia(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="pago-notas">Notas</Label>
              <Textarea
                id="pago-notas"
                placeholder="Notas adicionales sobre el pago..."
                value={pagoNotas}
                onChange={(e) => setPagoNotas(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={registrarPago} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Registrar Pago"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para cambiar estado */}
      <AlertDialog open={showEstadoDialog} onOpenChange={setShowEstadoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar Estado</AlertDialogTitle>
            <AlertDialogDescription>
              Selecciona el nuevo estado de la factura
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <Select
              value={nuevoEstado}
              onValueChange={(value) => setNuevoEstado(value as EstadoFactura)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pendiente
                  </div>
                </SelectItem>
                <SelectItem value="pagado">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Pagado
                  </div>
                </SelectItem>
                <SelectItem value="cancelado">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Cancelado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {nuevoEstado === "cancelado" && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Cancelar una factura la marcará como inactiva. Esta acción no
                  se puede deshacer fácilmente.
                </p>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={cambiarEstado} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Cambiar Estado"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
