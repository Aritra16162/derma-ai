import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { createPortal } from 'react-dom';

export function GlobalFeedback() {
  const { user, isFeedbackModalOpen, setFeedbackModalOpen } = useStore();
  const [mounted, setMounted] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        body: JSON.stringify({ email: user.email, name: user.name, feedback: feedbackText })
      });
      if (res.ok) {
        setFeedbackSuccess(true);
        setTimeout(() => {
          setFeedbackModalOpen(false);
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

  const handleOpen = () => {
    if (!user?.email) {
      alert("Please log in to submit feedback.");
      return;
    }
    setFeedbackModalOpen(true);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Feedback Modal Portal */}
      {createPortal(
        <AnimatePresence>
          {isFeedbackModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !isSubmitting && !feedbackSuccess && setFeedbackModalOpen(false)}
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
                    onClick={() => !isSubmitting && !feedbackSuccess && setFeedbackModalOpen(false)}
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
      )}
    </>
  );
}
