/*
 # Rediseño completo del módulo de facturación
 
 1. Limpieza
 - Eliminar todas las tablas relacionadas con facturación anterior
 - Eliminar vistas y políticas antiguas
 
 2. Nueva estructura
 - facturas: Tabla principal simplificada
 - facturas_pacientes: Relación N:N con pacientes
 - facturas_recetas: Referencia a recetas (sin precio)
 - facturas_items: Items/conceptos facturables con precio manual
 - facturas_pagos: Historial de pagos
 
 3. Características
 - Folio auto-generado
 - Cálculo automático de totales
 - Sistema de estados
 - Soporte para múltiples pacientes por factura
 - Pagos parciales
 */
-- ============================================================================
-- PASO 1: ELIMINAR ESTRUCTURA ANTERIOR
-- ============================================================================
-- Eliminar vistas
DROP VIEW IF EXISTS vista_resumen_facturas CASCADE;
-- Eliminar tablas relacionadas con facturación (en orden correcto por FK)
DROP TABLE IF EXISTS factura_pagos CASCADE;
DROP TABLE IF EXISTS factura_items CASCADE;
DROP TABLE IF EXISTS factura_recetas CASCADE;
DROP TABLE IF EXISTS factura_pacientes CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS facturas CASCADE;
-- ============================================================================
-- PASO 2: CREAR NUEVA ESTRUCTURA
-- ============================================================================
-- -----------------------------------------------------------------------------
-- Tabla principal: facturas
-- -----------------------------------------------------------------------------
CREATE TABLE facturas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    folio text UNIQUE NOT NULL,
    fecha date NOT NULL DEFAULT CURRENT_DATE,
    subtotal decimal(10, 2) NOT NULL DEFAULT 0,
    iva decimal(10, 2) NOT NULL DEFAULT 0,
    total decimal(10, 2) NOT NULL DEFAULT 0,
    saldo decimal(10, 2) NOT NULL DEFAULT 0,
    estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'cancelado')),
    notas text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT facturas_subtotal_check CHECK (subtotal >= 0),
    CONSTRAINT facturas_iva_check CHECK (iva >= 0),
    CONSTRAINT facturas_total_check CHECK (total >= 0),
    CONSTRAINT facturas_saldo_check CHECK (saldo >= 0)
);
-- Índices para mejorar rendimiento
CREATE INDEX idx_facturas_fecha ON facturas(fecha DESC);
CREATE INDEX idx_facturas_folio ON facturas(folio);
CREATE INDEX idx_facturas_estado ON facturas(estado);
-- -----------------------------------------------------------------------------
-- Relación N:N: facturas_pacientes
-- -----------------------------------------------------------------------------
CREATE TABLE facturas_pacientes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    factura_id uuid NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
    paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
    created_at timestamptz DEFAULT now(),
    UNIQUE(factura_id, paciente_id)
);
CREATE INDEX idx_facturas_pacientes_factura ON facturas_pacientes(factura_id);
CREATE INDEX idx_facturas_pacientes_paciente ON facturas_pacientes(paciente_id);
-- -----------------------------------------------------------------------------
-- Referencia a recetas (sin precio, solo contexto)
-- -----------------------------------------------------------------------------
CREATE TABLE facturas_recetas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    factura_id uuid NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
    receta_id uuid NOT NULL REFERENCES recetas(id) ON DELETE RESTRICT,
    notas text,
    created_at timestamptz DEFAULT now(),
    UNIQUE(factura_id, receta_id)
);
CREATE INDEX idx_facturas_recetas_factura ON facturas_recetas(factura_id);
CREATE INDEX idx_facturas_recetas_receta ON facturas_recetas(receta_id);
-- -----------------------------------------------------------------------------
-- Items/Conceptos facturables (AQUÍ van los precios)
-- -----------------------------------------------------------------------------
CREATE TABLE facturas_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    factura_id uuid NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
    concepto text NOT NULL,
    descripcion text,
    cantidad integer NOT NULL DEFAULT 1,
    precio_unitario decimal(10, 2) NOT NULL,
    subtotal decimal(10, 2) NOT NULL,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT facturas_items_cantidad_check CHECK (cantidad > 0),
    CONSTRAINT facturas_items_precio_check CHECK (precio_unitario >= 0),
    CONSTRAINT facturas_items_subtotal_check CHECK (subtotal >= 0)
);
CREATE INDEX idx_facturas_items_factura ON facturas_items(factura_id);
-- -----------------------------------------------------------------------------
-- Historial de pagos
-- -----------------------------------------------------------------------------
CREATE TABLE facturas_pagos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    factura_id uuid NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
    fecha date NOT NULL DEFAULT CURRENT_DATE,
    monto decimal(10, 2) NOT NULL,
    metodo_pago text NOT NULL CHECK (
        metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')
    ),
    referencia text,
    notas text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT facturas_pagos_monto_check CHECK (monto > 0)
);
CREATE INDEX idx_facturas_pagos_factura ON facturas_pagos(factura_id);
CREATE INDEX idx_facturas_pagos_fecha ON facturas_pagos(fecha DESC);
-- ============================================================================
-- PASO 3: TRIGGERS Y FUNCIONES
-- ============================================================================
-- -----------------------------------------------------------------------------
-- Función: Generar folio automático
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_folio() RETURNS TRIGGER AS $$
DECLARE year_part text;
month_part text;
next_number integer;
new_folio text;
BEGIN -- Obtener año y mes actual
year_part := TO_CHAR(NEW.fecha, 'YY');
month_part := TO_CHAR(NEW.fecha, 'MM');
-- Obtener el siguiente número secuencial del mes
SELECT COALESCE(
        MAX(
            CAST(
                SUBSTRING(
                    folio
                    FROM '\d+$'
                ) AS integer
            )
        ),
        0
    ) + 1 INTO next_number
