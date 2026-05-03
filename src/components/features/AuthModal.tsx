import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, KeyRound, UserCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { API_URL } from '@/lib/config';

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, loginUser } = useStore();
  const [mode, setMode] = useState<'signin' | 'signup' | 'verify' | 'forgot-password' | 'reset-password'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (showAuthModal) {
      setMode('signin');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setOtp('');
      setOtpVerified(false);
      setError('');
      setTimer(60);
    }
  }, [showAuthModal]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if ((mode === 'verify' || mode === 'reset-password') && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timer]);

  const handleResend = async () => {
    setError('');
    try {
      const endpoint = (mode === 'reset-password' || mode === 'forgot-password') ? '/auth/forgot-password' : '/auth/resend-otp';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to resend code');
      setTimer(60);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await fetch(`${API_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Signup failed');
        setTimer(60);
        setMode('verify');
      } else if (mode === 'signin') {
        const res = await fetch(`${API_URL}/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Signin failed');
        setTimer(60);
        setMode('verify');
      } else if (mode === 'verify') {
        const res = await fetch(`${API_URL}/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Verification failed');
        
        loginUser(data.name || email.split('@')[0], email);
        setShowAuthModal(false);
      } else if (mode === 'forgot-password') {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to send reset code');
        setTimer(60);
        setOtpVerified(false);
        setMode('reset-password');
      } else if (mode === 'reset-password' && !otpVerified) {
        const res = await fetch(`${API_URL}/auth/verify-reset-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Invalid or expired OTP');
        
        setOtpVerified(true);
      } else if (mode === 'reset-password' && otpVerified) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const res = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, new_password: password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to reset password');
        
        alert('Password reset successfully! Please sign in with your new password.');
        setPassword('');
        setConfirmPassword('');
        setOtp('');
        setOtpVerified(false);
        setMode('signin');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative border border-gray-200 dark:border-slate-800"
        >
          <button 
            onClick={() => setShowAuthModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>

          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : mode === 'verify' ? 'Verify Email' : mode === 'forgot-password' ? 'Reset Password' : 'New Password'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              {mode === 'verify' 
                ? 'We sent a 6-digit code to your email. Please enter it below.' 
                : mode === 'forgot-password'
                ? 'Enter your email address to receive a password reset code.'
                : mode === 'reset-password' && !otpVerified
                ? 'Enter the 6-digit code sent to your email to continue.'
                : mode === 'reset-password' && otpVerified
                ? 'Your code has been verified. Please enter your new password.'
                : 'Secure access to your AI symptom analysis and history.'}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/50">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-trust-blue text-gray-900 dark:text-white"
                  />
                </div>
              )}
              {(mode === 'signin' || mode === 'signup' || mode === 'forgot-password') && (
                <>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-trust-blue text-gray-900 dark:text-white"
                    />
                  </div>
                </>
              )}
              {(mode === 'signin' || mode === 'signup' || (mode === 'reset-password' && otpVerified)) && (
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      required
                      placeholder={mode === 'reset-password' ? "New Password" : "Password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-trust-blue text-gray-900 dark:text-white"
                    />
                  </div>
                  {mode === 'reset-password' && otpVerified && (
                    <div className="relative mt-4">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        required
                        placeholder="Re-enter New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-trust-blue text-gray-900 dark:text-white"
                      />
                    </div>
                  )}
                  {mode === 'signin' && (
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => { setError(''); setMode('forgot-password'); }}
                        className="text-sm text-trust-blue hover:underline font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {(mode === 'verify' || mode === 'reset-password') && (
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="6-Digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={mode === 'reset-password' && otpVerified}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-trust-blue text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {(!otpVerified || mode === 'verify') && (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={timer > 0}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-trust-blue hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-trust-blue hover:bg-blue-700 text-white font-medium rounded-xl transition-colors mt-2"
              >
                {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : mode === 'forgot-password' ? 'Send Reset Code' : mode === 'reset-password' && !otpVerified ? 'Verify Code' : mode === 'reset-password' && otpVerified ? 'Reset Password' : 'Verify Code'}
              </button>
            </form>

            {(mode === 'signin' || mode === 'signup') && (
              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => { setError(''); setMode(mode === 'signin' ? 'signup' : 'signin'); }}
                  className="text-trust-blue hover:underline font-medium"
                >
                  {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            )}
            {(mode === 'forgot-password' || mode === 'reset-password') && (
              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                <button
                  type="button"
                  onClick={() => { setError(''); setOtpVerified(false); setMode('signin'); }}
                  className="text-trust-blue hover:underline font-medium"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
