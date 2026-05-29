'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { CheckCircle2, X } from 'lucide-react';

export function Toast() {
  const { toastMessage, setToastMessage } = useStore();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000); // auto-dismiss after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 min-w-[300px]"
        >
          <CheckCircle2 className="text-green-500 w-5 h-5 flex-shrink-0" />
          <span className="flex-1 font-medium text-sm">
            {toastMessage}
          </span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
