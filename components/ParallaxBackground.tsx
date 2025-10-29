"use client";

import { useEffect, useRef } from "react";

interface ParallaxBackgroundProps {
  children: React.ReactNode;
}

export default function ParallaxBackground({
  children,
}: ParallaxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Normalizar posición del mouse (-1 a 1)
      mouseX.current = (clientX / innerWidth - 0.5) * 2;
      mouseY.current = (clientY / innerHeight - 0.5) * 2;

      // Aplicar transformaciones parallax a las capas
      const layers = containerRef.current.querySelectorAll(".parallax-layer");
      layers.forEach((layer, index) => {
        const speed = (index + 1) * 0.05;
        const x = mouseX.current * speed * 50;
        const y = mouseY.current * speed * 50;
        (layer as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Capa 1 - Fondo base con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-cyan-900/20 animate-gradient"></div>
      </div>

      {/* Capa 2 - Círculos grandes con parallax */}
      <div className="parallax-layer absolute inset-0 transition-transform duration-300 ease-out">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Capa 3 - Círculos medianos con más parallax */}
      <div className="parallax-layer absolute inset-0 transition-transform duration-300 ease-out">
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      {/* Capa 4 - Círculos pequeños con más parallax */}
      <div className="parallax-layer absolute inset-0 transition-transform duration-300 ease-out">
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-indigo-500/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-1/4 right-1/3 w-48 h-48 bg-pink-500/10 rounded-full blur-xl animate-float-delayed"></div>
      </div>

      {/* Capa 5 - Grid animado */}
      <div className="parallax-layer absolute inset-0 transition-transform duration-300 ease-out opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "grid-move 20s linear infinite",
          }}
        ></div>
      </div>

      {/* Capa 6 - Partículas flotantes */}
      <div className="parallax-layer absolute inset-0 transition-transform duration-300 ease-out">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out ${
                Math.random() * 2
              }s infinite`,
            }}
          ></div>
        ))}
      </div>

      {/* Contenido */}
      <div className="relative z-10 w-full h-full">{children}</div>

      {/* Estilos de animaciones */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(20px) scale(0.95);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        @keyframes gradient {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 0.3;
          }
        }

        @keyframes grid-move {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(50px);
          }
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.5);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-gradient {
          animation: gradient 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
