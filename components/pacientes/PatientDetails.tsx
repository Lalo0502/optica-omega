"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Patient } from "@/types/pacientes";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Printer,
  Download,
  Loader2,
  CreditCard,
  Clock,
} from "lucide-react";

interface PatientDetailsProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PatientDetails({
  patientId,
  isOpen,
  onClose,
}: PatientDetailsProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!patientId || !isOpen) return;

      setLoading(true);

      try {
        // Obtener datos del paciente
        const { data: patientData, error: patientError } = await supabase
          .from("pacientes")
          .select("*")
          .eq("id", patientId)
          .single();

        if (patientError) throw patientError;

        if (patientData) {
          setPatient(patientData);
        }
      } catch (error) {
        console.error("Error al cargar detalles del paciente:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los detalles del paciente",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [patientId, isOpen, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl max-h-[80vh] overflow-y-auto"
        hideCloseButton
      >
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : patient ? (
          <>
            {/* Header con acciones */}
            <DialogHeader className="space-y-0 pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border-2 border-primary/20">
                    {patient.primer_nombre.charAt(0)}
                    {patient.primer_apellido.charAt(0)}
                  </div>
                  <div>
                    <DialogTitle className="text-lg">
                      {patient.primer_nombre} {patient.segundo_nombre || ""}{" "}
                      {patient.primer_apellido} {patient.segundo_apellido || ""}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Paciente #{patient.id.substring(0, 8)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-8 text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-8 text-xs"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Imprimir
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Datos Principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna Izquierda */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Primer Nombre
                    </label>
                    <p className="text-base font-semibold mt-1">
                      {patient.primer_nombre}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Segundo Nombre
                    </label>
                    <p className="text-base font-semibold mt-1">
                      {patient.segundo_nombre || (
                        <span className="text-muted-foreground/50 text-sm">
                          No especificado
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Primer Apellido
                    </label>
                    <p className="text-base font-semibold mt-1">
                      {patient.primer_apellido}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Segundo Apellido
                    </label>
                    <p className="text-base font-semibold mt-1">
                      {patient.segundo_apellido || (
                        <span className="text-muted-foreground/50 text-sm">
                          No especificado
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Fecha de Nacimiento
                      </label>
                      <p className="text-sm font-medium mt-1">
                        {patient.fecha_nacimiento ? (
                          formatDate(patient.fecha_nacimiento)
                        ) : (
                          <span className="text-muted-foreground/50 text-sm">
                            No especificada
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Edad
                      </label>
                      <p className="text-sm font-medium mt-1">
                        {patient.edad ? (
                          `${patient.edad} años`
                        ) : (
                          <span className="text-muted-foreground/50 text-sm">
                            No especificada
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Teléfono
                    </label>
                    <p className="text-base font-semibold mt-1">
                      {patient.telefono || (
                        <span className="text-muted-foreground/50 text-sm">
                          No especificado
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </label>
                    <p className="text-sm font-medium mt-1 break-words">
                      {patient.email || (
                        <span className="text-muted-foreground/50 text-sm">
                          No especificado
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Dirección
                    </label>
                    <p className="text-sm font-medium mt-1">
                      {patient.direccion || (
                        <span className="text-muted-foreground/50 text-sm">
                          No especificada
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div className="pt-4 border-t">
                <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Notas
                </label>
                <p className="text-sm text-foreground/80 mt-2 whitespace-pre-line leading-relaxed">
                  {patient.notas || (
                    <span className="text-muted-foreground/50 text-sm">
                      Sin notas adicionales
                    </span>
                  )}
                </p>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Registrado el {formatDate(patient.created_at)}
                </span>
                <Button onClick={onClose} variant="outline">
                  Cerrar
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              No se encontró información del paciente
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
