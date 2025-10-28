/*
  # Crear tabla de condiciones médicas y relacionarla con pacientes

  1. Nuevas Tablas
    - `condiciones_medicas`: Catálogo de condiciones médicas comunes
      - `id` (uuid, clave primaria)
      - `nombre` (texto, nombre de la condición)
      - `descripcion` (texto, descripción de la condición)
      - `created_at` (timestamp)
    
    - `paciente_condiciones`: Tabla de relación muchos a muchos entre pacientes y condiciones
      - `id` (uuid, clave primaria)
      - `paciente_id` (uuid, referencia a pacientes)
      - `condicion_id` (uuid, referencia a condiciones_medicas)
      - `fecha_diagnostico` (fecha, opcional)
      - `notas` (texto, notas específicas sobre la condición del paciente)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en ambas tablas
    - Agregar políticas para usuarios autenticados y anónimos (para demo)
*/

-- Crear tabla de condiciones médicas
CREATE TABLE IF NOT EXISTS condiciones_medicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS para la tabla de condiciones médicas
ALTER TABLE condiciones_medicas ENABLE ROW LEVEL SECURITY;

-- Crear tabla de relación entre pacientes y condiciones
CREATE TABLE IF NOT EXISTS paciente_condiciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  condicion_id uuid REFERENCES condiciones_medicas(id) ON DELETE CASCADE,
  fecha_diagnostico date,
  notas text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS para la tabla de relación
ALTER TABLE paciente_condiciones ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios autenticados (condiciones_medicas)
CREATE POLICY "Usuarios autenticados pueden leer condiciones médicas"
  ON condiciones_medicas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar condiciones médicas"
  ON condiciones_medicas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar condiciones médicas"
  ON condiciones_medicas
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar condiciones médicas"
  ON condiciones_medicas
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para usuarios autenticados (paciente_condiciones)
CREATE POLICY "Usuarios autenticados pueden leer condiciones de pacientes"
  ON paciente_condiciones
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar condiciones de pacientes"
  ON paciente_condiciones
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar condiciones de pacientes"
  ON paciente_condiciones
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar condiciones de pacientes"
  ON paciente_condiciones
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para acceso público (demo) - condiciones_medicas
CREATE POLICY "Acceso público para lectura de condiciones médicas"
  ON condiciones_medicas
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acceso público para inserción de condiciones médicas"
  ON condiciones_medicas
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de condiciones médicas"
  ON condiciones_medicas
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de condiciones médicas"
  ON condiciones_medicas
  FOR DELETE
  TO anon
  USING (true);

-- Políticas para acceso público (demo) - paciente_condiciones
CREATE POLICY "Acceso público para lectura de condiciones de pacientes"
  ON paciente_condiciones
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acceso público para inserción de condiciones de pacientes"
  ON paciente_condiciones
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de condiciones de pacientes"
  ON paciente_condiciones
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de condiciones de pacientes"
  ON paciente_condiciones
  FOR DELETE
  TO anon
  USING (true);

-- Insertar algunas condiciones médicas comunes en oftalmología
INSERT INTO condiciones_medicas (nombre, descripcion)
VALUES 
  ('Diabetes', 'Puede causar retinopatía diabética y otros problemas oculares'),
  ('Hipertensión', 'Puede afectar los vasos sanguíneos de los ojos'),
  ('Glaucoma', 'Aumento de la presión intraocular que puede dañar el nervio óptico'),
  ('Cataratas', 'Opacidad del cristalino que afecta la visión'),
  ('Degeneración macular', 'Deterioro de la mácula, parte central de la retina'),
  ('Astigmatismo', 'Error refractivo que causa visión borrosa'),
  ('Miopía', 'Dificultad para ver objetos lejanos'),
  ('Hipermetropía', 'Dificultad para ver objetos cercanos'),
  ('Presbicia', 'Pérdida de la capacidad para enfocar objetos cercanos debido al envejecimiento'),
  ('Ojo seco', 'Producción insuficiente de lágrimas o lágrimas de mala calidad');