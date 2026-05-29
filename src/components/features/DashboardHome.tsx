import { useStore } from '@/store/useStore';
import { Sparkles, Activity, FileText, Calendar, AlertTriangle, Clock, CheckCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export function DashboardHome() {
  const { setCurrentView, historyLogs, user } = useStore();
  const [backendLogs, setBackendLogs] = useState<any[] | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setIsFetching(true);
      import('@/lib/config').then(({ API_URL }) => {
        fetch(`${API_URL}/reports/${user.email}`)
          .then(res => res.json())
          .then(data => {
              if (Array.isArray(data)) {
                  setBackendLogs(data.map(log => ({...log, patientName: user.name})));
              }
          })
          .catch(err => console.error("Failed to fetch dashboard history:", err))
          .finally(() => setIsFetching(false));
      });
    } else {
        setBackendLogs(null);
        setIsFetching(false);
    }
  }, [user]);

  // Optimistic UI Fallback:
  // Merge backend and local logs to prevent data loss if SQLite DB resets on Render
  const localLogs = user ? historyLogs.filter(log => log.patientName === user.name) : historyLogs.filter(log => log.patientName === 'Guest User');
  
  const allLogs = [...(backendLogs || []), ...localLogs];
  const userLogs = Array.from(new Map(allLogs.map(log => [
      log.conditionName + JSON.stringify(log.surveyData), 
      log
  ])).values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const lastLog = userLogs.length > 0 ? userLogs[0] : null;

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'Seek Care Today':
        return { color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800', icon: AlertTriangle };
      case 'See Doctor':
        return { color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800', icon: Clock };
      default:
        return { color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800', icon: CheckCircle };
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 px-4 flex flex-col items-center relative gap-8 pb-12 min-h-[60vh]">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full overflow-hidden p-6 md:p-12 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-none rounded-2xl border border-white/40 dark:border-slate-700/50 transition-all duration-500 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
      >
        {/* Dynamic mesh background for a premium feel */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
          <motion.div 
            animate={{ 
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] left-[-10%] w-[60%] h-[120%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[80px]"
          />
          <motion.div 
            animate={{ 
              opacity: [0.2, 0.4, 0.2] 
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[120%] rounded-full bg-indigo-400/20 dark:bg-purple-600/20 blur-[80px]"
          />
        </div>

        <div className="relative z-10 w-24 h-24 flex items-center justify-center mb-6">
          {/* Radiating Ripples */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-400/60 dark:border-blue-500/60"
            animate={{ scale: [1, 1.3, 1.6], opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-400/60 dark:border-blue-500/60"
            animate={{ scale: [1, 1.3, 1.6], opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.66 }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-400/60 dark:border-blue-500/60"
            animate={{ scale: [1, 1.3, 1.6], opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1.33 }}
          />
          
          {/* Main Logo Container */}
          <div className="relative z-20 w-full h-full bg-gradient-to-tr from-blue-100 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-800/40 rounded-full flex items-center justify-center shadow-inner ring-1 ring-white/50 dark:ring-white/10">
            <Activity size={40} className="text-blue-600 dark:text-blue-400 drop-shadow-md" />
          </div>
        </div>
        
        <h2 className="relative z-10 text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-slate-300 mb-4 tracking-tight text-center leading-tight">
          Symptom Consultation Dashboard
        </h2>
        <p className="relative z-10 text-center text-gray-600 dark:text-slate-300 max-w-xl mb-12 text-lg font-medium leading-relaxed">
          Welcome to your interactive medical dashboard. Click below to begin a new reactive symptom consultation and receive an instant AI skin analysis triage.
        </p>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (!user?.email) {
              alert("Please log in to start the analysis.");
              return;
            }
            setCurrentView('analysis');
          }}
          className="relative z-10 overflow-hidden group px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-full flex items-center justify-center gap-3 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.8)] transition-all text-base md:text-lg border border-blue-400/30"
        >
          {/* Shimmer effect strip */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          <Sparkles size={24} className="relative z-10 drop-shadow-md animate-pulse" />
          <span className="relative z-10 drop-shadow-sm">Start New AI Analysis</span>
        </motion.button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2"
      >
         <div className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-none rounded-2xl border border-white/40 dark:border-slate-700/50 transition-all duration-500 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
            <h3 className="font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-2 mb-4">
               <FileText size={18}/> Recent Consultations
            </h3>
            <div className="flex flex-col gap-3">
              {isFetching ? (
                 <div className="p-6 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600 flex flex-col items-center justify-center gap-3">
                    <span className="w-6 h-6 border-2 border-trust-blue border-t-transparent rounded-full animate-spin"></span>
                    <span className="text-sm font-bold text-trust-blue animate-pulse uppercase tracking-wider">Syncing</span>
                 </div>
              ) : lastLog ? (() => {
                 const config = getUrgencyConfig(lastLog.urgency || 'Routine');
                 const Icon = config.icon;
                 return (
                   <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600 flex flex-col gap-2 cursor-pointer hover:bg-white dark:hover:bg-slate-600 transition-colors" onClick={() => setCurrentView('history')}>
                      <div className="flex justify-between items-start">
                         <h4 className="font-bold text-gray-900 dark:text-white">{lastLog.conditionName}</h4>
                         <div className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${config.color}`}>
                            <Icon size={10} />
                            {lastLog.urgency}
                         </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                         <Calendar size={12} />
                         {new Date(lastLog.date).toLocaleDateString()}
                      </div>
                   </div>
                 );
              })() : (
                 <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg text-sm text-gray-600 dark:text-slate-300 border border-gray-100 dark:border-slate-600">No recent consultations found.</div>
              )}
            </div>
         </div>
         
         <div 
           onClick={() => setIsAboutOpen(true)}
           className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-none rounded-2xl border border-white/40 dark:border-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-900/80 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center text-center group shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
         >
           <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <Info size={24} className="text-gray-500 dark:text-slate-400" />
           </div>
           <h3 className="font-bold text-gray-800 dark:text-slate-200 mb-2">About Us</h3>
           <p className="text-xs text-gray-500 dark:text-slate-400 max-w-xs">Click here to learn more about DermaGuide&apos;s AI analysis system and capabilities.</p>
         </div>
      </motion.div>

      <AnimatePresence>
        {isAboutOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAboutOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass-card bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Info className="text-trust-blue dark:text-blue-400" size={24} /> 
                  About DermaGuide
                </h3>
                <button 
                  onClick={() => setIsAboutOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 text-sm text-gray-600 dark:text-slate-300 leading-relaxed space-y-4">
                <p>
                  DermaGuide is an AI-powered skin support system that analyzes user-uploaded images along with symptoms to provide early, non-diagnostic guidance.
                </p>
                <p>
                  It identifies possible conditions, assigns confidence levels, and classifies risk to help users understand the seriousness of their situation. The system offers clear explanations and suggests next steps such as home care, monitoring, or consulting a doctor. 
                </p>
                <p>
                  Additionally, our Advanced AI Insights feature utilizes advanced reasoning capabilities to deeply evaluate the clinical presentation. It provides patients with a comprehensive, personalized explanation of the identified condition alongside detailed potential care guidance to help them make informed health decisions.
                </p>
                <p className="font-semibold text-gray-800 dark:text-slate-200 border-l-4 border-trust-blue dark:border-blue-500 pl-3">
                  Designed as a decision-support tool, it focuses on safety, clarity, and accessibility.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
