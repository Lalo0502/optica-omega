import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PatientListSkeleton() {
  // Crear un array de 5 filas para el skeleton
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: "40px" }}></TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead style={{ width: "100px" }}>Edad</TableHead>
            <TableHead>Notas</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {skeletonRows.map((_, index) => (
            <TableRow key={index}>
              {/* Columna del botón expandir */}
              <TableCell>
                <Skeleton className="h-8 w-8 rounded-md" />
              </TableCell>

              {/* Columna de Paciente */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[180px]" />
                    <Skeleton className="h-3 w-[140px]" />
                  </div>
                </div>
              </TableCell>

              {/* Columna de Contacto */}
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[160px]" />
                </div>
              </TableCell>

              {/* Columna de Dirección */}
              <TableCell>
                <Skeleton className="h-4 w-[200px]" />
              </TableCell>

              {/* Columna de Edad */}
              <TableCell>
                <div className="flex items-center justify-center">
                  <Skeleton className="h-4 w-[60px]" />
                </div>
              </TableCell>

              {/* Columna de Notas */}
              <TableCell>
                <Skeleton className="h-4 w-[150px]" />
              </TableCell>

              {/* Columna de Acciones */}
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
