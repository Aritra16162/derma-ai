# Derma-Guide AI 🩺

Derma-Guide AI is an interactive, AI-powered progressive web application (PWA) designed to provide early, non-diagnostic skin condition triage and guidance. By combining edge-ready machine learning with rapid symptom surveying, Derma-Guide offers users instant feedback, urgency scoring, and next-step recommendations for dermatological concerns.

## 🌟 Key Features

- **AI Skin Classification**: Utilizes a customized TensorFlow MobileNetV2 model to analyze user-uploaded or camera-captured images for a variety of localized skin conditions (e.g., ringworm, impetigo, cellulitis).
- **Reactive Symptom Survey**: Pairs visual analysis with a dynamic clinical questionnaire (assessing pain, duration, spreading, and fever) to assign a realistic urgency modifier.
- **Smart Triage Engine**: Returns an algorithmic urgency status—_Routine_, _See Doctor_, or _Seek Care Today_—empowering users to make safer health decisions.
- **Persistent Medical History**: A fully isolated, local-first Zustand architectural store securely saves personal consultation history and survey logs across guest or authenticated sessions.
- **Beautiful Dark Mode UI**: Built with Next.js, Tailwind v4, and Framer Motion, featuring glassmorphism elements, CSS-animated starry backdrops, and interactive accordion-style widgets.

## 🏗️ Project Structure

```
derma-ai/
├── backend/                  # Python FastAPI Backend
│   ├── api/
│   │   └── routes.py         # API endpoint definitions
│   ├── ml/
│   │   └── vision.py         # TensorFlow model loading & inference
│   ├── schemas/
│   │   └── models.py         # Pydantic request/response models
│   ├── main.py               # App entry point (FastAPI instance)
│   ├── utils.py              # Triage heuristic logic
│   ├── train.py              # Model training script
│   ├── requirements.txt      # Python dependencies
│   ├── model.h5              # Trained model weights (gitignored)
│   └── class_indices.json    # Class label mapping
│
├── src/                      # Next.js Frontend (React 19)
│   ├── app/
│   │   ├── layout.tsx        # Root layout with providers
│   │   ├── page.tsx          # Main application page
│   │   └── globals.css       # Global styles & design tokens
│   ├── components/
│   │   ├── layout/           # Shell UI (Header, Sidebar)
│   │   ├── features/         # Domain modules (Survey, Triage, Camera)
│   │   └── ui/               # Shared utilities (Providers, etc.)
│   ├── store/
│   │   └── useStore.ts       # Zustand state management
│   ├── lib/
│   │   └── api.ts            # API client for backend communication
│   └── i18n/                 # Internationalization config
│
├── public/                   # Static assets (logos, manifest)
├── start.bat                 # One-click project launcher (Windows)
├── package.json              # Node.js dependencies
├── next.config.ts            # Next.js configuration + API proxy
├── tsconfig.json             # TypeScript configuration
└── .gitignore                # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.0
- **Python** >= 3.10
- **npm** (comes with Node.js)

### Quick Start (Windows)
Simply double-click `start.bat` in the project root. It will launch both the backend and frontend in separate terminal windows automatically.

### Manual Start

#### 1. Launch the Backend API
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
_The API will serve requests at `http://127.0.0.1:8000`._

#### 2. Launch the Frontend Application
In a separate terminal window from the project root:
```bash
npm install
npm run dev
```
_The application will be accessible at `http://localhost:3000`._

### Upload to GitHub
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

## 📋 Disclaimer

**Derma-Guide AI is strictly a decision-support tool, not a diagnostic medical device.** It focuses on safety, clarity, and accessibility, but its predictions are probabilistic. Users should always consult a licensed medical professional for formal diagnoses and treatment plans.

## 📄 License

This project is licensed under the Agnish and Aurithro License.
