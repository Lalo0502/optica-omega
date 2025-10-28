export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pacientes: {
        Row: {
          id: string
          created_at: string
          primer_nombre: string
          primer_apellido: string
          segundo_apellido: string | null
          direccion: string | null
          telefono: string
          email: string | null
          fecha_nacimiento: string | null
          notas: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          primer_nombre: string
          primer_apellido: string
          segundo_apellido?: string | null
          direccion?: string | null
          telefono: string
          email?: string | null
          fecha_nacimiento?: string | null
          notas?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          primer_nombre?: string
          primer_apellido?: string
          segundo_apellido?: string | null
          direccion?: string | null
          telefono?: string
          email?: string | null
          fecha_nacimiento?: string | null
          notas?: string | null
        }
      }
      condiciones_medicas: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          created_at?: string
        }
      }
      paciente_condiciones: {
        Row: {
          id: string
          paciente_id: string
          condicion_id: string
          fecha_diagnostico: string | null
          notas: string | null
          created_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          condicion_id: string
          fecha_diagnostico?: string | null
          notas?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          condicion_id?: string
          fecha_diagnostico?: string | null
          notas?: string | null
          created_at?: string
        }
        Relationships: {
          condiciones_medicas: {
            id: string
            nombre: string
            descripcion: string | null
          }
        }
      }
      recetas: {
        Row: {
          id: string
          paciente_id: string
          fecha_emision: string
          fecha_vencimiento: string | null
          notas: string | null
          created_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          fecha_emision?: string
          fecha_vencimiento?: string | null
          notas?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          fecha_emision?: string
          fecha_vencimiento?: string | null
          notas?: string | null
          created_at?: string
        }
      }
      receta_detalles: {
        Row: {
          id: string
          receta_id: string
          tipo_lente: string
          ojo: string
          esfera: number | null
          cilindro: number | null
          eje: number | null
          adicion: number | null
          distancia_pupilar: number | null
          altura: number | null
          notas: string | null
          created_at: string
        }
        Insert: {
          id?: string
          receta_id: string
          tipo_lente: string
          ojo: string
          esfera?: number | null
          cilindro?: number | null
          eje?: number | null
          adicion?: number | null
          distancia_pupilar?: number | null
          altura?: number | null
          notas?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          receta_id?: string
          tipo_lente?: string
          ojo?: string
          esfera?: number | null
          cilindro?: number | null
          eje?: number | null
          adicion?: number | null
          distancia_pupilar?: number | null
          altura?: number | null
          notas?: string | null
          created_at?: string
        }
      }
      receta_condiciones: {
        Row: {
          id: string
          receta_id: string
          paciente_condicion_id: string
          created_at: string
        }
        Insert: {
          id?: string
          receta_id: string
          paciente_condicion_id: string
          created_at?: string
        }
        Update: {
          id?: string
          receta_id?: string
          paciente_condicion_id?: string
          created_at?: string
        }
        Relationships: {
          paciente_condiciones: {
            id: string
            fecha_diagnostico: string | null
            notas: string | null
            condiciones_medicas: {
              id: string
              nombre: string
              descripcion: string | null
            }
          }
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}