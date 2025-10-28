import { Skeleton } from "@/components/ui/skeleton";

export default function RecentFacturasSkeleton() {
  // Crear 5 filas de skeleton
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="space-y-4">
      {skeletonRows.map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 rounded-lg border border-border/50"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-3 w-[160px]" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-3 w-[90px]" />
            </div>
            <Skeleton className="h-6 w-[70px] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
