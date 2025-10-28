"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, Glasses, User, Calendar, Eye
} from "lucide-react";
import { format } from "date-fns";

interface RecetaFormProps {
  patientId: string;
  patientName: string;
  onSave: (recetaData: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export default function RecetaForm({
  patientId,
  patientName,
  onSave,
  onCancel,
  initialData,
  isEditing = false
}: RecetaFormProps) {
  const [activeTab, setActiveTab] = useState("informacion");
  const [formData, setFormData] = useState({
    paciente_id: patientId,
    fecha_emision: format(new Date(), "yyyy-MM-dd"),
    fecha_vencimiento: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), "yyyy-MM-dd"),
    notas: ""
  });

  const [detallesOjoDerecho, setDetallesOjoDerecho] = useState({
    tipo_lente: "",
    esfera: null as number | null,
    cilindro: null as number | null,
    eje: null as number | null,
    adicion: null as number | null,
    distancia_pupilar: null as number | null,
    altura: null as number | null,
    notas: null as string | null
  });

  const [detallesOjoIzquierdo, setDetallesOjoIzquierdo] = useState({
    tipo_lente: "",
    esfera: null as number | null,
    cilindro: null as number | null,
    eje: null as number | null,
    adicion: null as number | null,
    distancia_pupilar: null as number | null,
    altura: null as number | null,
    notas: null as string | null
  });

  // Cargar datos iniciales si estamos editando
  useState(() => {
    if (initialData && isEditing) {
      setFormData({
        paciente_id: patientId,
        fecha_emision: initialData.fecha_emision || format(new Date(), "yyyy-MM-dd"),
        fecha_vencimiento: initialData.fecha_vencimiento || "",
        notas: initialData.notas || ""
      });
      
      if (initialData.detallesOjoDerecho) {
        setDetallesOjoDerecho(initialData.detallesOjoDerecho);
      }
      
      if (initialData.detallesOjoIzquierdo) {
        setDetallesOjoIzquierdo(initialData.detallesOjoIzquierdo);
      }
    }
  });

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Manejar cambios en los detalles del ojo derecho
  const handleDetalleOjoDerechoChange = (field: string, value: any) => {
    setDetallesOjoDerecho((prev) => ({ ...prev, [field]: value }));
  };

  // Manejar cambios en los detalles del ojo izquierdo
  const handleDetalleOjoIzquierdoChange = (field: string, value: any) => {
    setDetallesOjoIzquierdo((prev) => ({ ...prev, [field]: value }));
  };

