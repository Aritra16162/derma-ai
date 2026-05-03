'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/useStore';
import { API_URL } from '@/lib/config';
import { motion } from 'framer-motion';
import { FileDown, RefreshCcw, AlertTriangle, CheckCircle, Clock, Mail } from 'lucide-react';

export function TriageDashboard() {
  const { t } = useTranslation();
  const { user, setShowAuthModal, triageResult, conditionName, surveyData, capturedImage, resetFlow } = useStore();
  const [sending, setSending] = useState(false);
  const savedRef = useRef(false);

  useEffect(() => {
    if (user && triageResult && conditionName && !savedRef.current) {
      savedRef.current = true;
      fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          condition_name: conditionName,
          urgency: triageResult,
          survey_data: surveyData,
          image_data: capturedImage
        })
      }).catch(err => console.error("Failed to save report automatically:", err));
    }
  }, [user, triageResult, conditionName, surveyData]);

  const handleSendEmail = async () => {
    if (!user) {
        setShowAuthModal(true);
        return;
    }
    setSending(true);
    try {
        const res = await fetch(`${API_URL}/send-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                triage_data: {
                    patient_name: user.name || 'Guest Patient',
                    patient_id: user.patientId || 'N/A',
                    report_id: `REF-AI-${Math.floor(Math.random() * 90000) + 10000}-TX`,
                    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    predicted_class: conditionName,
                    danger_level: triageResult,
                    survey: surveyData,
                    image_data: capturedImage
                }
            })
        });
        if (res.ok) {
            alert('Report sent to your email!');
        } else {
            const data = await res.json();
            alert('Failed to send report: ' + (data.detail || 'Unknown error'));
        }
    } catch(e: any) {
        alert('Failed to send report: ' + e.message);
    } finally {
        setSending(false);
    }
  };

  const getUrgencyConfig = () => {
    switch (triageResult) {
      case 'Seek Care Today':
        return { color: 'bg-urgency-red', text: 'text-urgency-red', icon: AlertTriangle, label: t('results.seekCareToday') };
      case 'See Doctor':
        return { color: 'bg-warning-yellow', text: 'text-warning-yellow', icon: Clock, label: t('results.seeDoctor') };
      default:
        return { color: 'bg-success-green', text: 'text-success-green', icon: CheckCircle, label: t('results.routine') };
    }
  };

  const config = getUrgencyConfig();
  const Icon = config.icon;

  const reportId = `REF-AI-${Math.floor(Math.random() * 90000) + 10000}-TX`;
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <div className="flex flex-col w-full max-w-md mx-auto mt-6 space-y-4 print:hidden">
      {/* Result Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card p-6 bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 transition-colors relative overflow-hidden"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white transition-colors">{t('results.title')}</h2>
        
        {/* Status Bar */}
        <div className="flex items-center justify-between text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 transition-colors">
          <span>{t('results.routine')}</span>
          <span>{t('results.seeDoctor')} / Seek Care</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full mb-6 overflow-hidden flex transition-colors">
           <div className={`h-full ${config.color} transition-all duration-500 delay-300`} style={{ width: triageResult === 'Routine' ? '33%' : triageResult === 'See Doctor' ? '66%' : '100%' }} />
        </div>

        <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-700/50 p-4 rounded-xl border border-white/60 dark:border-slate-600/50 shadow-sm transition-colors">
          {capturedImage && (
            <img src={capturedImage} alt="Scanned region" className="w-20 h-20 object-cover rounded-lg shadow-sm" />
          )}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase transition-colors">{t('results.predicted')}</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white mt-1 leading-tight drop-shadow-sm">{conditionName || 'Unknown'}</span>
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border dark:border-slate-600 shadow-sm ${config.text} text-xs font-bold transition-colors`}>
                <Icon size={14} />
                {config.label}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4 print:hidden"
      >
        <div className="flex gap-4 w-full">
            <button 
              onClick={() => {
                const originalTitle = document.title;
                document.title = `${user?.name || 'Guest_Patient'} - ${user?.patientId || 'NA'}`;
                window.print();
                setTimeout(() => { document.title = originalTitle; }, 1000);
              }}
              className="flex-1 min-h-[48px] bg-trust-blue hover:opacity-90 text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <FileDown size={20} />
              {t('results.download')}
            </button>
            <button 
              onClick={resetFlow}
              className="min-h-[48px] px-6 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-semibold rounded-full flex items-center justify-center transition-all border dark:border-slate-600 shadow-sm"
            >
              <RefreshCcw size={20} />
            </button>
        </div>
        <button 
          onClick={handleSendEmail}
          disabled={sending}
          className="w-full min-h-[48px] bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 font-semibold rounded-full flex items-center justify-center gap-2 transition-all shadow-sm border border-gray-200 dark:border-slate-700 disabled:opacity-50"
        >
          <Mail size={20} />
          {sending ? 'Sending...' : 'Send PDF to Email'}
        </button>
      </motion.div>
      </div>

      {/* Printable Report UI (Hidden on Screen) */}
      <div className="hidden print:block w-full max-w-4xl mx-auto bg-white text-black p-8">
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-slate-200 pb-6 mb-8">
           <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">Derma<span className="text-blue-600">Guide</span> AI</h1>
           </div>
           <div className="text-right">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Automated Analysis Report</h2>
              <p className="text-sm text-slate-400 mt-1 font-mono">{reportId}</p>
           </div>
        </div>

        {/* Patient Info Table */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 grid grid-cols-2 gap-y-4 gap-x-12 text-sm">
           <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-600">Patient Name:</span>
              <span className="text-slate-900">{user?.name || 'Guest Patient'}</span>
           </div>
           <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-600">Date of Scan:</span>
              <span className="text-slate-900">{currentDate}</span>
           </div>
           <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-600">Patient ID:</span>
              <span className="text-slate-900 font-mono">{user?.patientId || 'N/A'}</span>
           </div>
        </div>

        {/* Clinical Image */}
        <div className="mb-8">
           <h3 className="text-lg font-bold text-slate-800 border-l-4 border-blue-500 pl-3 mb-4">Submitted Clinical Image</h3>
           <p className="text-sm text-slate-500 mb-4">
             The AI model has processed the uploaded dermoscopic/clinical image to identify areas of morphological concern.
           </p>
           {capturedImage && (
             <div className="w-full max-w-sm bg-slate-50 border border-slate-200 p-2 flex flex-col items-center rounded-xl shadow-sm">
               <img src={capturedImage} alt="Clinical Scanned Region" className="w-full h-auto max-h-64 object-cover rounded-lg" />
               <span className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">Input Image</span>
             </div>
           )}
        </div>

        {/* Model Classification Results */}
        <div className="mb-8">
           <h3 className="text-lg font-bold text-slate-800 border-l-4 border-blue-500 pl-3 mb-4">Model Classification Results</h3>
           <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-800 text-white">
                 <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Diagnostic Category</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-lg">Triage Recommendation</th>
                 </tr>
              </thead>
              <tbody>
                 <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="px-4 py-4 font-bold text-slate-900">{conditionName || 'Unknown'}</td>
                    <td className="px-4 py-4">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${triageResult === 'Seek Care Today' ? 'bg-red-100 text-red-700 border border-red-200' : triageResult === 'See Doctor' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                         <Icon size={12} />
                         {config.label}
                       </span>
                    </td>
                 </tr>
              </tbody>
           </table>
        </div>

        {/* Survey Data */}
        <div className="mb-8">
           <h3 className="text-lg font-bold text-slate-800 border-l-4 border-blue-500 pl-3 mb-4">Reported Symptoms</h3>
           <div className="grid grid-cols-2 gap-4 text-sm bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col">
                 <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Duration</span>
                 <span className="text-slate-900 font-medium">{surveyData.duration || 'Not specified'}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pain/Itchiness</span>
                 <span className="text-slate-900 font-medium">{surveyData.pain || 'Not specified'}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Spreading</span>
                 <span className="text-slate-900 font-medium">{surveyData.spreading || 'Not specified'}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Fever</span>
                 <span className="text-slate-900 font-medium">{surveyData.fever || 'Not specified'}</span>
              </div>
           </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-400 text-center leading-relaxed">
           This report is generated automatically by an AI model and is intended for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
        </div>
      </div>
    </>
  );
}
