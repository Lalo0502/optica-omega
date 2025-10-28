/*
  # Crear tabla de usuarios para autenticación

  1. Nueva Tabla
    - `usuarios`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password` (text)
      - `nombre` (text)
      - `rol` (text)
      - `created_at` (timestamp)
  2. Seguridad
    - Enable RLS en `usuarios` tabla
    - Añadir políticas para acceso público y autenticado
*/

-- Verificar si la tabla ya existe antes de crearla
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'usuarios') THEN
    CREATE TABLE usuarios (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE NOT NULL,
      password text NOT NULL,
      nombre text NOT NULL,
      rol text NOT NULL DEFAULT 'usuario',
      created_at timestamptz DEFAULT now()
    );

    -- Habilitar RLS para la tabla de usuarios
    ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

    -- Políticas para usuarios autenticados
    CREATE POLICY "Usuarios autenticados pueden leer usuarios"
      ON usuarios
      FOR SELECT
      TO authenticated
      USING (true);

    -- Políticas para acceso público (login)
    CREATE POLICY "Acceso público para lectura de usuarios"
      ON usuarios
      FOR SELECT
      TO anon
      USING (true);

    -- Insertar un usuario administrador por defecto
    INSERT INTO usuarios (email, password, nombre, rol)
    VALUES ('admin@optica.com', 'pbkdf2_sha256$150000$jMOqkdOUpor5$Qwwt4wUP0SdkU0ZOLWRHV9ZkEJPdUxuZ9ZdKhRkuMgw=', 'Administrador', 'admin');
  END IF;
END $$;