  // Guardar la receta
  const handleSaveReceta = async () => {
    // Validar campos requeridos
    if (!formData.paciente_id || !formData.fecha_emision) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    // Preparar los datos para guardar
    const recetaData = {
      ...formData,
      detalles: [
        {
          tipo_lente: detallesOjoDerecho.tipo_lente,
          ojo: "derecho",
          esfera: detallesOjoDerecho.esfera,
          cilindro: detallesOjoDerecho.cilindro,
          eje: detallesOjoDerecho.eje,
          adicion: detallesOjoDerecho.adicion,
          distancia_pupilar: detallesOjoDerecho.distancia_pupilar,
          altura: detallesOjoDerecho.altura,
          notas: detallesOjoDerecho.notas
        },
        {
          tipo_lente: detallesOjoIzquierdo.tipo_lente,
          ojo: "izquierdo",
          esfera: detallesOjoIzquierdo.esfera,
          cilindro: detallesOjoIzquierdo.cilindro,
          eje: detallesOjoIzquierdo.eje,
          adicion: detallesOjoIzquierdo.adicion,
          distancia_pupilar: detallesOjoIzquierdo.distancia_pupilar,
          altura: detallesOjoIzquierdo.altura,
          notas: detallesOjoIzquierdo.notas
        }
      ]
    };

    await onSave(recetaData);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="informacion" className="gap-2">
          <FileText className="h-4 w-4" />
          Información Básica
        </TabsTrigger>
        <TabsTrigger value="prescripcion" className="gap-2">
          <Glasses className="h-4 w-4" />
          Prescripción
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="informacion" className="space-y-4 py-2">
        <div className="space-y-4">
          <div className="form-section p-4 rounded-lg border border-border/60 bg-card">
            <div className="form-section-title text-sm font-medium flex items-center gap-2 mb-3 pb-2 border-b">
              <User className="h-4 w-4 text-primary" />
              <span>Paciente</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paciente_id" className="text-sm font-medium flex items-center gap-1.5">
                <span>Paciente</span>
                <span className="text-primary ml-0.5">*</span>
              </Label>
              <div className="p-2 border rounded-md bg-muted/20">
                {patientName}
              </div>
            </div>
          </div>
          
          <div className="form-section p-4 rounded-lg border border-border/60 bg-card">
            <div className="form-section-title text-sm font-medium flex items-center gap-2 mb-3 pb-2 border-b">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Fechas</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_emision" className="text-sm font-medium flex items-center gap-1.5">
                  <span>Fecha de Emisión</span>
                  <span className="text-primary ml-0.5">*</span>
                </Label>
                <Input
                  id="fecha_emision"
                  type="date"
                  value={formData.fecha_emision}
                  onChange={handleInputChange}
                  className="w-full"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fecha_vencimiento" className="text-sm font-medium flex items-center gap-1.5">
                  <span>Fecha de Vencimiento</span>
                </Label>
                <Input
                  id="fecha_vencimiento"
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section p-4 rounded-lg border border-border/60 bg-card">
            <div className="form-section-title text-sm font-medium flex items-center gap-2 mb-3 pb-2 border-b">
              <FileText className="h-4 w-4 text-primary" />
              <span>Notas Adicionales</span>
            </div>
            
            <div className="space-y-2">
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={handleInputChange}
                placeholder="Observaciones o indicaciones adicionales"
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={() => setActiveTab("prescripcion")}>
            Siguiente
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="prescripcion" className="space-y-4 py-2">
        <div className="space-y-4">
          <div className="form-section p-4 rounded-lg border border-border/60 bg-card">
            <div className="form-section-title text-sm font-medium flex items-center gap-2 mb-3 pb-2 border-b">
              <Glasses className="h-4 w-4 text-primary" />
              <span>Tipo de Lente</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_lente_od" className="text-sm font-medium">
                  Ojo Derecho (OD)
                </Label>
                <Select 
                  value={detallesOjoDerecho.tipo_lente} 
                  onValueChange={(value) => handleDetalleOjoDerechoChange("tipo_lente", value)}
                >
                  <SelectTrigger id="tipo_lente_od">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monofocal">Monofocal</SelectItem>
                    <SelectItem value="bifocal">Bifocal</SelectItem>
                    <SelectItem value="progresivo">Progresivo</SelectItem>
                    <SelectItem value="ocupacional">Ocupacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tipo_lente_oi" className="text-sm font-medium">
                  Ojo Izquierdo (OI)
                </Label>
                <Select 
                  value={detallesOjoIzquierdo.tipo_lente} 
                  onValueChange={(value) => handleDetalleOjoIzquierdoChange("tipo_lente", value)}
                >
                  <SelectTrigger id="tipo_lente_oi">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monofocal">Monofocal</SelectItem>
                    <SelectItem value="bifocal">Bifocal</SelectItem>
                    <SelectItem value="progresivo">Progresivo</SelectItem>
                    <SelectItem value="ocupacional">Ocupacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ojo Derecho */}
            <div className="form-section p-4 rounded-lg border border-border/60 bg-card">
              <div className="form-section-title text-sm font-medium flex items-center gap-2 mb-3 pb-2 border-b">
                <Eye className="h-4 w-4 text-primary" />
                <span>Ojo Derecho (OD)</span>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="esfera_od" className="text-xs font-medium">
                      Esfera
                    </Label>
                    <Input
                      id="esfera_od"
                      type="number"
                      step="0.25"
                      value={detallesOjoDerecho.esfera === null ? "" : detallesOjoDerecho.esfera}
                      onChange={(e) => handleDetalleOjoDerechoChange("esfera", e.target.value === "" ? null : parseFloat(e.target.value))}
                      className="h-8 text-xs"
                      placeholder="+/-0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cilindro_od" className="text-xs font-medium">
                      Cilindro
                    </Label>
                    <Input
                      id="cilindro_od"
                      type="number"
                      step="0.25"
                      value={detallesOjoDerecho.cilindro === null ? "" : detallesOjoDerecho.cilindro}
                      onChange={(e) => handleDetalleOjoDerechoChange("cilindro", e.target.value === "" ? null : parseFloat(e.target.value))}
                      className="h-8 text-xs"
                      placeholder="+/-0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="eje_od" className="text-xs font-medium">
                      Eje
                    </Label>
                    <Input
                      id="eje_od"
                      type="number"
                      min="0"
                      max="180"
                      value={detallesOjoDerecho.eje === null ? "" : detallesOjoDerecho.eje}
                      onChange={(e) => handleDetalleOjoDerechoChange("eje", e.target.value === "" ? null : parseInt(e.target.value))}
                      className="h-8 text-xs"
                      placeholder="0-180"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="adicion_od" className="text-xs font-medium">
                      Adición
                    </Label>
                    <Input
                      id="adicion_od"
                      type="number"
                      step="0.25"
                      value={detallesOjoDerecho.adicion === null ? "" : detallesOjoDerecho.adicion}
                      onChange={(e) => handleDetalleOjoDerechoChange("adicion", e.target.value === "" ? null : parseFloat(e.target.value))}
                      className="h-8 text-xs"
                      placeholder="+0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="dp_od" className="text-xs font-medium">
                      Dist. Pupilar
                    </Label>
                    <Input
                      id="dp_od"
                      type="number"
                      step="0.5"
                      value={detallesOjoDerecho.distancia_pupilar === null ? "" : detallesOjoDerecho.distancia_pupilar}
                      onChange={(e) => handleDetalleOjoDerechoChange("distancia_pupilar", e.target.value === "" ? null : parseFloat(e.target.value))}
                      className="h-8 text-xs"
                      placeholder="mm"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="altura_od" className="text-xs font-medium">
                    Altura
                  </Label>
                  <Input
                    id="altura_od"
                    type="number"
                    step="0.5"
                    value={detallesOjoDerecho.altura === null ? "" : detallesOjoDerecho.altura}
                    onChange={(e) => handleDetalleOjoDerechoChange("altura", e.target.value === "" ? null : parseFloat(e.target.value))}
                    className="h-8 text-xs"
                    placeholder="mm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="notas_od" className="text-xs font-medium">
                    Notas
                  </Label>
                  <Input
                    id="notas_od"
                    value={detallesOjoDerecho.notas || ""}
                    onChange={(e) => handleDetalleOjoDerechoChange("notas", e.target.value)}
                    className="h-8 text-xs"
                    placeholder="Observaciones específicas"
                  />
                </div>
              </div>
            </div>
            
