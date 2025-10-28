/*
  # Fix factura_recetas tipo constraint

  1. Changes
    - Update tipo column check constraint to include all valid tipos
    - Add missing tipos to constraint
*/

-- Drop existing check constraint
ALTER TABLE factura_recetas
DROP CONSTRAINT IF EXISTS factura_recetas_tipo_check;

-- Add new check constraint with all valid tipos
ALTER TABLE factura_recetas
ADD CONSTRAINT factura_recetas_tipo_check 
CHECK (tipo IN ('receta', 'manual', 'producto', 'servicio'));

-- Update any existing records with invalid tipos
UPDATE factura_recetas
SET tipo = 'manual'
WHERE tipo NOT IN ('receta', 'manual', 'producto', 'servicio');