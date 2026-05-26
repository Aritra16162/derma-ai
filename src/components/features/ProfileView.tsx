import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { UserCircle, Mail, Hash, LogOut, ArrowRight, ShieldCheck, Activity, Trash2, KeyRound, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '@/lib/config';

export function ProfileView() {
  const { user, setShowLogoutConfirm, setShowAuthModal, logoutUser, setCurrentView } = useStore();
  
  const [deleteState, setDeleteState] = useState<'idle' | 'confirming' | 'password' | 'verifying' | 'success'>('idle');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (deleteState === 'verifying' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [deleteState, timer]);

  const requestDelete = async () => {
    setDeleteError('');
    setIsDeleting(true);
    setTimer(60);
    try {
      const res = await fetch(`${API_URL}/auth/request-delete-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, password: deletePassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to request deletion');
      setDeleteState('verifying');
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const verifyDelete = async () => {
    setDeleteError('');
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-delete-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, otp: deleteOtp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to verify deletion');
      setDeleteState('success');
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (deleteState === 'success') {
    return (
      <div className="w-full max-w-md mx-auto mt-12">
        <div className="glass-card p-10 bg-white/95 dark:bg-slate-800/95 border border-success-green/20 dark:border-green-500/20 shadow-2xl transition-colors duration-300 flex flex-col items-center rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-success-green/5 dark:bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-6 relative z-10 border border-green-100 dark:border-green-500/20">
            <CheckCircle size={40} className="text-success-green dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center relative z-10">Account Deleted</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm text-center mb-8 relative z-10">
            Your account and all associated medical history have been permanently deleted successfully.
          </p>
          <button
            onClick={() => {
              logoutUser();
              setCurrentView('dashboard');
              setDeleteState('idle');
            }}
            className="w-full bg-success-green hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all relative z-10 shadow-lg shadow-green-500/20"
          >
            Okay
          </button>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8 flex flex-col items-center">
        <div className="w-full glass-card p-10 bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 transition-colors duration-300 relative overflow-hidden">
           {/* Decorative BG */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-trust-blue/5 dark:bg-trust-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

           <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
              <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden shrink-0">
                 <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}${user.gender === 'Male' ? '&beardProbability=100' : user.gender === 'Female' ? '&lipsProbability=100' : ''}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 flex flex-col text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                   <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                   <ShieldCheck className="text-success-green dark:text-green-400" size={24} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 flex items-center justify-center md:justify-start gap-2">
                  <Mail size={16} /> {user.email}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                  <div className="bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 p-4 rounded-xl flex flex-col transition-colors duration-300">
                     <span className="text-xs text-gray-400 dark:text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Hash size={14}/> Patient ID</span>
                     <span className="font-mono text-gray-800 dark:text-slate-200 font-medium">{user.patientId}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 p-4 rounded-xl flex flex-col transition-colors duration-300">
                     <span className="text-xs text-gray-400 dark:text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><UserCircle size={14}/> Gender</span>
                     <span className="text-gray-800 dark:text-slate-200 font-medium capitalize">{user.gender || 'Prefer not to say'}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 p-4 rounded-xl flex flex-col transition-colors duration-300">
                     <span className="text-xs text-gray-400 dark:text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Activity size={14}/> Status</span>
                     <span className="text-trust-blue dark:text-blue-400 font-bold">Active</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 w-full flex flex-col gap-4">
                  {deleteState === 'idle' && (
                    <div className="flex justify-between items-center w-full">
                       <button 
                         onClick={() => setDeleteState('confirming')}
                         className="flex items-center gap-2 px-6 py-2.5 rounded-full text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-600 hover:border-red-200 dark:hover:border-red-500/30 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-semibold transition-colors text-sm"
                       >
                         <Trash2 size={16} />
                         Delete Account
                       </button>
                       <button 
                         onClick={() => setShowLogoutConfirm(true)}
                         className="flex items-center gap-2 px-6 py-2.5 rounded-full text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 font-semibold transition-colors text-sm"
                       >
                         <LogOut size={16} />
                         Sign Out
                       </button>
                    </div>
                  )}

                  {deleteState === 'confirming' && (
                    <div className="flex flex-col items-end w-full gap-3 p-4 bg-red-50/50 dark:bg-red-500/5 rounded-xl border border-red-100 dark:border-red-500/20">
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium w-full text-center">Are you sure you want to permanently delete your account and medical history? This cannot be undone.</p>
                      <div className="flex gap-3 justify-center w-full">
                        <button 
                          onClick={() => setDeleteState('idle')}
                          className="px-6 py-2 rounded-full text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 font-semibold text-sm transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => setDeleteState('password')}
                          className="px-6 py-2 rounded-full text-white bg-red-600 hover:bg-red-700 font-semibold text-sm transition-colors disabled:opacity-50"
                        >
                          Yes, Delete Account
                        </button>
                      </div>
                    </div>
                  )}

                  {deleteState === 'password' && (
                    <div className="flex flex-col items-center w-full gap-3 p-4 bg-red-50/50 dark:bg-red-500/5 rounded-xl border border-red-100 dark:border-red-500/20">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium text-center">Please enter your password to continue.</p>
                      <div className="flex gap-3 items-center w-full max-w-sm">
                        <div className="relative flex-1">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type={showDeletePassword ? "text" : "password"} 
                            placeholder="Your Password" 
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="w-full pl-9 pr-10 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white text-base tracking-wider"
                          />
                          <button
                            type="button"
                            onClick={() => setShowDeletePassword(!showDeletePassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            {showDeletePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-3 justify-center w-full mt-2">
                        <button 
                          onClick={() => { setDeleteState('idle'); setDeletePassword(''); setDeleteError(''); }}
                          className="px-6 py-2 rounded-full text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 font-semibold text-sm transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={requestDelete}
                          disabled={isDeleting || !deletePassword}
                          className="px-6 py-2 rounded-full text-white bg-red-600 hover:bg-red-700 font-semibold text-sm transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? 'Verifying...' : 'Verify Password'}
                        </button>
                      </div>
                      {deleteError && <p className="text-xs text-red-500 text-center w-full mt-1">{deleteError}</p>}
                    </div>
                  )}

                  {deleteState === 'verifying' && (
                    <div className="flex flex-col items-center w-full gap-3 p-4 bg-red-50/50 dark:bg-red-500/5 rounded-xl border border-red-100 dark:border-red-500/20">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium text-center">We sent a 6-digit verification code to your email. Enter it below to confirm deletion.</p>
                      <div className="flex gap-3 items-center w-full max-w-sm">
                        <div className="relative flex-1">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="6-Digit OTP" 
                            value={deleteOtp}
                            onChange={(e) => setDeleteOtp(e.target.value.trim())}
                            className="w-full pl-9 pr-24 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white text-sm"
                          />
                          <button
                            onClick={requestDelete}
                            disabled={timer > 0 || isDeleting}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-base font-semibold text-trust-blue hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-2">
                        <button 
                          onClick={() => { setDeleteState('idle'); setDeleteOtp(''); setDeleteError(''); }}
                          className="px-6 py-2 rounded-full text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 font-semibold text-sm transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={verifyDelete}
                          disabled={isDeleting || deleteOtp.length < 6}
                          className="px-6 py-2 rounded-full text-white bg-red-600 hover:bg-red-700 font-semibold text-sm transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? 'Verifying...' : 'Verify & Delete'}
                        </button>
                      </div>
                      {deleteError && <p className="text-xs text-red-500 text-center w-full mt-1">{deleteError}</p>}
                    </div>
                  )}
                </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-12">
      <div className="glass-card p-8 bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 transition-colors duration-300 flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 border border-blue-100 dark:border-slate-600 transition-colors">
          <UserCircle size={32} className="text-trust-blue dark:text-blue-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Welcome!</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm text-center mb-8 transition-colors">
          Please sign in to view your profile and sync your medical history across your devices.
        </p>

        <div className="w-full flex flex-col gap-4">
          <button 
            onClick={() => setShowAuthModal(true)}
            className="mt-4 w-full bg-trust-blue hover:opacity-90 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
          >
            Sign In
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
