-- Agregar columna edad a la tabla pacientes
ALTER TABLE pacientes
ADD COLUMN edad INTEGER;
-- Agregar comentario a la columna
COMMENT ON COLUMN pacientes.edad IS 'Edad del paciente en años';