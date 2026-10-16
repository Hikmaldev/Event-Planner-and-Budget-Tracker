# Product Requirements Document (PRD)

## Event Planner and Budget Tracker

| Item | Detail |
|---|---|
| Document version | 1.0 (Draft) |
| Date | October 13, 2026 |
| Status | Draft for review |
| Tech stack | Next.js, TypeScript, Neon Postgres, Prisma, shadcn/ui |

---

## 1. Product Summary

This app helps a person organize an event, a wedding, a campus event, or a neighborhood gathering, by tracking every vendor, every rupiah of budget, and every task leading up to the day. Instead of juggling a spreadsheet, a notes app, and a dozen WhatsApp threads, the organizer has one place to see the full picture: who's booked, what's been paid, what's left in the budget, and what still needs to happen before H-1.

## 2. Background and Problem

Organizing an event, especially a wedding or a large gathering, usually means coordinating many vendors at once: catering, decoration, documentation, venue, entertainment, and more. This gets messy fast:

- Budget creeps up because nobody is tracking planned spend against actual spend in one place.
- Vendor contracts and payment status live in scattered chat threads or paper notes.
- It's easy to lose track of which vendor has been paid in full, which has a down payment only, and which hasn't been paid at all.
- Tasks before the event (confirm headcount, finalize decoration layout, print materials) get missed because there's no single checklist with deadlines.
- As the event date approaches, there's no clear view of what still needs attention this week versus what can wait.

## 3. Goals and Success Metrics

### 3.1 Goals

1. Give an event organizer one place to track vendors, contracts, and payments per category.
2. Make budget overruns visible early, not discovered after the event.
3. Turn pre-event tasks into a trackable checklist with deadlines, not a scattered mental list.
4. Show a clear timeline view so the organizer always knows what matters right now (H-30, H-7, H-1).
5. Support planning more than one event (not just a single wedding) so the tool works for recurring use, like a campus event committee or a family that plans several gatherings a year.

### 3.2 Success Metrics

| Metric | Target | How to measure |
|---|---|---|
| Events where final spend is tracked against budget in the app | 90%+ of events created | Usage data: events with at least one budget category filled in |
| Budget overruns caught before the event (not after) | Majority of overrun cases flagged via in-app comparison before H-1 | Compare budget vs actual timestamps against event date |
| Pre-event checklist completion rate by H-1 | High completion rate for events actively used in the app | Checklist completion data |
| Time to find a vendor's payment status | Under 15 seconds | User testing |
| Organizer satisfaction with the timeline view | Positive in post-use feedback | Short survey after an event concludes |

## 4. Scope

### 4.1 In Scope (MVP)

- Create an event with name, date, location, and a total target budget.
- Manage a vendor list per category (catering, decoration, documentation, and other custom categories), including contract status and payment status.
- Budget breakdown per category, comparing planned budget vs actual spending.
- Pre-event checklist with tasks and deadlines.
- Timeline view showing the event's key milestones (e.g. H-30, H-7, H-1) and what's due around each.
- Support for managing multiple events under one account (not limited to a single event).

### 4.2 Out of Scope for MVP

- Multi-user real-time collaboration (e.g. a co-organizer editing the same event simultaneously). MVP supports one account managing its own events; sharing/collaboration is a future enhancement.
- Vendor-facing portal (vendors do not log in themselves; all vendor data is entered by the organizer).
- Online payment processing or invoicing. The app tracks payment status, not payment transactions themselves.
- Guest list and RSVP management.
- Automated vendor discovery or marketplace features.

## 5. Target Users

### 5.1 Persona

**Event Organizer (primary user)**
- Plans a wedding, a campus event, or a community gathering, sometimes just once, sometimes repeatedly (e.g. a campus event committee member).
- Juggles multiple vendors and needs to know at a glance who's confirmed, who's paid, and what's left in the budget.
- Wants a single view of what needs attention as the event date approaches.

**Co-Organizer / Committee Member (secondary user, future)**
- Helps plan the same event alongside the primary organizer.
- Out of scope for MVP (see 4.2), but shapes the data model so this can be added later without a rewrite.

## 6. Roles and Access

For MVP, the app is single-account, single-organizer per event. There is no multi-role permission matrix yet; every authenticated user manages their own events fully.

| Feature | Event Owner (the only role in MVP) |
|---|---|
| Create, edit, delete events | Yes |
| Manage vendors per event | Yes |
| Manage budget categories and entries | Yes |
| Manage checklist tasks | Yes |
| View timeline | Yes |

**Resolved (implemented):** ownership of event-scoped records is inherited through `Event.ownerId`; child tables carry `eventId` (see 10.3.1/10.3.3) and the database enforces same-event links with composite foreign keys. The earlier claim that every child table stores `ownerId` is superseded. Confirm at review if the model should change; see Open Question 5.

