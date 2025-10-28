import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function FacturasListSkeleton() {
  // Crear 6 cards de skeleton
  const skeletonCards = Array.from({ length: 6 });

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {skeletonCards.map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-6">
            {/* Header con Folio, Estado y Menú */}
            <div className="flex items-start justify-between mb-5">
              <div className="space-y-2">
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-3 w-[130px]" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-[70px] rounded-full" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>

            {/* Información de Pacientes */}
            <div className="mb-5 pb-5 border-b">
              <Skeleton className="h-4 w-[180px]" />
            </div>

            {/* Montos */}
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-[50px]" />
                <Skeleton className="h-6 w-[100px]" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-[60px]" />
                <Skeleton className="h-4 w-[90px]" />
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-orange-50 dark:bg-orange-950/20">
                <Skeleton className="h-4 w-[110px]" />
                <Skeleton className="h-5 w-[90px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
