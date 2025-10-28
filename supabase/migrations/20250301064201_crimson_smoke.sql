/*
  # Crear tabla de pacientes

  1. Nueva Tabla
    - `pacientes`
      - `id` (uuid, clave primaria)
      - `created_at` (timestamp)
      - `primer_nombre` (texto, no nulo)
      - `primer_apellido` (texto, no nulo)
      - `segundo_apellido` (texto, puede ser nulo)
      - `direccion` (texto, puede ser nulo)
      - `telefono` (texto, no nulo)
      - `email` (texto, puede ser nulo)
      - `fecha_nacimiento` (fecha, puede ser nulo)
      - `medico` (texto, puede ser nulo)
      - `notas` (texto, puede ser nulo)
  2. Seguridad
    - Habilitar RLS en la tabla `pacientes`
    - Agregar política para que los usuarios autenticados puedan leer y escribir
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