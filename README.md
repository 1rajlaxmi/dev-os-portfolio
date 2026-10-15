# 🖥️ DevOS — Interactive Developer Portfolio OS

An interactive, browser-based operating system simulation built as a full-stack developer portfolio for **Rajlaxmi Gupta** (Full Stack Developer). Features window management, virtual file system, terminal emulator, sound effects, spotlight search, and dynamic contact email integration.

---

## 🏗️ Architecture Overview

The repository is structured as a monorepo containing two decoupled, production-ready applications:

```
rajjo portfolio/
├── dev-os/               # Frontend Client (React 19 + TypeScript + Vite + Redux Toolkit + Tailwind CSS)
│   ├── src/              # Desktop UI, Window Manager, Terminal, Programs, VFS
│   ├── public/           # Static assets, Resume PDF, Favicons
│   ├── vercel.json       # Vercel SPA routing rewrite rules
│   └── package.json
│
├── devos-server/         # Backend Server (Node.js + Express + Socket.io + Resend)
│   ├── data/             # Standalone profile configuration (profile.json)
│   ├── __tests__/        # REST API & Terminal integration test suites (Jest + Supertest)
│   ├── index.js          # REST API, Socket.io WebSocket server, Resend email handler
│   └── package.json
│
├── .gitignore            # Root secrets & dependency ignore rules
└── README.md             # This document
```

---

## 📊 Deployment Readiness & Health Status

| Component | Audit Check | Result | Details |
| :--- | :--- | :--- | :--- |
| **Frontend Unit Tests** | `vitest` | ✅ **100 / 100 Passed** | Dock, Terminal, Spotlight, Browser, Themes, Redux slices |
| **Backend API Tests** | `jest` | ✅ **43 / 43 Passed** | Health check, VFS APIs, Terminal commands, Contact & Admin auth |
| **Production Build** | `tsc -b && vite build` | ✅ **0 Errors** | Clean bundle generated in ~1.4s |
| **Linting & Code Quality** | `eslint .` | ✅ **0 Errors** | Pure component rendering, type-safe rules |
| **Secrets Protection** | `.gitignore` | ✅ **Secured** | `.env` ignored across root, client, and server |
| **Server Startup** | `npm start` | ✅ **Configured** | `"start": "node index.js"` ready for cloud platforms |
| **WebSocket Networking** | Socket.io Host | ✅ **Dynamic** | Supports `VITE_SOCKET_URL` & auto-derives from `VITE_API_URL` |
| **Server Modularity** | Self-Contained | ✅ **Decoupled** | Server has its own `./data/profile.json` copy |

---

## 🚀 Step-by-Step Production Hosting Guide

Because `dev-os` is a static Single Page Application (SPA) and `devos-server` is a continuous Node.js WebSocket process, they are hosted on complimentary cloud platforms:

### Step 1: Deploy Backend (`devos-server`) to Render (Free)

1. Push this repository to **GitHub**.
2. Log in to [Render Dashboard](https://dashboard.render.com/) and click **New +** ➔ **Web Service**.
3. Connect your GitHub repository.
4. Configure service settings:
   - **Name**: `devos-backend`
   - **Region**: Closest to your users (e.g., Singapore / Frankfurt / Oregon)
   - **Branch**: `main`
   - **Root Directory**: `devos-server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add the following keys:
   | Key | Example Value | Description |
   | :--- | :--- | :--- |
   | `PORT` | `3000` | Port listened by Express |
   | `ADMIN_PASSWORD` | `your_secure_password` | Master password for portfolio CMS editing |
   | `CORS_ORIGIN` | `*` | Allowed origins (or set to your Vercel frontend URL) |
   | `RESEND_API_KEY` | `re_123456789...` | API key from [Resend](https://resend.com) |
   | `CONTACT_RECEIVER_EMAIL` | `rajlaxmigupta@atomicmail.io` | Email inbox receiving visitor messages |
6. Click **Create Web Service**.
7. Once deployed, copy your public service URL:
   ```
   https://devos-backend.onrender.com
   ```

---

### Step 2: Deploy Frontend (`dev-os`) to Vercel (Free)

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** ➔ **Project**.
2. Select your GitHub repository.
3. In project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `dev-os`
4. Expand **Environment Variables** and add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://devos-backend.onrender.com/api` | Your Render backend URL with `/api` suffix |
   | `VITE_SOCKET_URL` | `https://devos-backend.onrender.com` | Your Render backend root URL for Socket.io |
5. Click **Deploy**.
6. Vercel will build and assign you a live domain (e.g. `https://rajlaxmi-portfolio.vercel.app`).

> [!NOTE]
> On Render's free tier, backend instances spin down after 15 minutes of inactivity. When a visitor sends their first command, the server wakes up within ~30 seconds. The frontend terminal handles this gracefully with informative feedback.

---

## 💻 Local Development Setup

To run both services locally on your machine:

### 1. Start Backend Server
```bash
cd devos-server
npm install
npm run dev
```
- Server starts at `http://localhost:3000`
- API health check: `http://localhost:3000/api/health`

### 2. Start Frontend Client
```bash
cd dev-os
npm install
npm run dev
```
- Vite client starts at `http://localhost:5173`

---

## 🧪 Running Automated Tests

### Frontend Vitest Suite
```bash
cd dev-os
npm test          # Runs 10 test suites / 100 tests
npm run lint      # Runs ESLint checks
npm run build     # Runs TypeScript check & Vite production build
```

### Backend Jest Suite
```bash
cd devos-server
npm test          # Runs 43 REST API integration tests
```

---

## 🔒 Security Best Practices

- **Never commit `.env` files**: All environment files are strictly ignored in `.gitignore`.
- **API Keys**: Manage `RESEND_API_KEY` only via cloud dashboard environment variables.
- **CORS Protection**: The server dynamically respects `CORS_ORIGIN` for both REST endpoints and Socket.io WebSockets.

---

## 👤 Developer Profile

- **Developer**: Rajlaxmi Gupta
- **Role**: Full Stack Developer Intern @ AIDEOA
- **Education**: MCA — Central University of Haryana
- **GitHub**: [github.com/1rajlaxmi](https://github.com/1rajlaxmi/)
- **LinkedIn**: [linkedin.com/in/rajlaxmi-cuh](https://www.linkedin.com/in/rajlaxmi-cuh/)
- **Email**: `rajlaxmigupta@atomicmail.io`
