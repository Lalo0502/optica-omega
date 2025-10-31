"use client";

import { motion } from "framer-motion";

export default function LogoutTransition() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-white flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, rotate: 0, opacity: 0 }}
        animate={{
          scale: [0.8, 1.1, 1],
          rotate: [0, 10, -10, 0],
          opacity: 1,
        }}
        exit={{
          scale: 0.5,
          rotate: 360,
          opacity: 0,
        }}
        transition={{
          duration: 2.5,
          ease: [0.6, 0.01, 0.05, 0.95],
          times: [0, 0.4, 1],
        }}
        className="relative"
      >
        <motion.div
          animate={{
            boxShadow: [
              "0 0 40px rgba(15, 23, 42, 0.2)",
              "0 0 100px rgba(15, 23, 42, 0.5)",
              "0 0 40px rgba(15, 23, 42, 0.2)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-3xl p-12 shadow-2xl"
        >
          {/* Símbolo Omega con animación de pulso */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-slate-900 text-9xl font-bold flex items-center justify-center"
          >
            Ω
          </motion.div>
        </motion.div>

        {/* Texto con animación de fade */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [20, 0, 0, -20],
          }}
          transition={{
            duration: 2.5,
            times: [0, 0.2, 0.7, 1],
          }}
          className="text-center mt-8 text-slate-600 font-light text-lg"
        >
          Hasta pronto
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
