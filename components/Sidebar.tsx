"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Menu,
  X,
  LogOut,
  Receipt,
  Settings,
  Calendar,
  Tag,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import LogoutTransition from "./LogoutTransition";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLogoutTransition, setShowLogoutTransition] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Obtener datos del usuario
  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUserData();
  }, []);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false);
      } else {
        // En desktop, iniciar colapsado
        setIsCollapsed(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Handle mouse enter/leave for desktop
  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsCollapsed(true);
    }
  };

  const handleLogout = async () => {
    try {
      // Mostrar transición de logout
      setShowLogoutTransition(true);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Esperar animación antes de navegar (sin toast)
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1200);
    } catch (error: any) {
      setShowLogoutTransition(false);
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      });
    }
  };

  const routes = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Pacientes",
      path: "/pacientes",
      icon: Users,
    },
    {
      name: "Citas",
      path: "/citas",
      icon: Calendar,
    },
    {
      name: "Promociones",
      path: "/promociones",
      icon: Tag,
    },
    {
      name: "Facturación",
      path: "/facturas",
      icon: Receipt,
    },
    {
      name: "Configuración",
      path: "/configuracion",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar - Diseño Minimalista Moderno */}
      <motion.div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "hidden lg:flex flex-col border-r border-slate-200 bg-white overflow-hidden",
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo - Estilo minimalista con símbolo Ω */}
        <div
          className={cn(
            "p-6 border-b border-slate-200",
            isCollapsed && "flex justify-center p-4"
          )}
        >
          <motion.div
            className={cn(
              "flex items-center gap-4",
              isCollapsed && "justify-center"
            )}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-11 h-11 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-2xl font-light text-slate-900">Ω</span>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  className="flex flex-col overflow-hidden"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="font-light text-base text-slate-900 tracking-tight">
                    Óptica Omega
                  </span>
                  <span className="text-xs text-slate-500 font-light tracking-wide">
                    Sistema de Gestión
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        {/* Navigation - Diseño minimalista con animaciones sutiles */}
        <nav className="flex-1 p-4 space-y-1">
          {routes.map((route) => {
            const isActive = pathname === route.path;
            return (
              <Link key={route.path} href={route.path}>
                <motion.div
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    isCollapsed && "justify-center px-3"
                  )}
                  whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <route.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isActive ? "text-white" : "text-slate-500"
                    )}
                  />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        className="text-sm font-light tracking-wide"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {route.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>{" "}
        {/* User Profile - Avatar + Nombre */}
        <div className="px-4 pb-3 border-t border-slate-200 pt-4">
          <motion.div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200",
              isCollapsed && "justify-center px-2"
            )}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-light">
                {userEmail ? userEmail[0].toUpperCase() : "U"}
              </span>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  className="flex flex-col overflow-hidden min-w-0"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-sm font-light text-slate-900 truncate">
                    {userEmail.split("@")[0] || "Usuario"}
                  </span>
                  <span className="text-xs text-slate-500 truncate">
                    {userEmail || "user@example.com"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        {/* Logout Button - Minimalista con hover rojo suave */}
        <div className="px-4 pb-4">
          <motion.button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl",
              "text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200",
              isCollapsed && "justify-center px-3"
            )}
            whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  className="text-sm font-light tracking-wide"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  Cerrar Sesión
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile Sidebar - Diseño Minimalista */}
      <div className="lg:hidden">
        {/* Mobile Header - Siempre visible */}
        <motion.div
          className="fixed top-0 left-0 right-0 flex items-center justify-between p-4 border-b border-slate-200 bg-white z-30"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-xl font-light text-slate-900">Ω</span>
            </div>
            <div className="flex flex-col">
              <span className="font-light text-sm text-slate-900 tracking-tight">
                Óptica Omega
              </span>
              <span className="text-xs text-slate-500 font-light tracking-wide">
                Sistema de Gestión
              </span>
            </div>
          </div>
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-slate-600" />
            ) : (
              <Menu className="w-6 h-6 text-slate-600" />
            )}
          </motion.button>
        </motion.div>

        {/* Spacer para el header fixed */}
        <div className="h-[73px]"></div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 top-[73px]"
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                className="fixed top-[73px] left-0 right-0 bottom-0 bg-white z-50 p-4 overflow-y-auto"
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <nav className="space-y-1">
                  {routes.map((route) => {
                    const isActive = pathname === route.path;
                    return (
                      <Link
                        key={route.path}
                        href={route.path}
                        onClick={() => setIsOpen(false)}
                      >
                        <motion.div
                          className={cn(
                            "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200",
                            isActive
                              ? "bg-slate-900 text-white shadow-md"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          )}
                          whileTap={{ scale: 0.98 }}
                        >
                          <route.icon
                            className={cn(
                              "w-5 h-5",
                              isActive ? "text-white" : "text-slate-500"
                            )}
                          />
                          <span className="text-sm font-light tracking-wide">
                            {route.name}
                          </span>
                        </motion.div>
                      </Link>
                    );
                  })}
                </nav>

                {/* User Profile Mobile */}
                <div className="pt-4 border-t border-slate-200">
                  <motion.div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 mb-2"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-light">
                        {userEmail ? userEmail[0].toUpperCase() : "U"}
                      </span>
                    </div>
                    <div className="flex flex-col overflow-hidden min-w-0">
                      <span className="text-sm font-light text-slate-900 truncate">
                        {userEmail.split("@")[0] || "Usuario"}
                      </span>
                      <span className="text-xs text-slate-500 truncate">
                        {userEmail || "user@example.com"}
                      </span>
                    </div>
                  </motion.div>

                  <motion.button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-light tracking-wide">
                      Cerrar Sesión
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      {/* Transición de logout */}
      {showLogoutTransition && <LogoutTransition />}
    </>
  );
};

export default Sidebar;
