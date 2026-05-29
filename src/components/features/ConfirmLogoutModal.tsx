import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function ConfirmLogoutModal() {
  const { showLogoutConfirm, setShowLogoutConfirm, logoutUser, setCurrentView, setToastMessage } = useStore();

  if (!showLogoutConfirm) return null;

  const handleConfirm = () => {
    logoutUser();
    setCurrentView('dashboard');
    setShowLogoutConfirm(false);
    setToastMessage('Logged out successfully');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative border border-gray-200 dark:border-slate-800"
        >
          <button 
            onClick={() => setShowLogoutConfirm(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>

          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/50">
              <LogOut size={32} className="text-red-500" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Sign Out?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              Are you sure you want to sign out? You will need to sign back in to access your profile and history.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-sm"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
