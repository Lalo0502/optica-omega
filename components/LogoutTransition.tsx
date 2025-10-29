"use client";

import { motion } from "framer-motion";

export default function LogoutTransition() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-white flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 1, rotate: 0, opacity: 1 }}
        animate={{ scale: 0.5, rotate: 180, opacity: 0 }}
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
          <div className="text-slate-900 text-9xl font-bold flex items-center justify-center">
            Ω
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6 text-slate-600 font-light"
        >
          Hasta pronto
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