## 7. Functional Requirements

### 7.1 Authentication

| ID | Requirement | Priority |
|---|---|---|
| FR-AUTH-01 | User creates an account and logs in with email and password (or a provider like Google, if added). | Must |
| FR-AUTH-02 | A user only sees and manages events they own. | Must |
| FR-AUTH-03 | User can reset password via email. | Should |
| FR-AUTH-04 | User can sign out; the session is cleared and the user returns to the Login screen. | Must |

### 7.2 Event Management

| ID | Requirement | Priority |
|---|---|---|
| FR-EVT-01 | User can create an event with name, date, location, and total target budget. | Must |
| FR-EVT-02 | User can edit an event's details after creation. | Must |
| FR-EVT-03 | User can delete an event, with a confirmation step warning that all its vendors, budget entries, and checklist items will be removed. | Must |
| FR-EVT-04 | User can manage multiple events, each fully independent of the others. | Must |
| FR-EVT-05 | Each event shows a quick summary: days remaining, budget used vs. target, checklist completion percentage. | Should |

### 7.3 Vendor Management

| ID | Requirement | Priority |
|---|---|---|
| FR-VND-01 | User can add a vendor under a category (catering, decoration, documentation, or a custom category) within an event. | Must |
| FR-VND-02 | Each vendor has a contract status (e.g. Negotiating, Contracted, Cancelled). | Must |
| FR-VND-03 | Each vendor has a payment status (e.g. Unpaid, Down Payment, Paid in Full), with an amount paid so far. | Must |
| FR-VND-04 | User can record the agreed vendor price, separate from the amount actually paid. | Must |
| FR-VND-05 | User can add contact information and notes per vendor. | Should |
| FR-VND-06 | User can filter or group the vendor list by category or status. | Should |
| FR-VND-07 | User can edit or remove a vendor from an event. | Must |

### 7.4 Budget Tracking

| ID | Requirement | Priority |
|---|---|---|
| FR-BDG-01 | User can define budget categories within an event (e.g. Catering, Decoration, Documentation, Venue), each with a planned amount. | Must |
| FR-BDG-02 | System calculates actual spend per category automatically from the amounts paid to vendors linked to that category. | Must |
| FR-BDG-03 | System shows a planned vs. actual comparison per category and for the event total. | Must |
| FR-BDG-04 | System shows a clear visual indicator when a category's actual spend exceeds its planned budget. | Must |
| FR-BDG-05 | User can record a budget entry not tied to a specific vendor (e.g. a miscellaneous cost), for flexibility. | Should |
| FR-BDG-06 | System shows the overall event budget: total planned, total spent, and remaining. | Must |

### 7.5 Checklist and Tasks

| ID | Requirement | Priority |
|---|---|---|
| FR-CHK-01 | User can add a checklist task with a title, optional description, and a deadline date. | Must |
| FR-CHK-02 | User can mark a task as complete or incomplete. | Must |
| FR-CHK-03 | User can edit or delete a task. | Must |
| FR-CHK-04 | Checklist tasks can optionally be linked to a vendor (e.g. "Confirm final headcount with caterer"). | Should |
| FR-CHK-05 | System highlights overdue tasks (deadline passed, not yet complete) distinctly from upcoming ones. | Must |
| FR-CHK-06 | User can sort or filter the checklist by deadline or completion status. | Should |

### 7.6 Timeline View

| ID | Requirement | Priority |
|---|---|---|
| FR-TML-01 | System shows a timeline view of the event with key markers relative to the event date (e.g. H-30, H-7, H-1, H-day). | Must |
| FR-TML-02 | Checklist tasks appear on the timeline positioned by their deadline date. | Must |
| FR-TML-03 | Timeline clearly distinguishes past, current/upcoming, and future milestones relative to today's date. | Must |
| FR-TML-04 | User can tap a timeline milestone to see the tasks due around that point. | Should |

## 8. Main User Flows

### 8.1 Set Up a New Event

1. User logs in and clicks "New Event."
2. User enters event name, date, location, and total target budget.
3. User adds budget categories (e.g. Catering: Rp 40,000,000, Decoration: Rp 15,000,000).
4. User starts adding vendors under each category as they're contacted and contracted.
5. Event dashboard now shows a summary: days remaining, 0% budget used, 0% checklist complete.

### 8.2 Track a Vendor Payment

1. User opens the event and goes to the Vendors tab.
2. User finds the catering vendor and updates payment status from "Unpaid" to "Down Payment," entering the amount paid.
3. Budget tab automatically reflects the new actual spend under the Catering category.
4. If this pushes Catering's actual spend close to or over its planned amount, the budget view shows a warning indicator.

### 8.3 Review What's Due This Week

1. User opens the event's Timeline view as the event date approaches.
2. User sees the current position relative to H-30/H-7/H-1/H-day markers.
3. User taps the nearest upcoming milestone and sees the checklist tasks due around it.
4. User marks completed tasks as done, and the checklist completion percentage updates on the event summary.

