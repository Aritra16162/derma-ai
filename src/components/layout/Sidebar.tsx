import { Activity, User, History, Settings, MapPin, Moon, Sun, MessageSquare, X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useStore } from '@/store/useStore';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export function Sidebar() {
  const { currentView, setCurrentView, resetFlow, user, setFeedbackModalOpen } = useStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartAnalysis = () => {
    resetFlow();
    setCurrentView('dashboard');
  };

  const handleHospitalsNearMe = () => {
    if (window.confirm("Do you want to be redirected to Google Maps to find hospitals near you?")) {
      window.open("https://www.google.com/maps/search/hospitals+near+me", "_blank");
    }
  };

  const isDark = mounted ? theme === 'dark' : false;

  const navItems = [
    { icon: Activity, label: 'New Symptom Check', active: currentView === 'dashboard' || currentView === 'analysis', onClick: handleStartAnalysis },
    { icon: MapPin, label: 'Hospitals Near Me', active: false, onClick: handleHospitalsNearMe },
    { icon: User, label: 'My Profile', active: currentView === 'profile', onClick: () => setCurrentView('profile') },
    { icon: History, label: 'Medical History', active: currentView === 'history', onClick: () => setCurrentView('history') },
    { 
      icon: isDark ? Sun : Moon, 
      label: isDark ? 'Light Mode' : 'Dark Mode', 
      active: false, 
      onClick: () => setTheme(isDark ? 'light' : 'dark') 
    },
  ];



  return (
    <aside className="w-64 bg-[#adc1d3] dark:bg-slate-900 border-r dark:border-slate-800 h-full flex flex-col items-center py-8 transition-colors duration-300 overflow-y-auto overflow-x-hidden">
      {/* Sidebar Logo */}
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 mb-10 shadow-sm cursor-pointer hover:scale-105 transition-transform" onClick={() => setCurrentView('dashboard')}>
         <Image src="/logo.png" alt="Derma Guide Logo" width={32} height={32} className="object-contain" />
      </div>

      <nav className="w-full px-4 flex flex-col gap-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.onClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-sm w-full text-left
                ${item.active 
                  ? 'bg-[#859eb5] dark:bg-trust-blue text-white shadow-inner' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-[#9db2c6] dark:hover:bg-slate-800 dark:hover:text-white hover:text-slate-900'
                }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto mb-4 w-full px-4">
        <button
          onClick={() => {
            if (!user?.email) {
              alert("Please log in to submit feedback.");
              return;
            }
            setFeedbackModalOpen(true);
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-sm w-full text-left text-slate-700 dark:text-slate-300 hover:bg-[#9db2c6] dark:hover:bg-slate-800 dark:hover:text-white hover:text-slate-900"
        >
          <MessageSquare size={18} />
          Feedback
        </button>
      </div>

    </aside>
  );
}
