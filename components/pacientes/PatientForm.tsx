"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ClipboardList,
} from "lucide-react";

interface PatientFormProps {
  formData: {
    primer_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    direccion: string;
    telefono: string;
    email: string;
    fecha_nacimiento: string;
    edad: string;
    notas: string;
  };
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleSavePatient: () => void;
  isEditing: boolean;
  setIsDialogOpen: (value: boolean) => void;
}

export default function PatientForm({
  formData,
  handleInputChange,
  activeTab,
  setActiveTab,
  handleSavePatient,
  isEditing,
  setIsDialogOpen,
}: PatientFormProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="datos-personales" className="gap-2">
          <User className="h-4 w-4" />
          Datos Personales
        </TabsTrigger>
        <TabsTrigger value="datos-medicos" className="gap-2">
          <ClipboardList className="h-4 w-4" />
          Datos Médicos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="datos-personales" className="space-y-4 py-2">
        <div className="space-y-4">
          <div className="form-section p-4 rounded-lg border border-border/60 bg-card">
            <div className="form-section-title text-sm font-medium flex items-center gap-2 mb-3 pb-2 border-b">
              <User className="h-4 w-4 text-primary" />
              <span>Información Personal</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="primer_nombre"
                  className="text-sm font-medium flex items-center gap-1.5"
                >
                  <span>Primer Nombre</span>
                  <span className="text-primary ml-0.5">*</span>
                </Label>
                <Input
                  id="primer_nombre"
                  value={formData.primer_nombre}
                  onChange={handleInputChange}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="primer_apellido"
                  className="text-sm font-medium flex items-center gap-1.5"
                >
                  <span>Primer Apellido</span>
                  <span className="text-primary ml-0.5">*</span>
                </Label>
                <Input
                  id="primer_apellido"
                  value={formData.primer_apellido}
                  onChange={handleInputChange}
                  className="w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label
                htmlFor="segundo_apellido"
                className="text-sm font-medium flex items-center gap-1.5"
              >
                <span>Segundo Apellido</span>
              </Label>
              <Input
                id="segundo_apellido"
                value={formData.segundo_apellido}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label
                  htmlFor="fecha_nacimiento"
                  className="text-sm font-medium flex items-center gap-1.5"
                >
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Fecha de Nacimiento</span>
                </Label>
                <Input
                  id="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edad"
                  className="text-sm font-medium flex items-center gap-1.5"
                >
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Edad</span>
                </Label>
                <Input
                  id="edad"
                  type="number"
                  min="0"
                  max="150"
                  value={formData.edad}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Ej: 35"
                />
              </div>
            </div>
          </div>

          <div className="form-section p-4 rounded-lg border border-border/60 bg-card">
            <div className="form-section-title text-sm font-medium flex items-center gap-2 mb-3 pb-2 border-b">
              <Phone className="h-4 w-4 text-primary" />
              <span>Información de Contacto</span>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="telefono"
                className="text-sm font-medium flex items-center gap-1.5"
              >
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Teléfono</span>
              </Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label
                htmlFor="email"
                className="text-sm font-medium flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Correo Electrónico</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label
                htmlFor="direccion"
                className="text-sm font-medium flex items-center gap-1.5"
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Dirección</span>
              </Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => setActiveTab("datos-medicos")}>
            Siguiente
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="datos-medicos" className="space-y-4 py-2">
        <div className="space-y-4">
          <div className="form-section p-4 rounded-lg border border-border/60 bg-card">
            <div className="form-section-title text-sm font-medium flex items-center gap-2 mb-3 pb-2 border-b">
              <ClipboardList className="h-4 w-4 text-primary" />
              <span>Notas Médicas Generales</span>
            </div>

            <div className="space-y-2">
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={handleInputChange}
                placeholder="Información médica relevante, comentarios o notas adicionales"
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={() => setActiveTab("datos-personales")}
          >
            Anterior
          </Button>
          <Button onClick={handleSavePatient}>
            {isEditing ? "Actualizar Paciente" : "Guardar Paciente"}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
