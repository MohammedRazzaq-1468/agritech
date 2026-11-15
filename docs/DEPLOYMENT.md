# AgriSmart AI – Production Deployment Guide

This guide describes how to deploy AgriSmart AI to cloud hosting platforms (Vercel, Netlify, Render, Railway, and Supabase).

---

## 1. Frontend Deployment (Vercel or Netlify)

### Vercel
1. Link your GitHub repository to Vercel.
2. Set Root Directory to: `client`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend-api.onrender.com/api/v1`
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOi...`
7. Click **Deploy**.

---

## 2. Backend Deployment (Render or Railway)

### Render (Web Service)
1. Link repository to Render.
2. Root Directory: `server`.
3. Environment: **Node**.
4. Build Command: `npm install`.
5. Start Command: `npm start`.
6. Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `FRONTEND_URL`: `https://your-frontend.vercel.app`
   - `API_BASE_URL`: `https://your-backend-api.onrender.com/api/v1`
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_ANON_KEY`: `eyJhbGciOi...`
   - `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGciOi...`
   - `GEMINI_API_KEY`: `AIzaSy...`
   - `GEMINI_MODEL`: `gemini-2.5-flash`
7. Health Check Path: `/api/v1/health`.

---

## 3. Database Deployment (Supabase Managed PostgreSQL)

1. Database is automatically provisioned and managed on Supabase.
2. Verify Row-Level Security (RLS) is toggled ON across all 11 tables.
3. In Authentication -> URL Configuration, add your production frontend domain (e.g., `https://your-frontend.vercel.app`) to **Site URL** and **Redirect URLs**.

---

## 4. Production Security Checklist

- [x] `GEMINI_API_KEY` exists strictly on backend environment variables, never in client bundle.
- [x] Helmet security headers active on Express app.
- [x] Rate limiting configured on `/api/` (100 req/15 min) and `/api/v1/crops/recommend`, `/api/v1/disease/analyze` (30 req/15 min).
- [x] PostgreSQL Row Level Security enforces user isolation on all tables.
- [x] Image uploads restricted to 10 MB with binary magic-byte inspection.

