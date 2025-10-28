"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold mt-4 mb-2">Página no encontrada</h2>
        <p className="text-muted-foreground mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link href="/">
          <Button className="gap-2">
            <Home size={16} />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}