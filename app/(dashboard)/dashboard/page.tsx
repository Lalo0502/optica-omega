"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  Users,
  Eye,
  Receipt,
  DollarSign,
  Calendar,
  Tag,
} from "lucide-react";
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

interface Cita {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fecha_preferida: string;
  hora_preferida: string;
  motivo: string;
  created_at: string;
}

interface Promocion {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_url: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  activa: boolean;
}

interface DashboardStats {
  totalPatients: number;
  totalFacturasPendientes: number;
  saldoPorCobrar: number;
  citasPendientes: number;
  promocionesActivas: number;
  isLoading: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalFacturasPendientes: 0,
    saldoPorCobrar: 0,
    citasPendientes: 0,
    promocionesActivas: 0,
    isLoading: true,
  });

  const [recentFacturas, setRecentFacturas] = useState<Factura[]>([]);
  const [isLoadingFacturas, setIsLoadingFacturas] = useState(true);
  const [recentCitas, setRecentCitas] = useState<Cita[]>([]);
  const [isLoadingCitas, setIsLoadingCitas] = useState(true);
  const [recentPromociones, setRecentPromociones] = useState<Promocion[]>([]);
  const [isLoadingPromociones, setIsLoadingPromociones] = useState(true);

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

        // Obtener citas pendientes
        const { count: citasPendientes } = await supabase
          .from("solicitudes_citas")
          .select("*", { count: "exact", head: true })
          .eq("estado", "pendiente");

        // Obtener promociones activas
        const { count: promocionesActivas } = await supabase
          .from("promociones")
          .select("*", { count: "exact", head: true })
          .eq("activa", true);

        setStats({
          totalPatients: patientCount || 0,
          totalFacturasPendientes: facturasPendientes || 0,
          saldoPorCobrar,
          citasPendientes: citasPendientes || 0,
          promocionesActivas: promocionesActivas || 0,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        setStats((prev) => ({ ...prev, isLoading: false }));
      }
    };

    const fetchRecentFacturas = async () => {
      try {
        console.log("🔍 Consultando facturas recientes...");

        // Primero obtener las facturas
        const { data: facturasData, error: facturasError } = await supabase
          .from("facturas")
          .select("id, folio, fecha, estado, total, saldo")
          .order("fecha", { ascending: false })
          .limit(5);

        if (facturasError) {
          console.log("❌ Error facturas:", facturasError);
          throw facturasError;
        }

        console.log("📊 Facturas recibidas:", facturasData);

        // Para cada factura, obtener sus pacientes
        const formattedData = await Promise.all(
          (facturasData || []).map(async (factura) => {
            console.log(
              `🔎 Buscando pacientes para factura ${factura.folio} (ID: ${factura.id})`
            );

            // Primero obtener los IDs de pacientes de esta factura
            const { data: relacionesData, error: relacionesError } =
              await supabase
                .from("facturas_pacientes")
                .select("paciente_id")
                .eq("factura_id", factura.id);

            console.log(`🔗 Relaciones para ${factura.folio}:`, relacionesData);

            if (relacionesError) {
              console.log(`❌ Error relaciones:`, relacionesError);
            }

            // Si hay pacientes, obtenerlos directamente
            let pacienteNombres = "";
            if (relacionesData && relacionesData.length > 0) {
              const pacienteIds = relacionesData.map((r) => r.paciente_id);

              // Consultar directamente la tabla pacientes (ahora con segundo_nombre)
              const { data: pacientesData, error: pacientesError } =
                await supabase
                  .from("pacientes")
                  .select(
                    "primer_nombre, segundo_nombre, primer_apellido, segundo_apellido"
                  )
                  .in("id", pacienteIds);

              console.log(
                `👥 Pacientes data para ${factura.folio}:`,
                pacientesData
              );

              if (pacientesError) {
                console.log(`❌ Error pacientes:`, pacientesError);
              }

              // Formatear nombres completos
              pacienteNombres = (pacientesData || [])
                .map((p: any) => {
                  return `${p.primer_nombre} ${p.segundo_nombre || ""} ${
                    p.primer_apellido
                  } ${p.segundo_apellido || ""}`.trim();
                })
                .join(", ");
            }

            console.log(
              `✍️ Nombre final para ${factura.folio}:`,
              pacienteNombres
            );

            return {
              id: factura.id,
              folio: factura.folio,
              fecha_emision: factura.fecha,
              estado: factura.estado,
              total: factura.total,
              saldo: factura.saldo,
              paciente_nombre: pacienteNombres || "Sin paciente asignado",
            };
          })
        );

        console.log("✅ Facturas formateadas:", formattedData);
        setRecentFacturas(formattedData);
      } catch (error) {
        console.error("Error al cargar facturas recientes:", error);
      } finally {
        setIsLoadingFacturas(false);
      }
    };

    fetchStats();
    fetchRecentFacturas();

    // Fetch recent citas
    const fetchRecentCitas = async () => {
      try {
        const { data, error } = await supabase
          .from("solicitudes_citas")
          .select("*")
          .eq("estado", "pendiente")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        setRecentCitas(data || []);
      } catch (error) {
        console.error("Error al cargar citas recientes:", error);
      } finally {
        setIsLoadingCitas(false);
      }
    };

    // Fetch recent promociones
    const fetchRecentPromociones = async () => {
      try {
        const { data, error } = await supabase
          .from("promociones")
          .select("*")
          .eq("activa", true)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        setRecentPromociones(data || []);
      } catch (error) {
        console.error("Error al cargar promociones recientes:", error);
      } finally {
        setIsLoadingPromociones(false);
      }
    };

    fetchRecentCitas();
    fetchRecentPromociones();
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

          <Card className="border border-purple-200/50 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-900/50 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Citas Pendientes
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-700 dark:text-purple-500">
                {stats.citasPendientes}
              </div>
              <p className="text-sm text-purple-600/80 dark:text-purple-500/80 mt-2">
                Por confirmar
              </p>
            </CardContent>
          </Card>

          <Card className="border border-pink-200/50 bg-pink-50/50 dark:bg-pink-950/20 dark:border-pink-900/50 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Promociones Activas
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <Tag className="h-5 w-5 text-pink-600 dark:text-pink-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-pink-700 dark:text-pink-500">
                {stats.promocionesActivas}
              </div>
              <p className="text-sm text-pink-600/80 dark:text-pink-500/80 mt-2">
                En el landing
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
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-500">
                {formatCurrency(stats.saldoPorCobrar)}
              </div>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-500/80 mt-2">
                Total a recuperar
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grid con 3 columnas: Facturas, Citas, Promociones */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Facturas Recientes */}
        <Card className="border border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Facturas Recientes</CardTitle>
                <CardDescription className="mt-1">
                  Últimas facturas emitidas
                </CardDescription>
              </div>
              <Link href="/facturas">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-accent text-xs"
                >
                  Ver todas
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingFacturas ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-slate-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : recentFacturas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No hay facturas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentFacturas.slice(0, 3).map((factura) => (
                  <div
                    key={factura.id}
                    className="p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{factura.folio}</p>
                      <Badge
                        variant={getEstadoBadgeVariant(factura.estado)}
                        className="text-xs"
                      >
                        {factura.estado}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {factura.paciente_nombre}
                    </p>
                    <p className="text-xs font-medium text-primary mt-1">
                      {formatCurrency(factura.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Citas Pendientes */}
        <Card className="border border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Citas Pendientes</CardTitle>
                <CardDescription className="mt-1">
                  Solicitudes por confirmar
                </CardDescription>
              </div>
              <Link href="/citas">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-accent text-xs"
                >
                  Ver todas
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingCitas ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-slate-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : recentCitas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No hay citas pendientes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentCitas.slice(0, 3).map((cita) => (
                  <div
                    key={cita.id}
                    className="p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">
                        {cita.nombre} {cita.apellido}
                      </p>
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
                      >
                        Pendiente
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(cita.fecha_preferida), "dd MMM yyyy", {
                        locale: es,
                      })}{" "}
                      - {cita.hora_preferida}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {cita.motivo}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Promociones Activas */}
        <Card className="border border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Promociones Activas</CardTitle>
                <CardDescription className="mt-1">
                  Visibles en el landing
                </CardDescription>
              </div>
              <Link href="/promociones">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-accent text-xs"
                >
                  Ver todas
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingPromociones ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-slate-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : recentPromociones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No hay promociones activas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentPromociones.slice(0, 3).map((promo) => (
                  <div
                    key={promo.id}
                    className="p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {promo.imagen_url && (
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                          <img
                            src={promo.imagen_url}
                            alt={promo.titulo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {promo.titulo}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {promo.descripcion}
                        </p>
                        <p className="text-xs text-primary mt-1">
                          Hasta{" "}
                          {format(new Date(promo.fecha_fin), "dd MMM", {
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
          <CardDescription>
            Accede rápidamente a las funciones principales
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

          <Link href="/citas">
            <div className="group cursor-pointer space-y-2 rounded-lg border border-border/50 p-4 hover:bg-accent/50 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Calendar className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="font-medium">Citas</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Gestiona solicitudes y confirmación de citas
              </p>
            </div>
          </Link>

          <Link href="/promociones">
            <div className="group cursor-pointer space-y-2 rounded-lg border border-border/50 p-4 hover:bg-accent/50 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                  <Tag className="h-5 w-5 text-pink-500" />
                </div>
                <h3 className="font-medium">Promociones</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Crea y administra ofertas del landing
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
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                  <Eye className="h-5 w-5 text-indigo-500" />
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
