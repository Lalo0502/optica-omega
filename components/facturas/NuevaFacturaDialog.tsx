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
  CalendarDays,
  DollarSign,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Patient, Receta } from "@/types/pacientes";
import { ItemFormulario } from "@/types/facturas";

interface NuevaFacturaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function NuevaFacturaDialog({
  open,
  onOpenChange,
  onSuccess,
}: NuevaFacturaDialogProps) {
  // Estados del formulario
  const [fecha, setFecha] = useState(format(new Date(), "yyyy-MM-dd"));
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
  const [pacientesSeleccionados, setPacientesSeleccionados] = useState<
    Patient[]
  >([]);
  const [searchPaciente, setSearchPaciente] = useState("");
  const [showPacienteSearch, setShowPacienteSearch] = useState(false);

  // Recetas
  const [recetasDisponibles, setRecetasDisponibles] = useState<Receta[]>([]);
  const [recetasSeleccionadas, setRecetasSeleccionadas] = useState<Receta[]>(
    []
  );
  const [recetaPreview, setRecetaPreview] = useState<Receta | null>(null);
  const [showRecetaPreview, setShowRecetaPreview] = useState(false);

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
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();

  // Cargar datos pendientes desde receta
  useEffect(() => {
    if (open) {
      const pendingData = localStorage.getItem("pendingInvoiceData");
      if (pendingData) {
        try {
          const data = JSON.parse(pendingData);
          // Solo cargar si los datos son recientes (menos de 5 minutos)
          if (Date.now() - data.timestamp < 5 * 60 * 1000) {
            // Cargar paciente y recetas, luego seleccionar la receta específica
            loadPacienteAndReceta(data.patientId, data.recetaId);
          }
          // Limpiar localStorage después de cargar
          localStorage.removeItem("pendingInvoiceData");
        } catch (error) {
          console.error("Error cargando datos pendientes:", error);
        }
      }
    }
  }, [open]);

  // Función para cargar paciente y seleccionar receta
  const loadPacienteAndReceta = async (
    patientId: string,
    recetaId?: string
  ) => {
    try {
      // 1. Cargar paciente
      const { data: patientData, error: patientError } = await supabase
        .from("pacientes")
        .select("*")
        .eq("id", patientId)
        .single();

      if (patientError) throw patientError;

      if (patientData) {
        setPacientesSeleccionados([patientData]);

        // 2. Cargar recetas disponibles del paciente
        const recetas = await cargarRecetasPaciente(patientData.id);
        setRecetasDisponibles(recetas);

        // 3. Si hay recetaId específico, seleccionarla
        if (recetaId && recetas.length > 0) {
          const recetaSeleccionada = recetas.find((r) => r.id === recetaId);
          if (recetaSeleccionada) {
            setRecetasSeleccionadas([recetaSeleccionada]);
          }
        }
      }
    } catch (error) {
      console.error("Error cargando paciente y receta:", error);
    }
  };

  // Función para cargar paciente desde ID
  const loadPacienteFromData = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .eq("id", patientId)
        .single();

      if (error) throw error;
      if (data) {
        setPacientesSeleccionados([data]);
        // Cargar recetas del paciente
        const recetas = await cargarRecetasPaciente(data.id);
        setRecetasDisponibles(recetas);
      }
    } catch (error) {
      console.error("Error cargando paciente:", error);
    }
  };

  // Función para cargar y seleccionar receta
  const loadRecetaFromData = async (recetaId: string) => {
    try {
      const { data, error } = await supabase
        .from("recetas")
        .select(
          `
          *,
          detalles:receta_detalles(*)
        `
        )
        .eq("id", recetaId)
        .single();

      if (error) throw error;
      if (data) {
        setRecetasSeleccionadas([data]);
      }
    } catch (error) {
      console.error("Error cargando receta:", error);
    }
  };

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

  // Cargar recetas cuando se selecciona un paciente
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

  // Ver preview de receta
  const verPreviewReceta = async (receta: Receta) => {
    setIsLoading(true);
    try {
      // Cargar detalles completos de la receta
      const { data: detalles, error } = await supabase
        .from("receta_detalles")
        .select("*")
        .eq("receta_id", receta.id);

      if (error) throw error;

      setRecetaPreview({
        ...receta,
        detalles: detalles || [],
      });
      setShowRecetaPreview(true);
    } catch (error) {
      console.error("Error al cargar detalles de receta:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el preview de la receta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        id: Date.now().toString(), // ID temporal
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
    if (aplicarDescuento) {
      if (tipoDescuento === "porcentaje") {
        descuento = subtotal * (valorDescuento / 100);
      } else {
        descuento = valorDescuento;
      }
    }
    
    // Calcular IVA sobre el subtotal menos descuento
    const baseImponible = subtotal - descuento;
    const iva = aplicarIva ? baseImponible * (porcentajeIva / 100) : 0;
    
    const total = baseImponible + iva;

    return { subtotal, descuento, iva, total };
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  // Guardar factura
  const guardarFactura = async () => {
    // Validaciones
    if (pacientesSeleccionados.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar al menos un paciente",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar al menos un item",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // 1. Crear factura
      const totales = calcularTotales();
      const { data: facturaData, error: facturaError } = await supabase
        .from("facturas")
        .insert({
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
        })
        .select()
        .single();

      if (facturaError) throw facturaError;

      const facturaId = facturaData.id;

      // 2. Insertar relaciones con pacientes
      const pacientesInserts = pacientesSeleccionados.map((p) => ({
        factura_id: facturaId,
        paciente_id: p.id,
      }));

      const { error: pacientesError } = await supabase
        .from("facturas_pacientes")
        .insert(pacientesInserts);

      if (pacientesError) throw pacientesError;

      // 3. Insertar recetas (si hay)
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

      // 4. Insertar items
      const itemsInserts = items.map((item) => ({
        factura_id: facturaId,
        concepto: item.concepto,
        descripcion: item.descripcion || null,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      }));

      const { error: itemsError } = await supabase
        .from("facturas_items")
        .insert(itemsInserts);

      if (itemsError) throw itemsError;

      toast({
        title: "Factura creada",
        description: `Factura ${facturaData.folio} creada exitosamente`,
      });

      // Resetear formulario
      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creando factura:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la factura",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFecha(format(new Date(), "yyyy-MM-dd"));
    setNotas("");
    setAplicarIva(true);
    setPorcentajeIva(16);
    setAplicarDescuento(false);
    setTipoDescuento("porcentaje");
    setValorDescuento(0);
    setNotasDescuento("");
    setPacientesSeleccionados([]);
    setRecetasDisponibles([]);
    setRecetasSeleccionadas([]);
    setItems([]);
    setNuevoItem({
      concepto: "",
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      subtotal: 0,
    });
    setActiveTab("general");
  };

  // Buscar pacientes cuando cambia el término de búsqueda
  useEffect(() => {
    if (showPacienteSearch) {
      buscarPacientes(searchPaciente);
    }
  }, [searchPaciente, showPacienteSearch]);

  const totales = calcularTotales();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b shrink-0">
          <DialogTitle className="text-2xl">Nueva Factura</DialogTitle>
          <DialogDescription>
            Crea una nueva factura seleccionando pacientes y agregando items
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 shrink-0">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="pacientes" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Pacientes</span>
              {pacientesSeleccionados.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pacientesSeleccionados.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Items</span>
              {items.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {items.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="totales" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Totales</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            {/* TAB 1: GENERAL */}
            <TabsContent value="general" className="mt-0 space-y-4">
          {/* Fecha */}
          <div className="grid gap-2">
            <Label htmlFor="fecha">Fecha de Emisión</Label>
            <Input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              placeholder="Notas adicionales sobre la factura..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={4}
            />
          </div>

          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Consejo:</strong> Después de configurar la fecha y notas,
                continúa agregando pacientes en la siguiente pestaña.
              </p>
            </CardContent>
          </Card>
            </TabsContent>

            {/* TAB 2: PACIENTES */}
            <TabsContent value="pacientes" className="mt-0 space-y-4">
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
                Recetas (opcional - para referencia)
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => verPreviewReceta(receta)}
                          title="Ver detalles de la receta"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
            </TabsContent>

            {/* TAB 3: ITEMS */}
            <TabsContent value="items" className="mt-0 space-y-4">

          {/* Items */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Items/Conceptos
            </Label>

            {/* Formulario para agregar item */}
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

            {/* Lista de items */}
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
          </div>
            </TabsContent>

            {/* TAB 4: TOTALES Y CONFIGURACIÓN */}
            <TabsContent value="totales" className="mt-0 space-y-4">
          {/* Configuración de Descuento */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="aplicar-descuento-switch" className="text-base">
                    Aplicar Descuento
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Agregar un descuento a la factura
                  </p>
                </div>
                <Switch
                  id="aplicar-descuento-switch"
                  checked={aplicarDescuento}
                  onCheckedChange={setAplicarDescuento}
                />
              </div>

              {aplicarDescuento && (
                <div className="grid gap-3 md:grid-cols-2">
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
                        <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
                        <SelectItem value="fijo">Cantidad Fija ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor-descuento">
                      {tipoDescuento === "porcentaje" ? "Porcentaje (%)" : "Cantidad ($)"}
                    </Label>
                    <Input
                      id="valor-descuento"
                      type="number"
                      min="0"
                      max={tipoDescuento === "porcentaje" ? "100" : undefined}
                      step="0.01"
                      value={valorDescuento}
                      onChange={(e) => setValorDescuento(parseFloat(e.target.value) || 0)}
                      placeholder={tipoDescuento === "porcentaje" ? "Ej: 10" : "Ej: 100"}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notas-descuento">Motivo del Descuento (opcional)</Label>
                    <Input
                      id="notas-descuento"
                      type="text"
                      value={notasDescuento}
                      onChange={(e) => setNotasDescuento(e.target.value)}
                      placeholder="Ej: Cliente frecuente, Promoción"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuración de IVA */}
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
                  <Label htmlFor="porcentaje-iva">Porcentaje de IVA (%)</Label>
                  <Input
                    id="porcentaje-iva"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={porcentajeIva}
                    onChange={(e) => setPorcentajeIva(parseFloat(e.target.value) || 0)}
                    placeholder="Ej: 16"
                  />
                  <p className="text-xs text-muted-foreground">
                    Puedes modificar el porcentaje según sea necesario
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Resumen de Totales */}
          {items.length > 0 && (
            <Card className="bg-muted/50 border-2">
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
                      Descuento {tipoDescuento === "porcentaje" ? `(${valorDescuento}%)` : ""}:
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
            </TabsContent>
          </div>
        </Tabs>

        {/* Resumen fijo y Acciones (fuera de tabs) */}
        <div className="shrink-0 space-y-4 pt-4 border-t">
          {items.length > 0 && (
            <Card className="bg-primary/5">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {pacientesSeleccionados.length} paciente(s) • {items.length} item(s)
                  </div>
                  <div className="text-lg font-bold">
                    Total: {formatCurrency(totales.total)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Acciones */}
        <div className="flex justify-end gap-3">
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
            onClick={guardarFactura}
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
              "Crear Factura"
            )}
          </Button>
        </div>
        </div>
      </DialogContent>

      {/* Dialog de Preview de Receta */}
      <Dialog open={showRecetaPreview} onOpenChange={setShowRecetaPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Receta</DialogTitle>
            <DialogDescription>
              Vista previa completa de la prescripción
            </DialogDescription>
          </DialogHeader>

          {recetaPreview && (
            <div className="space-y-4">
              {/* Información General */}
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Fecha de Emisión
                      </p>
                      <p className="font-medium">
                        {format(
                          new Date(recetaPreview.fecha_emision),
                          "dd/MM/yyyy"
                        )}
                      </p>
                    </div>
                    {recetaPreview.fecha_vencimiento && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Fecha de Vencimiento
                        </p>
                        <p className="font-medium">
                          {format(
                            new Date(recetaPreview.fecha_vencimiento),
                            "dd/MM/yyyy"
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                  {recetaPreview.notas && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notas</p>
                      <p className="text-sm">{recetaPreview.notas}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Detalles de la Prescripción */}
              {recetaPreview.detalles && recetaPreview.detalles.length > 0 ? (
                <div className="space-y-3">
                  {recetaPreview.detalles.map((detalle, index) => (
                    <Card key={detalle.id || index}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline">
                            {detalle.tipo_lente || "No especificado"}
                          </Badge>
                          <Badge>
                            {detalle.ojo === "derecho"
                              ? "OD (Ojo Derecho)"
                              : detalle.ojo === "izquierdo"
                              ? "OI (Ojo Izquierdo)"
                              : detalle.ojo}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          {detalle.esfera !== null && (
                            <div>
                              <p className="text-muted-foreground">Esfera</p>
                              <p className="font-medium">
                                {detalle.esfera > 0 ? "+" : ""}
                                {detalle.esfera}
                              </p>
                            </div>
                          )}
                          {detalle.cilindro !== null && (
                            <div>
                              <p className="text-muted-foreground">Cilindro</p>
                              <p className="font-medium">
                                {detalle.cilindro > 0 ? "+" : ""}
                                {detalle.cilindro}
                              </p>
                            </div>
                          )}
                          {detalle.eje !== null && (
                            <div>
                              <p className="text-muted-foreground">Eje</p>
                              <p className="font-medium">{detalle.eje}°</p>
                            </div>
                          )}
                          {detalle.adicion !== null && (
                            <div>
                              <p className="text-muted-foreground">Adición</p>
                              <p className="font-medium">
                                {detalle.adicion > 0 ? "+" : ""}
                                {detalle.adicion}
                              </p>
                            </div>
                          )}
                          {detalle.distancia_pupilar !== null && (
                            <div>
                              <p className="text-muted-foreground">DP</p>
                              <p className="font-medium">
                                {detalle.distancia_pupilar} mm
                              </p>
                            </div>
                          )}
                          {detalle.altura !== null && (
                            <div>
                              <p className="text-muted-foreground">Altura</p>
                              <p className="font-medium">{detalle.altura} mm</p>
                            </div>
                          )}
                        </div>

                        {detalle.notas && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-muted-foreground">
                              Notas:
                            </p>
                            <p className="text-sm">{detalle.notas}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    Esta receta no tiene detalles de prescripción registrados
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button type="button" onClick={() => setShowRecetaPreview(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
