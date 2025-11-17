"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [tokenError, setTokenError] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Verificar y capturar el token de recuperación del URL
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("URL completa:", window.location.href);
        console.log("Hash:", window.location.hash);
        console.log("Search params:", window.location.search);
        
        // Verificar si hay un error en la URL (link expirado/inválido)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");
        
        if (error) {
          console.error("Error en URL:", error, errorDescription);
          setTokenError(true);
          
          let message = "El enlace de recuperación no es válido.";
          if (error === "access_denied" || errorDescription?.includes("expired")) {
            message = "El enlace de recuperación ha expirado o ya fue usado. Solicita uno nuevo.";
          }
          
          toast({
            title: "Link inválido",
            description: message,
            variant: "destructive",
          });
          setIsVerifyingToken(false);
          return;
        }
        
        // Supabase puede enviar el token en el hash (#) o en query params (?)
        // Intentar ambos métodos
        let accessToken = hashParams.get("access_token");
        let refreshToken = hashParams.get("refresh_token");
        let type = hashParams.get("type");
        
        // Método 2: Leer de query params si no está en hash
        if (!accessToken) {
          const searchParams = new URLSearchParams(window.location.search);
          accessToken = searchParams.get("access_token");
          refreshToken = searchParams.get("refresh_token");
          type = searchParams.get("type");
        }

        console.log("Token detectado:", accessToken ? "SÍ" : "NO");
        console.log("Tipo:", type);

        if (accessToken && type === "recovery") {
          console.log("Estableciendo sesión con token de recuperación...");
          
          // Establecer la sesión con el token de recuperación
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (sessionError) {
            console.error("Error al establecer sesión:", sessionError);
            setTokenError(true);
            toast({
              title: "Link inválido o expirado",
              description: "El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.",
              variant: "destructive",
            });
          } else {
            console.log("Sesión establecida exitosamente:", data);
          }
        } else {
          console.log("No se encontró token de recuperación, verificando sesión existente...");
          
          // No hay token de recuperación, verificar si hay sesión existente
          const { data: { session } } = await supabase.auth.getSession();
          
          console.log("Sesión existente:", session ? "SÍ" : "NO");
          
          if (!session) {
            setTokenError(true);
            toast({
              title: "Acceso denegado",
              description: "Necesitas un enlace de recuperación válido para cambiar tu contraseña.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error al verificar token:", error);
        setTokenError(true);
      } finally {
        setIsVerifyingToken(false);
      }
    };

    checkSession();
  }, [toast]);

  // Validar contraseña en tiempo real
  useEffect(() => {
    if (!newPassword) {
      setValidationErrors([]);
      return;
    }

    const errors: string[] = [];

    if (newPassword.length < 10) {
      errors.push("Debe tener al menos 10 caracteres");
    }

    const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\;'/]/g;
    const specialCharsCount = (newPassword.match(specialCharsRegex) || []).length;
    
    if (specialCharsCount < 2) {
      errors.push("Debe contener al menos 2 caracteres especiales");
    }

    setValidationErrors(errors);
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (validationErrors.length > 0) {
      toast({
        title: "Contraseña no válida",
        description: validationErrors[0],
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordChanged(true);

      // Copiar al portapapeles
      try {
        await navigator.clipboard.writeText(newPassword);
        toast({
          title: "Contraseña actualizada",
          description: "Tu nueva contraseña ha sido copiada al portapapeles",
        });
      } catch {
        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido cambiada exitosamente",
        });
      }

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la contraseña",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Mostrando estado de verificación del token
  if (isVerifyingToken) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-slate-200 mb-4">
            <div className="text-slate-900 text-4xl font-light">Ω</div>
          </div>
          <p className="text-slate-600">Verificando enlace de recuperación...</p>
        </motion.div>
      </div>
    );
  }

  // Mostrar error si el token no es válido
  if (tokenError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border border-red-200 mb-6"
          >
            <AlertCircle className="h-10 w-10 text-red-600" />
          </motion.div>

          <h1 className="text-2xl font-light text-slate-900 mb-2">
            Enlace Expirado o Inválido
          </h1>
          <p className="text-slate-600 mb-6">
            Este enlace de recuperación ya fue usado, ha expirado, o no es válido.
            Por favor, regresa al inicio de sesión y solicita un nuevo enlace.
          </p>

          <Link href="/login">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              Volver al inicio de sesión
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (passwordChanged) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 border border-green-200 mb-6"
          >
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </motion.div>

          <h1 className="text-2xl font-light text-slate-900 mb-2">
            Contraseña Actualizada
          </h1>
          <p className="text-slate-600 mb-6">
            Tu contraseña ha sido restablecida exitosamente. Serás redirigido al
            inicio de sesión...
          </p>

          <Link href="/login">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              Ir al inicio de sesión
            </Button>
          </Link>
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
            Nueva Contraseña
          </h1>
          <p className="text-slate-500 text-sm">
            Ingresa tu nueva contraseña para tu cuenta
          </p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-sm bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nueva Contraseña */}
            <div>
              <label className="block text-sm font-light text-slate-600 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white transition-all rounded-lg"
                  placeholder="••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Validaciones en tiempo real */}
              {newPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 space-y-1"
                >
                  {validationErrors.length > 0 ? (
                    validationErrors.map((error, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-amber-600"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {error}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Contraseña válida
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-light text-slate-600 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white transition-all rounded-lg"
                  placeholder="••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Validar coincidencia */}
              {confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2"
                >
                  {newPassword === confirmPassword ? (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Las contraseñas coinciden
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-amber-600">
                      <AlertCircle className="h-3 w-3" />
                      Las contraseñas no coinciden
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Requisitos */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-xs font-medium text-slate-700 mb-2">
                Requisitos de la contraseña:
              </p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Mínimo 10 caracteres</li>
                <li>• Al menos 2 caracteres especiales (!@#$%^&*...)</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                isLoading ||
                validationErrors.length > 0 ||
                newPassword !== confirmPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-light rounded-lg disabled:opacity-50"
            >
              {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 font-light">
          Óptica Omega © 2025
        </p>
      </motion.div>
    </div>
  );
}
