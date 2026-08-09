# MedConnectMe - Medical Learning Platform

A premium, mobile-first medical education platform built with **Next.js (App Router) + TypeScript + Supabase**. Includes a full marketing landing page and a bilingual (English / Kiswahili) student + admin dashboard with medical-specific learning tools.

This project was inspired by the PHP [Student Management System](https://github.com/amirhamza05/Student-Management-System) starter kit (kept in `reference/` for reference only) and rebuilt as a full modern web app with medical-specific features.

## Highlights

- **Landing page** — handcrafted, bilingual marketing site that tells the student story with real product screenshots (dashboard, timetable, grades, rotations, formulary, ID card), no fake mockups
- **Demo mode** — run the whole app with built-in mock data and one-click test logins, no Supabase required
- **AI Tutor** concept — a study partner that explains concepts and generates practice questions alongside your textbooks

## Features

### Student
- **Dashboard** — GPA, attendance rate, clinical hours, today's schedule, latest notices, recent results, reminders
- **Grades & Assessments** — scores, auto grading, GPA, performance chart
- **Timetable** — weekly schedule grouped by day (mobile day switcher)
- **Attendance** — monthly summaries with per-month filtering
- **Clinical Rotations** — rotation tracking with progress bars, hours logging, hours-per-department chart
- **Case Logs** — record patient encounters (diagnosis, department, age, gender, reflections)
- **Study Materials** — notes, PDFs, videos, links hub
- **Drug Formulary** — drug reference (indications, dosage, side effects)
- **Notices** — pinned announcements
- **Reminders** — exam/assignment/payment deadline tracking with overdue badges
- **Payments** — tuition & fee status (paid / partial / unpaid)
- **Student ID Card** — digital card with QR code, printable

### Admin
- **Overview** — students, exams, income, attendance stats, recent activity
- **Students** — add/edit/delete student accounts
- **Exams** — manage exams & assessments
- **Results** — batch score entry with auto grade, publish/unpublish results
- **Timetable** — schedule management
- **Rotations** — assign clinical rotations to students
- **Materials & Notices** — content management
- **Payments** — record fees
- **SMS Center** — send SMS to students (record-keeping; connect a provider)
- **Reports & Analytics** — income, attendance, grade distribution charts
- **Activity Log** — full audit trail

### Platform
- **Bilingual EN / SW** — language toggle everywhere (landing + app)
- **Mobile-first** — bottom navigation on phones, sidebar on desktop
- **Role-based auth** — student & admin logins
- **Row Level Security** — students only see their own data

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- Supabase (Auth, Postgres, RLS)
- Recharts (analytics)
- lucide-react (icons)
- qrcode (ID card QR)

## Getting Started

### Option A — Run with demo mode (recommended to try it now)

Demo mode bypasses Supabase entirely and uses built-in mock data, so you can log in instantly:

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll see the landing page. Go to `/login` and use the **one-click demo buttons** (or the credentials below):

- Admin: `admin@med.local` / `admin123`
- Student: `student@med.local` / `student123`

Demo mode is enabled via `.env.local`:

```
NEXT_PUBLIC_DEMO_MODE=true
```

To switch back to real Supabase, set `NEXT_PUBLIC_DEMO_MODE=false` (or remove it) and fill in your Supabase credentials.

### Option B — Connect real Supabase

1. Open the **Supabase SQL Editor** in your project and run:

   ```
   supabase/migrations/001_initial_schema.sql
   ```

   This creates all tables, RLS policies, triggers, and seeds default programs, drugs, and settings.

2. Configure environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Supabase project credentials (Settings → API):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. (Optional) Seed demo data:

   ```bash
   # add service role key to .env.local first
   npm run seed
   ```

4. Run the app:

   ```bash
   npm run dev
   ```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_DEMO_MODE` | `true` = use built-in mock data (no Supabase needed) |
| `NEXT_PUBLIC_DEMO_STUDENT_EMAIL` / `NEXT_PUBLIC_DEMO_STUDENT_PASSWORD` | Demo student login |
| `NEXT_PUBLIC_DEMO_ADMIN_EMAIL` / `NEXT_PUBLIC_DEMO_ADMIN_PASSWORD` | Demo admin login |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Only used by `scripts/seed.ts` (keep secret!) |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed demo data (requires service role key) |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # landing page (/)
│   ├── (auth)/login, register    # auth pages
│   ├── (dashboard)/              # app shell (sidebar + bottom nav)
│   │   ├── dashboard, profile, grades, timetable, attendance
│   │   ├── rotations, case-logs, materials, formulary
│   │   ├── notices, reminders, payments, id-card
│   │   └── admin/*              # admin panel
├── components/
│   ├── ui/                      # Button, Card, Modal, Badge, etc.
│   ├── dashboard/               # Sidebar, BottomNav, TopBar, LanguageToggle
│   ├── landing/                 # Landing page sections (nav, hero, etc.)
│   └── admin/
├── lib/
│   ├── supabase/                # server & browser clients, proxy helper
│   ├── demo/                    # demo mode (mock client + data + session)
│   ├── i18n/                    # EN/SW dictionaries + context
│   ├── hooks/                   # useAsync
│   ├── types.ts                 # domain types
│   └── utils.ts                 # formatters & helpers
├── proxy.ts                     # auth session refresh / route guard
supabase/migrations/             # SQL schema + RLS
scripts/seed.ts                  # demo data seeder
reference/                       # original PHP starter kit (reference only)
```

## Notes

- SMS sending records are stored in `sms_messages` with a `pending` status. Connect a real provider (e.g. Africa's Talking) to actually send.
- For production, review the RLS policies and set up email confirmation, password recovery, and Supabase storage for file uploads if needed.
- Demo mode stores the session in a browser cookie (`medconnectme_demo`) and `localStorage`; data is in-memory and resets on page reload.
