"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  Glasses,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function PremiumLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessTransition, setShowSuccessTransition] = useState(false);
  const [showError, setShowError] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mouse tracking para efectos
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Liquid morphing background con Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const blobs: any[] = [];
    const blobCount = 3; // Reducido de 5 a 3 para minimalismo

    class Blob {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.radius = Math.random() * 200 + 100;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        const colors = [
          "rgba(15, 23, 42, 0.03)", // slate-900 muy sutil
          "rgba(30, 41, 59, 0.02)", // slate-800
          "rgba(51, 65, 85, 0.025)", // slate-700
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.filter = "blur(60px)";
        ctx.fill();
      }
    }

    for (let i = 0; i < blobCount; i++) {
      blobs.push(new Blob());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      blobs.forEach((blob) => {
        blob.update();
        blob.draw();
      });
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Framer Motion values para magnetic button
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

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
        // Mostrar transición de éxito (sin toast)
        setShowSuccessTransition(true);

        // Esperar animación antes de navegar
        setTimeout(() => {
          const from = searchParams.get("from") || "/dashboard";
          router.push(from);
          router.refresh();
        }, 2000);
      }
    } catch (error: any) {
      // Activar animación de error (shake)
      setShowError(true);
      setTimeout(() => setShowError(false), 600);

      // Toast de error
      toast({
        title: "Error de acceso",
        description: error.message || "Usuario o contraseña incorrectos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }; // Transición de éxito (después del login correcto)
  if (showSuccessTransition) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-white flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.6, 0.01, 0.05, 0.95],
          }}
          className="relative"
        >
          <motion.div
            animate={{
              boxShadow: [
                "0 0 40px rgba(15, 23, 42, 0.2)",
                "0 0 80px rgba(15, 23, 42, 0.4)",
                "0 0 40px rgba(15, 23, 42, 0.2)",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-3xl p-12 shadow-2xl"
          >
            {/* Símbolo Omega */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="text-slate-900 text-9xl font-bold flex items-center justify-center"
            >
              Ω
            </motion.div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6 text-slate-600 font-light"
          >
            Bienvenido a Óptica Omega
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-white">
      {/* Canvas para liquid morphing con blobs grises */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Gradient overlay animado - muy sutil en blanco */}
      <motion.div
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(15, 23, 42, 0.015) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(15, 23, 42, 0.025) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(15, 23, 42, 0.015) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 z-1"
      />

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Logo minimalista - Símbolo Omega */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.3,
              ease: "easeOut",
            }}
            className="text-center mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 mb-4 shadow-sm"
            >
              {/* Símbolo Omega */}
              <div className="text-slate-900 text-5xl font-light">Ω</div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-light text-slate-900 mb-1"
            >
              Bienvenido de vuelta
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-500 text-sm"
            >
              Óptica Omega
            </motion.p>
          </motion.div>{" "}
          {/* Card minimalista con animación de error */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: showError ? [-10, 10, -10, 10, -5, 5, 0] : 0,
            }}
            transition={{
              opacity: { delay: 0.4, duration: 0.5, ease: "easeOut" },
              scale: { delay: 0.4, duration: 0.5, ease: "easeOut" },
              x: { duration: 0.6, ease: "easeInOut" },
            }}
            className="backdrop-blur-sm bg-white border border-slate-200 rounded-2xl p-8 shadow-xl"
          >
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: showError ? [1, 1.02, 1] : 1,
                }}
                transition={{
                  opacity: { delay: 0.5, duration: 0.4 },
                  y: { delay: 0.5, duration: 0.4 },
                  scale: { duration: 0.3 },
                }}
              >
                <label className="block text-sm font-light text-slate-600 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white transition-all rounded-lg ${
                      showError ? "border-red-300 bg-red-50" : ""
                    }`}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: showError ? [1, 1.02, 1] : 1,
                }}
                transition={{
                  opacity: { delay: 0.6, duration: 0.4 },
                  y: { delay: 0.6, duration: 0.4 },
                  scale: { duration: 0.3 },
                }}
              >
                <label className="block text-sm font-light text-slate-600 mb-2">
                  Contraseña
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white transition-all rounded-lg ${
                      showError ? "border-red-300 bg-red-50" : ""
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Button minimalista */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-light rounded-lg border border-slate-900 hover:border-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar Sesión</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
          {/* Footer minimalista */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs text-slate-400 mt-6 font-light"
          >
            Óptica Omega © 2025
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
