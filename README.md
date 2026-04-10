# Discord Clone — Setup Guide

## Prerequisites
- Node.js 18+ (https://nodejs.org)
- PostgreSQL 14+ (https://postgresql.org)

## Step 1: Database Setup
```bash
psql -U postgres
CREATE DATABASE discord_clone;
\q
```

## Step 2: Backend Setup
```bash
cd backend
npm install
```

Edit `.env` and replace `YOUR_PASSWORD_HERE` with your PostgreSQL password.

```bash
npm run db:generate
npm run db:push
```

## Step 3: Frontend Setup
```bash
cd ../frontend
npm install
```

## Step 4: Run the App

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173

## Add Your Logo
Place your logo image at: `frontend/public/logo.png`

## Finding Your Server ID (to invite friends)
Open your browser DevTools → Network tab, or use Prisma Studio:
```bash
cd backend
npm run db:studio
```
Then open http://localhost:5555 and browse the Server table to find your server's ID.