## 9. Non-Functional Requirements

### 9.1 Performance

- Event dashboard loads within 2 seconds for a typical event with up to a few dozen vendors and budget entries.
- Budget calculations (planned vs actual) update immediately after a vendor payment is recorded, without a page reload.

### 9.2 Security

- Passwords are hashed; all traffic runs over HTTPS.
- A user can never view or edit another user's event data, even by guessing an event ID; ownership checks happen on the server for every request.
- Session/auth tokens are handled securely (e.g. via a well-established auth library rather than a custom-built session system).

### 9.3 Reliability

- Deleting an event requires explicit confirmation, since it cascades to all its vendors, budget entries, and checklist tasks.
- A vendor payment update and the resulting budget recalculation happen consistently; the budget view never shows stale totals after a payment is recorded.

### 9.4 Usability

- The budget comparison (planned vs actual) is visible without digging through menus; it's part of the main event dashboard.
- Overdue checklist tasks are visually distinct enough to catch the user's attention without needing to read every row carefully.
- The app works well on both desktop and mobile browsers, since an organizer may check vendor status while out meeting a vendor in person.

### 9.5 Maintainability

- Budget calculation logic (summing vendor payments into category actuals) lives in a single, testable function, not duplicated across multiple UI components.
- Prisma schema reflects the ownership model clearly (`ownerId` on events), anticipating future multi-user sharing without requiring a schema rewrite.

## 10. Technical Architecture

### 10.1 Stack

| Layer | Technology |
|---|---|
| Frontend and backend | Next.js (App Router), TypeScript |
| UI components | shadcn/ui |
| Database | Neon (serverless Postgres) |
| ORM | Prisma |
| Authentication | NextAuth.js (or a comparable auth library compatible with Next.js) |

### 10.2 Component Overview

```
[Next.js App Router: UI + Server Actions/API Routes]
                  |
            [Prisma ORM]
                  |
         [Neon Postgres Database]
```

### 10.3 Data Spec

#### 10.3.1 Entities, Fields, Types, and Required Fields

**User**

| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (cuid), PK | Yes | |
| email | String, unique | Yes | |
| passwordHash | String | Conditional | Required for email/password accounts; nullable for external-provider-only accounts |
| name | String | No | |
| createdAt | DateTime | Yes | |

**PasswordResetToken**

| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (cuid), PK | Yes | |
| userId | String, FK -> User.id | Yes | the account that requested the reset |
| tokenHash | String, unique | Yes | SHA-256 hash of the emailed token; the raw token is never stored |
| expiresAt | DateTime | Yes | 1 hour after creation; expired tokens are rejected |
| usedAt | DateTime, nullable | No | set when the token is consumed; single use |
| createdAt | DateTime | Yes | |

**Event**

| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (cuid), PK | Yes | |
| ownerId | String, FK -> User.id | Yes | the organizer who owns this event |
| name | String | Yes | |
| eventDate | DateTime | Yes | |
| location | String | No | |
| totalTargetBudget | Decimal | Yes | |
| createdAt / updatedAt | DateTime | Yes | |

**VendorCategory**

| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (cuid), PK | Yes | |
| eventId | String, FK -> Event.id | Yes | categories are scoped per event |
| name | String | Yes | e.g. Catering, Decoration, Documentation, or custom |
| plannedBudget | Decimal | Yes | |
| isDefault | Boolean | Yes | true for system-suggested categories at event creation |

**Vendor**

| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (cuid), PK | Yes | |
| eventId | String, FK -> Event.id | Yes | |
| categoryId | String, FK -> VendorCategory.id | Yes | |
| name | String | Yes | |
| contactInfo | String | No | |
| notes | String | No | |
| agreedPrice | Decimal | Yes | |
| contractStatus | Enum(NEGOTIATING, CONTRACTED, CANCELLED) | Yes | default NEGOTIATING |
| paymentStatus | Enum(UNPAID, DOWN_PAYMENT, PAID_IN_FULL) | Yes | default UNPAID |
| amountPaid | Decimal | Yes | default 0 |
| createdAt / updatedAt | DateTime | Yes | |

**BudgetEntry** (for miscellaneous spend not tied to a vendor, per FR-BDG-05)

| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (cuid), PK | Yes | |
| eventId | String, FK -> Event.id | Yes | |
| categoryId | String, FK -> VendorCategory.id | Yes | |
| description | String | Yes | |
| amount | Decimal | Yes | |
| createdAt | DateTime | Yes | |

**ChecklistTask**

| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (cuid), PK | Yes | |
| eventId | String, FK -> Event.id | Yes | |
| vendorId | String, FK -> Vendor.id, nullable | No | optional link per FR-CHK-04 |
| title | String | Yes | |
| description | String | No | |
| deadline | DateTime | Yes | |
| isComplete | Boolean | Yes | default false |
| completedAt | DateTime, nullable | No | set when isComplete becomes true |
| createdAt | DateTime | Yes | |

#### 10.3.2 Relations and Delete Rules

| Relation | Type | Delete Rule | Reasoning |
|---|---|---|---|
| User -> Event | 1-N | Restrict | A user's events should not vanish silently if the account is ever removed through an unrelated process; account deletion (if ever added) must handle events explicitly, not as a side effect |
| User -> PasswordResetToken | 1-N | Cascade | Outstanding reset tokens only exist for their user; deleting the user removes them |
| Event -> VendorCategory | 1-N | Cascade | Categories only have meaning within their event; deleting an event (an explicit, confirmed action per FR-EVT-03) removes its categories |
| Event -> Vendor | 1-N | Cascade | Same reasoning: vendors belong entirely to their event |
| Event -> BudgetEntry | 1-N | Cascade | Same reasoning |
| Event -> ChecklistTask | 1-N | Cascade | Same reasoning |
| VendorCategory -> Vendor | 1-N | Restrict | A category with vendors already assigned cannot be deleted directly; the UI should require reassigning or removing those vendors first, or offer a "merge into another category" action |
| VendorCategory -> BudgetEntry | 1-N | Restrict | Same reasoning as above, to avoid orphaning spend records |
| Vendor -> ChecklistTask | 1-N (optional link) | Set Null | If a linked vendor is deleted, the checklist task should remain (it may still represent a real to-do), with its `vendorId` cleared rather than the task being deleted |

#### 10.3.3 Data Ownership

| Data | Owned by | Who can read | Who can write |
|---|---|---|---|
| An event | The user who created it (`ownerId`) | Only the owner (MVP); future: owner plus any shared collaborators | Only the owner |
| Vendor categories, vendors, budget entries, checklist tasks | The event they belong to, transitively owned by the event's owner | Only the event's owner (MVP) | Only the event's owner |
| User account data | The user themselves | The user (own profile) | The user (own profile) |

**Note:** every event-scoped table (`VendorCategory`, `Vendor`, `BudgetEntry`, `ChecklistTask`) carries an `eventId` rather than a direct `ownerId`, so ownership is always resolved through the parent `Event`. This keeps a single source of truth for "who owns this data" and makes future collaborator sharing (granting another user access to one event) a matter of adding a join table, not restructuring every table's ownership field.

**Relationship scope constraints:** a `Vendor.categoryId` and `BudgetEntry.categoryId` must refer to a category belonging to the same `eventId` as the record. When `ChecklistTask.vendorId` is set, that vendor must belong to the same event as the task. Reject cross-event links in the data layer and enforce referential integrity in the database.

### 10.4 Core Business Rules

1. A category's actual spend is always calculated as the sum of `amountPaid` across its vendors plus the sum of `amount` across its direct `BudgetEntry` records. Nothing is manually entered as "actual spend"; it's always derived.
2. An event's total actual spend is the sum of all its categories' actual spend, and total remaining budget is `totalTargetBudget` minus that sum.
3. A vendor's `paymentStatus` must stay logically consistent with `amountPaid` versus `agreedPrice`, as defined in rule 6; enforce this in application logic rather than leaving it to self-reporting.
4. Deleting a vendor that has an `amountPaid` greater than zero should warn the user, since it will remove that spend from the category's budget calculation.
5. Monetary fields (`totalTargetBudget`, `plannedBudget`, `agreedPrice`, `amountPaid`, and `BudgetEntry.amount`) cannot be negative. Reject negative values in the server/data layer and leave existing records and totals unchanged.
6. When `agreedPrice` is greater than zero, `amountPaid = 0` corresponds to `UNPAID`, `0 < amountPaid < agreedPrice` corresponds to `DOWN_PAYMENT`, and `amountPaid >= agreedPrice` corresponds to `PAID_IN_FULL`. Reject a selected status/amount pair that violates this mapping.
7. Timeline tasks are grouped into the nearest milestone by absolute day distance; ties resolve to the earlier milestone, tasks more than 30 days out clamp to H-30, and tasks after the event clamp to H-day. (Implemented behavior; confirm via Open Question 7.)
8. Deleting an event removes its event-scoped data in one transaction, in the order checklist task -> budget entry -> vendor -> category -> event, so the category `Restrict` rules can never block an explicit event deletion. The database cascades remain as a safety net. (Implemented behavior; confirm via Open Question 9.)

## 11. Action Inventory