            {/* Ojo Izquierdo */}
            <div className="form-section p-4 rounded-lg border border-border/60 bg-card">
              <div className="form-section-title text-sm font-medium flex items-center gap-2 mb-3 pb-2 border-b">
                <Eye className="h-4 w-4 text-primary" />
                <span>Ojo Izquierdo (OI)</span>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="esfera_oi" className="text-xs font-medium">
                      Esfera
                    </Label>
                    <Input
                      id="esfera_oi"
                      type="number"
                      step="0.25"
                      value={detallesOjoIzquierdo.esfera === null ? "" : detallesOjoIzquierdo.esfera}
                      onChange={(e) => handleDetalleOjoIzquierdoChange("esfera", e.target.value === "" ? null : parseFloat(e.target.value))}
                      className="h-8 text-xs"
                      placeholder="+/-0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cilindro_oi" className="text-xs font-medium">
                      Cilindro
                    </Label>
                    <Input
                      id="cilindro_oi"
                      type="number"
                      step="0.25"
                      value={detallesOjoIzquierdo.cilindro === null ? "" : detallesOjoIzquierdo.cilindro}
                      onChange={(e) => handleDetalleOjoIzquierdoChange("cilindro", e.target.value === "" ? null : parseFloat(e.target.value))}
                      className="h-8 text-xs"
                      placeholder="+/-0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="eje_oi" className="text-xs font-medium">
                      Eje
                    </Label>
                    <Input
                      id="eje_oi"
                      type="number"
                      min="0"
                      max="180"
                      value={detallesOjoIzquierdo.eje === null ? "" : detallesOjoIzquierdo.eje}
                      onChange={(e) => handleDetalleOjoIzquierdoChange("eje", e.target.value === "" ? null : parseInt(e.target.value))}
                      className="h-8 text-xs"
                      placeholder="0-180"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="adicion_oi" className="text-xs font-medium">
                      Adición
                    </Label>
                    <Input
                      id="adicion_oi"
                      type="number"
                      step="0.25"
                      value={detallesOjoIzquierdo.adicion === null ? "" : detallesOjoIzquierdo.adicion}
                      onChange={(e) => handleDetalleOjoIzquierdoChange("adicion", e.target.value === "" ? null : parseFloat(e.target.value))}
                      className="h-8 text-xs"
                      placeholder="+0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="dp_oi" className="text-xs font-medium">
                      Dist. Pupilar
                    </Label>
                    <Input
                      id="dp_oi"
                      type="number"
                      step="0.5"
                      value={detallesOjoIzquierdo.distancia_pupilar === null ? "" : detallesOjoIzquierdo.distancia_pupilar}
                      onChange={(e) => handleDetalleOjoIzquierdoChange("distancia_pupilar", e.target.value === "" ? null : parseFloat(e.target.value))}
                      className="h-8 text-xs"
                      placeholder="mm"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="altura_oi" className="text-xs font-medium">
                    Altura
                  </Label>
                  <Input
                    id="altura_oi"
                    type="number"
                    step="0.5"
                    value={detallesOjoIzquierdo.altura === null ? "" : detallesOjoIzquierdo.altura}
                    onChange={(e) => handleDetalleOjoIzquierdoChange("altura", e.target.value === "" ? null : parseFloat(e.target.value))}
                    className="h-8 text-xs"
                    placeholder="mm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="notas_oi" className="text-xs font-medium">
                    Notas
                  </Label>
                  <Input
                    id="notas_oi"
                    value={detallesOjoIzquierdo.notas || ""}
                    onChange={(e) => handleDetalleOjoIzquierdoChange("notas", e.target.value)}
                    className="h-8 text-xs"
                    placeholder="Observaciones específicas"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => setActiveTab("informacion")}>
            Anterior
          </Button>
          <Button onClick={handleSaveReceta}>
            {isEditing ? "Actualizar Receta" : "Guardar Receta"}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}