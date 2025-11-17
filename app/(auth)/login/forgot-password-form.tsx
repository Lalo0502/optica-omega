"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordForm({
  email,
  setEmail,
  onBackToLogin,
}: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Intentando enviar email de recuperación a:", email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
      });

      if (error) {
        console.error("Error de Supabase:", error);
        console.error("Código de error:", error.status);
        console.error("Mensaje completo:", JSON.stringify(error, null, 2));
        
        // Detectar error de rate limit
        if (error.message.includes("rate limit") || 
            error.message.includes("Email rate limit exceeded") ||
            error.status === 429) {
          
          const waitTime = 60; // Coincidir con tu configuración de Supabase
          
          toast({
            title: "Límite de intentos",
            description: `Has enviado varios emails recientemente. Espera ${waitTime} segundos e intenta de nuevo.`,
            variant: "destructive",
            duration: 5000,
          });
          
          // Activar cooldown
          setCooldown(waitTime);
          const interval = setInterval(() => {
            setCooldown((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          throw error;
        }
        return;
      }

      console.log("Email enviado exitosamente");
      setEmailSent(true);
      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
      });
    } catch (error: any) {
      console.error("Error general:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el correo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setEmailSent(false);
    onBackToLogin();
  };

  return (
    <AnimatePresence mode="wait">
      {emailSent ? (
        // Estado de éxito después de enviar correo
        <motion.div
          key="email-sent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="text-center py-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 border border-green-200 mb-4"
          >
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 mb-6 text-sm"
          >
            Revisa tu bandeja de entrada para restablecer tu contraseña
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6"
          >
            <p className="text-sm text-slate-600 mb-2">
              <strong>¿No recibiste el correo?</strong>
            </p>
            <ul className="text-xs text-slate-500 space-y-1 text-left">
              <li>• Revisa tu carpeta de spam</li>
              <li>• Verifica que el correo sea correcto</li>
              <li>• Espera unos minutos</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleBackToLogin}
              variant="outline"
              className="w-full h-12 border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio de sesión
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        // Formulario de recuperación
        <motion.form
          key="forgot-password-form"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
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
                className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white transition-all rounded-lg"
                placeholder="tu@email.com"
                required
              />
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {cooldown > 0 && (
              <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                <p className="font-medium mb-1">⏰ Espera {cooldown} segundos</p>
                <p className="text-xs">
                  Esto evita el envío de spam. Si ya recibiste un email anterior, usa
                  ese en lugar de solicitar uno nuevo.
                </p>
              </div>
            )}
            
            <motion.button
              whileHover={{ scale: cooldown > 0 ? 1 : 1.01 }}
              whileTap={{ scale: cooldown > 0 ? 1 : 0.99 }}
              type="submit"
              disabled={isLoading || cooldown > 0}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-light rounded-lg border border-slate-900 hover:border-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Enviando...</span>
              ) : cooldown > 0 ? (
                <span>Espera {cooldown}s</span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Enviar enlace de recuperación</span>
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="text-center"
          >
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-light"
            >
              Volver al inicio de sesión
            </button>
          </motion.div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
