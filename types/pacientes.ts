export interface Patient {
  id: string;
  created_at: string;
  updated_at?: string;
  primer_nombre: string;
  segundo_nombre?: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  direccion: string | null;
  telefono: string;
  email: string | null;
  fecha_nacimiento: string | null;
  edad: number | null;
  notas: string | null;
  // condiciones?: CondicionMedica[];
}

export interface CondicionMedica {
  id: string;
  nombre: string;
  descripcion: string | null;
  paciente_condicion_id?: string;
  fecha_diagnostico?: string | null;
  notas?: string | null;
  isSelected?: boolean;
}

export interface Receta {
  id: string;
  paciente_id: string;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  notas: string | null;
  created_at: string;
  detalles?: RecetaDetalle[];
}

export interface RecetaDetalle {
  id: string;
  receta_id: string;
  tipo_lente: string;
  ojo: string;
  esfera: number | null;
  cilindro: number | null;
  eje: number | null;
  adicion: number | null;
  distancia_pupilar: number | null;
  altura: number | null;
  notas: string | null;
}