"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  onForgotPassword: () => void;
}

export default function LoginForm({
  email,
  setEmail,
  onForgotPassword,
}: LoginFormProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        const from = searchParams.get("from") || "/dashboard";
        window.location.href = from;
      }
    } catch (error: any) {
      // Activar animación de error (shake)
      setShowError(true);
      setTimeout(() => setShowError(false), 600);

      toast({
        title: "Error de acceso",
        description: error.message || "Usuario o contraseña incorrectos",
        variant: "destructive",
      });

      setIsLoading(false);
    }
  };

  return (
    <motion.form
      key="login-form"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Email Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: showError ? [1, 1.02, 1] : 1,
        }}
        transition={{
          opacity: { delay: 0.1, duration: 0.4 },
          y: { delay: 0.1, duration: 0.4 },
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
          opacity: { delay: 0.2, duration: 0.4 },
          y: { delay: 0.2, duration: 0.4 },
          scale: { duration: 0.3 },
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-light text-slate-600">
            Contraseña
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs text-slate-500 hover:text-slate-900 transition-colors font-light"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
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

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
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
    </motion.form>
  );
}
