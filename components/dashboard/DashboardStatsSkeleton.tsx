import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Users, Receipt, DollarSign } from "lucide-react";

export default function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Total Pacientes */}
      <Card className="border border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-[100px]" />
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-[80px] mb-2" />
          <Skeleton className="h-4 w-[150px]" />
        </CardContent>
      </Card>

      {/* Facturas con Saldo */}
      <Card className="border border-orange-200/50 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-[120px]" />
          <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Receipt className="h-5 w-5 text-orange-600 dark:text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-[60px] mb-2" />
          <Skeleton className="h-4 w-[130px]" />
        </CardContent>
      </Card>

      {/* Saldo por Cobrar */}
      <Card className="border border-emerald-200/50 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-[110px]" />
          <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-[120px] mb-2" />
          <Skeleton className="h-4 w-[130px]" />
        </CardContent>
      </Card>
    </div>
  );
}
