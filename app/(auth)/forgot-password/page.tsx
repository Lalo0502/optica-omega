"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el correo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 border border-green-200 mb-6"
            >
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </motion.div>

            <h1 className="text-2xl font-light text-slate-900 mb-2">
              Correo Enviado
            </h1>
            <p className="text-slate-600 mb-6">
              Te hemos enviado un enlace a <strong>{email}</strong> para
              restablecer tu contraseña.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-600 mb-2">
                <strong>¿No recibiste el correo?</strong>
              </p>
              <ul className="text-xs text-slate-500 space-y-1 text-left">
                <li>• Revisa tu carpeta de spam</li>
                <li>• Verifica que el correo sea correcto</li>
                <li>• Espera unos minutos e intenta de nuevo</li>
              </ul>
            </div>

            <Link href="/login">
              <Button
                variant="outline"
                className="w-full h-12 border-slate-200 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 mb-4">
            <div className="text-slate-900 text-4xl font-light">Ω</div>
          </div>
          <h1 className="text-2xl font-light text-slate-900 mb-1">
            Recuperar Contraseña
          </h1>
          <p className="text-slate-500 text-sm">
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña
          </p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-sm bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
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
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-light rounded-lg"
            >
              {isLoading ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar enlace de recuperación
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors font-light"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio de sesión
          </Link>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 font-light">
          Óptica Omega © 2025
        </p>
      </motion.div>
    </div>
  );
}
