'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore, SurveyData } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Send, Loader } from 'lucide-react';
import { submitToTriage } from '@/lib/api';

const questions: { id: keyof SurveyData; i18nKey: string }[] = [
  { id: 'duration', i18nKey: 'duration' },
  { id: 'pain', i18nKey: 'pain' },
  { id: 'spreading', i18nKey: 'spreading' },
  { id: 'history', i18nKey: 'history' },
  { id: 'fever', i18nKey: 'fever' },
];

export function SurveyWizard() {
  const { t } = useTranslation();
  const { surveyData, updateSurvey, nextStep, prevStep, setTriageResult, setIsProcessing, isProcessing, capturedImage } = useStore();
  const [currentQIndex, setCurrentQIndex] = useState(0);

  const currentQ = questions[currentQIndex];
  const selectedValue = surveyData[currentQ.id];

  const handleSelect = (option: string) => {
    updateSurvey({ [currentQ.id]: option });
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    } else {
      prevStep();
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      const result = await submitToTriage(capturedImage, surveyData);
      
      // Compress the image AFTER analysis but before saving to state/database
      let finalImageToStore = capturedImage;
      if (capturedImage) {
        try {
          const { compressImage } = await import('@/lib/imageUtils');
          finalImageToStore = await compressImage(capturedImage);
        } catch(e) {
          console.error("Failed to compress image for storage", e);
        }
      }
      useStore.getState().setCapturedImage(finalImageToStore);
      
      setTriageResult(result.status, result.conditionName, result.geaSummary, result.geaDetails);
      nextStep();
    } catch (error: any) {
      if (error.message.includes("INVALID_IMAGE_DETECTED")) {
        alert("Safety Check Failed: The uploaded image does not appear to be a valid photo of human skin. Please upload a clearer image.");
        useStore.getState().setStep(0);
      } else {
        alert(error.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Typecasting the options from react-i18next which might arrive as readonly arrays
  const options = t(`survey.${currentQ.i18nKey}.options`, { returnObjects: true }) as string[];

  return (
    <div className="flex flex-col w-full max-w-md mx-auto mt-6 glass-card p-6 bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 transition-colors relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('survey.title')}</h2>
        <span className="text-sm font-semibold text-gray-400 dark:text-slate-500">
          {currentQIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="w-full bg-gray-200 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-[#2056b3] h-full transition-all duration-300"
          style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQIndex}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-slate-200 transition-colors">
              {t(`survey.${currentQ.i18nKey}.question`)}
            </h3>

            <div className="flex flex-col gap-3">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(option)}
                  className={`min-h-[48px] px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    selectedValue === option
                      ? 'border-[#2056b3] bg-blue-50 text-[#2056b3] dark:bg-trust-blue/20 dark:border-trust-blue/50 dark:text-blue-400 font-semibold shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex gap-4">
        <button 
          onClick={handleBack}
          disabled={isProcessing}
          className="flex-1 min-h-[48px] bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <ChevronLeft size={20} />
          {t('survey.back')}
        </button>
        <button 
          onClick={handleNext}
          disabled={!selectedValue || isProcessing}
          className="flex-1 min-h-[48px] bg-[#2056b3] hover:opacity-90 text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md"
        >
          {isProcessing ? (
            <>Processing <Loader size={20} className="animate-spin" /></>
          ) : currentQIndex === questions.length - 1 ? (
            <>
              {t('survey.submit')}
              <Send size={18} />
            </>
          ) : (
            <>
              {t('survey.next')}
              <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
