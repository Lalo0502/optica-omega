"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Upload,
  Database,
  Calendar,
  AlertCircle,
  Cloud,
  HardDrive,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function ConfiguracionPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingToCloud, setIsExportingToCloud] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [lastCloudBackup, setLastCloudBackup] = useState<string | null>(null);
  const [nextAutoBackup, setNextAutoBackup] = useState<string | null>(null);
  const { toast } = useToast();

  // Backup automático semanal
  useEffect(() => {
    checkAndRunAutoBackup();
  }, []);

  const checkAndRunAutoBackup = async () => {
    try {
      // Obtener la fecha del último backup desde localStorage
      const lastAutoBackupStr = localStorage.getItem("lastAutoBackup");

      if (lastAutoBackupStr) {
        const lastAutoBackup = new Date(lastAutoBackupStr);
        const now = new Date();
        const daysSinceLastBackup =
          (now.getTime() - lastAutoBackup.getTime()) / (1000 * 60 * 60 * 24);

        // Calcular próximo backup (7 días después del último)
        const nextBackupDate = new Date(lastAutoBackup);
        nextBackupDate.setDate(nextBackupDate.getDate() + 7);
        setNextAutoBackup(nextBackupDate.toISOString());

        // Si pasaron 7 días o más, hacer backup automático
        if (daysSinceLastBackup >= 7) {
          toast({
            title: "Iniciando backup automático semanal",
            description: "Se guardará en la nube automáticamente...",
          });

          await runAutoBackup();
        }
      } else {
        // Primera vez, hacer backup inmediatamente
        await runAutoBackup();
      }
    } catch (error) {
      console.error("Error en backup automático:", error);
    }
  };

  const runAutoBackup = async () => {
    try {
      // Función para obtener TODOS los registros
      const fetchAllRecords = async (tableName: string) => {
        let allData: any[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from(tableName)
            .select("*")
            .range(from, from + batchSize - 1);

          if (error) throw error;

          if (data && data.length > 0) {
            allData = [...allData, ...data];
            from += batchSize;

            if (data.length < batchSize) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        return allData;
      };

      // Obtener datos
      const [pacientes, recetas, facturas, citas, promociones] =
        await Promise.all([
          fetchAllRecords("pacientes"),
          fetchAllRecords("recetas"),
          fetchAllRecords("facturas"),
          fetchAllRecords("citas"),
          fetchAllRecords("promociones"),
        ]);

      // Crear backup
      const backup = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        automatic: true,
        data: {
          pacientes,
          recetas,
          facturas,
          citas,
          promociones,
        },
        stats: {
          total_pacientes: pacientes.length,
          total_recetas: recetas.length,
          total_facturas: facturas.length,
          total_citas: citas.length,
          total_promociones: promociones.length,
        },
      };

      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const fileName = `backup-auto-${
        new Date().toISOString().split("T")[0]
      }-${Date.now()}.json`;

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("backups")
        .upload(fileName, dataBlob, {
          contentType: "application/json",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Guardar fecha del backup automático
      const now = new Date().toISOString();
      localStorage.setItem("lastAutoBackup", now);
      setLastCloudBackup(now);

      // Calcular próximo backup
      const nextBackupDate = new Date();
      nextBackupDate.setDate(nextBackupDate.getDate() + 7);
      setNextAutoBackup(nextBackupDate.toISOString());

      toast({
        title: "Backup automático completado",
        description: `${backup.stats.total_pacientes} pacientes guardados. Próximo backup en 7 días.`,
      });
    } catch (error: any) {
      console.error("Error en backup automático:", error);
      // No mostrar error al usuario para no interrumpir
    }
  };

  const handleExportBackup = async () => {
    try {
      setIsExporting(true);

      // Función para obtener TODOS los registros sin límite de 1000
      const fetchAllRecords = async (tableName: string) => {
        let allData: any[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from(tableName)
            .select("*")
            .range(from, from + batchSize - 1);

          if (error) throw error;

          if (data && data.length > 0) {
            allData = [...allData, ...data];
            from += batchSize;

            // Si recibimos menos registros que el batchSize, ya no hay más
            if (data.length < batchSize) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        return allData;
      };

      // Obtener todos los datos de todas las tablas (sin límite)
      toast({
        title: "Exportando datos...",
        description:
          "Esto puede tomar unos momentos si tienes muchos registros.",
      });

      const [pacientes, recetas, facturas, citas, promociones] =
        await Promise.all([
          fetchAllRecords("pacientes"),
          fetchAllRecords("recetas"),
          fetchAllRecords("facturas"),
          fetchAllRecords("citas"),
          fetchAllRecords("promociones"),
        ]);

      // Crear objeto de backup
      const backup = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        data: {
          pacientes,
          recetas,
          facturas,
          citas,
          promociones,
        },
        stats: {
          total_pacientes: pacientes.length,
          total_recetas: recetas.length,
          total_facturas: facturas.length,
          total_citas: citas.length,
          total_promociones: promociones.length,
        },
      };

      // Crear archivo JSON y descargar
      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `optica-omega-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Guardar fecha del último backup
      setLastBackup(new Date().toISOString());

      toast({
        title: "Backup creado exitosamente",
        description: `Se exportaron ${backup.stats.total_pacientes} pacientes, ${backup.stats.total_recetas} recetas, ${backup.stats.total_facturas} facturas, ${backup.stats.total_citas} citas y ${backup.stats.total_promociones} promociones.`,
      });
    } catch (error: any) {
      toast({
        title: "Error al crear backup",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportToCloud = async () => {
    try {
      setIsExportingToCloud(true);

      // Función para obtener TODOS los registros sin límite de 1000
      const fetchAllRecords = async (tableName: string) => {
        let allData: any[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from(tableName)
            .select("*")
            .range(from, from + batchSize - 1);

          if (error) throw error;

          if (data && data.length > 0) {
            allData = [...allData, ...data];
            from += batchSize;

            if (data.length < batchSize) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        return allData;
      };

      // Obtener todos los datos
      toast({
        title: "Guardando backup en la nube...",
        description: "Esto puede tomar unos momentos.",
      });

      const [pacientes, recetas, facturas, citas, promociones] =
        await Promise.all([
          fetchAllRecords("pacientes"),
          fetchAllRecords("recetas"),
          fetchAllRecords("facturas"),
          fetchAllRecords("citas"),
          fetchAllRecords("promociones"),
        ]);

      // Crear objeto de backup
      const backup = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        data: {
          pacientes,
          recetas,
          facturas,
          citas,
          promociones,
        },
        stats: {
          total_pacientes: pacientes.length,
          total_recetas: recetas.length,
          total_facturas: facturas.length,
          total_citas: citas.length,
          total_promociones: promociones.length,
        },
      };

      // Convertir a Blob
      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      // Nombre del archivo con fecha
      const fileName = `backup-${
        new Date().toISOString().split("T")[0]
      }-${Date.now()}.json`;

      // Subir a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("backups")
        .upload(fileName, dataBlob, {
          contentType: "application/json",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Guardar fecha del último backup en la nube Y resetear contador de backup automático
      const now = new Date().toISOString();
      setLastCloudBackup(now);
      localStorage.setItem("lastAutoBackup", now); // Resetear contador automático

      // Calcular próximo backup automático
      const nextBackupDate = new Date();
      nextBackupDate.setDate(nextBackupDate.getDate() + 7);
      setNextAutoBackup(nextBackupDate.toISOString());

      toast({
        title: "Backup guardado en la nube",
        description: `Se guardaron ${backup.stats.total_pacientes} pacientes, ${backup.stats.total_recetas} recetas, ${backup.stats.total_facturas} facturas, ${backup.stats.total_citas} citas y ${backup.stats.total_promociones} promociones en Supabase Storage.`,
      });
    } catch (error: any) {
      toast({
        title: "Error al guardar en la nube",
        description:
          error.message ||
          "Asegúrate de que el bucket 'backups' exista en Storage",
        variant: "destructive",
      });
    } finally {
      setIsExportingToCloud(false);
    }
  };

  const handleImportBackup = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setIsImporting(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backup = JSON.parse(e.target?.result as string);

          // Validar estructura del backup
          if (!backup.version || !backup.data) {
            throw new Error("Archivo de backup inválido");
          }

          const { pacientes, recetas, facturas, citas, promociones } =
            backup.data;

          // Confirmar antes de importar
          const confirmImport = window.confirm(
            `¿Estás seguro de importar este backup?\n\n` +
              `Pacientes: ${pacientes?.length || 0}\n` +
              `Recetas: ${recetas?.length || 0}\n` +
              `Facturas: ${facturas?.length || 0}\n` +
              `Citas: ${citas?.length || 0}\n` +
              `Promociones: ${promociones?.length || 0}\n\n` +
              `Esto agregará los datos que no existan en la base de datos actual.`
          );

          if (!confirmImport) {
            setIsImporting(false);
            return;
          }

          let importedCount = {
            pacientes: 0,
            recetas: 0,
            facturas: 0,
            citas: 0,
            promociones: 0,
          };

          // Importar pacientes (solo los que no existan)
          if (pacientes && pacientes.length > 0) {
            for (const paciente of pacientes) {
              const { data: existing } = await supabase
                .from("pacientes")
                .select("id")
                .eq("id", paciente.id)
                .single();

              if (!existing) {
                await supabase.from("pacientes").insert(paciente);
                importedCount.pacientes++;
              }
            }
          }

          // Importar recetas (solo las que no existan)
          if (recetas && recetas.length > 0) {
            for (const receta of recetas) {
              const { data: existing } = await supabase
                .from("recetas")
                .select("id")
                .eq("id", receta.id)
                .single();

              if (!existing) {
                await supabase.from("recetas").insert(receta);
                importedCount.recetas++;
              }
            }
          }

          // Importar facturas (solo las que no existan)
          if (facturas && facturas.length > 0) {
            for (const factura of facturas) {
              const { data: existing } = await supabase
                .from("facturas")
                .select("id")
                .eq("id", factura.id)
                .single();

              if (!existing) {
                await supabase.from("facturas").insert(factura);
                importedCount.facturas++;
              }
            }
          }

          // Importar citas (solo las que no existan)
          if (citas && citas.length > 0) {
            for (const cita of citas) {
              const { data: existing } = await supabase
                .from("citas")
                .select("id")
                .eq("id", cita.id)
                .single();

              if (!existing) {
                await supabase.from("citas").insert(cita);
                importedCount.citas++;
              }
            }
          }

          // Importar promociones (solo las que no existan)
          if (promociones && promociones.length > 0) {
            for (const promocion of promociones) {
              const { data: existing } = await supabase
                .from("promociones")
                .select("id")
                .eq("id", promocion.id)
                .single();

              if (!existing) {
                await supabase.from("promociones").insert(promocion);
                importedCount.promociones++;
              }
            }
          }

          toast({
            title: "Backup importado exitosamente",
            description: `Se importaron ${importedCount.pacientes} pacientes, ${importedCount.recetas} recetas, ${importedCount.facturas} facturas, ${importedCount.citas} citas y ${importedCount.promociones} promociones nuevas.`,
          });

          // Recargar la página para actualizar los datos
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error: any) {
          toast({
            title: "Error al importar backup",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setIsImporting(false);
        }
      };

      reader.readAsText(file);
    } catch (error: any) {
      toast({
        title: "Error al leer archivo",
        description: error.message,
        variant: "destructive",
      });
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona los ajustes y respaldos de tu sistema
        </p>
      </div>

      {/* Backup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Respaldo de Datos
          </CardTitle>
          <CardDescription>
            Exporta e importa todos los datos de tu sistema para mantener
            respaldos seguros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información del último backup local */}
          {lastBackup && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              <HardDrive className="h-4 w-4" />
              <span>
                Último backup local:{" "}
                {new Date(lastBackup).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          {/* Información del último backup en la nube */}
          {lastCloudBackup && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <Cloud className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800">
                Último backup en la nube:{" "}
                {new Date(lastCloudBackup).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          {/* Información de próximo backup automático */}
          {nextAutoBackup && (
            <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Backup Automático Semanal</p>
                <p>
                  Próximo backup programado:{" "}
                  {new Date(nextAutoBackup).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Advertencia */}
          <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Importante</p>
              <p>
                Al importar un backup, solo se agregarán los datos que no
                existan en la base de datos actual. No se sobrescribirán datos
                existentes.
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Exportar Backup Local */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Descargar Local
                </CardTitle>
                <CardDescription>
                  Descarga un archivo JSON a tu computadora
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleExportBackup}
                  disabled={isExporting}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Guardar en la Nube */}
            <Card className="border-2 border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-blue-600" />
                  Guardar en la Nube
                </CardTitle>
                <CardDescription>
                  Guarda en Supabase Storage (más seguro)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleExportToCloud}
                  disabled={isExportingToCloud}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isExportingToCloud ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Cloud className="h-4 w-4 mr-2" />
                      Guardar en Nube
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Importar Backup */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Importar Backup
                </CardTitle>
                <CardDescription>
                  Carga un archivo de backup previamente exportado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label htmlFor="backup-file">
                  <Button
                    disabled={isImporting}
                    className="w-full"
                    size="lg"
                    variant="outline"
                    asChild
                  >
                    <span className="cursor-pointer">
                      {isImporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                          Importando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Seleccionar Archivo
                        </>
                      )}
                    </span>
                  </Button>
                </label>
                <input
                  id="backup-file"
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                  disabled={isImporting}
                />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder para futuras configuraciones */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Próximamente</CardTitle>
          <CardDescription>
            Más opciones de configuración estarán disponibles pronto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Preferencias de usuario</li>
            <li>• Notificaciones</li>
            <li>• Temas personalizados</li>
            <li>• Gestión de permisos</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
