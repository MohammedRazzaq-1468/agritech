# AgriSmart AI – Intelligent Agriculture Crop Advisory Assistant

[![Full-Stack Production Ready](https://img.shields.io/badge/status-production--grade-emerald.svg)](#)
[![Google GenAI SDK](https://img.shields.io/badge/Google%20GenAI%20SDK-%40google%2Fgenai%20v3.0.0-blue.svg)](https://www.npmjs.com/package/@google/genai)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B%20LTS-green.svg)](https://nodejs.org/)
[![React 18](https://img.shields.io/badge/React-18%20%2B%20Vite-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase PostgreSQL](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20RLS-3ecf8e.svg)](https://supabase.com/)

---

## 1. Project Overview

**AgriSmart AI** is a production-grade, full-stack, AI-powered agricultural advisory assistant engineered specifically for Indian smallholder and commercial farmers. 

The system combines:
$$\text{Farmer Input} + \text{Soil Laboratory Tests} + \text{Verified Satellite Meteorology} + \text{Gemini 2.5 AI} = \text{Actionable Precision Advisory}$$

It solves critical agronomic challenges:
- **Which crop to grow:** AI evaluates soil type, season (Kharif, Rabi, Zaid), land area, and water resources to prescribe high-yielding crop varieties.
- **Crop Disease Diagnosis:** Multimodal visual pathology of uploaded plant leaf photographs, determining pathogen type (fungal, bacterial, viral, pest), severity, and IPM remediation.
- **Nutrient & Fertilizer Optimization:** Translates soil lab tests (pH, N, P, K, Organic Carbon) into balanced fertilization schedules and bio-fertilizer plans.
- **Dynamic Irrigation:** Weather-linked evapotranspiration guidance to conserve water and prevent root rot.
- **24/7 AI Agronomist Chat:** Conversational assistance in simple farmer-friendly language.

---

## 2. Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS v3, Lucide React icons, React Router DOM, Axios, Recharts, date-fns.
- **Backend:** Node.js (v20+ LTS), Express.js (ES Modules), Helmet, CORS, Express-Rate-Limit, Multer (Memory Storage with magic byte validation), Zod validation.
- **Database & Auth:** Supabase PostgreSQL 16+, Supabase Authentication (JWT handling), Row Level Security (RLS) policies on all tables.
- **AI Engine:** Official Google GenAI SDK (`@google/genai` v3.0.0), `gemini-2.5-flash`, structured JSON responses (`responseSchema`), agronomist system instruction.
- **Weather Provider:** Open-Meteo Verified Global Meteorological Service (live forecasts, precipitation probabilities, agro-weather alerts).

---

## 3. Architecture & Folder Structure

```text
agrismart-ai/
├── client/                        # React.js + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Button, Input, Select, Textarea, Card, Modal, EmptyState
│   │   │   ├── layout/            # Navbar, Sidebar, DashboardLayout, AuthLayout, ProtectedRoute
│   │   │   ├── dashboard/         # WelcomeCard, WeatherCard, QuickActionCard, RecentAdvisories
│   │   │   ├── crops/             # CropRecommendationForm, CropRecommendationCard
│   │   │   ├── disease/           # ImageUploader, DiseaseAnalysisCard
│   │   │   ├── soil/              # SoilAdvisoryForm, NutrientCard
│   │   │   └── chatbot/           # ChatWindow
│   │   ├── pages/
│   │   │   ├── public/            # LandingPage, AboutPage, NotFoundPage
│   │   │   ├── auth/              # LoginPage, RegisterPage, ForgotPasswordPage
│   │   │   ├── dashboard/         # DashboardPage, ProfilePage
│   │   │   ├── crops/             # CropRecommendationPage
│   │   │   ├── disease/           # DiseaseDetectionPage
│   │   │   ├── weather/           # WeatherDashboardPage
│   │   │   ├── soil/              # SoilAdvisoryPage
│   │   │   ├── irrigation/        # IrrigationPage
│   │   │   ├── chatbot/           # ChatbotPage
│   │   │   ├── history/           # AdvisoryHistoryPage, AdvisoryDetailsPage
│   │   │   ├── saved/             # SavedAdvisoriesPage
│   │   │   └── admin/             # AdminDashboardPage, AdminCropsPage, AdminArticlesPage
│   │   ├── services/              # Axios API client, Supabase client
│   │   ├── contexts/              # AuthContext (session, login, signup, role guards)
│   │   └── utils/                 # formatters
│   ├── .env.example
│   └── package.json
│
├── server/                        # Express.js + Node.js Backend
│   ├── src/
│   │   ├── config/                # env.js (Zod validated), supabase.js, gemini.js
│   │   ├── constants/             # indianAgri.js (30 states, soil types, seasons)
│   │   ├── controllers/           # crop, disease, soil, irrigation, weather, chat, admin
│   │   ├── middleware/            # requireAuth, requireAdmin, upload (magic bytes), rateLimiter, errorHandler
│   │   ├── routes/                # modular REST routes under /api/v1
│   │   ├── schemas/               # validation.js (Zod schemas for requests & Gemini outputs)
│   │   ├── services/
│   │   │   ├── gemini/            # geminiService.js (structured JSON, multimodal vision)
│   │   │   ├── weather/           # weatherService.js (Open-Meteo live API integration)
│   │   │   ├── crops/             # cropService.js
│   │   │   ├── disease/           # diseaseService.js
│   │   │   ├── soil/              # soilService.js
│   │   │   └── irrigation/        # irrigationService.js
│   │   ├── utils/                 # logger.js (redacts credentials)
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── supabase/
│   ├── migrations/                # 20261106000000_create_agrismart_schema.sql
│   ├── seed.sql                   # Indian crop varieties & agricultural articles
│   └── config.toml
│
├── docs/
│   ├── API.md                     # Complete REST API reference
│   ├── DATABASE.md                # Schema documentation & RLS policies
│   ├── SETUP.md                   # Local setup instructions
│   └── DEPLOYMENT.md              # Vercel, Render & Supabase deployment
│
├── .gitignore
├── package.json
└── README.md
```

---

## 4. Quick Start

### 1. Install Dependencies
```bash
# In server directory:
cd server
npm install

# In client directory:
cd ../client
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` in both `server/` and `client/` directories:
- `server/.env`: Set `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- `client/.env`: Set `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

### 3. Run Development Servers
Open two terminal tabs:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
# Running on http://localhost:5000 (Health check: /api/v1/health)
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

---

## 5. Security & Safety Principles

1. **Zero Client-Side Exposure:** `GEMINI_API_KEY` and database service credentials exist exclusively on the server side.
2. **Row Level Security:** Strict database isolation ensures farmers only read and modify their own records (`auth.uid() = user_id`).
3. **MIME & Magic-Byte Verification:** Uploaded plant photographs are inspected at the binary buffer header level to reject disguised executable files.
4. **IPM-First Advisory:** Advisories prioritize cultural and biological remedies before synthetic chemicals; chemical recommendations mandate PPE guidelines and Pre-Harvest Interval (PHI) compliance.
5. **Decision Support Transparency:** AI outputs are framed as educational decision support and never claim to guarantee yield or replace physical laboratory cultures.

---

## 6. Documentation Index

- [REST API Reference](docs/API.md)
- [Database Schema & RLS Policies](docs/DATABASE.md)
- [Local Setup & Configuration](docs/SETUP.md)
- [Production Cloud Deployment](docs/DEPLOYMENT.md)

---
© 2026 AgriSmart AI Engineering Team. Released under the MIT License.