| Action ID | Page | UI Element | Endpoint / Server Action | Entity | Success Result | Failure Result |
|---|---|---|---|---|---|---|
| ACT-01 | Login | "Log In" button | `loginAction` server action -> Auth.js v5 (NextAuth) `signIn("credentials")` | User | Session created, redirected to Events dashboard | Invalid credentials or provider error shown; no session created; form stays editable |
| ACT-02 | Events Dashboard | "New Event" button | `createEvent` server action | Event | New event created, appears in the events list immediately | Validation error (e.g. missing name or date) shown inline; event not created |
| ACT-03 | Event Detail | "Edit Event" form → Save | `updateEvent` server action | Event | Event details updated, reflected immediately across the dashboard and timeline | Validation error shown inline; changes not saved |
| ACT-04 | Event Detail | "Delete Event" button + confirmation | `deleteEvent` server action | Event (cascade) | Event and all associated data removed, user returned to the events list | Action cancelled if confirmation is dismissed; no partial deletion |
| ACT-05 | Vendors Tab | "Add Vendor" button | `createVendor` server action | Vendor | New vendor appears in the vendor list under its category immediately | Validation error (e.g. missing name, missing category) shown inline; vendor not created |
| ACT-06 | Vendors Tab | Payment status dropdown + amount field | `updateVendorPayment` server action | Vendor | Payment status and amount updated consistently with `agreedPrice`; Budget tab reflects new actual spend immediately | Validation error (including negative amount or inconsistent status/amount pair) shown inline; update not saved and budget totals remain unchanged |
| ACT-07 | Vendors Tab | "Delete Vendor" button + confirmation | `deleteVendor` server action | Vendor | Vendor removed, category's actual spend recalculated immediately | Warning shown first if amountPaid > 0, requiring explicit confirmation; deletion cancelled if dismissed |
| ACT-08 | Budget Tab | "Add Category" button | `createVendorCategory` server action | VendorCategory | New category appears in the budget breakdown immediately | Validation error shown inline; category not created |
| ACT-09 | Budget Tab | "Add Budget Entry" button | `createBudgetEntry` server action | BudgetEntry | New entry appears under its category, actual spend recalculated immediately | Validation error shown inline; entry not created |
| ACT-10 | Checklist Tab | "Add Task" button | `createChecklistTask` server action | ChecklistTask | New task appears in the checklist and on the timeline immediately | Validation error (e.g. missing title or deadline) shown inline; task not created |
| ACT-11 | Checklist Tab | Checkbox on a task row | `toggleTaskComplete` server action | ChecklistTask | Task marked complete/incomplete, checklist completion percentage updates immediately | N/A beyond a failed network request, which shows a retry option and reverts the checkbox state |
| ACT-12 | Timeline View | Tap a milestone marker | Client-side filter (no new request, uses already-fetched checklist data) | ChecklistTask (read) | Tasks due around that milestone are shown | N/A, purely client-side interaction |
| ACT-13 | Register | "Create Account" form | `registerAction` server action (creates the user with a bcrypt hash, then Auth.js v5 `signIn("credentials")`) | User | Account is created and the user completes the selected sign-in flow to reach the Events dashboard | Invalid input, duplicate email, or provider error is shown; no duplicate account is created |
| ACT-14 | Login / Password Reset | "Forgot password" form | `requestPasswordResetAction` server action (stores a hashed token in `PasswordResetToken` and sends the reset email) | User | Password-reset instructions are requested for the submitted email | Invalid email or provider error is shown; no password change is made |
| ACT-15 | Vendors Tab | Vendor details form → Save | `updateVendor` server action | Vendor | Vendor details (including category, contract status, agreed price, contact information, and notes) are updated; affected budget views refresh immediately | Validation or ownership error is shown; no changes are saved |
| ACT-16 | Vendors Tab | Category/status filter or grouping control | Client-side filter/group over the current event's vendor list | Vendor (read) | List reflects the selected category/status; no-match state is shown when applicable | N/A, local interaction; the full list remains available when filters are cleared |
| ACT-17 | Checklist Tab | Task details form → Save | `updateChecklistTask` server action | ChecklistTask | Task details are updated in the checklist and timeline immediately | Validation or ownership error is shown; no changes are saved |
| ACT-18 | Checklist Tab | "Delete Task" control | `deleteChecklistTask` server action | ChecklistTask | Task is removed from the checklist and timeline immediately | Error is shown; task remains unchanged |
| ACT-19 | Checklist Tab | Deadline/completion sort or filter control | Client-side sort/filter over the current event's task list | ChecklistTask (read) | List reflects the selected sort/filter; no-match state is shown when applicable | N/A, local interaction; the full list remains available when filters are cleared |
| ACT-20 | Budget Tab | "Delete Category" control (per the existing delete rule in §10.3.2) | `deleteVendorCategory` server action | VendorCategory | Category is deleted when it has no linked vendors or budget entries | Database restriction prevents deletion while linked records exist; show the dependent record types and keep the category unchanged; linked BudgetEntry handling is subject to Open Question 10 |
| ACT-21 | Password Reset | Reset form opened from the email link | `resetPasswordAction` server action (consumes the hashed token and updates the password) | User | Password is changed after a valid reset request/link and the user receives confirmation | Invalid reset link or provider error is shown; password remains unchanged |
| ACT-22 | Header (all screens) | Brand link (always) + "Events Dashboard" link (shown only when signed in) | Client navigation to `/events` | — (screen) | Events Dashboard opens for signed-in users; signed-out visitors see a clean header with no extra navigation | N/A |
| ACT-25 | Events Dashboard | Event summary card | Client navigation to `/events/[eventId]` using the event ID from the route | Event (read) | Event workspace opens for the owned event | Missing or foreign event shows the not-found screen |
| ACT-26 | Event Detail | "← Events Dashboard" link | Client navigation to `/events` | — (screen) | Events Dashboard opens | N/A |
| ACT-27 | Login | "Lupa password?" link | Client navigation to `/reset-password` | — (screen) | Password Reset screen opens | N/A |
| ACT-28 | Password Reset | "Kembali ke Log In" and "Menuju halaman Log In" links | Client navigation to `/login` | — (screen) | Login screen opens | N/A |
| ACT-29 | Vendors Tab | "Bersihkan filter" button | Client-side filter reset (no request) | Vendor (read) | Category and status filters return to "ALL" | N/A |
| ACT-30 | Event Detail | Tab triggers (Overview / Vendors / Budget / Checklist / Timeline) | Client-side tab state over already-fetched data (no request) | — (read) | Selected tab panel is shown | N/A |
| ACT-31 | All dialogs | Close (X) control and Esc/overlay dismissal | Component-level dismissal (Radix Dialog) | — | Dialog closes with no data change | N/A |
| ACT-32 | Header (all screens) | "Logout" button (shown when signed in) | `logoutAction` server action -> Auth.js v5 `signOut({ redirectTo: "/login" })` | Session | Session cleared, user returned to the Login screen | N/A (without a session the user still lands on Login) |
| ACT-33 | Login | "Isi kredensial demo" button (development only; shown when the demo account is configured) | Client-side autofill from server-provided demo config (`DEMO_EMAIL` / `DEMO_PASSWORD`); no request | User (login form) | Email and password fields are filled with the demo credentials; the user still submits the form manually | N/A (purely client-side; never rendered in production) |

