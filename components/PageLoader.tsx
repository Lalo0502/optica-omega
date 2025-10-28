"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Simular carga inicial de la página
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // No mostrar el loader en páginas de autenticación
  if (pathname?.includes('/login')) return null;
  
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Logo Omega animado */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <div className="h-20 w-20 rounded-full bg-primary/20"></div>
          </div>
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20">
            <span className="text-4xl font-bold text-primary animate-pulse">
              Ω
            </span>
          </div>
        </div>

        {/* Texto y spinner */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">
            Óptica Omega
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando sistema...</span>
          </div>
        </div>

        {/* Barra de progreso animada */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden mt-2">
          <div className="h-full bg-primary rounded-full animate-loading-bar"></div>
        </div>
      </div>
    </div>
  );
}
