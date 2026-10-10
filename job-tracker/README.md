# Job Application Tracker

Full stack project: Kanban pipeline, stage history, reminders (next), and email parsing (next).

**Stack:** React + Vite (client) · Express + Prisma + PostgreSQL (server)

## Setup (PowerShell)

1. Create a PostgreSQL database (e.g. `jobtracker`).
2. Server:
   ```powershell
   cd server
   copy .env.example .env      # then edit DATABASE_URL and JWT_SECRET
   npm install
   npx prisma migrate dev --name init
   npm run dev                 # http://localhost:4000
   ```
3. Client (new terminal):
   ```powershell
   cd client
   npm install
   npm run dev                 # http://localhost:5173
   ```

The Vite dev server proxies `/api` to the Express server.

## Implemented (phase 1)
- Register / login with bcrypt + JWT
- Applications CRUD
- Stage change endpoint that writes a StageEvent in one transaction
- Kanban-style board with move-by-dropdown, add and delete

## Next
- Drag and drop (dnd-kit)
- Reminders + node-cron scheduler
- Inbound email webhook + rule-based parser, then LLM parser with review queue
- Dashboard analytics
