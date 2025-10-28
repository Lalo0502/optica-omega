"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Users, Eye, Receipt, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import DashboardStatsSkeleton from "@/components/dashboard/DashboardStatsSkeleton";
import RecentFacturasSkeleton from "@/components/dashboard/RecentFacturasSkeleton";

// Cambiar el título de la página
if (typeof document !== "undefined") {
  document.title = "Dashboard | Óptica Omega";
}
import { es } from "date-fns/locale";
import Link from "next/link";

interface Factura {
  id: string;
  folio: string;
  fecha_emision: string;
  estado: string;
  total: number;
  saldo: number;
  paciente_nombre: string;
}

interface DashboardStats {
  totalPatients: number;
  totalFacturasPendientes: number;
  saldoPorCobrar: number;
  isLoading: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalFacturasPendientes: 0,
    saldoPorCobrar: 0,
    isLoading: true,
  });

  const [recentFacturas, setRecentFacturas] = useState<Factura[]>([]);
  const [isLoadingFacturas, setIsLoadingFacturas] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener el total de pacientes
        const { count: patientCount } = await supabase
          .from("pacientes")
          .select("*", { count: "exact", head: true });

        // Obtener facturas con saldo pendiente (no están pagadas completamente)
        const { count: facturasPendientes } = await supabase
          .from("facturas")
          .select("*", { count: "exact", head: true })
          .gt("saldo", 0);

        // Calcular el saldo total por cobrar
        const { data: facturasConSaldo } = await supabase
          .from("facturas")
          .select("saldo")
          .gt("saldo", 0);

        const saldoPorCobrar =
          facturasConSaldo?.reduce((sum, f) => sum + f.saldo, 0) || 0;

        setStats({
          totalPatients: patientCount || 0,
          totalFacturasPendientes: facturasPendientes || 0,
          saldoPorCobrar,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        setStats((prev) => ({ ...prev, isLoading: false }));
      }
    };

    const fetchRecentFacturas = async () => {
      try {
        const { data, error } = await supabase
          .from("vista_facturas_resumen")
          .select("*")
          .order("fecha_emision", { ascending: false })
          .limit(5);

        if (error) throw error;

        setRecentFacturas(data || []);
      } catch (error) {
        console.error("Error al cargar facturas recientes:", error);
      } finally {
        setIsLoadingFacturas(false);
      }
    };

    fetchStats();
    fetchRecentFacturas();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "pagada":
        return "default";
      case "parcial":
        return "secondary";
      case "pendiente":
        return "outline";
      case "vencida":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Vista general de Óptica Omega
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Principales */}
      {stats.isLoading ? (
        <DashboardStatsSkeleton />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border border-border/50 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pacientes
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.totalPatients}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Registrados en el sistema
              </p>
            </CardContent>
          </Card>

          <Card className="border border-orange-200/50 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900/50 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Facturas con Saldo
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-orange-600 dark:text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-700 dark:text-orange-500">
                {stats.totalFacturasPendientes}
              </div>
              <p className="text-sm text-orange-600/80 dark:text-orange-500/80 mt-2">
                Pendientes de cobro
              </p>
            </CardContent>
          </Card>

          <Card className="border border-emerald-200/50 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/50 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saldo por Cobrar
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-700 dark:text-emerald-500">
                {formatCurrency(stats.saldoPorCobrar)}
              </div>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-500/80 mt-2">
                Total a recuperar
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Facturas Recientes */}
      <Card className="border border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Facturas Recientes</CardTitle>
              <CardDescription className="mt-1.5">
                Últimas 5 facturas emitidas
              </CardDescription>
            </div>
            <Link href="/facturas">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
              >
                Ver todas
              </Badge>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingFacturas ? (
            <RecentFacturasSkeleton />
          ) : recentFacturas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No hay facturas registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentFacturas.map((factura) => (
                <div
                  key={factura.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{factura.folio}</p>
                      <p className="text-sm text-muted-foreground">
                        {factura.paciente_nombre}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(factura.total)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(factura.fecha_emision),
                          "dd MMM yyyy",
                          { locale: es }
                        )}
                      </p>
                    </div>
                    <Badge variant={getEstadoBadgeVariant(factura.estado)}>
                      {factura.estado.charAt(0).toUpperCase() +
                        factura.estado.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accesos Rápidos */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
          <CardDescription>
            Accede rápidamente a las funciones principales
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Link href="/pacientes">
            <div className="group cursor-pointer space-y-2 rounded-lg border border-border/50 p-4 hover:bg-accent/50 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-medium">Gestión de Pacientes</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Administra y registra información de pacientes
              </p>
            </div>
          </Link>

          <Link href="/facturas">
            <div className="group cursor-pointer space-y-2 rounded-lg border border-border/50 p-4 hover:bg-accent/50 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <Receipt className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="font-medium">Facturación</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Crea y administra facturas y cobros
              </p>
            </div>
          </Link>

          <Link href="/pacientes">
            <div className="group cursor-pointer space-y-2 rounded-lg border border-border/50 p-4 hover:bg-accent/50 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Eye className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="font-medium">Recetas</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Gestiona prescripciones y recetas médicas
              </p>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
