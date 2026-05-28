import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TriageStatus = 'Routine' | 'See Doctor' | 'Seek Care Today' | null;

export interface SurveyData {
  duration: string;
  pain: string;
  spreading: string;
  history: string;
  fever: string;
}

export type ViewState = 'dashboard' | 'analysis' | 'profile' | 'history';

export interface User {
  name: string;
  email: string;
  patientId: string;
  gender?: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  patientId: string;
  patientName: string;
  conditionName: string;
  urgency: TriageStatus;
  surveyData: SurveyData;
  geaSummary?: string;
  geaDetails?: string;
  image_data?: string;
}

export interface AppState {
  // Navigation & Auth
  currentView: ViewState;
  user: User | null;
  historyLogs: MedicalRecord[];
  isSidebarOpen: boolean;
  showAuthModal: boolean;
  authMode: 'signin' | 'signup';
  showLogoutConfirm: boolean;
  setCurrentView: (view: ViewState) => void;
  setShowAuthModal: (show: boolean, mode?: 'signin' | 'signup') => void;
  setShowLogoutConfirm: (show: boolean) => void;
  loginUser: (name: string, email: string, gender?: string) => void;
  logoutUser: () => void;
  toggleSidebar: () => void;

  // Analysis State
  currentStep: number;
  capturedImage: string | null;
  surveyData: SurveyData;
  triageResult: TriageStatus;
  conditionName: string | null;
  geaSummary: string | null;
  geaDetails: string | null;
  isProcessing: boolean;
  
  // Global Modals
  isFeedbackModalOpen: boolean;
  setFeedbackModalOpen: (open: boolean) => void;
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setCapturedImage: (image: string | null) => void;
  updateSurvey: (data: Partial<SurveyData>) => void;
  setTriageResult: (status: TriageStatus, conditionName?: string, geaSummary?: string, geaDetails?: string) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  resetFlow: () => void;
}

const initialSurveyData = {
  duration: '',
  pain: '',
  spreading: '',
  history: '',
  fever: ''
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation & Auth Initial State
      currentView: 'dashboard',
      user: null,
      historyLogs: [],
      isSidebarOpen: false,
      showAuthModal: false,
      authMode: 'signin',
      showLogoutConfirm: false,
      setCurrentView: (view) => set({ currentView: view }),
      setShowAuthModal: (show, mode = 'signin') => set({ showAuthModal: show, authMode: mode }),
      setShowLogoutConfirm: (show) => set({ showLogoutConfirm: show }),
      loginUser: (name, email, gender) => {
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
          hash = ((hash << 5) - hash) + email.charCodeAt(i);
          hash = hash & hash;
        }
        const patientId = `PT-${(Math.abs(hash) % 900000) + 100000}`;
        set({ user: { name, email, patientId, gender: gender || 'Prefer not to say' } });
      },
      logoutUser: () => set({ user: null }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      // Analysis Initial State
      currentStep: 0,
      capturedImage: null,
      surveyData: initialSurveyData,
      triageResult: null,
      conditionName: null,
      geaSummary: null,
      geaDetails: null,
      isProcessing: false,
      isFeedbackModalOpen: false,
      setFeedbackModalOpen: (open) => set({ isFeedbackModalOpen: open }),

      // Analysis Actions
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
      setCapturedImage: (image) => set({ capturedImage: image }),
      updateSurvey: (data) => set((state) => ({ surveyData: { ...state.surveyData, ...data } })),
      setTriageResult: (status, conditionName, geaSummary, geaDetails) => set((state) => {
        let newLogs = state.historyLogs;
        
        // Log to history if valid condition is generated
        if (status && conditionName) {
            const newRecord: MedicalRecord = {
               id: `REC-${Math.random().toString(36).substr(2, 9)}`,
               date: new Date().toISOString(),
               patientId: state.user ? state.user.patientId : 'Anonymous',
               patientName: state.user ? state.user.name : 'Guest User',
               conditionName: conditionName,
               urgency: status,
               surveyData: state.surveyData,
               geaSummary: geaSummary,
               geaDetails: geaDetails,
               image_data: state.capturedImage || undefined
            };
            newLogs = [newRecord, ...state.historyLogs];
        }

        return { 
          triageResult: status, 
          historyLogs: newLogs,
          ...(conditionName ? { conditionName } : {}),
          ...(geaSummary ? { geaSummary } : {}),
          ...(geaDetails ? { geaDetails } : {})
        };
      }),
      setIsProcessing: (isProcessing) => set({ isProcessing }),
      resetFlow: () => set({
        currentStep: 0,
        capturedImage: null,
        surveyData: initialSurveyData,
        triageResult: null,
        conditionName: null,
        geaSummary: null,
        geaDetails: null,
        isProcessing: false
      })
    }),
    {
      name: 'derma-guide-storage', // unique name for localStorage key
      partialize: (state) => ({ user: state.user, historyLogs: state.historyLogs }), // persist user and logs
    }
  )
);