## 12. Acceptance Criteria per Feature

### 12.1 General (All Pages)

- A brand-new account with no events shows a clear empty state on the Events dashboard (e.g. "You haven't created any events yet. Click 'New Event' to get started.") instead of a blank page.
- Every data screen shows a loading state while data is being fetched, an empty state when no matching data exists, and an error state when loading fails. Empty or failed reads never fall back to demo data.
- A failed create, update, or delete leaves persisted data unchanged and reports the failure to the user.
- Newly added or updated data appears in every affected list/view immediately after the action succeeds, without a manual page refresh.
- Data remains correct and visible after a full page refresh and after navigating to a different menu or tab and back.
- Every event and event-scoped read/write is authorized on the server against the signed-in user's ownership of that event; guessing another user's event or child-record ID never grants access.
- Contract, payment, task-completion, and over-budget states are communicated with both a visual indicator and text; color alone is never the status signal.

### 12.2 Authentication

- A valid registration creates one account; submitting the same email again does not create a duplicate account.
- Successful login creates a session and opens the Events dashboard. Invalid credentials do not create a session and show an error while keeping the form usable.
- A newly registered account with no events sees the Events dashboard empty state and its create-event call to action.
- A valid password-reset request follows the selected provider's email flow; the password changes only after the user submits a valid reset form/link. An invalid reset link leaves the existing password unchanged.

### 12.3 Event Management

- Creating an event with valid name, date, and total target budget adds it to the signed-in user's dashboard immediately; events belonging to another account are not shown.
- A user can manage multiple events independently; changing or deleting one does not alter another event's data.
- Editing an event persists the updated name, date, location, and target budget and refreshes the dashboard/overview/timeline values.
- Deleting an event requires confirmation that names the event and warns that its related data will be removed. Dismissing confirmation leaves the event and all related data intact; confirming removes the event and its event-scoped data.
- The event summary shows days remaining, budget used versus target, and checklist completion based on the event's stored data.

### 12.4 Vendor Management

- An event with no vendors shows a Vendors-tab empty state. A newly created vendor appears under its selected category and has the specified default contract/payment statuses and zero amount paid.
- A vendor cannot be linked to a category belonging to another event. Editing vendor details persists them and updates affected views.
- Updating `amountPaid` or `agreedPrice` rejects negative values and inconsistent status/amount pairs. For `agreedPrice > 0`, zero paid means unpaid, a positive amount below the agreed price means down payment, and an amount equal to or above the agreed price means paid in full. Valid updates immediately refresh vendor and budget views.
- Deleting a vendor with payments warns that its paid amount will be removed from actual spend. Cancelling leaves the vendor unchanged; confirming removes it, recalculates actual spend, and retains linked checklist tasks with `vendorId` set to null.
- Category/status filtering or grouping shows the matching vendors; a filter with no matches has an empty result state and can be cleared.

