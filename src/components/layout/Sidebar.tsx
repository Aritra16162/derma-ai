import { Activity, User, History, Settings, MapPin, Moon, Sun, MessageSquare, X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useStore } from '@/store/useStore';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export function Sidebar() {
  const { currentView, setCurrentView, resetFlow, user } = useStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

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

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    if (!user?.email) {
      alert("Please log in to submit feedback.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { API_URL } = await import('@/lib/config');
      const res = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email, feedback: feedbackText })
      });
      if (res.ok) {
        setFeedbackSuccess(true);
        setTimeout(() => {
          setIsFeedbackOpen(false);
          setFeedbackSuccess(false);
          setFeedbackText('');
        }, 2000);
      } else {
        alert("Failed to send feedback. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="w-64 bg-[#adc1d3] dark:bg-slate-900 border-r dark:border-slate-800 h-full flex flex-col items-center py-8 transition-colors duration-300">
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
            setIsFeedbackOpen(true);
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-sm w-full text-left text-slate-700 dark:text-slate-300 hover:bg-[#9db2c6] dark:hover:bg-slate-800 dark:hover:text-white hover:text-slate-900"
        >
          <MessageSquare size={18} />
          Feedback
        </button>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {isFeedbackOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !isSubmitting && !feedbackSuccess && setIsFeedbackOpen(false)}
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-md glass-card bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-2xl overflow-hidden rounded-2xl"
              >
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="text-trust-blue dark:text-blue-400" size={24} /> 
                    Send Feedback
                  </h3>
                  <button 
                    onClick={() => !isSubmitting && !feedbackSuccess && setIsFeedbackOpen(false)}
                    disabled={isSubmitting || feedbackSuccess}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500 dark:text-gray-400 disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  {feedbackSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-8 text-center"
                    >
                      <CheckCircle2 size={64} className="text-green-500 mb-4" />
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Thank You!</h4>
                      <p className="text-gray-600 dark:text-slate-300">Your feedback has been sent to us.</p>
                    </motion.div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 dark:text-slate-300">
                        We value your thoughts! Please let us know how we can improve your experience.
                      </p>
                      <textarea 
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Write your feedback here..."
                        className="w-full h-32 p-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-trust-blue dark:focus:ring-blue-500 resize-none transition-all"
                        disabled={isSubmitting}
                      />
                      <button
                        onClick={handleFeedbackSubmit}
                        disabled={isSubmitting || !feedbackText.trim()}
                        className="w-full py-3 rounded-xl bg-trust-blue hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            Send Feedback
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}    </aside>
  );
}
