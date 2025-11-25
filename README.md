# Corruption Tracker (Next.js + Express + MongoDB)

This repo contains:
- Frontend: Next.js app (src/app) showing procurement stats on the landing page and supporting login/registration.
- Backend: Express + Mongoose API (backend/) for authentication and procurement stats persisted in MongoDB.

Below are step-by-step instructions to run everything locally and confirm the database is working end-to-end.

## 1) Prerequisites
- Node.js 18+ and npm
- MongoDB Community Server running locally (mongod). If you use MongoDB Atlas, have a connection string ready.

## 2) Configure environment variables

Backend:
1. Copy the example env file:
   cp backend/.env.example backend/.env
2. Edit backend/.env as needed:
   - MONGODB_URI: e.g. mongodb://localhost:27017/corruption_tracker (local) or your Atlas URI
   - JWT_SECRET: any long random string
   - PORT: 4000 (default)

Frontend:
1. In the project root, create .env.local with:
   NEXT_PUBLIC_API_BASE=http://localhost:4000/api

## 3) Install dependencies
- Root (frontend):
  npm install
- Backend:
  cd backend && npm install

## 4) Start the backend
In a terminal window:

cd backend
npm run dev

You should see logs like:
- MongoDB connected
- Backend server running on http://localhost:4000

Health check:
- Open http://localhost:4000/health in a browser or run: curl http://localhost:4000/health
  Expected: {"status":"ok"}

## 5) Start the frontend
In a second terminal window at the repo root:

npm run dev

Open http://localhost:3000 in your browser.

## 6) Verify the database is working
There are two simple end-to-end checks: procurement stats (read/seed) and authentication (write/read users).

A) Procurement stats (read from MongoDB)
- The first call to GET /api/stats will seed a default stats document if none exists.
- From a terminal:
  curl http://localhost:4000/api/stats
  You should receive JSON with fields like totalContracts, totalValue, flaggedContracts, activeVendors.
- In the UI, visit http://localhost:3000/landing (or login first) — the cards on the landing page will display these values.

B) Auth (write/read users)
1. Register a user:
   curl -X POST http://localhost:4000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User","phone":"0712345678","role":"public"}'
   Expected: JSON response with a token and user object. This writes a new user document to MongoDB.
2. Login with the same credentials:
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   Expected: JSON response with a token and the same user object (read from MongoDB).
3. In the UI, you can also use /registration and /login pages. Successful login stores a token and user in localStorage and redirects to /landing.

If these operations succeed, your MongoDB connection and persistence are working.

## 7) Troubleshooting
- ECONNREFUSED or cannot connect to MongoDB:
  - Ensure mongod is running locally, or your Atlas cluster is reachable.
  - Verify MONGODB_URI in backend/.env. For local default: mongodb://localhost:27017/corruption_tracker
- CORS issues:
  - Backend enables permissive CORS by default; ensure you’re hitting http://localhost:4000 from http://localhost:3000.
- 401/403 on protected endpoints:
  - Make sure you include the Authorization: Bearer <token> header when calling protected APIs (not required for /api/stats).
- Port already in use:
  - Change PORT in backend/.env or stop the other process using 4000.

## Useful endpoints
- GET http://localhost:4000/health — backend health
- GET http://localhost:4000/api/stats — procurement KPIs (seeds if empty)
- POST http://localhost:4000/api/auth/register — create account
- POST http://localhost:4000/api/auth/login — login and get JWT

## Notes
- The frontend reads NEXT_PUBLIC_API_BASE to know where to call the backend. Default used in code if unset: http://localhost:4000/api
- The landing page displays stats fetched from the backend. If the backend is down or DB is unreachable, it falls back to local defaults and logs a warning in the console.
