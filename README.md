# Remindly — Modern Personal Task & Reminder Management

**Remindly** is a personal task and reminder management application designed to help you consolidate your responsibilities, habits, custom categories, and daily schedule into a single, cohesive workspace.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL with Row Level Security)**, Remindly is optimized for zero-friction local exploration and one-click deployment to **Vercel**.

---

## 🌟 Key Features

### 1. Authentication & Cloud Persistence
- **Supabase Auth**: Secure email/password login and registration.
- **Row Level Security (RLS)**: Strict user-isolated PostgreSQL policies.
- **Instant Demo Mode**: Fully functional with persistent local storage out-of-the-box if Supabase credentials are not yet configured.

### 2. My Day Dashboard & Clarity Digest
- **Intelligent Grouping**: Separates tasks into **Overdue** (urgent alerts), **Due Today** (agenda with exact times), **Upcoming** (next 7 days), and **Completed**.
- **Daily Digest / Morning Summary**: Configurable overview modal that highlights overdue tasks with a one-click *"Move all overdue to Today"* action.
- **Live Search**: Instant keyword filtering across task titles, notes, and tags.

### 3. Task Management & Snoozing
- **Full Lifecycle**: Create, edit, complete, delete, snooze, and reschedule.
- **Smart Snooze Menu**: Quick snooze for *+1 hour*, *+3 hours*, *This Evening (7 PM)*, *Tomorrow Morning (9 AM)*, *Next Week*, or custom date/time.
- **Delightful Feedback**: Celebratory confetti bursts and synthesized audio chimes using the native **Web Audio API** (zero external sound files needed).

### 4. Custom Categories with Icons & Color Palettes
- Create unlimited custom categories (e.g. Work, Health, Personal, Finances, Reading, Side Projects).
- Choose from 25+ curated **Lucide icons** and 10 modern color swatches.
- View task counts and filter your workspace by category with one click.

### 5. Reminders & Recurring Responsibilities
- **Recurrence Engine**: Supports *Daily*, *Weekdays (Mon-Fri)*, *Weekly*, *Bi-weekly*, *Monthly*, and custom intervals. Completing a recurring task automatically schedules its next occurrence.
- **Configurable Reminder Leads**: Set alerts for exact due time, 10 minutes before, 15 minutes before, 30 minutes before, or 1 hour before.

### 6. Notification Management & Anti-Duplicate System
- **Desktop Push Notifications**: Native Web Notification API support.
- **Duplicate Prevention Engine**: Automatically suppresses duplicate reminder notifications for tasks already delivered.
- **Quiet Hours (Do Not Disturb)**: Define customizable quiet hours (e.g., 22:00 to 07:00) during which audio and desktop alerts are automatically muted.

### 7. Calendar View & Google Calendar Integration Ready
- **Monthly Interactive Grid**: View all scheduled tasks distributed across the month.
- **Day Drawer**: Click any date to view responsibilities or quickly add a task directly for that day.
- **RFC 5545 iCalendar (.ics) Export**: One-click download of `.ics` files compatible with **Google Calendar**, **Apple Calendar**, and **Outlook**.
- **Google Calendar Ready Architecture**: Database schema includes `google_calendar_event_id` and is pre-architected for two-way Google Calendar OAuth sync.

### 8. Settings & Data Control
- Profile display name & Timezone configuration.
- Notification toggles (desktop push, sound chimes, morning digest time, quiet hours).
- Account data tools: Export full workspace as JSON backup and clear completed tasks.

---

## 🛠️ Recommended Tech Stack

| Layer | Technology | Why It's Best for Vercel |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14 (App Router)** | Native Vercel optimization, fast SSR, zero-config Edge API routes. |
| **Language** | **TypeScript** | Strict compile-time type safety across database entities and UI props. |
| **Styling** | **Tailwind CSS** | Lightweight utility classes, dark/light theme support, glassmorphism. |
| **Database & Auth** | **Supabase (PostgreSQL)** | Cloud-hosted database with Row-Level Security, instant Auth API, free tier. |
| **Icons & Audio** | **Lucide React + Web Audio API** | Vector icons with crystal-clear zero-asset synthesized sound effects. |
| **Calendar Standard** | **RFC-5545 iCalendar (`.ics`)** | Universal calendar sync and Google Calendar compatibility. |

---

## 🚀 Quick Start Guide

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd remindly
npm install
```

### 2. Environment Variables Setup
Copy the sample environment file:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your Supabase credentials (optional for initial evaluation):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
> **Note:** If you leave `.env.local` as default, Remindly runs in **Local Demo Mode** with persistent browser storage so you can test all features immediately!

### 3. Supabase Database Migration
When connecting to Supabase:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** in the left sidebar.
3. Paste and run the entire contents of `supabase/schema.sql`.
4. This sets up the tables (`profiles`, `categories`, `tasks`, `notification_preferences`, `notification_history`), indexes, Row Level Security (RLS) policies, and an automatic trigger that seeds default categories upon user registration.

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deploying to Vercel

1. Push your repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Visit [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your Remindly repository.
4. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon API Key
5. Click **Deploy**. Vercel will build and deploy the production app within 60 seconds!

---

## 📁 Project Structure

```
├── supabase/
│   └── schema.sql                  # PostgreSQL tables, RLS policies, triggers
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root HTML layout with context providers
│   │   ├── page.tsx                # My Day dashboard & task manager
│   │   ├── globals.css             # Tailwind theme variables & glassmorphism
│   │   ├── calendar/page.tsx       # Month calendar schedule view
│   │   ├── categories/page.tsx     # Custom categories management
│   │   ├── settings/page.tsx       # Profile, timezone & notification settings
│   │   ├── auth/
│   │   │   ├── login/page.tsx      # Sign in & demo mode
│   │   │   ├── signup/page.tsx     # Sign up & auto-seeding
│   │   │   └── callback/route.ts   # Supabase auth token exchange
│   │   └── api/calendar/export/    # RFC 5545 iCal feed endpoint
│   ├── components/
│   │   ├── common/                 # Navbar, Sidebar, AppShell
│   │   ├── tasks/                  # TaskCard, QuickTaskInput, TaskDetailModal, SnoozeDropdown, DailySummaryModal
│   │   ├── categories/             # CategoryIcon, CategoryModal
│   │   └── calendar/               # CalendarView, DayTaskDrawer
│   ├── context/
│   │   ├── AuthContext.tsx         # Supabase Auth + Demo mode session
│   │   ├── TaskContext.tsx         # CRUD, snooze, recurrence & filter state
│   │   └── NotificationContext.tsx # Push alerts, deduplication & quiet hours
│   ├── lib/
│   │   ├── supabase/               # Browser and Server Supabase clients
│   │   ├── utils.ts                # Date formatting, recurrence & snooze math
│   │   ├── sound.ts                # Web Audio API chime synthesizer
│   │   ├── ical.ts                 # RFC-5545 iCalendar generator
│   │   └── mockData.ts             # Rich initial tasks & categories
│   └── types/
│       └── index.ts                # Strict TypeScript interfaces
└── package.json
```

---

## 📄 License
MIT License. Built for personal productivity and clarity.
