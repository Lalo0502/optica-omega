/*
  # Sistema de Facturación

  1. Nuevas Tablas
    - `facturas`
      - Información general de la factura
      - Incluye folio automático (FAC-YYYYMMDD-XXXX)
      - Estados: pendiente, abonado, pagado, vencido, cancelado
    
    - `factura_pacientes`
      - Relación muchos a muchos entre facturas y pacientes
      - Permite múltiples pacientes por factura
    
    - `factura_recetas`
      - Relación muchos a muchos entre facturas y recetas
      - Incluye precio y descripción por receta
    
    - `factura_pagos`
      - Registro de pagos realizados
      - Soporta pagos mixtos (efectivo/tarjeta)
      - Incluye referencias y tipos de tarjeta

  2. Características
    - Folio automático para facturas
    - Cálculo automático de saldos
    - Actualización automática de estados
    - Vista de resumen de facturas
    - Índices para optimización
    - Políticas de seguridad (RLS)
*/

-- Crear secuencia para folios
CREATE SEQUENCE IF NOT EXISTS factura_folio_seq;

-- Crear tabla de facturas
CREATE TABLE facturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folio text UNIQUE,
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
CREATE TABLE factura_pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id uuid REFERENCES facturas(id) ON DELETE CASCADE,
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(factura_id, paciente_id)
);

-- Crear tabla de relación entre facturas y recetas
CREATE TABLE factura_recetas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id uuid REFERENCES facturas(id) ON DELETE CASCADE,
  receta_id uuid REFERENCES recetas(id) ON DELETE CASCADE,
  descripcion text NOT NULL,
  precio decimal(10,2) NOT NULL DEFAULT 0,
  notas text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(factura_id, receta_id)
);

-- Crear tabla de pagos de facturas
CREATE TABLE factura_pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id uuid REFERENCES facturas(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  monto decimal(10,2) NOT NULL DEFAULT 0,
  metodo_pago text NOT NULL CHECK (metodo_pago IN ('efectivo', 'tarjeta')),
  referencia_tarjeta text,
  tipo_tarjeta text CHECK (tipo_tarjeta IN ('debito', 'credito')),
  notas text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_payment_amount CHECK (monto > 0)
);

-- Crear índices para optimización
CREATE INDEX idx_facturas_fecha ON facturas(fecha);
CREATE INDEX idx_facturas_estado ON facturas(estado);
CREATE INDEX idx_facturas_folio ON facturas(folio);
CREATE INDEX idx_factura_pacientes ON factura_pacientes(factura_id, paciente_id);
CREATE INDEX idx_factura_recetas ON factura_recetas(factura_id, receta_id);
CREATE INDEX idx_factura_pagos ON factura_pagos(factura_id);

-- Función para generar folio automático
CREATE OR REPLACE FUNCTION generate_factura_folio()
RETURNS TRIGGER AS $$
DECLARE
  fecha_str text;
  seq_num text;
BEGIN
  fecha_str := to_char(NEW.fecha, 'YYYYMMDD');
  seq_num := lpad(nextval('factura_folio_seq')::text, 4, '0');
  NEW.folio := 'FAC-' || fecha_str || '-' || seq_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para asignar folio automáticamente
CREATE TRIGGER set_factura_folio
  BEFORE INSERT ON facturas
  FOR EACH ROW
  EXECUTE FUNCTION generate_factura_folio();

-- Función para actualizar estado y saldo de factura
CREATE OR REPLACE FUNCTION actualizar_estado_factura()
RETURNS TRIGGER AS $$
BEGIN
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

-- Vista para resumen de facturas
CREATE OR REPLACE VIEW vista_resumen_facturas AS
SELECT 
  f.id as factura_id,
  f.folio,
  f.fecha,
  f.fecha_vencimiento,
  f.total,
  f.anticipo,
  f.saldo,
  f.estado,
  COALESCE(SUM(CASE WHEN fp.metodo_pago = 'efectivo' THEN fp.monto ELSE 0 END), 0) as total_efectivo,
  COALESCE(SUM(CASE WHEN fp.metodo_pago = 'tarjeta' THEN fp.monto ELSE 0 END), 0) as total_tarjeta,
  COUNT(DISTINCT fr.receta_id) as total_recetas,
  COUNT(DISTINCT fpa.paciente_id) as total_pacientes
FROM facturas f
LEFT JOIN factura_pagos fp ON f.id = fp.factura_id
LEFT JOIN factura_recetas fr ON f.id = fr.factura_id
LEFT JOIN factura_pacientes fpa ON f.id = fpa.factura_id
GROUP BY f.id, f.folio, f.fecha, f.fecha_vencimiento, f.total, f.anticipo, f.saldo, f.estado;

-- Habilitar RLS en todas las tablas
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_pagos ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (para demo)
CREATE POLICY "Acceso público para lectura de facturas"
  ON facturas FOR SELECT TO anon USING (true);

CREATE POLICY "Acceso público para inserción de facturas"
  ON facturas FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de facturas"
  ON facturas FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de facturas"
  ON facturas FOR DELETE TO anon USING (true);

-- Repetir políticas para las demás tablas
CREATE POLICY "Acceso público para lectura de factura_pacientes"
  ON factura_pacientes FOR SELECT TO anon USING (true);

CREATE POLICY "Acceso público para inserción de factura_pacientes"
  ON factura_pacientes FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de factura_pacientes"
  ON factura_pacientes FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de factura_pacientes"
  ON factura_pacientes FOR DELETE TO anon USING (true);

CREATE POLICY "Acceso público para lectura de factura_recetas"
  ON factura_recetas FOR SELECT TO anon USING (true);

CREATE POLICY "Acceso público para inserción de factura_recetas"
  ON factura_recetas FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de factura_recetas"
  ON factura_recetas FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de factura_recetas"
  ON factura_recetas FOR DELETE TO anon USING (true);

CREATE POLICY "Acceso público para lectura de factura_pagos"
  ON factura_pagos FOR SELECT TO anon USING (true);

CREATE POLICY "Acceso público para inserción de factura_pagos"
  ON factura_pagos FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de factura_pagos"
  ON factura_pagos FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de factura_pagos"
  ON factura_pagos FOR DELETE TO anon USING (true);