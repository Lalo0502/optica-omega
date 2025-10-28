/*
  # Create pacientes table

  1. New Tables
    - `pacientes`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `primer_nombre` (text, not null)
      - `primer_apellido` (text, not null)
      - `segundo_apellido` (text)
      - `direccion` (text)
      - `telefono` (text, not null)
      - `email` (text)
      - `fecha_nacimiento` (date)
      - `medico` (text)
      - `notas` (text)
  2. Security
    - Enable RLS on `pacientes` table
    - Add policies for authenticated users to perform CRUD operations
*/

CREATE TABLE IF NOT EXISTS pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  primer_nombre text NOT NULL,
  primer_apellido text NOT NULL,
  segundo_apellido text,
  direccion text,
  telefono text NOT NULL,
  email text,
  fecha_nacimiento date,
  medico text,
  notas text
);

ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden leer pacientes"
  ON pacientes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar pacientes"
  ON pacientes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar pacientes"
  ON pacientes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar pacientes"
  ON pacientes
  FOR DELETE
  TO authenticated
  USING (true);

-- Allow public access for demo purposes
CREATE POLICY "Acceso público para lectura"
  ON pacientes
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acceso público para inserción"
  ON pacientes
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualización"
  ON pacientes
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación"
  ON pacientes
  FOR DELETE
  TO anon
  USING (true);