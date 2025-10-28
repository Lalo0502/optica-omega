-- Migrar edad desde notas a la columna edad
-- Busca patrones como:
-- "25 años", "25años", "25 edad", "25 anos", "25 años" (con ñ o n)
-- "años 25", "edad 25", "anos 25", "años: 25", "edad: 25"
-- Primero intentar patrón: número antes de palabra (ej: "25 años")
UPDATE pacientes
SET edad = CAST(
        SUBSTRING(
            notas
            FROM '(\d+)\s*(años?|edad|anos?|a[ñn]os?)'
        ) AS INTEGER
    )
WHERE notas IS NOT NULL
    AND notas ~* '\d+\s*(años?|edad|anos?|a[ñn]os?)'
    AND edad IS NULL;
-- Luego intentar patrón: palabra antes de número (ej: "edad 25" o "años: 25")
UPDATE pacientes
SET edad = CAST(
        SUBSTRING(
            notas
            FROM '(?:años?|edad|anos?|a[ñn]os?)\s*:?\s*(\d+)'
        ) AS INTEGER
    )
WHERE notas IS NOT NULL
    AND notas ~* '(?:años?|edad|anos?|a[ñn]os?)\s*:?\s*\d+'
    AND edad IS NULL;
-- Mostrar cuántos registros se actualizaron
DO $$
DECLARE updated_count INTEGER;
BEGIN
SELECT COUNT(*) INTO updated_count
FROM pacientes
WHERE edad IS NOT NULL;
RAISE NOTICE 'Total de pacientes con edad: %',
updated_count;
END $$;