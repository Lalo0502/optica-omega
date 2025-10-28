/*
  # Fix factura_recetas table schema

  1. Changes
    - Add missing `tipo` column to factura_recetas table
    - Update existing records to use default tipo value
    - Add check constraint for valid tipos
*/

-- Add tipo column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'factura_recetas' AND column_name = 'tipo'
  ) THEN
    ALTER TABLE factura_recetas
      ADD COLUMN tipo text NOT NULL DEFAULT 'manual' CHECK (tipo IN ('receta', 'manual'));
  END IF;
END $$;

-- Update existing records to use 'receta' tipo if they have a receta_id
UPDATE factura_recetas
SET tipo = 'receta'
WHERE receta_id IS NOT NULL;

-- Update existing records to use 'manual' tipo if they don't have a receta_id
UPDATE factura_recetas
SET tipo = 'manual'
WHERE receta_id IS NULL;

-- Make sure RLS policies are up to date
DROP POLICY IF EXISTS "Enable read access for all users" ON factura_recetas;
DROP POLICY IF EXISTS "Enable insert access for all users" ON factura_recetas;
DROP POLICY IF EXISTS "Enable update access for all users" ON factura_recetas;
DROP POLICY IF EXISTS "Enable delete access for all users" ON factura_recetas;

CREATE POLICY "Enable read access for all users"
  ON factura_recetas FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON factura_recetas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON factura_recetas FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON factura_recetas FOR DELETE
  USING (true);