"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { generatePrescriptionPDF } from "@/lib/pdf";
import {
  FileText,
  Loader2,
  Plus,
  Eye,
  Calendar,
  User,
  Printer,
  Download,
  Glasses,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Edit,
  Receipt,
} from "lucide-react";
import { Receta, Patient } from "@/types/pacientes";
import RecetaForm from "./RecetaForm";

interface FacturaResumen {
  id: string;
  folio: string;
  fecha: string;
  total: number;
  saldo: number;
  estado: "pendiente" | "pagado" | "cancelado";
}

interface RecetaConFacturas extends Receta {
  facturas?: FacturaResumen[];
}

interface PatientRecetasProps {
  patientId: string;
}

export default function PatientRecetas({ patientId }: PatientRecetasProps) {
  const [patientRecetas, setPatientRecetas] = useState<RecetaConFacturas[]>([]);
  const [loadingRecetas, setLoadingRecetas] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewRecetaDialogOpen, setIsNewRecetaDialogOpen] = useState(false);
  const [isEditRecetaDialogOpen, setIsEditRecetaDialogOpen] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState<Receta | null>(null);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const { toast } = useToast();

  // Formatear fecha para mostrar
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", {
        locale: es,
      });
    } catch (error) {
      return dateString;
    }
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  // Obtener color del badge según estado de factura
  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "pagado":
        return "default"; // Verde
      case "pendiente":
        return "secondary"; // Amarillo
      case "cancelado":
        return "destructive"; // Rojo
      default:
        return "outline";
    }
  };

  // Ver detalles de la receta
  const handleViewRecetaDetails = (receta: Receta) => {
    setSelectedReceta(receta);
    setIsDialogOpen(true);
  };

  // Editar receta
  const handleEditReceta = (receta: Receta) => {
    setSelectedReceta(receta);
    setIsEditRecetaDialogOpen(true);
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (selectedReceta && patientData) {
      try {
        await generatePrescriptionPDF(selectedReceta, patientData);
        toast({
          title: "PDF generado",
          description: "La receta se ha descargado correctamente",
        });
      } catch (error) {
        console.error("Error al generar PDF:", error);
        toast({
          title: "Error",
          description: "No se pudo generar el PDF",
          variant: "destructive",
        });
      }
    }
  };

  // Preparar datos para el formulario de edición
  const prepareRecetaFormData = (receta: Receta) => {
    // Obtener detalles para ojo derecho e izquierdo
    const ojoDerecho = receta.detalles?.find((d) => d.ojo === "derecho");
    const ojoIzquierdo = receta.detalles?.find((d) => d.ojo === "izquierdo");

    return {
      fecha_emision: receta.fecha_emision,
      fecha_vencimiento: receta.fecha_vencimiento || "",
      notas: receta.notas || "",
      detallesOjoDerecho: {
        tipo_lente: ojoDerecho?.tipo_lente || "",
        esfera: ojoDerecho?.esfera,
        cilindro: ojoDerecho?.cilindro,
        eje: ojoDerecho?.eje,
        adicion: ojoDerecho?.adicion,
        distancia_pupilar: ojoDerecho?.distancia_pupilar,
        altura: ojoDerecho?.altura,
        notas: ojoDerecho?.notas || "",
      },
      detallesOjoIzquierdo: {
        tipo_lente: ojoIzquierdo?.tipo_lente || "",
        esfera: ojoIzquierdo?.esfera,
        cilindro: ojoIzquierdo?.cilindro,
        eje: ojoIzquierdo?.eje,
        adicion: ojoIzquierdo?.adicion,
        distancia_pupilar: ojoIzquierdo?.distancia_pupilar,
        altura: ojoIzquierdo?.altura,
        notas: ojoIzquierdo?.notas || "",
      },
    };
  };

  // Cargar datos del paciente
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        // Obtener datos del paciente
        const { data, error } = await supabase
          .from("pacientes")
          .select("*")
          .eq("id", patientId)
          .single();

        if (error) throw error;

        if (data) {
          setPatientData(data);
        }
      } catch (error) {
        console.error("Error al cargar datos del paciente:", error);
      }
    };

    fetchPatientData();
  }, [patientId]);

  // Cargar recetas del paciente
  useEffect(() => {
    const fetchRecetas = async () => {
      setLoadingRecetas(true);
      setPatientRecetas([]);

      try {
        // Obtener las recetas del paciente
        const { data: recetasData, error: recetasError } = await supabase
          .from("recetas")
          .select("*")
          .eq("paciente_id", patientId)
          .order("fecha_emision", { ascending: false });

        if (recetasError) throw recetasError;

        if (recetasData) {
          // Para cada receta, obtener sus detalles y facturas
          const recetasWithDetailsAndFacturas = await Promise.all(
            recetasData.map(async (receta) => {
              // Obtener detalles de la receta
              const { data: detallesData, error: detallesError } =
                await supabase
                  .from("receta_detalles")
                  .select("*")
                  .eq("receta_id", receta.id);

              if (detallesError) {
                console.error(
                  "Error al cargar detalles de receta:",
                  detallesError
                );
              }

              // Obtener facturas asociadas a esta receta
              const { data: facturasRecetasData, error: facturasError } =
                await supabase
                  .from("facturas_recetas")
                  .select("factura_id")
                  .eq("receta_id", receta.id);

              let facturas: FacturaResumen[] = [];

              if (
                !facturasError &&
                facturasRecetasData &&
                facturasRecetasData.length > 0
              ) {
                // Obtener detalles de cada factura
                const facturaIds = facturasRecetasData.map(
                  (fr) => fr.factura_id
                );

                const { data: facturasData, error: facturasDetalleError } =
                  await supabase
                    .from("facturas")
                    .select("id, folio, fecha, total, saldo, estado")
                    .in("id", facturaIds)
                    .order("fecha", { ascending: false });

                if (!facturasDetalleError && facturasData) {
                  facturas = facturasData;
                }
              }

              return {
                ...receta,
                detalles: detallesData || [],
                facturas: facturas,
              };
            })
          );

          setPatientRecetas(recetasWithDetailsAndFacturas);
        }
      } catch (error) {
        console.error("Error al cargar recetas del paciente:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las recetas del paciente",
          variant: "destructive",
        });
      } finally {
        setLoadingRecetas(false);
      }
    };

    fetchRecetas();
  }, [patientId, toast]);

  // Guardar nueva receta
  const handleSaveReceta = async (recetaData: any) => {
    try {
      // 1. Insertar la receta
      const { data: recetaInsertData, error: recetaInsertError } =
        await supabase
          .from("recetas")
          .insert({
            paciente_id: patientId,
            fecha_emision: recetaData.fecha_emision,
            fecha_vencimiento: recetaData.fecha_vencimiento || null,
            notas: recetaData.notas || null,
          })
          .select();

      if (recetaInsertError) throw recetaInsertError;

      if (recetaInsertData && recetaInsertData.length > 0) {
        const recetaId = recetaInsertData[0].id;

        // 2. Insertar los detalles de la receta
        if (recetaData.detalles && recetaData.detalles.length > 0) {
          const detallesInsert = recetaData.detalles.map((detalle: any) => ({
            receta_id: recetaId,
            tipo_lente: detalle.tipo_lente,
            ojo: detalle.ojo,
            esfera: detalle.esfera,
            cilindro: detalle.cilindro,
            eje: detalle.eje,
            adicion: detalle.adicion,
            distancia_pupilar: detalle.distancia_pupilar,
            altura: detalle.altura,
            notas: detalle.notas,
          }));

          const { error: detallesInsertError } = await supabase
            .from("receta_detalles")
            .insert(detallesInsert);

          if (detallesInsertError) {
            console.error(
              "Error al insertar detalles de receta:",
              detallesInsertError
            );
          }
        }

        // 4. Actualizar la lista de recetas
        const { data: newRecetaData, error: newRecetaError } = await supabase
          .from("recetas")
          .select("*")
          .eq("id", recetaId)
          .single();

        if (newRecetaError) {
          console.error("Error al obtener la nueva receta:", newRecetaError);
        } else if (newRecetaData) {
          // Obtener detalles de la receta
          const { data: detallesData } = await supabase
            .from("receta_detalles")
            .select("*")
            .eq("receta_id", recetaId);

          const newReceta = {
            ...newRecetaData,
            detalles: detallesData || [],
          };

          setPatientRecetas([newReceta, ...patientRecetas]);
        }

        toast({
          title: "Receta guardada",
          description: "La receta ha sido guardada correctamente",
        });

        setIsNewRecetaDialogOpen(false);
      }
    } catch (error) {
      console.error("Error al guardar receta:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la receta",
        variant: "destructive",
      });
    }
  };

  // Actualizar receta existente
  const handleUpdateReceta = async (recetaData: any) => {
    if (!selectedReceta) return;

    try {
      // 1. Actualizar la receta
      const { error: recetaUpdateError } = await supabase
        .from("recetas")
        .update({
          fecha_emision: recetaData.fecha_emision,
          fecha_vencimiento: recetaData.fecha_vencimiento || null,
          notas: recetaData.notas || null,
        })
        .eq("id", selectedReceta.id);

      if (recetaUpdateError) throw recetaUpdateError;

      // 2. Eliminar los detalles existentes
      const { error: deleteDetallesError } = await supabase
        .from("receta_detalles")
        .delete()
        .eq("receta_id", selectedReceta.id);

      if (deleteDetallesError) {
        console.error(
          "Error al eliminar detalles existentes:",
          deleteDetallesError
        );
      }

      // 3. Insertar los nuevos detalles
      if (recetaData.detalles && recetaData.detalles.length > 0) {
        const detallesInsert = recetaData.detalles.map((detalle: any) => ({
          receta_id: selectedReceta.id,
          tipo_lente: detalle.tipo_lente,
          ojo: detalle.ojo,
          esfera: detalle.esfera,
          cilindro: detalle.cilindro,
          eje: detalle.eje,
          adicion: detalle.adicion,
          distancia_pupilar: detalle.distancia_pupilar,
          altura: detalle.altura,
          notas: detalle.notas,
        }));

        const { error: detallesInsertError } = await supabase
          .from("receta_detalles")
          .insert(detallesInsert);

        if (detallesInsertError) {
          console.error(
            "Error al insertar nuevos detalles:",
            detallesInsertError
          );
        }
      }

      // 6. Actualizar la lista de recetas
      const { data: updatedRecetaData, error: updatedRecetaError } =
        await supabase
          .from("recetas")
          .select("*")
          .eq("id", selectedReceta.id)
          .single();

      if (updatedRecetaError) {
        console.error(
          "Error al obtener la receta actualizada:",
          updatedRecetaError
        );
      } else if (updatedRecetaData) {
        // Obtener detalles de la receta
        const { data: detallesData } = await supabase
          .from("receta_detalles")
          .select("*")
          .eq("receta_id", selectedReceta.id);

        const updatedReceta = {
          ...updatedRecetaData,
          detalles: detallesData || [],
        };

        // Actualizar la lista de recetas
        setPatientRecetas(
          patientRecetas.map((receta) =>
            receta.id === selectedReceta.id ? updatedReceta : receta
          )
        );
      }

      toast({
        title: "Receta actualizada",
        description: "La receta ha sido actualizada correctamente",
      });

      setIsEditRecetaDialogOpen(false);
    } catch (error) {
      console.error("Error al actualizar receta:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la receta",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-muted/30 p-4 rounded-b-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Recetas del Paciente
        </h3>
        <Dialog
          open={isNewRecetaDialogOpen}
          onOpenChange={setIsNewRecetaDialogOpen}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1">
              <Plus className="h-3.5 w-3.5" />
              Nueva Receta
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-3xl max-h-[90vh] overflow-y-auto"
            hideCloseButton
          >
            <DialogHeader className="pb-4 mb-2 border-b">
              <DialogTitle className="text-xl flex items-center gap-2">
                <Glasses className="h-5 w-5" />
                Nueva Receta
              </DialogTitle>
            </DialogHeader>

            {patientData && (
              <RecetaForm
                patientId={patientId}
                patientName={`${patientData.primer_nombre} ${patientData.primer_apellido}`}
                onSave={handleSaveReceta}
                onCancel={() => setIsNewRecetaDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Diálogo para ver detalles de receta */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          hideCloseButton
        >
          {selectedReceta && (
            <>
              <DialogHeader className="pb-4 mb-2 border-b">
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl">
                    Detalles de la Receta
                  </DialogTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setTimeout(() => {
                          handleEditReceta(selectedReceta);
                        }, 100);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Printer className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Imprimir</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={handleDownloadPDF}
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Descargar</span>
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Información general */}
                <Card className="overflow-hidden border-border/50 hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-2 bg-muted/30">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Información General
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-sm font-medium mb-1">Fechas</h3>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Badge
                                  variant="outline"
                                  className="bg-primary/5"
                                >
                                  Emisión
                                </Badge>
                                <span>
                                  {formatDate(selectedReceta.fecha_emision)}
                                </span>
                              </div>

                              {selectedReceta.fecha_vencimiento && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Badge
                                    variant="outline"
                                    className="bg-muted/50"
                                  >
                                    Vencimiento
                                  </Badge>
                                  <span>
                                    {formatDate(
                                      selectedReceta.fecha_vencimiento
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-sm font-medium mb-1">
                              Paciente
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {patientData
                                  ? `${patientData.primer_nombre} ${patientData.primer_apellido}`
                                  : "Nombre del Paciente"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium mb-1">
                              Tipo de Lentes
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                ...new Set(
                                  selectedReceta.detalles?.map(
                                    (d) => d.tipo_lente
                                  )
                                ),
                              ].map((tipo, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-primary/10 text-primary capitalize"
                                >
                                  {tipo}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Prescripción */}
                <Card className="overflow-hidden border-border/50 hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-2 bg-muted/30">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Glasses className="h-4 w-4 text-primary" />
                      Prescripción
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                      {/* Ojo Derecho */}
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Eye className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="font-medium">Ojo Derecho (OD)</h3>
                        </div>

                        {selectedReceta.detalles?.find(
                          (d) => d.ojo === "derecho"
                        ) ? (
                          <div className="space-y-4">
                            {(() => {
                              const ojoDerecho = selectedReceta.detalles?.find(
                                (d) => d.ojo === "derecho"
                              );
                              return (
                                <>
                                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                                    <div className="text-sm font-medium mb-2 pb-1 border-b border-border/40 capitalize">
                                      {ojoDerecho?.tipo_lente ||
                                        "No especificado"}
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                      {ojoDerecho?.esfera !== null && (
                                        <div className="text-sm">
                                          <span className="text-muted-foreground">
                                            Esfera:
                                          </span>{" "}
                                          <span className="font-medium">
                                            {ojoDerecho?.esfera}
                                          </span>
                                        </div>
                                      )}

                                      {ojoDerecho?.cilindro !== null && (
                                        <div className="text-sm">
                                          <span className="text-muted-foreground">
                                            Cilindro:
                                          </span>{" "}
                                          <span className="font-medium">
                                            {ojoDerecho?.cilindro}
                                          </span>
                                        </div>
                                      )}

                                      {ojoDerecho?.eje !== null && (
                                        <div className="text-sm">
                                          <span className="text-muted-foreground">
                                            Eje:
                                          </span>{" "}
                                          <span className="font-medium">
                                            {ojoDerecho?.eje}°
                                          </span>
                                        </div>
                                      )}

                                      {ojoDerecho?.adicion !== null && (
                                        <div className="text-sm">
                                          <span className="text-muted-foreground">
                                            Adición:
                                          </span>{" "}
                                          <span className="font-medium">
                                            {ojoDerecho?.adicion}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    {ojoDerecho?.distancia_pupilar !== null && (
                                      <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Distancia Pupilar
                                        </div>
                                        <div className="text-sm font-medium">
                                          {ojoDerecho?.distancia_pupilar} mm
                                        </div>
                                      </div>
                                    )}

                                    {ojoDerecho?.altura !== null && (
                                      <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Altura
                                        </div>
                                        <div className="text-sm font-medium">
                                          {ojoDerecho?.altura} mm
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {ojoDerecho?.notas && (
                                    <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                                      <div className="text-xs text-muted-foreground mb-1">
                                        Notas
                                      </div>
                                      <div className="text-sm">
                                        {ojoDerecho?.notas}
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                            <p className="text-sm">
                              No hay datos para el ojo derecho
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Ojo Izquierdo */}
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Eye className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="font-medium">Ojo Izquierdo (OI)</h3>
                        </div>

                        {selectedReceta.detalles?.find(
                          (d) => d.ojo === "izquierdo"
                        ) ? (
                          <div className="space-y-4">
                            {(() => {
                              const ojoIzquierdo =
                                selectedReceta.detalles?.find(
                                  (d) => d.ojo === "izquierdo"
                                );
                              return (
                                <>
                                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                                    <div className="text-sm font-medium mb-2 pb-1 border-b border-border/40 capitalize">
                                      {ojoIzquierdo?.tipo_lente ||
                                        "No especificado"}
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                      {ojoIzquierdo?.esfera !== null && (
                                        <div className="text-sm">
                                          <span className="text-muted-foreground">
                                            Esfera:
                                          </span>{" "}
                                          <span className="font-medium">
                                            {ojoIzquierdo?.esfera}
                                          </span>
                                        </div>
                                      )}

                                      {ojoIzquierdo?.cilindro !== null && (
                                        <div className="text-sm">
                                          <span className="text-muted-foreground">
                                            Cilindro:
                                          </span>{" "}
                                          <span className="font-medium">
                                            {ojoIzquierdo?.cilindro}
                                          </span>
                                        </div>
                                      )}

                                      {ojoIzquierdo?.eje !== null && (
                                        <div className="text-sm">
                                          <span className="text-muted-foreground">
                                            Eje:
                                          </span>{" "}
                                          <span className="font-medium">
                                            {ojoIzquierdo?.eje}°
                                          </span>
                                        </div>
                                      )}

                                      {ojoIzquierdo?.adicion !== null && (
                                        <div className="text-sm">
                                          <span className="text-muted-foreground">
                                            Adición:
                                          </span>{" "}
                                          <span className="font-medium">
                                            {ojoIzquierdo?.adicion}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    {ojoIzquierdo?.distancia_pupilar !==
                                      null && (
                                      <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Distancia Pupilar
                                        </div>
                                        <div className="text-sm font-medium">
                                          {ojoIzquierdo?.distancia_pupilar} mm
                                        </div>
                                      </div>
                                    )}

                                    {ojoIzquierdo?.altura !== null && (
                                      <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Altura
                                        </div>
                                        <div className="text-sm font-medium">
                                          {ojoIzquierdo?.altura} mm
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {ojoIzquierdo?.notas && (
                                    <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                                      <div className="text-xs text-muted-foreground mb-1">
                                        Notas
                                      </div>
                                      <div className="text-sm">
                                        {ojoIzquierdo?.notas}
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                            <p className="text-sm">
                              No hay datos para el ojo izquierdo
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notas adicionales */}
                {selectedReceta.notas && (
                  <Card className="overflow-hidden border-border/50 hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-2 bg-muted/30">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Notas Adicionales
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <p className="text-sm whitespace-pre-line">
                        {selectedReceta.notas}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Navegación entre recetas y botón de cerrar */}
                <div className="flex justify-between items-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cerrar
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar receta */}
      <Dialog
        open={isEditRecetaDialogOpen}
        onOpenChange={setIsEditRecetaDialogOpen}
      >
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          hideCloseButton
        >
          <DialogHeader className="pb-4 mb-2 border-b">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Glasses className="h-5 w-5" />
              Editar Receta
            </DialogTitle>
          </DialogHeader>

          {selectedReceta && patientData && (
            <RecetaForm
              patientId={patientId}
              patientName={`${patientData.primer_nombre} ${patientData.primer_apellido}`}
              onSave={handleUpdateReceta}
              onCancel={() => setIsEditRecetaDialogOpen(false)}
              initialData={prepareRecetaFormData(selectedReceta)}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Lista de recetas */}
      {loadingRecetas ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : patientRecetas.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No hay recetas registradas para este paciente
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {patientRecetas.map((receta) => (
            <Card
              key={receta.id}
              className="overflow-hidden border-border/50 hover:shadow-md transition-all duration-200"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {formatDate(receta.fecha_emision)}
                    </CardTitle>
                    {receta.fecha_vencimiento && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Vence: {formatDate(receta.fecha_vencimiento)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewRecetaDetails(receta)}
                      className="h-8 gap-1 hover:bg-primary/10 hover:text-primary"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">Ver Detalles</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditReceta(receta)}
                      className="h-8 gap-1 hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2 space-y-3">
                {/* Tipos de lentes */}
                <div className="flex flex-wrap gap-1.5">
                  {[...new Set(receta.detalles?.map((d) => d.tipo_lente))].map(
                    (tipo, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-primary/10 text-primary capitalize"
                      >
                        {tipo}
                      </Badge>
                    )
                  )}
                </div>

                {/* Facturas asociadas */}
                {receta.facturas && receta.facturas.length > 0 && (
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">
                        Facturas Asociadas ({receta.facturas.length})
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {receta.facturas.map((factura) => (
                        <div
                          key={factura.id}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono bg-background px-1.5 py-0.5 rounded">
                              {factura.folio}
                            </code>
                            <Badge
                              variant={getEstadoBadgeVariant(factura.estado)}
                              className="text-xs capitalize"
                            >
                              {factura.estado}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(factura.total)}
                            </p>
                            {factura.saldo > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Saldo: {formatCurrency(factura.saldo)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
