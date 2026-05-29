'use client';

import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, CheckCircle2, Upload, Video, ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/useStore';
import { validateImage } from '@/lib/api';

import { compressImage } from '@/lib/imageUtils';

export function CameraView() {
  const { t } = useTranslation();
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setCapturedImage, nextStep } = useStore();
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const capture = useCallback(() => {
    setIsScanning(true);
    // Simulate holographic scanning wait before capture
    setTimeout(async () => {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        try {
          const compressed = await compressImage(imageSrc);
          setLocalImage(compressed);
        } catch (error) {
          console.error("Compression failed:", error);
          setLocalImage(imageSrc);
        }
      }
      setIsScanning(false);
    }, 1500);
  }, [webcamRef]);

  const confirm = async () => {
    if (!localImage) return;
    setIsValidating(true);
    const isValid = await validateImage(localImage);
    setIsValidating(false);
    if (!isValid) {
      alert("Safety Check Failed: We could not detect enough skin in this photo. Please ensure you take a close-up, clear photo of human skin.");
      setLocalImage(null);
      return;
    }
    setCapturedImage(localImage);
    nextStep();
  };

  const retake = () => {
    setLocalImage(null);
    setIsCameraEnabled(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const original = reader.result as string;
          const compressed = await compressImage(original);
          setLocalImage(compressed);
        } catch (error) {
          console.error("Compression failed:", error);
          setLocalImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto mt-6 glass-card p-6 bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 transition-colors duration-300 relative overflow-hidden">
      <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white transition-colors">{t('hero.title')}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center transition-colors">Select how you want to upload your photo for analysis.</p>
      
      <div className="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-gray-200 dark:border-slate-700">
        {!localImage ? (
          <>
            {isCameraEnabled ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "environment" }}
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => setIsCameraEnabled(false)}
                  className="absolute top-4 left-4 w-10 h-10 bg-black/50 hover:bg-black/70 flex items-center justify-center rounded-full text-white backdrop-blur-md transition-colors z-30 shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:scale-95"
                >
                  <ArrowLeft size={20} />
                </button>
              </>
            ) : (
               <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-slate-900 absolute inset-0 gap-4 transition-colors">
                  <Camera size={48} className="text-gray-300 dark:text-slate-700" />
                  <div className="flex flex-col gap-3 w-3/4 max-w-xs">
                     <button 
                       onClick={() => setIsCameraEnabled(true)}
                       className="w-full py-3 bg-trust-blue hover:opacity-90 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95 text-sm"
                     >
                       <Video size={16} /> Enable Camera
                     </button>
                     <div className="flex items-center gap-2 w-full text-xs text-gray-400 font-bold uppercase">
                        <span className="flex-1 h-px bg-gray-200 dark:bg-slate-800"></span> OR <span className="flex-1 h-px bg-gray-200 dark:bg-slate-800"></span>
                     </div>
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-trust-blue dark:hover:border-trust-blue text-gray-700 dark:text-slate-300 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
                     >
                       <Upload size={16} /> Upload JPG
                     </button>
                     <input 
                       type="file" 
                       accept="image/*" 
                       className="hidden" 
                       ref={fileInputRef} 
                       onChange={handleFileUpload} 
                     />
                  </div>
               </div>
            )}
            
            {/* Outline markers */}
            <div className="absolute inset-4 border-2 border-dashed border-white/40 rounded-lg pointer-events-none" />
            
            {/* Holographic scanner overlay */}
            <AnimatePresence>
              {isScanning && (
                <motion.div 
                  initial={{ top: '0%', opacity: 0 }}
                  animate={{ top: ['0%', '100%', '0%'], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                  className="absolute left-0 right-0 h-1 bg-[var(--color-trust-blue)] shadow-[0_0_15px_3px_#2056b3] z-10 pointer-events-none"
                />
              )}
            </AnimatePresence>

            {isScanning && (
               <div className="absolute inset-0 bg-trust-blue/20 flex flex-col items-center justify-center z-20 backdrop-blur-sm pointer-events-none">
                 <div className="w-16 h-16 border-4 border-t-white border-white/20 rounded-full animate-spin mb-4" />
                 <span className="text-white font-bold tracking-widest uppercase">{t('camera.scanning')}</span>
               </div>
            )}
          </>
        ) : (
          <img src={localImage} alt="Captured" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="mt-8 flex gap-4 w-full">
        {!localImage && isCameraEnabled && (
          <button 
            onClick={capture}
            disabled={isScanning}
            className="flex-1 min-h-[48px] bg-[#2056b3] hover:opacity-90 text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-75 shadow-md"
          >
            <Camera size={20} />
            SCAN
          </button>
        )}
        {localImage && (
          <>
            <button 
              onClick={retake}
              className="flex-1 min-h-[48px] bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw size={20} />
              {t('camera.retake')}
            </button>
            <button 
              onClick={confirm}
              disabled={isValidating}
              className="flex-1 min-h-[48px] bg-[#28a745] hover:opacity-90 text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isValidating ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
              {isValidating ? 'Validating...' : t('camera.confirm')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