### 12.5 Budget Tracking

- An event with no budget categories shows an empty state. When categories exist but no vendors or budget entries exist, each category shows zero actual spend.
- Negative event targets, category planned amounts, agreed vendor prices, payment amounts, and budget-entry amounts are rejected by server-side validation; existing data and totals remain unchanged.
- Category actual spend equals the sum of its vendors' `amountPaid` plus its direct budget entries. Event actual spend is the sum of category actuals; remaining budget equals `totalTargetBudget` minus event actual spend.
- Each category shows planned and actual amounts together; the event overview shows its target, actual spend, and remaining amount. The exact event-level “total planned” definition follows Open Question 6.
- A budget entry updates its category actual and event actual immediately. A category over its planned budget displays the over-budget indicator immediately.
- A category cannot be deleted while linked vendors or budget entries exist; the failed deletion leaves the category and linked records intact. A category with no linked records can be deleted. Handling linked budget entries for reassignment/removal remains subject to Open Question 10.
- Budget figures persist correctly after refresh and navigation.

### 12.6 Checklist and Tasks

- An event with no tasks shows a checklist empty state. A valid task appears in the checklist and, when applicable, the timeline immediately after creation.
- A task can be linked only to a vendor from the same event. Editing task fields persists the changes; deleting a task removes it from the checklist and timeline.
- Completing or reopening a task updates its completion state and the event's checklist completion percentage immediately.
- An incomplete task past its deadline remains visibly overdue after refresh/navigation; a completed task is not shown as overdue. Completed tasks remain visible in the checklist, in accordance with the design requirement.
- Sorting/filtering by deadline or completion status returns the expected tasks; an empty filtered result is distinguishable from a loading/error state.

### 12.7 Timeline View

- An event with no tasks shows the H-30, H-7, H-1, and H-day markers without task chips; the timeline is not blank or broken.
- Each task is positioned using its deadline, and selecting a milestone shows the tasks assigned to that milestone by the approved grouping rule (see Open Question 8).
- Past, current/nearest-upcoming, and future markers are distinguished relative to today's actual date. The current position is recalculated on each load, not hardcoded or stale.
- Creating, editing, completing, or deleting a task updates the timeline without a manual refresh.

## 13. UI Requirements

### 13.1 Main Screens

| Screen | Main Content |
|---|---|
| Login / Register | Email and password form |
| Password Reset | Request reset email and submit a new password through the provider's valid reset flow |
| Events Dashboard | List of the user's events, each with a quick summary card |
| Event Overview | Summary: days remaining, budget used vs target, checklist completion |
| Vendors Tab | Vendor list grouped by category, with status badges |
| Budget Tab | Per-category planned vs actual comparison, overall totals |
| Checklist Tab | Task list with deadlines, completion checkboxes |
| Timeline View | Visual timeline with H-30/H-7/H-1/H-day markers and tasks positioned along it |

### 13.2 Design Principles

- The budget comparison (planned vs actual) is never more than one tab away from the event overview; it's core to the app's purpose, not a secondary report.
- Status (contract status, payment status, task completion, over-budget) is always shown visually, with color and text together, never color alone.
- The timeline view answers "what matters right now" at a glance, without requiring the user to read every task in the full checklist.

## 14. Release Plan

| Phase | Scope | Estimated Duration |
|---|---|---|
| Phase 0 | Prisma schema design, auth setup, project scaffolding | 1 to 2 weeks |
| Phase 1 (MVP) | Event management, vendor management, budget tracking, checklist, timeline view | 5 to 6 weeks |
| Phase 2 | Collaborator sharing per event, vendor contact export, budget report export (PDF/Excel) | 2 to 3 weeks |
| Phase 3 (optional) | Vendor marketplace integration, notification reminders for upcoming deadlines | To be scoped later |

## 15. Testing Strategy

- **Unit tests:** budget calculation logic (category actuals, event totals), payment status consistency rules.
- **Integration tests:** full flow from creating an event, adding vendors and budget categories, recording payments, and verifying budget totals update correctly.
- **Access control tests:** verify a user cannot read or modify another user's event via direct API/server action calls.
- **UAT:** an organizer sets up a sample event end-to-end, including a deliberate over-budget scenario and an overdue task, to confirm both are surfaced clearly.