FROM facturas
WHERE folio LIKE 'F-' || year_part || month_part || '-%';
-- Generar folio: F-YYMM-0001
new_folio := 'F-' || year_part || month_part || '-' || LPAD(next_number::text, 4, '0');
NEW.folio := new_folio;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger para generar folio automáticamente
CREATE TRIGGER trigger_generate_folio BEFORE
INSERT ON facturas FOR EACH ROW
    WHEN (
        NEW.folio IS NULL
        OR NEW.folio = ''
    ) EXECUTE FUNCTION generate_folio();
-- -----------------------------------------------------------------------------
-- Función: Actualizar timestamp
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_facturas_updated_at BEFORE
UPDATE ON facturas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- -----------------------------------------------------------------------------
-- Función: Recalcular totales de factura
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalcular_totales_factura() RETURNS TRIGGER AS $$
DECLARE factura_id_param uuid;
nuevo_subtotal decimal(10, 2);
nuevo_iva decimal(10, 2);
nuevo_total decimal(10, 2);
total_pagado decimal(10, 2);
nuevo_saldo decimal(10, 2);
nuevo_estado text;
BEGIN -- Determinar el ID de la factura según la operación
IF TG_OP = 'DELETE' THEN factura_id_param := OLD.factura_id;
ELSE factura_id_param := NEW.factura_id;
END IF;
-- Calcular subtotal desde items
SELECT COALESCE(SUM(subtotal), 0) INTO nuevo_subtotal
FROM facturas_items
WHERE factura_id = factura_id_param;
-- Calcular IVA (16%)
nuevo_iva := ROUND(nuevo_subtotal * 0.16, 2);
-- Calcular total
nuevo_total := nuevo_subtotal + nuevo_iva;
-- Calcular total pagado
SELECT COALESCE(SUM(monto), 0) INTO total_pagado
FROM facturas_pagos
WHERE factura_id = factura_id_param;
-- Calcular saldo
nuevo_saldo := nuevo_total - total_pagado;
-- Determinar estado
IF nuevo_saldo <= 0 THEN nuevo_estado := 'pagado';
ELSE
SELECT estado INTO nuevo_estado
FROM facturas
WHERE id = factura_id_param;
-- Solo cambiar a pendiente si no está cancelado
IF nuevo_estado != 'cancelado' THEN nuevo_estado := 'pendiente';
END IF;
END IF;
-- Actualizar factura
UPDATE facturas
SET subtotal = nuevo_subtotal,
    iva = nuevo_iva,
    total = nuevo_total,
    saldo = nuevo_saldo,
    estado = nuevo_estado
