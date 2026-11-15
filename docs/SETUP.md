# AgriSmart AI – Local Development & Setup Guide

This guide details how to set up, configure, and run AgriSmart AI locally on Windows, macOS, or Linux.

---

## 1. Prerequisites

- **Node.js**: v20+ LTS (Tested on Node.js v26 LTS)
- **npm**: v10+ (or pnpm / yarn)
- **Google AI Studio Account**: For `GEMINI_API_KEY` (Free tier works great)
- **Supabase Account**: Free project on supabase.com

---

## 2. Clone and Dependency Installation

```bash
# Clone the repository
git clone https://github.com/your-username/agrismart-ai.git
cd agrismart-ai

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

## 3. Environment Configuration

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```ini
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
API_BASE_URL=http://localhost:5000/api/v1

# Supabase Keys (from Project Settings -> API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Google Gemini API Key (from https://aistudio.google.com)
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash

# Weather Integration (Zero API key required for Open-Meteo)
WEATHER_API_PROVIDER=open-meteo
```

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```ini
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

*Note:* In sandbox/offline mode, if Supabase and Gemini credentials are not yet entered, AgriSmart AI includes deterministic agronomical simulation fallbacks and local authentication sessions so all UI workflows can be evaluated without blocking.

---

## 4. Database Setup

You can provision your Supabase Cloud PostgreSQL database using either method:

### Method A: Automated Migration Runner
```bash
# Run from root directory:
npm run db:migrate
```

### Method B: Supabase Web SQL Editor
1. Log into your Supabase Dashboard at https://supabase.com/dashboard.
2. Navigate to **SQL Editor** in the left sidebar.
3. Open `supabase/migrations/001_initial_schema.sql`, copy all contents, and click **Run**.
4. All 11 tables, storage bucket, triggers, RLS policies, and Indian crop varieties will be created.

---

## 5. Running the Application

Open two terminal windows:

### Terminal 1: Backend Server
```bash
cd server
npm run dev
# Server boots on http://localhost:5000
```

### Terminal 2: Frontend Client
```bash
cd client
npm run dev
# Vite runs on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