## 16. Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| User deletes an event accidentally, losing all vendor and payment history | Data loss, especially painful for a live event in progress | Explicit confirmation step naming the event before deletion |
| Budget calculations drift if vendor payment data is entered inconsistently | Misleading budget picture | Actual spend is always derived from vendor/budget entry data, never manually overridden, per the core business rules |
| Organizer needs a co-organizer to help manage the event, which MVP doesn't support | Limits adoption for larger events like weddings with multiple family members involved | Flagged clearly as a Phase 2 priority; data model already anticipates it |
| Users expect automatic reminders (e.g. "vendor payment due") that MVP doesn't include | Missed deadlines despite using the app | Timeline and overdue task highlighting cover this partially for MVP; notification reminders are a clear Phase 3 candidate |

## 17. Assumptions and Dependencies

**Assumptions**
- One account manages its own events fully for MVP; no event sharing between accounts is required at launch.
- A vendor's spend is representative of the category's actual cost; the app doesn't need to track taxes, fees, or currency conversion for MVP (assumed single currency, IDR).

**Dependencies**
- Auth provider/library choice (NextAuth.js or alternative) should be settled early, since it affects the User/session data model.
- If Phase 2 collaborator sharing is prioritized sooner, the join-table approach referenced in section 10.3.3 should be designed before Phase 1 ships, to avoid a disruptive migration later.

## 18. Future Enhancements (Backlog)

- Collaborator sharing: invite a co-organizer to a specific event with their own access.
- Export vendor list and budget report to PDF or Excel.
- Notification reminders for upcoming checklist deadlines and vendor payment due dates.
- Guest list and RSVP tracking.
- Vendor rating/review notes for future reference across events.
- Multi-currency support.

## 19. Open Questions

1. Should budget categories come with a suggested default set at event creation (e.g. Catering, Decoration, Documentation, Venue), or should the user always build the list from scratch? **Implementation status:** events start with zero categories; the user creates them manually.
2. How should the app handle a vendor whose contract is cancelled after a down payment was already made, does that amount stay counted as actual spend or get flagged separately? **Implementation status:** payments made to a cancelled vendor remain counted in actual spend until the vendor or its payment data is removed.
3. Is single-currency (IDR) sufficient for the target users, or is multi-currency needed sooner than Phase 3? **Implementation status:** IDR only; all amounts are formatted with `Rp` and id-ID separators.
4. Should the timeline's milestone markers (H-30, H-7, H-1, H-day) be fixed, or configurable per event type (a wedding's timeline differs a lot from a one-day campus event)? **Implementation status:** fixed markers are implemented.
5. Should every event-scoped table store a direct `ownerId` as section 6 says, or should child tables use only `eventId` and inherit ownership through `Event` as section 10.3.3 and the entity definitions say? **Implementation status:** child tables store only `eventId`; ownership is inherited through `Event` and same-event links are enforced with composite foreign keys. Confirm or change.
6. How should event-level “total planned” relate to `totalTargetBudget` and the sum of category `plannedBudget` values when those numbers differ? **Implementation status:** remaining = `totalTargetBudget` minus actual spend; the budget tab additionally shows the sum of category planned budgets as “Total Rencana”.
7. What date window assigns a task to an H-30/H-7/H-1/H-day marker and determines which tasks appear when a marker is selected? **Implementation status:** nearest milestone by absolute day distance; ties resolve to the earlier milestone (rule 7 in §10.4).
8. Which email transport/provider will deliver password-reset emails in production? The auth library is decided (Auth.js v5 / NextAuth with email+password credentials and JWT sessions); only the production email delivery path remains open. **Implementation status:** in development, the reset link is logged to the server console instead of being emailed.
9. Confirm that event deletion can cascade to both categories and vendors while direct category deletion remains restricted when vendors or budget entries still reference it; define any required database-level handling. **Implementation status:** implemented as an ordered transaction (rule 8 in §10.4) with database cascades kept as a safety net.
10. If deleting a category with linked budget entries is restricted, should the MVP include editing/reassigning or deleting a BudgetEntry, or should the category remain undeletable while such entries exist? FR-BDG-05 currently specifies recording entries only. **Implementation status:** BudgetEntry has no edit/delete UI yet; a category with linked entries cannot be deleted (ACT-20 returns `CONFLICT`).
11. Can a vendor have an `agreedPrice` of zero? The payment-status mapping is defined for positive agreed prices; zero-price vendors need an explicit status rule if allowed. **Implementation status:** zero-price vendors are allowed; the mapping applies as written with `amountPaid = 0` mapping to `UNPAID`.

## 20. Glossary

| Term | Meaning |
|---|---|
| H-30 / H-7 / H-1 / H-day | Shorthand for 30/7/1 days before and the day of the event, common in Indonesian event planning |
| Planned vs actual | The comparison between a budget category's target amount and what has actually been spent |
| Contract status | Where a vendor stands in the booking process: negotiating, contracted, or cancelled |
| Payment status | How much of a vendor's agreed price has been paid: unpaid, down payment, or paid in full |
| Event owner | The user account that created and manages a given event |
