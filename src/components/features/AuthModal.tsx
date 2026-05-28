import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, KeyRound, UserCircle, Eye, EyeOff, Loader } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { API_URL } from '@/lib/config';

const InteractiveMonkey = ({ 
  activeField, 
  inputValue, 
  showPassword,
  showConfirmPassword,
  mode,
  error,
  success,
  otpVerified
}: { 
  activeField: string, 
  inputValue: string, 
  showPassword: boolean,
  showConfirmPassword: boolean,
  mode: string,
  error?: string,
  success?: string,
  otpVerified?: boolean
}) => {
  const [showGreeting, setShowGreeting] = useState(true);
  const [cursorPos, setCursorPos] = useState(0);

  // If there's an error or success, always show the bubble. Otherwise show greetings on login/signup and OTP screens.
  const isBubbleVisible = !!error || !!success || (showGreeting && (
    mode === 'signin' || 
    mode === 'signup' || 
    mode === 'verify' || 
    (mode === 'reset-password' && !otpVerified)
  ));

  useEffect(() => {
    // Reset greeting on mode switch, hide after 3 seconds
    setShowGreeting(true);
    const timer = setTimeout(() => setShowGreeting(false), 3000);
    return () => clearTimeout(timer);
  }, [mode]);

  useEffect(() => {
    // Hide greeting (but not errors or success) when typing
    if (activeField !== 'none' && !error && !success) {
      setShowGreeting(false);
    }
  }, [activeField, error, success]);

  // Track the actual caret/cursor position instead of just total string length
  useEffect(() => {
    const updateCursor = () => {
      if (document.activeElement instanceof HTMLInputElement) {
        try {
          if (document.activeElement.type === 'email' || document.activeElement.type === 'number') {
            setCursorPos(document.activeElement.value.length);
          } else {
            setCursorPos(document.activeElement.selectionStart ?? document.activeElement.value.length);
          }
        } catch (e) {
          setCursorPos(document.activeElement.value.length);
        }
      }
    };
    
    updateCursor();
    
    document.addEventListener('keyup', updateCursor);
    document.addEventListener('click', updateCursor);
    document.addEventListener('input', updateCursor);
    
    return () => {
      document.removeEventListener('keyup', updateCursor);
      document.removeEventListener('click', updateCursor);
      document.removeEventListener('input', updateCursor);
    };
  }, [activeField]);
  let pupilX = 0;
  let pupilY = 0;
  let headX = 0;
  let headY = 0;
  let handsUp = false;

  if (activeField === 'password' || activeField === 'confirmPassword') {
    if ((activeField === 'password' && !showPassword) || (activeField === 'confirmPassword' && !showConfirmPassword)) {
      handsUp = true;
    } else {
      pupilY = activeField === 'confirmPassword' ? 18 : 14;
      headY = activeField === 'confirmPassword' ? 12 : 10;
      const length = cursorPos;
      const maxOffset = 14;
      const headMaxOffset = 8;
      const percent = Math.min(length / 22, 1);
      pupilX = (percent * (maxOffset * 2)) - maxOffset;
      headX = (percent * (headMaxOffset * 2)) - headMaxOffset;
    }
  } else if (activeField !== 'none' && activeField !== 'gender') {
    if (activeField === 'name') {
      pupilY = 6;
      headY = 4;
    } else if (activeField === 'email') {
      pupilY = 10;
      headY = 8;
    } else {
      pupilY = 10;
      headY = 8;
    }
    const length = cursorPos;
    const maxOffset = 14;
    const headMaxOffset = 8;
    const percent = Math.min(length / 22, 1);
    pupilX = (percent * (maxOffset * 2)) - maxOffset;
    headX = (percent * (headMaxOffset * 2)) - headMaxOffset;
  }

  return (
    <div className="relative w-32 h-32 mx-auto pointer-events-none select-none">
      <AnimatePresence>
        {isBubbleVisible && (
          <motion.div
            key={error || mode}
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className={`absolute -top-8 left-1/2 -translate-x-1/2 md:top-4 md:left-[90%] md:-translate-x-0 z-20 px-3 py-1.5 rounded-2xl md:rounded-bl-none shadow-[0_4px_15px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_15px_rgba(0,0,0,0.5)] text-sm font-bold border whitespace-nowrap origin-bottom md:origin-bottom-left ${
              error 
                ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' 
                : success
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                  : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border-gray-100 dark:border-slate-700'
            }`}
          >
            {error 
              ? `Oops! ${error} 🙈`
              : success
                ? `${success} 🌟`
                : mode === 'signup' 
                  ? 'Hi there! 👋' 
                  : (mode === 'forgot-password' || mode === 'reset-password' || mode === 'verify')
                    ? 'Check inbox or spam folder 📬'
                    : 'Love to see you again! 👋'
            }
          </motion.div>
        )}
      </AnimatePresence>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-full h-full">
        <defs>
          <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000000" floodOpacity="0.5"/>
          </filter>

          <linearGradient id="ear-inner-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f3c6a5"/>
            <stop offset="100%" stopColor="#df9b70"/>
          </linearGradient>

          <linearGradient id="face-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff4dd"/>
            <stop offset="70%" stopColor="#fce2be"/>
            <stop offset="100%" stopColor="#f5ca99"/>
          </linearGradient>

          <linearGradient id="fur-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a4633b"/>
            <stop offset="40%" stopColor="#8a4925"/>
            <stop offset="100%" stopColor="#5c2e14"/>
          </linearGradient>

          <linearGradient id="highlight-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d68d5b" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#a4633b" stopOpacity="0"/>
          </linearGradient>

          <radialGradient id="blush">
            <stop offset="0%" stopColor="#ff7356" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#ff7356" stopOpacity="0"/>
          </radialGradient>
        </defs>

        <g filter="url(#drop-shadow)">
          
          {/* Static Head Base */}
          <path d="M 90 260 C 50 260, 40 180, 90 170 C 110 130, 170 90, 256 90 C 342 90, 402 130, 422 170 C 472 180, 462 260, 422 260 C 425 340, 345 395, 256 395 C 167 395, 87 340, 90 260 Z" fill="#23130a" />

          {/* Ears (Parallax - moves in opposite direction to create 3D sphere illusion) */}
          <motion.g 
            animate={{ x: -headX * 0.6, y: -headY * 0.4 }} 
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <circle cx="105" cy="215" r="50" fill="url(#fur-grad)" stroke="#23130a" strokeWidth="12" />
            <path d="M 115 180 C 80 180, 75 245, 115 250 C 130 250, 135 180, 115 180 Z" fill="url(#ear-inner-grad)" stroke="#4d240c" strokeWidth="6" />
            <circle cx="407" cy="215" r="50" fill="url(#fur-grad)" stroke="#23130a" strokeWidth="12" />
            <path d="M 397 180 C 432 180, 437 245, 397 250 C 382 250, 377 180, 397 180 Z" fill="url(#ear-inner-grad)" stroke="#4d240c" strokeWidth="6" />
          </motion.g>

          {/* Base Head Sphere (Static) */}
          <path d="M 256 100 C 150 100, 100 150, 100 245 C 100 340, 150 385, 256 385 C 362 385, 412 340, 412 245 C 412 150, 362 100, 256 100 Z" fill="url(#fur-grad)" />

          {/* Hair Tuft (Parallax - moves faster to feel closer) */}
          <motion.g 
            animate={{ x: headX * 0.6, y: headY * 0.6 }} 
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <path d="M 230 105 Q 256 75, 275 102 Q 295 85, 305 110" fill="none" stroke="#23130a" strokeWidth="14" strokeLinecap="round" />
            <path d="M 230 105 Q 256 75, 275 102 Q 295 85, 305 110 Z" fill="url(#fur-grad)" />
          </motion.g>

          {/* Forehead Highlight (Parallax) */}
          <motion.g 
            animate={{ x: headX * 0.5, y: headY * 0.3 }} 
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <path d="M 140 140 C 190 112, 300 110, 360 135 C 330 120, 200 115, 140 140 Z" fill="url(#highlight-grad)" />
          </motion.g>

          {/* Tracking Face Features */}
          <motion.g 
            animate={{ x: headX, y: headY, rotate: headX * 0.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ transformOrigin: '256px 256px' }}
          >
            {/* Face Mask Base */}
            <path d="M 256 185 
                     C 290 140, 385 145, 385 220 
                     C 385 305, 350 360, 256 360 
                     C 162 360, 127 305, 127 220 
                     C 127 145, 222 140, 256 185 Z" 
                  fill="url(#face-grad)" stroke="#23130a" strokeWidth="12" strokeLinejoin="round" />

            {/* Blushes */}
            <circle cx="165" cy="275" r="22" fill="url(#blush)" />
            <circle cx="347" cy="275" r="22" fill="url(#blush)" />

            {/* Left Eye */}
            <motion.g animate={{ x: pupilX, y: pupilY }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <rect x="180" y="200" width="36" height="48" rx="18" fill="#23130a" />
              <circle cx="190" cy="212" r="7" fill="#ffffff" />
              <circle cx="196" cy="228" r="3.5" fill="#ffffff" />
            </motion.g>

            {/* Right Eye */}
            <motion.g animate={{ x: pupilX, y: pupilY }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <rect x="296" y="200" width="36" height="48" rx="18" fill="#23130a" />
              <circle cx="306" cy="212" r="7" fill="#ffffff" />
              <circle cx="312" cy="228" r="3.5" fill="#ffffff" />
            </motion.g>

            {/* Snout */}
            <ellipse cx="256" cy="246" rx="8" ry="5" fill="#4d240c" />
            <path 
              d={error 
                ? "M 234 276 Q 256 252, 278 276" // More curved sad pout
                : "M 226 262 Q 241 276, 256 264 Q 271 276, 286 262" // Happy W-mouth
              } 
              fill="none" stroke="#23130a" strokeWidth="10" strokeLinecap="round" 
            />
          </motion.g>

          {/* Hands covering eyes */}
          <motion.g 
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: handsUp ? -50 : 200, opacity: handsUp ? 1 : 0 }} 
            transition={{ 
              y: { type: 'spring', stiffness: 120, damping: 14, mass: 1.2 },
              opacity: { duration: 0.1 }
            }}
          >
            {/* Left Arm (scalloped fingers) */}
            <g transform="rotate(15 180 300)">
              {/* Outer arm */}
              <path d="M 135 430 L 135 255 A 15 15 0 0 1 165 255 A 15 15 0 0 1 195 255 A 15 15 0 0 1 225 255 L 225 430 A 45 45 0 0 1 135 430 Z" 
                    fill="url(#fur-grad)" stroke="#23130a" strokeWidth="12" strokeLinejoin="round" />
              {/* Inner pad */}
              <path d="M 150 335 L 150 265 A 10 10 0 0 1 170 265 A 10 10 0 0 1 190 265 A 10 10 0 0 1 210 265 L 210 335 A 30 30 0 0 1 150 335 Z" 
                    fill="url(#ear-inner-grad)" />
              {/* Finger cuts */}
              <path d="M 165 255 L 168 285" stroke="#23130a" strokeWidth="8" strokeLinecap="round" fill="none" />
              <path d="M 195 255 L 192 285" stroke="#23130a" strokeWidth="8" strokeLinecap="round" fill="none" />
            </g>
            
            {/* Right Arm (scalloped fingers) */}
            <g transform="rotate(-15 332 300)">
              {/* Outer arm */}
              <path d="M 287 430 L 287 255 A 15 15 0 0 1 317 255 A 15 15 0 0 1 347 255 A 15 15 0 0 1 377 255 L 377 430 A 45 45 0 0 1 287 430 Z" 
                    fill="url(#fur-grad)" stroke="#23130a" strokeWidth="12" strokeLinejoin="round" />
              {/* Inner pad */}
              <path d="M 302 335 L 302 265 A 10 10 0 0 1 322 265 A 10 10 0 0 1 342 265 A 10 10 0 0 1 362 265 L 362 335 A 30 30 0 0 1 302 335 Z" 
                    fill="url(#ear-inner-grad)" />
              {/* Finger cuts */}
              <path d="M 317 255 L 320 285" stroke="#23130a" strokeWidth="8" strokeLinecap="round" fill="none" />
              <path d="M 347 255 L 344 285" stroke="#23130a" strokeWidth="8" strokeLinecap="round" fill="none" />
            </g>
          </motion.g>

        </g>
      </svg>
    </div>
  );
};

