"use client"

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Menu, X, Eye, LogOut, Receipt } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });

      router.push('/login');
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      });
    }
  };

  const routes = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Pacientes',
      path: '/pacientes',
      icon: Users,
    },
    {
      name: 'Facturación',
      path: '/facturas',
      icon: Receipt,
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full shadow-md hover:shadow-lg transition-all duration-200"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar backdrop for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main sidebar */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-card border-r shadow-sm",
          "transition-all duration-300 ease-in-out",
          "lg:relative",
          isCollapsed ? "lg:w-20" : "lg:w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn(
            "flex items-center p-6",
            isCollapsed && "lg:justify-center lg:p-4"
          )}>
            {!isCollapsed && (
              <div className="transition-opacity duration-200 flex items-center gap-3">
                <div className="flex justify-center items-center h-10 w-10 rounded-full bg-primary text-primary-foreground">
                  <Eye size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Óptica</h1>
                  <p className="text-muted-foreground text-xs">Sistema de Gestión</p>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="flex justify-center items-center h-10 w-10 rounded-full bg-primary text-primary-foreground">
                <Eye size={20} />
              </div>
            )}
          </div>

          <nav className="flex-1">
            <ul className="space-y-2 px-4">
              <TooltipProvider delayDuration={0}>
                {routes.map((route) => (
                  <li key={route.path}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={route.path}
                            className={cn(
                              "flex justify-center items-center h-10 w-10 mx-auto rounded-lg transition-all duration-200",
                              pathname === route.path
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            <route.icon size={18} />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {route.name}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link
                        href={route.path}
                        className={cn(
                          "sidebar-link flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200",
                          pathname === route.path ? "active" : ""
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <route.icon size={18} />
                        <span className="font-medium text-sm">{route.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </TooltipProvider>
            </ul>
          </nav>

          {/* Logout button */}
          <div className="p-4 mt-auto border-t">
            {isCollapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      className="flex justify-center items-center h-10 w-10 mx-auto rounded-lg hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LogOut size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Cerrar Sesión
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button
                variant="ghost"
                className="w-full flex items-center gap-3 justify-start hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span className="font-medium text-sm">Cerrar Sesión</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;