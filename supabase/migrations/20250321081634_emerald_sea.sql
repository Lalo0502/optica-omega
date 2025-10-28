/*
  # Agregar campo de folio a facturas

  1. Cambios
    - Agregar campo `folio` a la tabla `facturas`
    - Crear secuencia para generar folios automáticamente
    - Crear trigger para asignar folio automáticamente
    - Actualizar folios existentes

  2. Formato del Folio
    - FAC-YYYYMMDD-XXXX
    - Donde:
      - FAC: Prefijo fijo
      - YYYYMMDD: Fecha en formato año-mes-día
      - XXXX: Número secuencial de 4 dígitos que se reinicia cada día
*/

-- Crear secuencia para el número secuencial del folio
CREATE SEQUENCE IF NOT EXISTS factura_folio_seq;

-- Agregar campo de folio
ALTER TABLE facturas 
ADD COLUMN IF NOT EXISTS folio text UNIQUE;

-- Función para generar el folio
CREATE OR REPLACE FUNCTION generate_factura_folio()
RETURNS TRIGGER AS $$
DECLARE
  fecha_str text;
  seq_num text;
BEGIN
  -- Obtener la fecha en formato YYYYMMDD
  fecha_str := to_char(NEW.fecha, 'YYYYMMDD');
  
  -- Obtener y formatear el número secuencial
  seq_num := lpad(nextval('factura_folio_seq')::text, 4, '0');
  
  -- Asignar el folio
  NEW.folio := 'FAC-' || fecha_str || '-' || seq_num;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para asignar folio automáticamente
DROP TRIGGER IF EXISTS set_factura_folio ON facturas;
CREATE TRIGGER set_factura_folio
  BEFORE INSERT ON facturas
  FOR EACH ROW
  EXECUTE FUNCTION generate_factura_folio();

-- Actualizar facturas existentes que no tengan folio
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, fecha FROM facturas WHERE folio IS NULL ORDER BY fecha, created_at
  LOOP
    UPDATE facturas 
    SET folio = (
      'FAC-' || 
      to_char(r.fecha, 'YYYYMMDD') || '-' ||
      lpad(nextval('factura_folio_seq')::text, 4, '0')
    )
    WHERE id = r.id;
  END LOOP;
END $$;