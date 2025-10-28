/**
 * Tipos para el sistema de facturación rediseñado
 */

// ============================================================================
// ENUMS Y TIPOS BASE
// ============================================================================

export type EstadoFactura = 'pendiente' | 'pagado' | 'cancelado';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';

// ============================================================================
// MODELOS DE BASE DE DATOS
// ============================================================================

/**
 * Factura principal
 */
export interface Factura {
  id: string;
  folio: string;
  fecha: string;
  subtotal: number;
  iva: number;
  total: number;
  saldo: number;
  estado: EstadoFactura;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Relación entre factura y paciente
 */
export interface FacturaPaciente {
  id: string;
  factura_id: string;
  paciente_id: string;
  created_at: string;
}

/**
 * Referencia a receta desde factura
 */
export interface FacturaReceta {
  id: string;
  factura_id: string;
  receta_id: string;
  notas: string | null;
  created_at: string;
}

/**
 * Item/concepto facturable
 */
export interface FacturaItem {
  id: string;
  factura_id: string;
  concepto: string;
  descripcion: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at: string;
}

/**
 * Pago realizado a una factura
 */
export interface FacturaPago {
  id: string;
  factura_id: string;
  fecha: string;
  monto: number;
  metodo_pago: MetodoPago;
  referencia: string | null;
  notas: string | null;
  created_at: string;
}

// ============================================================================
// TIPOS EXTENDIDOS (con relaciones)
// ============================================================================

/**
 * Factura con información completa
 */
export interface FacturaCompleta extends Factura {
  pacientes?: FacturaPacienteDetalle[];
  recetas?: FacturaRecetaDetalle[];
  items?: FacturaItem[];
  pagos?: FacturaPago[];
}

/**
 * Paciente con datos básicos para la factura
 */
export interface FacturaPacienteDetalle extends FacturaPaciente {
  paciente?: {
    id: string;
    primer_nombre: string;
    primer_apellido: string;
    segundo_apellido: string | null;
    telefono: string;
  };
}

/**
 * Receta con datos básicos para la factura
 */
export interface FacturaRecetaDetalle extends FacturaReceta {
  receta?: {
    id: string;
    fecha_emision: string;
    tipo_lente: string;
  };
}

/**
 * Vista de resumen de factura (desde la vista SQL)
 */
export interface FacturaResumen {
  id: string;
  folio: string;
  fecha: string;
  subtotal: number;
  iva: number;
  total: number;
  saldo: number;
  estado: EstadoFactura;
  notas: string | null;
  created_at: string;
  updated_at: string;
  total_pacientes: number;
  total_recetas: number;
  total_items: number;
  total_pagado: number;
  pacientes_nombres: string | null;
}

// ============================================================================
// TIPOS PARA FORMULARIOS
// ============================================================================

/**
 * Datos para crear una nueva factura
 */
export interface CrearFacturaInput {
  fecha: string;
  notas?: string;
  pacientes_ids: string[]; // IDs de pacientes
  recetas_ids?: string[]; // IDs de recetas (opcional)
  items: CrearItemInput[];
}

/**
 * Datos para crear un item
 */
export interface CrearItemInput {
  concepto: string;
  descripcion?: string;
  cantidad: number;
  precio_unitario: number;
}

/**
 * Datos para editar una factura
 */
export interface EditarFacturaInput {
  fecha?: string;
  notas?: string;
  estado?: EstadoFactura;
}

/**
 * Datos para registrar un pago
 */
export interface RegistrarPagoInput {
  factura_id: string;
  fecha: string;
  monto: number;
  metodo_pago: MetodoPago;
  referencia?: string;
  notas?: string;
}

// ============================================================================
// TIPOS PARA UI
// ============================================================================

/**
 * Item temporal para el formulario (antes de guardar)
 */
export interface ItemFormulario {
  id?: string; // temporal para React key
  concepto: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

/**
 * Paciente seleccionado en el formulario
 */
export interface PacienteSeleccionado {
  id: string;
  nombre_completo: string;
  telefono: string;
}

/**
 * Receta seleccionada en el formulario
 */
export interface RecetaSeleccionada {
  id: string;
  fecha_emision: string;
  paciente_id: string;
  descripcion: string;
}

/**
 * Filtros para buscar facturas
 */
export interface FiltrosFacturas {
  folio?: string;
  estado?: EstadoFactura | 'todos';
  fecha_desde?: string;
  fecha_hasta?: string;
  paciente_id?: string;
}

/**
 * Estadísticas de facturación
 */
export interface EstadisticasFacturas {
  total_facturas: number;
  total_ingresos: number;
  total_pendiente: number;
  facturas_pendientes: number;
  facturas_pagadas: number;
  facturas_canceladas: number;
}
