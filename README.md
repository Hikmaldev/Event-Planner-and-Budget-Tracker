# 🎉 Event Planner & Budget Tracker

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![Neon Postgres](https://img.shields.io/badge/Neon-Postgres-00E599?logo=postgresql&logoColor=white)
![Vitest](https://img.shields.io/badge/Tested_with-Vitest_5-6E9F18?logo=vitest&logoColor=white)

**Event Planner & Budget Tracker** is a full-stack web application that helps a single organizer run an event from budget planning to H-day: vendors and contracts, planned vs actual Rupiah spending, a pre-event checklist, and a timeline of H-30 / H-7 / H-1 / H-day milestones. Built with **Next.js 16 App Router**, **Prisma 7**, and **Neon Serverless Postgres**.

> *"One place to see who's booked, what's been paid, and what still needs to happen before H-1."*

---

## ✨ Key Features

### 🔐 Accounts & Authentication
- Register and log in with email + password (Auth.js v5, bcrypt password hashing, JWT sessions)
- **Logout** from the header (session cleared, back to the login screen)
- **Password reset** with a single-use token (SHA-256 hashed in the database, 1-hour expiry)
- **Demo autofill button** on the login page for local review — development only, never rendered in production

### 🎉 Event Management
- Create, edit, and delete events (name, date, location, total target budget)
- Events Dashboard with summary cards: days remaining, budget used vs target, checklist completion
- Delete confirmation that names the event and cascades to all of its vendors, budget entries, and tasks

### 🤝 Vendor Management
- Vendors under budget categories (Catering, Decoration, Documentation, Venue, or custom)
- Two independent status badges per vendor: **contract status** (Negotiating / Contracted / Cancelled) and **payment status** (Unpaid / Down Payment / Paid in Full)
- Agreed price tracked separately from the amount actually paid
- Filters by category and status, plus inline edit, payment update, and delete actions

### 💰 Budget Tracking
- Budget categories with planned amounts, compared against automatically derived actual spend
- Actual spend = sum of vendor payments + standalone budget entries (never entered manually)
- Planned vs actual comparison per category and for the whole event, with an over-budget alert banner
- Color-coded progress bars: under / near limit / over budget

### ✅ Checklist & Tasks
- Tasks with deadlines, optional description, and an optional linked vendor
- Overdue tasks flagged in red, completed tasks move down but stay visible
- Sort and filter by deadline or completion status

### 🗓️ Timeline View
- Milestones at H-30, H-7, H-1, and H-day, with the current position recalculated from today's date on every load
- Checklist tasks grouped to the nearest milestone and shown when a marker is selected

---

## 💰 Budget & Payment Rules

**Payment status** is derived from the amount paid (enforced server-side, inconsistent pairs are rejected):

| Amount Paid | Payment Status |
|:---:|---|
| `0` | ⚪ Unpaid |
| `0 < amountPaid < agreedPrice` | 🟡 Down Payment |
| `>= agreedPrice` | 🟢 Paid in Full |

**Budget status colors** (reserved for planned-vs-actual comparisons only):

| Actual vs Planned | Token | Meaning |
|:---:|---|---|
| Under 80% | `budget-under` (green) | 🔵 Under budget |
| 80% – 100% | `budget-near` (amber) | 🟡 Near limit |
| Above 100% | `budget-over` (red) | 🔴 Over budget |

Contract status uses a separate palette (blue and grays) so "Negotiating" is never mistaken for a warning state.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components, Server Actions, Cache Components) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) 5 |
| **UI** | [React 19](https://react.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database** | [Neon Serverless Postgres](https://neon.tech/) (`@neondatabase/serverless`) |
| **ORM** | [Prisma 7](https://www.prisma.io/) + `@prisma/adapter-neon` driver adapter |
| **Authentication** | [Auth.js v5](https://authjs.dev/) (NextAuth) — Credentials provider + JWT sessions |
| **Validation** | [Zod 4](https://zod.dev/) (server-side, mirrored by data-layer invariants) |
| **Password Hashing** | `bcryptjs` |
| **Testing** | [Vitest 5](https://vitest.dev/) — unit tests + integration tests against a real database |
| **Tooling** | `tsx` (seed runner), `dotenv`, ESLint |

---

## 🗂️ Project Structure

```
Event-Planner-and-Budget-Tracker/
├── prisma/
│   ├── schema.prisma           # Models, enums, and database-level delete rules
│   ├── seed.ts                 # Demo data seed (development only)
│   └── migrations/             # Applied SQL migrations
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Shell + session-aware header
│   │   ├── login/              # Login / Register (+ demo autofill)
│   │   ├── reset-password/     # Password reset flow
│   │   ├── events/             # Dashboard + event workspace
│   │   ├── actions/            # Server Actions (ACT-01..ACT-33)
│   │   └── api/auth/           # Auth.js route handlers
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── events/             # Workspace tabs, dialogs, forms
│   │   ├── auth/               # Login / reset forms
│   │   └── layout/             # Session nav
│   ├── lib/
│   │   ├── data/               # Data layer (ownership checks + invariants)
│   │   ├── domain/             # Pure budget / payment / timeline logic
│   │   ├── validation.ts       # Zod schemas
│   │   ├── auth.ts             # Auth.js configuration
│   │   └── db.ts               # Prisma Client + Neon adapter
│   ├── generated/prisma/       # Generated Prisma Client (gitignored)
│   └── types/                  # TypeScript augmentations
├── tests/
│   ├── unit/                   # Domain, validation, formatting, guards
│   └── integration/            # Database flows + access control
├── docs/
│   └── data-contract.md        # Data contract review document
├── PRD-Event-Planner-Budget-Tracker.md
├── design-system-event-planner.md
├── prisma.config.ts
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v22.12+ (v24 recommended — this project is developed on v24)
- A [Neon](https://neon.tech/) account (free tier is enough)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd Event-Planner-and-Budget-Tracker
npm install
```

`npm install` automatically runs `prisma generate` (via `postinstall`).

### 2. Setup Environment Variables

Copy the example file and fill it in:

```bash
cp .env.example .env        # macOS / Linux
copy .env.example .env      # Windows
```

```env
# Pooled connection — used by the app runtime
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require"
# Direct connection — used by the Prisma CLI (migrations)
DIRECT_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
# Random session secret for Auth.js (at least 32 characters)
AUTH_SECRET="generate-a-random-secret"
```

> **💡 Get both connection strings** from the Neon dashboard → your project → Connection Details (toggle "Pooled" for `DATABASE_URL`).

### 3. Setup Database

```bash
npm run db:migrate      # creates all tables (uses DIRECT_URL)
npm run db:seed         # optional: demo account + 3 sample events (development only)
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (unit + integration against the configured database) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run db:migrate` | `prisma migrate dev` (create/apply migrations) |
| `npm run db:generate` | Regenerate the Prisma Client |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed the demo account + sample events (dev only) |
| `npm run db:seed:clean` | Remove all demo data |

> **Note:** this app deliberately has **no demo-data fallback**. Without a working database it shows error or empty states instead of fake data.

---

## 🌐 Deploy to Vercel + Neon

### Step 1: Create a Database on Neon
1. Sign up / log in at [neon.tech](https://neon.tech)
2. Create a new project → pick the closest region (e.g., Singapore `ap-southeast-1` for Indonesia)
3. Copy both the **pooled** and **direct** connection strings

### Step 2: Apply Migrations
From your machine, with `DIRECT_URL` pointing at the production database:

```bash
npx prisma migrate deploy
```

### Step 3: Deploy to Vercel
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import the repository
3. Add the **Environment Variables**:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Neon pooled connection string |
   | `DIRECT_URL` | Neon direct connection string |
   | `AUTH_SECRET` | Random string of at least 32 characters |

4. Click **Deploy** — done! 🎉

> **⚠️ Demo data is development-only.** Do not run `db:seed` in production, and leave `DEMO_EMAIL` / `DEMO_PASSWORD` empty there — the demo autofill button never renders in production.

---

## 🔑 Demo Account

After running `npm run db:seed`, this account is ready to use:

| Field | Value |
|---|---|
| Email | `demo@example.com` |
| Password | `demo12345` |
| Name | Demo Organizer |

On the login page, click **"Isi kredensial demo"** to autofill these credentials (development only), then press **Log In**.

The seed creates **3 sample events**, each with at least 5 records per menu:

| Event | Date | Categories | Vendors | Budget Entries | Tasks |
|---|---|---|---|---|---|
| Pernikahan Andi & Rina | +60 days | 5 | 6 | 5 | 6 |
| Ulang Tahun Perusahaan Nusantara | +7 days | 5 | 5 | 5 | 6 |
| Gathering Komunitas Fotografi | past event | 5 | 5 | 5 | 6 |

The demo data includes over-budget categories, near-limit categories, every payment status, a cancelled vendor, overdue tasks, and completed tasks.

Remove it anytime with `npm run db:seed:clean`.

---

## 🧭 Routes & Server Actions

| Path | Description |
|---|---|
| `/` | Redirects to the Events Dashboard |
| `/login` | Login / Register (with the development-only demo autofill) |
| `/reset-password` | Request a reset link + set a new password |
| `/events` | Events Dashboard with summary cards |
| `/events/[eventId]` | Event workspace — Overview, Vendors, Budget, Checklist, Timeline tabs |
| `/api/auth/[...nextauth]` | Auth.js route handlers (sign-in, session, callbacks) |

Server Actions live in `src/app/actions/` and map 1:1 to the PRD Action Inventory:

| Action ID | Server Action | Effect |
|---|---|---|
| ACT-01 | `loginAction` | Sign in with credentials |
| ACT-02 | `createEventAction` | Create an event |
| ACT-03 | `updateEventAction` | Update event details |
| ACT-04 | `deleteEventAction` | Delete an event (cascades) |
| ACT-05 | `createVendorAction` | Add a vendor |
| ACT-06 | `updateVendorPaymentAction` | Record a payment (status/amount consistency enforced) |
| ACT-07 | `deleteVendorAction` | Delete a vendor (warns when paid) |
| ACT-08 | `createVendorCategoryAction` | Add a budget category |
| ACT-09 | `createBudgetEntryAction` | Add a standalone budget entry |
| ACT-10 | `createChecklistTaskAction` | Add a checklist task |
| ACT-11 | `toggleTaskCompleteAction` | Complete / reopen a task |
| ACT-13 | `registerAction` | Create an account and sign in |
| ACT-14 | `requestPasswordResetAction` | Issue a hashed, single-use reset token |
| ACT-15 | `updateVendorAction` | Update vendor details |
| ACT-17 | `updateChecklistTaskAction` | Update a task |
| ACT-18 | `deleteChecklistTaskAction` | Delete a task |
| ACT-20 | `deleteVendorCategoryAction` | Delete a category (blocked while linked records exist) |
| ACT-21 | `resetPasswordAction` | Consume the reset token and set a new password |
| ACT-32 | `logoutAction` | Sign out and return to the login screen |

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────────────┐
│                     Vercel (Hosting)                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │               Next.js 16 App Router                 │  │
│  │  ┌────────────┐ ┌─────────────────┐ ┌────────────┐  │  │
│  │  │  Screens   │ │ Server Actions  │ │ Auth.js v5 │  │  │
│  │  │   (RSC)    │ │  /actions/*     │ │  handlers  │  │  │
│  │  └─────┬──────┘ └────────┬────────┘ └─────┬──────┘  │  │
│  │        └───────────┬─────┘                │         │  │
│  │              ┌─────▼────────┐             │         │  │
│  │              │  Data Layer  │◄────────────┘         │  │
│  │              │ src/lib/data │                       │  │
│  │              │  + domain    │                       │  │
│  │              └─────┬────────┘                       │  │
│  │              ┌─────▼────────────┐                   │  │
│  │              │ Prisma 7 + Neon  │                   │  │
│  │              │  driver adapter  │                   │  │
│  │              └─────┬────────────┘                   │  │
│  └────────────────────┼────────────────────────────────┘  │
└───────────────────────┼───────────────────────────────────┘
                        │ HTTPS (pooled connection)
              ┌─────────▼──────────┐
              │   Neon Postgres    │
              │  (Serverless DB)   │
              │  Region: Singapore │
              └────────────────────┘
```

**Single data path**: every screen reads and writes through `src/lib/data`, which enforces ownership (`ownerId` on events, `eventId` on child tables) and business invariants (non-negative money, payment-status consistency, no cross-event links). Pure calculation logic lives in `src/lib/domain` and is shared by the app and the tests.

---

## 🧪 Testing

```bash
npm run test          # 57 tests: unit + integration
npm run test:watch    # watch mode
```

- **Unit tests** cover the domain logic: budget calculations and status thresholds, payment-status mapping, timeline milestone grouping, Zod schemas, Rupiah formatting, and the demo-credentials guard.
- **Integration tests** run real flows against the configured database: full budget flow (vendor payments + entries → category actuals and over-budget alerts), checklist lifecycle, category delete rules, event cascade deletion, cross-event link protection, and access control between two accounts.
- Integration tests create their own `test+...` users and clean up after themselves.

---

## 🔒 Security

- **Server-side authorization on every operation**: all reads/writes go through `requireUser()` and ownership-filtered queries; foreign records return "not found" so IDs cannot be probed (IDOR protection).
- **Input validation on the server**: Zod schemas plus data-layer invariants (negative amounts, inconsistent payment pairs, and cross-event links are rejected in depth).
- **Database-level integrity**: composite foreign keys keep vendors/entries inside their own event, and cascade/restrict rules are enforced by Postgres, not just application code.
- **Password reset tokens**: random 32-byte tokens, stored only as SHA-256 hashes, single use, 1-hour expiry, previous tokens invalidated on each request.
- **Sessions**: Auth.js JWT sessions signed with `AUTH_SECRET`; passwords hashed with bcrypt (12 rounds).
- **Demo tooling is dev-only**: the seed refuses to run when `NODE_ENV=production`, and the login autofill button is never rendered in production.

---

## 🔧 Engineering Notes

- `docs/data-contract.md` documents the review-only data contract (entities, invariants, validation, revalidation map).
- `PRD-Event-Planner-Budget-Tracker.md` is the source of truth for requirements and the Action Inventory (ACT-01..ACT-33).
- `AGENTS.md` carries repo-specific guidance for AI coding agents (commands, conventions, guardrails).

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an *issue* or *pull request* for bug fixes, new features, or documentation improvements.

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

<p align="center">
  Built with ❤️ to make event planning calmer — from the first vendor to H-day.
</p>
