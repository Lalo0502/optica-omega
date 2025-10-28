/*
  # Crear tablas para el módulo de recetas oftalmológicas

  1. Nuevas Tablas
    - `recetas`
      - `id` (uuid, clave primaria)
      - `paciente_id` (uuid, referencia a pacientes)
      - `fecha_emision` (fecha)
      - `fecha_vencimiento` (fecha)
      - `notas` (texto)
      - `created_at` (timestamp)
    
    - `receta_detalles`
      - `id` (uuid, clave primaria)
      - `receta_id` (uuid, referencia a recetas)
      - `tipo_lente` (texto)
      - `ojo` (texto, 'izquierdo' o 'derecho')
      - `esfera` (decimal)
      - `cilindro` (decimal)
      - `eje` (entero)
      - `adicion` (decimal)
      - `distancia_pupilar` (decimal)
      - `altura` (decimal)
      - `notas` (texto)
      - `created_at` (timestamp)
    
    - `receta_condiciones`
      - `id` (uuid, clave primaria)
      - `receta_id` (uuid, referencia a recetas)
      - `paciente_condicion_id` (uuid, referencia a paciente_condiciones)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Añadir políticas para usuarios autenticados y anónimos (para demo)
*/

-- Crear tabla de recetas
CREATE TABLE IF NOT EXISTS recetas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha_emision date NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento date,
  notas text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS para la tabla de recetas
ALTER TABLE recetas ENABLE ROW LEVEL SECURITY;

-- Crear tabla de detalles de receta (información de prescripción)
CREATE TABLE IF NOT EXISTS receta_detalles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receta_id uuid REFERENCES recetas(id) ON DELETE CASCADE,
  tipo_lente text NOT NULL,
  ojo text NOT NULL CHECK (ojo IN ('izquierdo', 'derecho')),
  esfera decimal(5,2),
  cilindro decimal(5,2),
  eje integer,
  adicion decimal(5,2),
  distancia_pupilar decimal(5,2),
  altura decimal(5,2),
  notas text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS para la tabla de detalles de receta
ALTER TABLE receta_detalles ENABLE ROW LEVEL SECURITY;

-- Crear tabla de relación entre recetas y condiciones médicas del paciente
CREATE TABLE IF NOT EXISTS receta_condiciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receta_id uuid REFERENCES recetas(id) ON DELETE CASCADE,
  paciente_condicion_id uuid REFERENCES paciente_condiciones(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS para la tabla de relación
ALTER TABLE receta_condiciones ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios autenticados (recetas)
CREATE POLICY "Usuarios autenticados pueden leer recetas"
  ON recetas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar recetas"
  ON recetas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar recetas"
  ON recetas
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar recetas"
  ON recetas
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para usuarios autenticados (receta_detalles)
CREATE POLICY "Usuarios autenticados pueden leer detalles de recetas"
  ON receta_detalles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar detalles de recetas"
  ON receta_detalles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar detalles de recetas"
  ON receta_detalles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar detalles de recetas"
  ON receta_detalles
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para usuarios autenticados (receta_condiciones)
CREATE POLICY "Usuarios autenticados pueden leer condiciones de recetas"
  ON receta_condiciones
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar condiciones de recetas"
  ON receta_condiciones
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar condiciones de recetas"
  ON receta_condiciones
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar condiciones de recetas"
  ON receta_condiciones
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para acceso público (demo) - recetas
CREATE POLICY "Acceso público para lectura de recetas"
  ON recetas
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acceso público para inserción de recetas"
  ON recetas
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de recetas"
  ON recetas
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de recetas"
  ON recetas
  FOR DELETE
  TO anon
  USING (true);

-- Políticas para acceso público (demo) - receta_detalles
CREATE POLICY "Acceso público para lectura de detalles de recetas"
  ON receta_detalles
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acceso público para inserción de detalles de recetas"
  ON receta_detalles
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de detalles de recetas"
  ON receta_detalles
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de detalles de recetas"
  ON receta_detalles
  FOR DELETE
  TO anon
  USING (true);

-- Políticas para acceso público (demo) - receta_condiciones
CREATE POLICY "Acceso público para lectura de condiciones de recetas"
  ON receta_condiciones
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acceso público para inserción de condiciones de recetas"
  ON receta_condiciones
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de condiciones de recetas"
  ON receta_condiciones
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de condiciones de recetas"
  ON receta_condiciones
  FOR DELETE
  TO anon
  USING (true);