# TaskerTrack — Full Stack

TaskerTrack is a team-focused workspace and assignment manager with role-based access control, Google sign-in, and a polished React + Tailwind frontend backed by an Express + Prisma API.

Demo (placeholder): https://your-deployed-link.example.com

---

## Overview

- Frontend: React (Vite) + Tailwind
- Backend: Node.js + Express + Prisma (SQLite for local dev)
- Auth: JWT and Google OAuth (Google one-tap)

---

## Live (deployed)

The deployed app link above is a placeholder — replace it with your production URL once deployed.

---

## Prerequisites

- Node.js (v18+ recommended; Vite requires >=20.19 for latest builds)
- npm

---

## Local development — Quick start

Follow these steps in two separate terminals: backend first, then frontend.

Backend (from repository root):
```powershell
cd "Team Task/Team Task/backend"
npm install
npx prisma db push
npm run seed
npm start
```

Frontend (after backend is running):
```powershell
cd "Team Task/Team Task/frontend"
npm install
npm run dev
```

Defaults:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

If PowerShell blocks `npm` scripts, run in an elevated terminal or set execution policy for current user:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

---

## Environment variables

Backend (`backend/.env`) — required keys (development):

- `PORT` (default: `5000`)
- `DATABASE_URL` (e.g. `file:./dev.db` for SQLite)
- `JWT_SECRET` (a secure random string)
- `FRONTEND_URL` (e.g. `http://localhost:5173`)
- `GOOGLE_CLIENT_ID` (Google OAuth client id)
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (seeded admin)

Frontend (`frontend/.env`):

- `VITE_API_URL` (e.g. `http://localhost:5000/api`)
- `VITE_GOOGLE_CLIENT_ID`

If you change env values, restart the respective server.

---

## Database & seeding

- Prisma schema is in `backend/prisma/schema.prisma`.
- For local dev we use SQLite by default. Run `npx prisma db push` to sync schema.
- Seed default admin and demo data: `npm run seed` (backend).

Seeded admin account (development):

- Email: `admin@taskflow.com`
- Password: `adminpassword123`

---

## Common troubleshooting

- 403 Forbidden on workspace/member/task endpoints: those routes require an `ADMIN` user who also owns the project. Log in with the seeded admin account or create a user with the `ADMIN` role.
- Google OAuth 403 / origin errors: add `http://localhost:5173` to your OAuth client's "Authorized JavaScript origins" in Google Cloud Console and add the backend callback URL as an authorized redirect URI if used.
- CORS: backend `src/index.js` already allows the local frontend origin; ensure `FRONTEND_URL` in backend `.env` matches your frontend origin.

---

## Folder structure

Top-level layout (workspace):

```
Team Task/
    README.md
    deployment_guide.md
    backend/
        package.json
        prisma/
            schema.prisma
            seed.js
            migrations/
        src/
            index.js
            config/
                prisma.js
            middleware/
            routes/
    frontend/
        package.json
        vite.config.js
        src/
            main.jsx
            App.jsx
            api/
            pages/
            components/
```

Adjust the relative paths above to match your local layout — the repository contains a nested `Team Task/Team Task` folder in this workspace.

---

## Deployment (notes)

- Backend: deploy to Railway/Heroku/Vercel serverless function. Set `DATABASE_URL` to a hosted Postgres for production.
- Frontend: deploy to Vercel/Netlify; set `VITE_API_URL` to the public backend URL and `VITE_GOOGLE_CLIENT_ID` in project env.

---

If you want, I can also:
- Add a small `docs/DEPLOY.md` with exact Railway / Vercel steps, or
- Replace the deployed placeholder link with a real URL after you deploy.

Enjoy — open [Team Task/Team Task/Readme.md](Team Task/Team Task/Readme.md#L1) for this file.

    ├── src/
    │   ├── api/            # Axios API config
    │   ├── components/     # Layout framework & shared UI
    │   └── pages/          # Auth, Dashboard, Projects, & Tasks
    └── index.html          # Main HTML entrypoint
```
