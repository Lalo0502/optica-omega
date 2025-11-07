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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  Search,
  X,
  Users,
  Receipt as ReceiptIcon,
  ShoppingCart,
  Loader2,
  Eye,
  Save,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Patient, Receta } from "@/types/pacientes";
import { ItemFormulario, Factura, FacturaItem } from "@/types/facturas";

interface EditarFacturaDialogProps {
  facturaId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FacturaCompleta extends Factura {
  pacientes: Patient[];
  items: FacturaItem[];
  recetas: Receta[];
}

export default function EditarFacturaDialog({
  facturaId,
  open,
  onOpenChange,
  onSuccess,
}: EditarFacturaDialogProps) {
  // Estados del formulario
  const [fecha, setFecha] = useState("");
  const [notas, setNotas] = useState("");
  const [aplicarIva, setAplicarIva] = useState(true);
  const [porcentajeIva, setPorcentajeIva] = useState(16);
  
  // Estados para descuento
  const [aplicarDescuento, setAplicarDescuento] = useState(false);
  const [tipoDescuento, setTipoDescuento] = useState<"porcentaje" | "fijo">("porcentaje");
  const [valorDescuento, setValorDescuento] = useState(0);
  const [notasDescuento, setNotasDescuento] = useState("");

  // Pacientes
  const [pacientes, setPacientes] = useState<Patient[]>([]);
  const [pacientesSeleccionados, setPacientesSeleccionados] = useState<Patient[]>([]);
  const [searchPaciente, setSearchPaciente] = useState("");
  const [showPacienteSearch, setShowPacienteSearch] = useState(false);

  // Recetas
  const [recetasDisponibles, setRecetasDisponibles] = useState<Receta[]>([]);
  const [recetasSeleccionadas, setRecetasSeleccionadas] = useState<Receta[]>([]);

  // Items
  const [items, setItems] = useState<ItemFormulario[]>([]);
  const [nuevoItem, setNuevoItem] = useState<ItemFormulario>({
    concepto: "",
    descripcion: "",
    cantidad: 1,
    precio_unitario: 0,
    subtotal: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Cargar factura completa
  const cargarFactura = async () => {
    if (!facturaId) return;

    console.log("=== INICIO cargarFactura ===");
    console.log("Estado actual de items:", items.length, "items");

    setIsLoading(true);
    
    // Limpiar estado primero
    setItems([]);
    setPacientesSeleccionados([]);
    setRecetasDisponibles([]);
    setRecetasSeleccionadas([]);
    
    try {
      // Cargar factura base
      const { data: facturaData, error: facturaError } = await supabase
        .from("facturas")
        .select("*")
        .eq("id", facturaId)
        .single();

      if (facturaError) throw facturaError;

      // Cargar pacientes
      const { data: pacientesData, error: pacientesError } = await supabase
        .from("facturas_pacientes")
        .select("paciente_id, pacientes(*)")
        .eq("factura_id", facturaId);

      if (pacientesError) throw pacientesError;

      const pacientesFactura = pacientesData?.map((fp: any) => fp.pacientes) || [];
      setPacientesSeleccionados(pacientesFactura);

      // Cargar recetas disponibles para esos pacientes
      if (pacientesFactura.length > 0) {
        const pacienteIds = pacientesFactura.map((p: Patient) => p.id);
        const { data: recetasData } = await supabase
          .from("recetas")
          .select("*")
          .in("paciente_id", pacienteIds)
          .order("fecha_emision", { ascending: false });

        setRecetasDisponibles(recetasData || []);
      }

      // Cargar recetas seleccionadas
      const { data: recetasSelData, error: recetasError } = await supabase
        .from("facturas_recetas")
        .select("receta_id, recetas(*)")
        .eq("factura_id", facturaId);

      if (!recetasError && recetasSelData) {
        const recetasSel = recetasSelData.map((fr: any) => fr.recetas);
        setRecetasSeleccionadas(recetasSel);
      }

      // Cargar items
      const { data: itemsData, error: itemsError } = await supabase
        .from("facturas_items")
        .select("*")
        .eq("factura_id", facturaId);

      if (itemsError) throw itemsError;

      console.log("Items cargados desde DB:", itemsData);

      const itemsFormulario = itemsData?.map((item: FacturaItem) => ({
        id: item.id,
        concepto: item.concepto,
        descripcion: item.descripcion || "",
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.cantidad * item.precio_unitario, // Calcular siempre desde cantidad y precio
      })) || [];

      console.log("Items procesados:", itemsFormulario);
      console.log("Items actuales en estado antes de setear:", items);

      setItems(itemsFormulario);

      // Establecer valores del formulario
      setFecha(format(new Date(facturaData.fecha), "yyyy-MM-dd"));
      setNotas(facturaData.notas || "");
      setAplicarIva(facturaData.aplicar_iva);
      setPorcentajeIva(facturaData.porcentaje_iva || 16);
      setAplicarDescuento(facturaData.aplicar_descuento || false);
      setTipoDescuento(facturaData.tipo_descuento || "porcentaje");
      setValorDescuento(facturaData.valor_descuento || 0);
      setNotasDescuento(facturaData.notas_descuento || "");

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

  useEffect(() => {
    console.log("useEffect ejecutado - open:", open, "facturaId:", facturaId);
    
    if (open && facturaId) {
      console.log("Cargando factura...");
      cargarFactura();
    } else if (!open) {
      console.log("Limpiando estado...");
      // Limpiar estado cuando se cierra el diálogo
      setItems([]);
      setPacientesSeleccionados([]);
      setRecetasDisponibles([]);
      setRecetasSeleccionadas([]);
      setFecha("");
      setNotas("");
      setAplicarIva(true);
      setPorcentajeIva(16);
      setAplicarDescuento(false);
      setTipoDescuento("porcentaje");
      setValorDescuento(0);
      setNotasDescuento("");
      setNuevoItem({
        concepto: "",
        descripcion: "",
        cantidad: 1,
        precio_unitario: 0,
        subtotal: 0,
      });
    }
  }, [open, facturaId]);

  // Buscar pacientes
  const buscarPacientes = async (search: string) => {
    if (!search || search.length < 2) {
      setPacientes([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .or(
          `primer_nombre.ilike.%${search}%,primer_apellido.ilike.%${search}%,telefono.ilike.%${search}%`
        )
        .limit(10);

      if (error) throw error;
      setPacientes(data || []);
    } catch (error) {
      console.error("Error buscando pacientes:", error);
    }
  };

  // Cargar recetas cuando se agrega un paciente
  const cargarRecetasPaciente = async (pacienteId: string) => {
    try {
      const { data, error } = await supabase
        .from("recetas")
        .select("*")
        .eq("paciente_id", pacienteId)
        .order("fecha_emision", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error cargando recetas:", error);
      return [];
    }
  };

  // Agregar paciente
  const agregarPaciente = async (paciente: Patient) => {
    if (pacientesSeleccionados.find((p) => p.id === paciente.id)) {
      toast({
        title: "Paciente ya agregado",
        description: "Este paciente ya está en la lista",
        variant: "destructive",
      });
      return;
    }

    setPacientesSeleccionados([...pacientesSeleccionados, paciente]);
    setShowPacienteSearch(false);
    setSearchPaciente("");
    setPacientes([]);

    // Cargar recetas del paciente
    const recetas = await cargarRecetasPaciente(paciente.id);
    setRecetasDisponibles((prev) => [...prev, ...recetas]);
  };

  // Remover paciente
  const removerPaciente = (pacienteId: string) => {
    setPacientesSeleccionados((prev) =>
      prev.filter((p) => p.id !== pacienteId)
    );

    // Remover recetas del paciente
    setRecetasDisponibles((prev) =>
      prev.filter((r) => r.paciente_id !== pacienteId)
    );
    setRecetasSeleccionadas((prev) =>
      prev.filter((r) => r.paciente_id !== pacienteId)
    );
  };

  // Agregar/remover receta
  const toggleReceta = (receta: Receta) => {
    if (recetasSeleccionadas.find((r) => r.id === receta.id)) {
      setRecetasSeleccionadas((prev) => prev.filter((r) => r.id !== receta.id));
    } else {
      setRecetasSeleccionadas([...recetasSeleccionadas, receta]);
    }
  };

  // Agregar item
  const agregarItem = () => {
    if (!nuevoItem.concepto || nuevoItem.precio_unitario <= 0) {
      toast({
        title: "Datos incompletos",
        description: "Ingresa el concepto y un precio válido",
        variant: "destructive",
      });
      return;
    }

    const subtotal = nuevoItem.cantidad * nuevoItem.precio_unitario;

    setItems([
      ...items,
      {
        ...nuevoItem,
        id: `new-${Date.now()}`, // ID temporal para nuevos items
        subtotal,
      },
    ]);

    // Resetear formulario de item
    setNuevoItem({
      concepto: "",
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      subtotal: 0,
    });
  };

  // Remover item
  const removerItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Calcular totales
  const calcularTotales = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Calcular descuento
    let descuento = 0;
    if (aplicarDescuento && valorDescuento > 0) {
      if (tipoDescuento === "porcentaje") {
        descuento = subtotal * (valorDescuento / 100);
      } else {
        descuento = valorDescuento;
      }
      descuento = Math.min(descuento, subtotal);
    }
    
    const subtotalConDescuento = subtotal - descuento;
    const iva = aplicarIva ? subtotalConDescuento * (porcentajeIva / 100) : 0;
    const total = subtotalConDescuento + iva;

    return { subtotal, descuento, subtotalConDescuento, iva, total };
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  // Guardar cambios
  const guardarCambios = async () => {
    if (!facturaId) return;

    // Validaciones
    if (pacientesSeleccionados.length === 0) {
      toast({
        title: "Error",
        description: "Debes tener al menos un paciente",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Debes tener al menos un item",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const totales = calcularTotales();

      // 1. Actualizar factura
      const { error: facturaError } = await supabase
        .from("facturas")
        .update({
          fecha,
          notas: notas || null,
          aplicar_iva: aplicarIva,
          porcentaje_iva: aplicarIva ? porcentajeIva : null,
          aplicar_descuento: aplicarDescuento,
          tipo_descuento: aplicarDescuento ? tipoDescuento : null,
          valor_descuento: aplicarDescuento ? valorDescuento : null,
          notas_descuento: aplicarDescuento && notasDescuento ? notasDescuento : null,
          descuento: totales.descuento,
          subtotal: totales.subtotal,
          iva: totales.iva,
          total: totales.total,
          updated_at: new Date().toISOString(),
        })
        .eq("id", facturaId);

      if (facturaError) throw facturaError;

      // 2. Actualizar pacientes (eliminar todos y volver a insertar)
      await supabase.from("facturas_pacientes").delete().eq("factura_id", facturaId);

      const pacientesInserts = pacientesSeleccionados.map((p) => ({
        factura_id: facturaId,
        paciente_id: p.id,
      }));

      const { error: pacientesError } = await supabase
        .from("facturas_pacientes")
        .insert(pacientesInserts);

      if (pacientesError) throw pacientesError;

      // 3. Actualizar recetas
      await supabase.from("facturas_recetas").delete().eq("factura_id", facturaId);

      if (recetasSeleccionadas.length > 0) {
        const recetasInserts = recetasSeleccionadas.map((r) => ({
          factura_id: facturaId,
          receta_id: r.id,
        }));

        const { error: recetasError } = await supabase
          .from("facturas_recetas")
          .insert(recetasInserts);

        if (recetasError) throw recetasError;
      }

      // 4. Actualizar items (eliminar todos y volver a insertar)
      const { error: deleteItemsError } = await supabase
        .from("facturas_items")
        .delete()
        .eq("factura_id", facturaId);

      if (deleteItemsError) {
        console.error("Error eliminando items:", deleteItemsError);
        throw deleteItemsError;
      }

      // Esperar un momento para asegurar que el delete se completó
      await new Promise(resolve => setTimeout(resolve, 100));

      const itemsInserts = items.map((item) => ({
        factura_id: facturaId,
        concepto: item.concepto,
        descripcion: item.descripcion || null,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.cantidad * item.precio_unitario, // Calcular subtotal correctamente
      }));

      console.log("Items a insertar:", itemsInserts);

      const { error: itemsError } = await supabase
        .from("facturas_items")
        .insert(itemsInserts);

      if (itemsError) {
        console.error("Error insertando items:", itemsError);
        throw itemsError;
      }

      toast({
        title: "Factura actualizada",
        description: "Los cambios se guardaron correctamente",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error actualizando factura:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la factura",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Buscar pacientes cuando cambia el término de búsqueda
  useEffect(() => {
    if (showPacienteSearch) {
      buscarPacientes(searchPaciente);
    }
  }, [searchPaciente, showPacienteSearch]);

  const totales = calcularTotales();

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl">Editar Factura</DialogTitle>
          <DialogDescription>
            Modifica los datos de la factura, agrega o elimina items y pacientes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Fecha */}
          <div className="grid gap-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          {/* Pacientes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Pacientes
              </Label>
              {!showPacienteSearch && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPacienteSearch(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar paciente
                </Button>
              )}
            </div>

            {showPacienteSearch && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nombre o teléfono..."
                        value={searchPaciente}
                        onChange={(e) => setSearchPaciente(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowPacienteSearch(false);
                        setSearchPaciente("");
                        setPacientes([]);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {pacientes.length > 0 && (
                    <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                      {pacientes.map((paciente) => (
                        <button
                          key={paciente.id}
                          type="button"
                          onClick={() => agregarPaciente(paciente)}
                          className="w-full p-3 hover:bg-accent text-left transition-colors"
                        >
                          <p className="font-medium">
                            {paciente.primer_nombre} {paciente.primer_apellido}
                            {paciente.segundo_apellido &&
                              ` ${paciente.segundo_apellido}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {paciente.telefono}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {pacientesSeleccionados.length > 0 && (
              <div className="space-y-2">
                {pacientesSeleccionados.map((paciente) => (
                  <Card key={paciente.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {paciente.primer_nombre} {paciente.primer_apellido}
                          {paciente.segundo_apellido &&
                            ` ${paciente.segundo_apellido}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {paciente.telefono}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removerPaciente(paciente.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recetas (opcionales) */}
          {recetasDisponibles.length > 0 && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <ReceiptIcon className="h-4 w-4" />
                Recetas (opcional)
              </Label>
              <div className="space-y-2">
                {recetasDisponibles.map((receta) => {
                  const paciente = pacientesSeleccionados.find(
                    (p) => p.id === receta.paciente_id
                  );
                  const isSelected = recetasSeleccionadas.find(
                    (r) => r.id === receta.id
                  );

                  return (
                    <Card key={receta.id}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleReceta(receta)}
                          >
                            {isSelected ? "✓ Seleccionada" : "Seleccionar"}
                          </Button>
                          <div>
                            <p className="font-medium">
                              {paciente?.primer_nombre}{" "}
                              {paciente?.primer_apellido}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Emisión:{" "}
                              {format(
                                new Date(receta.fecha_emision),
                                "dd/MM/yyyy"
                              )}
                              {receta.notas && ` • ${receta.notas}`}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <Separator />

          {/* Items */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Items/Conceptos
            </Label>

            {/* Lista de items existentes */}
            {items.length > 0 && (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-right">P. Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
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
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removerItem(item.id!)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Formulario para agregar nuevo item */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="concepto">Concepto *</Label>
                    <Input
                      id="concepto"
                      placeholder="Ej: Armazón Ray-Ban"
                      value={nuevoItem.concepto}
                      onChange={(e) =>
                        setNuevoItem({ ...nuevoItem, concepto: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Input
                      id="descripcion"
                      placeholder="Detalles adicionales"
                      value={nuevoItem.descripcion}
                      onChange={(e) =>
                        setNuevoItem({
                          ...nuevoItem,
                          descripcion: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="cantidad">Cantidad *</Label>
                    <Input
                      id="cantidad"
                      type="number"
                      min="1"
                      value={nuevoItem.cantidad}
                      onChange={(e) =>
                        setNuevoItem({
                          ...nuevoItem,
                          cantidad: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="precio">Precio Unitario *</Label>
                    <Input
                      id="precio"
                      type="number"
                      min="0"
                      step="0.01"
                      value={nuevoItem.precio_unitario}
                      onChange={(e) =>
                        setNuevoItem({
                          ...nuevoItem,
                          precio_unitario: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtotal</Label>
                    <Input
                      value={formatCurrency(
                        nuevoItem.cantidad * nuevoItem.precio_unitario
                      )}
                      disabled
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={agregarItem}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Item
                </Button>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Configuración de Descuento */}
          {items.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="aplicar-descuento" className="text-base">
                      Aplicar Descuento
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Ofrecer un descuento especial
                    </p>
                  </div>
                  <Switch
                    id="aplicar-descuento"
                    checked={aplicarDescuento}
                    onCheckedChange={setAplicarDescuento}
                  />
                </div>

                {aplicarDescuento && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="tipo-descuento">Tipo de Descuento</Label>
                      <Select
                        value={tipoDescuento}
                        onValueChange={(value: "porcentaje" | "fijo") =>
                          setTipoDescuento(value)
                        }
                      >
                        <SelectTrigger id="tipo-descuento">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="porcentaje">
                            Porcentaje (%)
                          </SelectItem>
                          <SelectItem value="fijo">Cantidad Fija ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valor-descuento">
                        {tipoDescuento === "porcentaje"
                          ? "Porcentaje (%)"
                          : "Cantidad ($)"}
                      </Label>
                      <Input
                        id="valor-descuento"
                        type="number"
                        min="0"
                        max={tipoDescuento === "porcentaje" ? "100" : undefined}
                        step="0.01"
                        value={valorDescuento}
                        onChange={(e) =>
                          setValorDescuento(parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notas-descuento">
                        Motivo del Descuento (opcional)
                      </Label>
                      <Input
                        id="notas-descuento"
                        type="text"
                        value={notasDescuento}
                        onChange={(e) => setNotasDescuento(e.target.value)}
                        placeholder="Ej: Cliente frecuente"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Configuración de IVA */}
          {items.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="aplicar-iva" className="text-base">
                      Aplicar IVA
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Activar o desactivar el impuesto
                    </p>
                  </div>
                  <Switch
                    id="aplicar-iva"
                    checked={aplicarIva}
                    onCheckedChange={setAplicarIva}
                  />
                </div>

                {aplicarIva && (
                  <div className="space-y-2">
                    <Label htmlFor="porcentaje-iva">
                      Porcentaje de IVA (%)
                    </Label>
                    <Input
                      id="porcentaje-iva"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={porcentajeIva}
                      onChange={(e) =>
                        setPorcentajeIva(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Totales */}
          {items.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(totales.subtotal)}
                  </span>
                </div>
                {aplicarDescuento && totales.descuento > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>
                      Descuento{" "}
                      {tipoDescuento === "porcentaje"
                        ? `(${valorDescuento}%)`
                        : ""}
                      :
                    </span>
                    <span className="font-medium">
                      -{formatCurrency(totales.descuento)}
                    </span>
                  </div>
                )}
                {aplicarIva && (
                  <div className="flex justify-between text-sm">
                    <span>IVA ({porcentajeIva}%):</span>
                    <span className="font-medium">
                      {formatCurrency(totales.iva)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(totales.total)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              placeholder="Notas adicionales sobre la factura..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={guardarCambios}
            disabled={
              isSaving ||
              items.length === 0 ||
              pacientesSeleccionados.length === 0
            }
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
