"use client";

import { motion } from "framer-motion";
import { Settings, Clock, Sparkles } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl text-center relative overflow-hidden">
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

          {/* Icons */}
          <div className="flex justify-center mb-8 relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute text-blue-400/20"
            >
              <Settings size={120} strokeWidth={1} />
            </motion.div>
            



          </div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-white mb-4 tracking-tight"
          >
            We'll be right back
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-slate-300 leading-relaxed text-lg"
          >
            Derma-Guide AI is currently undergoing scheduled maintenance to improve our systems and provide you with an even better experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-10 pt-8 border-t border-white/10"
          >
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Systems will be back online shortly</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
