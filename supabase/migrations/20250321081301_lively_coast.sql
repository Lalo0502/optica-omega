/*
  # Sistema de Facturación

  1. Tablas Principales
    - `facturas`: Información general de facturas
    - `factura_pacientes`: Relación entre facturas y pacientes
    - `factura_pagos`: Registro de pagos (permite pagos mixtos)

  2. Estados de Pago
    - pendiente: No se ha realizado ningún pago
    - abonado: Se ha realizado un pago parcial
    - pagado: Pagado completamente
    - vencido: Pasó la fecha límite sin pago completo
    - cancelado: Factura cancelada
*/

-- Crear tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento date,
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  iva decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  anticipo decimal(10,2) NOT NULL DEFAULT 0,
  saldo decimal(10,2) NOT NULL DEFAULT 0,
  estado text NOT NULL CHECK (estado IN ('pendiente', 'abonado', 'pagado', 'vencido', 'cancelado')) DEFAULT 'pendiente',
  notas text,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de relación entre facturas y pacientes
CREATE TABLE IF NOT EXISTS factura_pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id uuid REFERENCES facturas(id) ON DELETE CASCADE,
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(factura_id, paciente_id)
);

-- Crear tabla de pagos de facturas (permite pagos mixtos)
CREATE TABLE IF NOT EXISTS factura_pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id uuid REFERENCES facturas(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  monto decimal(10,2) NOT NULL DEFAULT 0,
  metodo_pago text NOT NULL CHECK (metodo_pago IN ('efectivo', 'tarjeta')),
  referencia_tarjeta text, -- Para pagos con tarjeta
  tipo_tarjeta text CHECK (tipo_tarjeta IN ('debito', 'credito')), -- débito/crédito
  notas text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_payment_amount CHECK (monto > 0)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_pagos ENABLE ROW LEVEL SECURITY;

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado);
CREATE INDEX IF NOT EXISTS idx_factura_pacientes ON factura_pacientes(factura_id, paciente_id);
CREATE INDEX IF NOT EXISTS idx_factura_pagos ON factura_pagos(factura_id);

-- Vista para resumen de facturas con pagos
CREATE OR REPLACE VIEW vista_resumen_facturas AS
SELECT 
  f.id as factura_id,
  f.fecha,
  f.fecha_vencimiento,
  f.total,
  f.anticipo,
  f.saldo,
  f.estado,
  COALESCE(SUM(CASE WHEN fp.metodo_pago = 'efectivo' THEN fp.monto ELSE 0 END), 0) as total_efectivo,
  COALESCE(SUM(CASE WHEN fp.metodo_pago = 'tarjeta' THEN fp.monto ELSE 0 END), 0) as total_tarjeta,
  COUNT(DISTINCT fpa.paciente_id) as total_pacientes
FROM facturas f
LEFT JOIN factura_pagos fp ON f.id = fp.factura_id
LEFT JOIN factura_pacientes fpa ON f.id = fpa.factura_id
GROUP BY f.id, f.fecha, f.fecha_vencimiento, f.total, f.anticipo, f.saldo, f.estado;

-- Función para actualizar estado y saldo de factura
CREATE OR REPLACE FUNCTION actualizar_estado_factura()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular el total pagado
  WITH pagos_totales AS (
    SELECT COALESCE(SUM(monto), 0) as total_pagado
    FROM factura_pagos
    WHERE factura_id = NEW.factura_id
  )
  UPDATE facturas f
  SET 
    saldo = f.total - f.anticipo - (SELECT total_pagado FROM pagos_totales),
    estado = CASE 
      WHEN f.total <= f.anticipo + (SELECT total_pagado FROM pagos_totales) THEN 'pagado'
      WHEN (SELECT total_pagado FROM pagos_totales) > 0 OR f.anticipo > 0 THEN 'abonado'
      WHEN f.fecha_vencimiento < CURRENT_DATE THEN 'vencido'
      ELSE 'pendiente'
    END
  WHERE id = NEW.factura_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estado automáticamente
CREATE TRIGGER trigger_actualizar_estado_factura
AFTER INSERT OR UPDATE OR DELETE ON factura_pagos
FOR EACH ROW
EXECUTE FUNCTION actualizar_estado_factura();