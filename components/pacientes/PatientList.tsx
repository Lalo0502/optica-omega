"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Edit,
  Trash2,
  Calendar,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  MapPin,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Patient } from "@/types/pacientes";
import PatientRecetas from "./PatientRecetas";
import PatientDetails from "./PatientDetails";

interface PatientListProps {
  patients: Patient[];
  expandedPatient: string | null;
  fetchPatientRecetas: (patientId: string) => void;
  handleEdit: (patient: Patient) => void;
  handleDelete: (id: string) => void;
}

export default function PatientList({
  patients,
  expandedPatient,
  fetchPatientRecetas,
  handleEdit,
  handleDelete,
}: PatientListProps) {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

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

  // Obtener iniciales para el avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      {/* Vista Desktop - Tabla (oculta en móvil) */}
      <div className="hidden md:block table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: "40px" }}></TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead style={{ width: "100px" }}>Edad</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className="text-right" style={{ width: "140px" }}>
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No se encontraron pacientes con ese criterio de búsqueda
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <React.Fragment key={patient.id}>
                  <TableRow className="patient-card">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={() => fetchPatientRecetas(patient.id)}
                      >
                        {expandedPatient === patient.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-primary/10 text-primary">
                          <AvatarFallback>
                            {getInitials(
                              patient.primer_nombre,
                              patient.primer_apellido
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {patient.primer_nombre}{" "}
                            {patient.segundo_nombre
                              ? patient.segundo_nombre + " "
                              : ""}
                            {patient.primer_apellido}{" "}
                            {patient.segundo_apellido || ""}
                          </div>
                          {patient.fecha_nacimiento ? (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(patient.fecha_nacimiento)}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground/50">
                              Sin fecha de nacimiento
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        {patient.telefono ? (
                          <a
                            href={`tel:${patient.telefono}`}
                            className="flex items-center text-sm hover:text-primary transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                            <span className="font-medium">
                              {patient.telefono}
                            </span>
                          </a>
                        ) : (
                          <div className="flex items-center text-xs text-muted-foreground/50">
                            <Phone className="h-3 w-3 mr-1.5 shrink-0" />
                            Sin teléfono
                          </div>
                        )}
                        {patient.email ? (
                          <div className="flex items-center text-sm">
                            <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                            <span
                              className="truncate max-w-[200px]"
                              title={patient.email}
                            >
                              {patient.email}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center text-xs text-muted-foreground/50">
                            <Mail className="h-3 w-3 mr-1.5 shrink-0" />
                            Sin email
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {patient.direccion ? (
                        <div className="flex items-start gap-1.5 text-sm">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                          <span className="line-clamp-2 max-w-[250px]">
                            {patient.direccion}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center text-xs text-muted-foreground/50">
                          <MapPin className="h-3 w-3 mr-1.5 shrink-0" />
                          Sin dirección
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {patient.edad ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {patient.edad} años
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">
                          No especificada
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.notas ? (
                        <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                          <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span className="line-clamp-2 max-w-[200px]">
                            {patient.notas}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center text-xs text-muted-foreground/50">
                          <FileText className="h-3 w-3 mr-1.5 shrink-0" />
                          Sin notas
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedPatient(patient.id)}
                          className="h-9 w-9 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(patient)}
                          className="h-9 w-9 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          title="Editar paciente"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(patient.id)}
                          className="h-9 w-9 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Eliminar paciente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedPatient === patient.id && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0 border-t-0">
                        <PatientRecetas patientId={patient.id} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Vista Móvil - Cards (oculta en desktop) */}
      <div className="md:hidden space-y-4">
        {patients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No se encontraron pacientes con ese criterio de búsqueda
              </p>
            </CardContent>
          </Card>
        ) : (
          patients.map((patient) => (
            <Card key={patient.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-4">
                {/* Header del Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-12 w-12 bg-primary/10 text-primary">
                      <AvatarFallback>
                        {getInitials(
                          patient.primer_nombre,
                          patient.primer_apellido
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">
                        {patient.primer_nombre}{" "}
                        {patient.segundo_nombre
                          ? patient.segundo_nombre + " "
                          : ""}
                        {patient.primer_apellido}
                      </h3>
                      {patient.edad && (
                        <p className="text-sm text-muted-foreground">
                          {patient.edad} años
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => fetchPatientRecetas(patient.id)}
                  >
                    {expandedPatient === patient.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {/* Información de Contacto */}
                <div className="space-y-2.5">
                  {patient.telefono ? (
                    <a
                      href={`tel:${patient.telefono}`}
                      className="flex items-center gap-2.5 text-sm hover:text-primary transition-colors active:scale-95"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{patient.telefono}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground/50">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>Sin teléfono</span>
                    </div>
                  )}

                  {patient.email ? (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground/50">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span>Sin email</span>
                    </div>
                  )}

                  {patient.direccion && (
                    <div className="flex items-start gap-2.5 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="line-clamp-2">{patient.direccion}</span>
                    </div>
                  )}

                  {patient.fecha_nacimiento && (
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{formatDate(patient.fecha_nacimiento)}</span>
                    </div>
                  )}

                  {patient.notas && (
                    <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{patient.notas}</span>
                    </div>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => setSelectedPatient(patient.id)}
                  >
                    <Eye className="h-4 w-4" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleEdit(patient)}
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(patient.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Recetas Expandidas */}
                {expandedPatient === patient.id && (
                  <div className="pt-3 border-t -mx-4 -mb-4">
                    <PatientRecetas patientId={patient.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <PatientDetails
        patientId={selectedPatient || ""}
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    </>
  );
}
