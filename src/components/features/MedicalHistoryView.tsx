import { useStore } from '@/store/useStore';
import { API_URL } from '@/lib/config';
import { History, Calendar, AlertTriangle, Clock, CheckCircle, ChevronDown, ChevronUp, FileDown, Loader2, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';

export function MedicalHistoryView() {
  const { user } = useStore();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const handleSendEmail = async (log: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    setSendingId(log.id);
    try {
        const formattedDate = new Date(log.date).toLocaleDateString() + ' at ' + new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const res = await fetch(`${API_URL}/send-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                triage_data: {
                    patient_name: user.name || 'Guest Patient',
                    patient_id: user.patientId || 'N/A',
                    report_id: log.id,
                    date: formattedDate,
                    predicted_class: log.conditionName,
                    danger_level: log.urgency,
                    survey: log.surveyData,
                    image_data: log.image_data
                }
            })
        });
        if (res.ok) {
            alert('Report sent to your email!');
        } else {
            const data = await res.json();
            alert('Failed to send report: ' + (data.detail || 'Unknown error'));
        }
    } catch(err: any) {
        alert('Failed to send report: ' + err.message);
    } finally {
        setSendingId(null);
    }
  };

  useEffect(() => {
    if (user?.email) {
      setLoading(true);
      fetch(`${API_URL}/reports/${user.email}`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setUserLogs(data.map(log => ({...log, patientName: user.name})));
            }
        })
        .catch(err => console.error("Failed to fetch history:", err))
        .finally(() => setLoading(false));
    } else {
        setUserLogs([]);
    }
  }, [user]);

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'Seek Care Today':
        return { color: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle };
      case 'See Doctor':
        return { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock };
      default:
        return { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle };
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto mt-8 px-4 flex flex-col print:hidden">
      <div className="flex items-center gap-3 mb-8 print:hidden">
        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center text-trust-blue border border-gray-100 dark:border-slate-700 transition-colors duration-300">
          <History size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Medical History</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">Review past AI analyses and symptomatic assessments.</p>
        </div>
      </div>

      {!user ? (
         <div className="glass-card p-10 bg-white/70 dark:bg-slate-800/70 border-gray-300 dark:border-slate-700 flex flex-col items-center justify-center text-center transition-colors">
            <History className="text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <h3 className="text-lg font-bold text-gray-700 dark:text-white">Not authenticated</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sign in via your Profile to access your medical history across devices.</p>
         </div>
      ) : loading ? (
         <div className="glass-card p-10 bg-white/70 dark:bg-slate-800/70 flex flex-col items-center justify-center text-center border border-dashed border-gray-300 dark:border-slate-600 transition-colors">
            <Loader2 className="animate-spin text-trust-blue mb-4" size={32} />
            <h3 className="text-lg font-bold text-gray-700 dark:text-white">Loading History...</h3>
         </div>
      ) : userLogs.length === 0 ? (
         <div className="glass-card p-10 bg-white/70 dark:bg-slate-800/70 flex flex-col items-center justify-center text-center border border-dashed border-gray-300 dark:border-slate-600 transition-colors">
            <h3 className="text-lg font-bold text-gray-700 dark:text-white">No records found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Complete an AI analysis to see your history logged here.</p>
         </div>
      ) : (
        <div className="flex flex-col gap-4">
          {userLogs.map((log) => {
            const config = getUrgencyConfig(log.urgency || 'Routine');
            const Icon = config.icon;
            
            return (
              <div 
                key={log.id} 
                onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                className={`glass-card bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800/90 transition-colors cursor-pointer border-l-4 overflow-hidden shadow-sm ${expandedLogId && expandedLogId !== log.id ? 'print:hidden' : ''}`} 
                style={{borderLeftColor: log.urgency === 'Seek Care Today' ? '#dc3545' : log.urgency === 'See Doctor' ? '#ffc107' : '#28a745'}}
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col">
                     <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{log.id}</span>
                     <h4 className="text-lg font-bold text-gray-900 dark:text-white drop-shadow-sm">{log.conditionName}</h4>
                     <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <Calendar size={14} />
                        {new Date(log.date).toLocaleDateString()} at {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </div>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end gap-2">
                     <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-gray-400 hidden md:block">Patient: {log.patientName}</span>
                        <div className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-bold ${config.color}`}>
                           <Icon size={14} />
                           {log.urgency}
                        </div>
                        {expandedLogId === log.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                     </div>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {expandedLogId === log.id && (
                  <div className="px-5 pb-6 pt-2 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30">
                     <h5 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4 mt-2">Symptomatic Survey Answers</h5>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm">
                          <span className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-slate-500 mb-1">Duration</span>
                          <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{log.surveyData.duration || 'Not specified'}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm">
                          <span className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-slate-500 mb-1">Pain Level</span>
                          <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{log.surveyData.pain || 'Not specified'}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm">
                          <span className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-slate-500 mb-1">Spreading</span>
                          <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{log.surveyData.spreading || 'Not specified'}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm">
                          <span className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-slate-500 mb-1">Fever</span>
                          <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{log.surveyData.fever || 'Not specified'}</span>
                        </div>
                     </div>
                     <div className="mt-5 flex justify-end gap-3 print:hidden">
                        <button 
                          onClick={(e) => handleSendEmail(log, e)}
                          disabled={sendingId === log.id}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-5 rounded-full flex items-center gap-2 shadow-sm transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingId === log.id ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                          Send to Email
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            const originalTitle = document.title;
                            document.title = `${user?.name || 'Guest_Patient'} - ${user?.patientId || 'NA'}`;
                            window.print();
                            setTimeout(() => { document.title = originalTitle; }, 1000);
                          }}
                          className="bg-trust-blue hover:opacity-90 text-white font-semibold py-2 px-5 rounded-full flex items-center gap-2 shadow-sm transition-all text-sm"
                        >
                          <FileDown size={16} />
                          Download Report
                        </button>
                     </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Printable Report UI (Hidden on Screen) */}
      {expandedLogId && (
        <div className="hidden print:block w-full max-w-4xl mx-auto bg-white text-black p-8">
           {(() => {
             const log = userLogs.find(l => l.id === expandedLogId);
             if (!log) return null;
             const config = getUrgencyConfig(log.urgency || 'Routine');
             const Icon = config.icon;
             const formattedDate = new Date(log.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
             
             return (
               <>
                  <div className="flex justify-between items-end border-b-2 border-slate-200 pb-6 mb-8">
                     <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Derma<span className="text-blue-600">Guide</span> AI</h1>
                     </div>
                     <div className="text-right">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Automated Analysis Report</h2>
                        <p className="text-sm text-slate-400 mt-1 font-mono">{log.id}</p>
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
                        <span className="text-slate-900">{formattedDate}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="font-semibold text-slate-600">Patient ID:</span>
                        <span className="text-slate-900 font-mono">{user?.patientId || 'N/A'}</span>
                     </div>
                  </div>

                  {/* Clinical Image */}
                  {log.image_data && (
                    <div className="mb-8">
                       <h3 className="text-lg font-bold text-slate-800 border-l-4 border-blue-500 pl-3 mb-4">Submitted Clinical Image</h3>
                       <p className="text-sm text-slate-500 mb-4">
                         The AI model has processed the uploaded dermoscopic/clinical image to identify areas of morphological concern.
                       </p>
                       <div className="w-full max-w-sm bg-slate-50 border border-slate-200 p-2 flex flex-col items-center rounded-xl shadow-sm">
                         <img src={log.image_data} alt="Clinical Scanned Region" className="w-full h-auto max-h-64 object-cover rounded-lg" />
                         <span className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">Input Image</span>
                       </div>
                    </div>
                  )}

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
                              <td className="px-4 py-4 font-bold text-slate-900">{log.conditionName || 'Unknown'}</td>
                              <td className="px-4 py-4">
                                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${log.urgency === 'Seek Care Today' ? 'bg-red-100 text-red-700 border border-red-200' : log.urgency === 'See Doctor' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                                   <Icon size={12} />
                                   {log.urgency || 'Routine'}
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
                           <span className="text-slate-900 font-medium">{log.surveyData?.duration || 'Not specified'}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pain/Itchiness</span>
                           <span className="text-slate-900 font-medium">{log.surveyData?.pain || 'Not specified'}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Spreading</span>
                           <span className="text-slate-900 font-medium">{log.surveyData?.spreading || 'Not specified'}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Fever</span>
                           <span className="text-slate-900 font-medium">{log.surveyData?.fever || 'Not specified'}</span>
                        </div>
                     </div>
                  </div>

                  {/* Footer Note */}
                  <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-400 text-center leading-relaxed">
                     This report is generated automatically by an AI model and is intended for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                  </div>
               </>
             );
           })()}
        </div>
      )}
    </>
  );
}