export function AuthModal() {
  const { showAuthModal, authMode, setShowAuthModal, loginUser } = useStore();
  const [mode, setMode] = useState<'signin' | 'signup' | 'verify' | 'forgot-password' | 'reset-password'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [activeField, setActiveField] = useState<'none' | 'name' | 'email' | 'password' | 'confirmPassword' | 'otp' | 'gender'>('none');

  const getInputValue = () => {
    if (activeField === 'name') return name;
    if (activeField === 'email') return email;
    if (activeField === 'password') return password;
    if (activeField === 'confirmPassword') return confirmPassword;
    if (activeField === 'otp') return otp;
    return '';
  };

  useEffect(() => {
    if (showAuthModal) {
      setMode(authMode);
      setName('');
      setEmail('');
      setPassword('');
      setGender('');
      setConfirmPassword('');
      setOtp('');
      setOtpVerified(false);
      setError('');
      setSuccess('');
      setTimer(60);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [showAuthModal, authMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if ((mode === 'verify' || mode === 'reset-password') && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timer]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (error) {
      timeout = setTimeout(() => {
        setError('');
      }, 1500);
    }
    return () => clearTimeout(timeout);
  }, [error]);

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
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const res = await fetch(`${API_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, gender })
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
        
        setSuccess('Success!');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        loginUser(data.name || email.split('@')[0], email, data.gender, data.patientId);
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
        setShowPassword(false);
        setShowConfirmPassword(false);
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
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md relative border border-gray-200 dark:border-slate-800"
        >
          <button 
            onClick={() => setShowAuthModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>

          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : mode === 'verify' ? 'Verify Email' : mode === 'forgot-password' ? 'Reset Password' : 'New Password'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm text-center">
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

            <div className="flex justify-center mb-6 mt-14 md:mt-4 h-32 items-center">
               <InteractiveMonkey 
                 activeField={activeField} 
                 inputValue={getInputValue()} 
                 showPassword={showPassword} 
                 showConfirmPassword={showConfirmPassword} 
                 mode={mode}
                 error={error}
                 success={success}
                 otpVerified={otpVerified}
               />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setActiveField('name')}
                      onBlur={() => setActiveField('none')}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-trust-blue text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      onFocus={() => setActiveField('gender')}
                      onBlur={() => setActiveField('none')}
                      required
                      className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-trust-blue appearance-none cursor-pointer ${gender === '' ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}
                    >
                      <option value="" disabled hidden>Gender</option>
                      <option value="Male" className="text-gray-900 dark:text-white">Male</option>
                      <option value="Female" className="text-gray-900 dark:text-white">Female</option>
                      <option value="Prefer not to say" className="text-gray-900 dark:text-white">Prefer not to say</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </>
              )}
              {(mode === 'signin' || mode === 'signup' || mode === 'forgot-password' || (mode === 'reset-password' && otpVerified)) && (
                <>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      inputMode="email"
                      required
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trim())}
                      onInvalid={(e) => {
                        if (!(e.target as HTMLInputElement).value.includes('@')) {
                          (e.target as HTMLInputElement).setCustomValidity(`Please include an '@' in the email address. '${(e.target as HTMLInputElement).value}' is missing an '@'.`);
                        }
                      }}
                      onInput={(e) => {
                        (e.target as HTMLInputElement).setCustomValidity("");
                      }}
                      onFocus={() => setActiveField('email')}
                      onBlur={() => setActiveField('none')}
                      autoComplete="off"
                      disabled={mode === 'reset-password' && otpVerified}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-trust-blue text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </>
              )}
              {(mode === 'signin' || mode === 'signup' || (mode === 'reset-password' && otpVerified)) && (
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder={mode === 'reset-password' ? "New Password (min 6 chars)" : "Password (min 6 chars)"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setActiveField('password')}
                      onBlur={() => setActiveField('none')}
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-trust-blue text-gray-900 dark:text-white [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {((mode === 'signup') || (mode === 'reset-password' && otpVerified)) && (
                    <div className="relative mt-4">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder={mode === 'signup' ? "Confirm Password" : "Re-enter New Password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setActiveField('confirmPassword')}
                        onBlur={() => setActiveField('none')}
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-trust-blue text-gray-900 dark:text-white [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  )}
                  {mode === 'signin' && (
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => { setError(''); setEmail(''); setPassword(''); setMode('forgot-password'); }}
                        className="text-sm text-trust-blue hover:underline font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {(mode === 'verify' || (mode === 'reset-password' && !otpVerified)) && (
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="6-Digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.trim())}
                    onFocus={() => setActiveField('otp')}
                    onBlur={() => setActiveField('none')}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-trust-blue text-gray-900 dark:text-white"
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
                className="w-full py-2.5 bg-trust-blue hover:bg-blue-700 text-white font-medium rounded-xl transition-colors mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>Processing <Loader size={18} className="animate-spin" /></>
                ) : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : mode === 'forgot-password' ? 'Send Reset Code' : mode === 'reset-password' && !otpVerified ? 'Verify Code' : mode === 'reset-password' && otpVerified ? 'Reset Password' : 'Verify Code'}
              </button>
            </form>

            {(mode === 'signin' || mode === 'signup') && (
              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => { setError(''); setEmail(''); setPassword(''); setName(''); setConfirmPassword(''); setMode(mode === 'signin' ? 'signup' : 'signin'); }}
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
                  onClick={() => { setError(''); setEmail(''); setPassword(''); setOtpVerified(false); setMode('signin'); }}
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
