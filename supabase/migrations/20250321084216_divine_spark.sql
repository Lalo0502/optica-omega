/*
  # Add support for additional items in recetas

  1. New Tables
    - `items_adicionales`: Catalog of additional items that can be added to prescriptions
      - `id` (uuid, primary key)
      - `nombre` (text, not null)
      - `descripcion` (text)
      - `precio_sugerido` (decimal)
      - `categoria` (text)
      - `created_at` (timestamp)

  2. Changes
    - Add `tipo` column to `factura_recetas` to distinguish between prescriptions and additional items
    - Add `item_id` column to `factura_recetas` to reference additional items

  3. Security
    - Enable RLS on new table
    - Add policies for authenticated and public access
*/

-- Create table for additional items
CREATE TABLE IF NOT EXISTS items_adicionales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  precio_sugerido decimal(10,2),
  categoria text NOT NULL CHECK (categoria IN ('armazon', 'lente', 'accesorio', 'servicio', 'otro')),
  created_at timestamptz DEFAULT now()
);

-- Add new columns to factura_recetas
ALTER TABLE factura_recetas 
ADD COLUMN IF NOT EXISTS tipo text NOT NULL CHECK (tipo IN ('receta', 'item')) DEFAULT 'receta',
ADD COLUMN IF NOT EXISTS item_id uuid REFERENCES items_adicionales(id);

-- Enable RLS on new table
ALTER TABLE items_adicionales ENABLE ROW LEVEL SECURITY;

-- Create policies for items_adicionales
CREATE POLICY "Usuarios autenticados pueden leer items_adicionales"
  ON items_adicionales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar items_adicionales"
  ON items_adicionales FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar items_adicionales"
  ON items_adicionales FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar items_adicionales"
  ON items_adicionales FOR DELETE
  TO authenticated
  USING (true);

-- Public access policies for demo
CREATE POLICY "Acceso público para lectura de items_adicionales"
  ON items_adicionales FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acceso público para inserción de items_adicionales"
  ON items_adicionales FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de items_adicionales"
  ON items_adicionales FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de items_adicionales"
  ON items_adicionales FOR DELETE
  TO anon
  USING (true);

-- Insert some common additional items
INSERT INTO items_adicionales (nombre, descripcion, precio_sugerido, categoria) VALUES
  ('Armazón básico', 'Armazón de acetato básico', 800.00, 'armazon'),
  ('Armazón premium', 'Armazón de marca premium', 2500.00, 'armazon'),
  ('Estuche básico', 'Estuche rígido para lentes', 100.00, 'accesorio'),
  ('Estuche premium', 'Estuche de piel para lentes', 250.00, 'accesorio'),
  ('Microfibra', 'Paño de microfibra para limpieza', 50.00, 'accesorio'),
  ('Kit de limpieza', 'Kit completo de limpieza para lentes', 150.00, 'accesorio'),
  ('Cordón para lentes', 'Cordón ajustable para lentes', 80.00, 'accesorio'),
  ('Spray limpiador', 'Spray limpiador para lentes', 100.00, 'accesorio'),
  ('Ajuste de armazón', 'Servicio de ajuste de armazón', 100.00, 'servicio'),
  ('Reparación simple', 'Reparación básica de armazón', 200.00, 'servicio'),
  ('Garantía extendida', 'Garantía extendida por 1 año', 300.00, 'servicio'),
  ('Tratamiento antirreflejante', 'Tratamiento antirreflejante para lentes', 800.00, 'lente'),
  ('Tratamiento fotocromático', 'Lentes que se oscurecen con el sol', 1200.00, 'lente'),
  ('Lentes de contacto (par)', 'Par de lentes de contacto básicos', 600.00, 'lente'),
  ('Solución para lentes de contacto', 'Solución multiusos para lentes de contacto', 150.00, 'accesorio');