import { useState, useRef, useEffect } from 'react';
import { Search, Menu, UserCircle, LogOut } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export function DashboardHeader() {
  const { user, toggleSidebar, setCurrentView, logoutUser, setShowAuthModal, setShowLogoutConfirm } = useStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [splashState, setSplashState] = useState<'waiting' | 'moving' | 'done'>('waiting');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (splashState === 'waiting') {
        const timer = setTimeout(() => {
          setSplashState('moving');
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [splashState]);

  return (
    <header className={`flex items-center justify-between p-4 sticky top-0 z-50 transition-colors duration-300 ${splashState === 'done' ? 'bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800/50' : 'bg-transparent border-transparent'}`}>
      
      {/* Splash Screen Background */}
      <AnimatePresence>
        {splashState !== 'done' && (
          <motion.div 
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-white pointer-events-auto"
          />
        )}
      </AnimatePresence>

      <div className={`flex items-center gap-6 z-50 relative transition-opacity duration-1000 ${splashState === 'done' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={toggleSidebar} 
          className="text-gray-600 dark:text-slate-300 font-medium text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="p-1.5 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
            <Menu size={16} />
          </span>
        </button>
      </div>

      {/* Central Title Area */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-max z-50">
        <motion.h1 
          initial={splashState !== 'done' ? { scale: 3.5, y: "42vh", x: "0%" } : { scale: 1, y: 0, x: "0%" }}
          animate={
            splashState === 'waiting' 
              ? { scale: 3.5, y: "42vh", x: "0%" }
              : splashState === 'moving'
                ? { scale: 1, y: 0, x: ["0%", "15%", "0%"] }
                : { scale: 1, y: 0, x: "0%" }
          }
          transition={
            splashState === 'waiting'
              ? { duration: 0 }
              : splashState === 'moving'
                ? { 
                    duration: 1.0, 
                    ease: [0.22, 1, 0.36, 1],
                    x: { duration: 1.0, times: [0, 0.6, 1], ease: "easeInOut" }
                  }
                : { duration: 0 }
          }
          onAnimationComplete={() => {
            if (splashState === 'moving') {
              setSplashState('done');
            }
          }}
          className="text-base md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-trust-blue to-blue-400 tracking-tight drop-shadow-sm origin-center"
        >
          Derma-Guide AI
        </motion.h1>
      </div>
      {/* User Actions */}
      <div className={`flex items-center gap-4 relative z-50 transition-opacity duration-1000 ${splashState === 'done' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} ref={dropdownRef}>
        <button 
          type="button"
          className="flex items-center gap-3 cursor-pointer p-2 -mr-2 relative z-20 focus:outline-none appearance-none bg-transparent border-none text-left touch-manipulation"
          onClick={() => {
            if (!user) {
               setShowAuthModal(true);
            } else {
               setIsDropdownOpen(!isDropdownOpen);
            }
          }}
        >
          <span className="text-sm font-medium text-gray-700 dark:text-slate-200 hidden md:block">
            {user ? `Welcome back, ${user.name.split(' ')[0]}!` : "Welcome! Please sign in."}
          </span>
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300 dark:border-slate-600">
             {user ? (
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`} alt="User Avatar" />
             ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
             )}
          </div>
        </button>

        {/* Dropdown Menu */}
        {user && (
          <div className={`absolute right-0 top-full pt-2 transition-all duration-200 z-50 ${isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
             <div className="w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 py-2 flex flex-col overflow-hidden">
               <button 
                 onClick={() => { setCurrentView('profile'); setIsDropdownOpen(false); }}
                 className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
               >
                 <UserCircle size={16} /> View Profile
               </button>
               <button 
                 onClick={() => { setShowLogoutConfirm(true); setIsDropdownOpen(false); }}
                 className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors border-t border-gray-100 dark:border-slate-700 mt-1 pt-3"
               >
                 <LogOut size={16} /> Sign Out
               </button>
             </div>
          </div>
        )}
      </div>
    </header>
  );
}