WHERE id = factura_id_param;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;
-- Triggers para recalcular totales automáticamente
CREATE TRIGGER trigger_recalcular_items_insert
AFTER
INSERT ON facturas_items FOR EACH ROW EXECUTE FUNCTION recalcular_totales_factura();
CREATE TRIGGER trigger_recalcular_items_update
AFTER
UPDATE ON facturas_items FOR EACH ROW EXECUTE FUNCTION recalcular_totales_factura();
CREATE TRIGGER trigger_recalcular_items_delete
AFTER DELETE ON facturas_items FOR EACH ROW EXECUTE FUNCTION recalcular_totales_factura();
CREATE TRIGGER trigger_recalcular_pagos_insert
AFTER
INSERT ON facturas_pagos FOR EACH ROW EXECUTE FUNCTION recalcular_totales_factura();
CREATE TRIGGER trigger_recalcular_pagos_update
AFTER
UPDATE ON facturas_pagos FOR EACH ROW EXECUTE FUNCTION recalcular_totales_factura();
CREATE TRIGGER trigger_recalcular_pagos_delete
AFTER DELETE ON facturas_pagos FOR EACH ROW EXECUTE FUNCTION recalcular_totales_factura();
-- -----------------------------------------------------------------------------
-- Función: Calcular subtotal de item automáticamente
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calcular_subtotal_item() RETURNS TRIGGER AS $$ BEGIN NEW.subtotal := NEW.cantidad * NEW.precio_unitario;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_calcular_subtotal_item BEFORE
INSERT
    OR
UPDATE ON facturas_items FOR EACH ROW EXECUTE FUNCTION calcular_subtotal_item();
-- ============================================================================
-- PASO 4: ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas_pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas_recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas_pagos ENABLE ROW LEVEL SECURITY;
-- Políticas permisivas (ajustar según autenticación)
CREATE POLICY "Enable all operations for all users" ON facturas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON facturas_pacientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON facturas_recetas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON facturas_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON facturas_pagos FOR ALL USING (true) WITH CHECK (true);
-- ============================================================================
-- PASO 5: VISTAS ÚTILES
-- ============================================================================
-- Vista: Resumen de facturas con información relacionada
CREATE OR REPLACE VIEW vista_facturas_resumen AS
SELECT f.id,
    f.folio,
    f.fecha,
    f.subtotal,
    f.iva,
    f.total,
    f.saldo,
    f.estado,
    f.notas,
    f.created_at,
    f.updated_at,
    -- Contar pacientes
    COUNT(DISTINCT fp.paciente_id) as total_pacientes,
    -- Contar recetas
    COUNT(DISTINCT fr.receta_id) as total_recetas,
    -- Contar items
    COUNT(DISTINCT fi.id) as total_items,
    -- Total pagado
    COALESCE(SUM(DISTINCT fpag.monto), 0) as total_pagado,
    -- Nombres de pacientes (concatenados)
    STRING_AGG(
        DISTINCT p.primer_nombre || ' ' || p.primer_apellido,
        ', '
    ) as pacientes_nombres
FROM facturas f
    LEFT JOIN facturas_pacientes fp ON f.id = fp.factura_id
    LEFT JOIN pacientes p ON fp.paciente_id = p.id
    LEFT JOIN facturas_recetas fr ON f.id = fr.factura_id
    LEFT JOIN facturas_items fi ON f.id = fi.factura_id
    LEFT JOIN facturas_pagos fpag ON f.id = fpag.factura_id
GROUP BY f.id,
    f.folio,
    f.fecha,
    f.subtotal,
    f.iva,
    f.total,
    f.saldo,
    f.estado,
    f.notas,
    f.created_at,
    f.updated_at;
-- ============================================================================
-- PASO 6: DATOS DE EJEMPLO (OPCIONAL - COMENTADO)
-- ============================================================================
-- Descomentar para insertar datos de prueba
/*
 -- Insertar una factura de ejemplo
 INSERT INTO facturas (fecha, notas) VALUES 
 (CURRENT_DATE, 'Factura de prueba - puede eliminarse');
 
 -- Obtener el ID de la factura recién creada
 DO $$
 DECLARE
 factura_id_test uuid;
 BEGIN
 SELECT id INTO factura_id_test FROM facturas ORDER BY created_at DESC LIMIT 1;
 
 -- Insertar items de ejemplo
 INSERT INTO facturas_items (factura_id, concepto, descripcion, cantidad, precio_unitario) VALUES
 (factura_id_test, 'Armazón', 'Armazón metálico plateado', 1, 1500.00),
 (factura_id_test, 'Lentes progresivos', 'Lentes progresivos con antirreflejante', 1, 3500.00),
 (factura_id_test, 'Estuche', 'Estuche rígido para lentes', 1, 150.00);
 END $$;
 */
-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================