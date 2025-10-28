-- Drop existing constraints
ALTER TABLE factura_recetas
DROP CONSTRAINT IF EXISTS factura_recetas_tipo_check,
DROP CONSTRAINT IF EXISTS factura_recetas_precio_check;

-- Make receta_id nullable
ALTER TABLE factura_recetas
ALTER COLUMN receta_id DROP NOT NULL;

-- Add tipo column with proper constraints
ALTER TABLE factura_recetas
ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'manual';

-- Add proper check constraints
ALTER TABLE factura_recetas
ADD CONSTRAINT factura_recetas_tipo_check 
CHECK (tipo IN ('receta', 'manual', 'producto', 'servicio'));

-- Make precio nullable and add constraint
ALTER TABLE factura_recetas
ALTER COLUMN precio DROP NOT NULL,
ALTER COLUMN precio SET DEFAULT NULL;

-- Add constraint to ensure only non-receta items have prices
ALTER TABLE factura_recetas
ADD CONSTRAINT factura_recetas_precio_check
CHECK (
  (tipo = 'receta' AND precio IS NULL) OR
  (tipo IN ('manual', 'producto', 'servicio') AND precio IS NOT NULL)
);

-- Update existing records
UPDATE factura_recetas
SET tipo = 'receta', precio = NULL
WHERE receta_id IS NOT NULL;

UPDATE factura_recetas
SET tipo = 'manual'
WHERE receta_id IS NULL AND tipo NOT IN ('manual', 'producto', 'servicio');