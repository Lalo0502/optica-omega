"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Glasses,
  ArrowRight,
  Users,
  Receipt,
  FileText,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Carrusel de imágenes/slides
  const slides = [
    {
      title: "Gestión de Pacientes",
      subtitle: "Administra información completa de pacientes y prescripciones",
      gradient: "from-blue-600 via-cyan-500 to-teal-500",
      Icon: Users,
    },
    {
      title: "Control de Facturación",
      subtitle: "Genera y administra facturas con seguimiento de pagos",
      gradient: "from-purple-600 via-pink-500 to-rose-500",
      Icon: Receipt,
    },
    {
      title: "Recetas Digitales",
      subtitle: "Crea y gestiona recetas oftálmicas de forma eficiente",
      gradient: "from-emerald-600 via-green-500 to-lime-500",
      Icon: FileText,
    },
    {
      title: "Reportes y Estadísticas",
      subtitle: "Visualiza el estado de tu negocio en tiempo real",
      gradient: "from-orange-600 via-amber-500 to-yellow-500",
      Icon: BarChart3,
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido al sistema",
        });

        // Redirect to the original requested URL or dashboard
        const from = searchParams.get("from") || "/dashboard";
        router.push(from);
        router.refresh();
      }
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Por favor verifica tus credenciales",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Left Side - Carousel */}
      <div className="lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          className="w-full h-full"
        >
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="h-screen flex flex-col justify-center items-center p-12 relative">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 text-center max-w-2xl">
                    {/* Large Icon */}
                    <div className="flex justify-center mb-8">
                      <div
                        className={`h-32 w-32 rounded-3xl bg-gradient-to-r ${slide.gradient} flex items-center justify-center shadow-2xl animate-float`}
                      >
                        <slide.Icon
                          className="h-16 w-16 text-white"
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>

                    {/* Title with Gradient */}
                    <h1
                      className={`text-6xl font-bold mb-6 bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent leading-tight`}
                    >
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-2xl text-slate-300 mb-8">
                      {slide.subtitle}
                    </p>

                    {/* Decorative Line */}
                    <div className="flex justify-center">
                      <div
                        className={`h-1.5 w-32 rounded-full bg-gradient-to-r ${slide.gradient}`}
                      ></div>
                    </div>
                  </div>

                  {/* Slide Indicators */}
                  <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3">
                    {slides.map((_, i) => (
                      <div
                        key={i}
                        className={`h-2.5 rounded-full transition-all ${
                          i === index
                            ? "w-12 bg-white"
                            : "w-2.5 bg-white/40 hover:bg-white/60"
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Brand Logo Overlay */}
        <div className="absolute top-8 left-8 flex items-center gap-3 z-20">
          <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Glasses className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Óptica Omega</h2>
            <p className="text-sm text-slate-300">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="lg:w-2/5 flex items-center justify-center p-8 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Brand */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 mb-4 shadow-lg">
              <Glasses className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Óptica Omega</h1>
            <p className="text-muted-foreground">Sistema de Gestión</p>
          </div>

          <Card className="border-2 shadow-2xl overflow-hidden">
            {/* Gradient Header Bar */}
            <div className="h-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500"></div>

            <CardHeader className="space-y-3 pt-8 pb-6">
              <CardTitle className="text-3xl font-bold text-center">
                Iniciar Sesión
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Ingresa tus credenciales para continuar
              </p>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@optica.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 text-base border-2 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 text-base border-2 focus:border-blue-500 transition-all pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-10 w-10 hover:bg-slate-100"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/40 transition-all hover:shadow-xl hover:shadow-blue-500/50 group"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      Iniciar Sesión
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            © 2025 Óptica Omega. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
