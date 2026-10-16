# Design System

## Event Planner and Budget Tracker

| Item | Detail |
|---|---|
| Document version | 1.0 (Draft) |
| Date | October 13, 2026 |
| Companion document | PRD-Event-Planner-Budget-Tracker.md |
| Built for | Next.js, TypeScript, shadcn/ui |

---

## 1. Overview

Planning an event is stressful by nature. Vendors go quiet, budgets creep, deadlines sneak up. This app's job is to be the one calm, legible surface in the middle of that chaos. Every design decision here optimizes for one feeling: **the organizer opens the app and immediately knows where things stand**, not for the app to look impressive in a portfolio screenshot.

Three principles:

1. **Status over decoration.** A vendor's payment status and a budget category's over/under state are the most important pixels on any screen. They get color, weight, and position priority over everything else.
2. **Planned and actual always sit side by side.** Never show a spending number without its budget counterpart nearby. A number alone doesn't answer "is this okay or not."
3. **Time pressure is visible, not vague.** "3 days left" beats "upcoming." Overdue is red and says "overdue," not a neutral gray dash.

## 2. Colors

### 2.1 Core Palette

Built on shadcn/ui's default theming approach (CSS variables mapped to Tailwind), so these tokens map directly to a `tailwind.config` theme extension.

| Token | Hex | Usage |
|---|---|---|
| `foreground` | `#18181B` | Primary text |
| `muted-foreground` | `#71717A` | Secondary text, labels |
| `background` | `#FFFFFF` | Page background |
| `card` | `#FFFFFF` | Card surfaces |
| `border` | `#E4E4E7` | Dividers, card borders |
| `primary` | `#3B5BDB` | Primary actions, active tab, links |

### 2.2 Budget Status Colors

The single most important color set in the app. These represent the relationship between planned and actual spend, and appear on budget category rows, progress bars, and the event overview.

| Status | Token | Hex | Usage |
|---|---|---|---|
| Under budget | `budget-under` | `#1A7F4C` (green) | Actual spend comfortably below planned (under ~80%) |
| Near limit | `budget-near` | `#B8860B` (amber) | Actual spend between 80% and 100% of planned |
| Over budget | `budget-over` | `#C0362C` (red) | Actual spend exceeds planned |

**Rule:** these three colors are reserved for budget-vs-planned comparisons only. They never represent anything else on the dashboard (not vendor status, not task status), so a glance at any shade of red on the budget tab means exactly one thing: something is over budget.

### 2.3 Vendor Status Colors

Deliberately a separate palette from budget status, using different hues so the two systems are never visually confused, even though both appear on the Vendors tab.

| Status type | Value | Token | Hex | Usage |
|---|---|---|---|---|
| Contract | Negotiating | `contract-negotiating` | `#71717A` (gray) | Still in discussion |
| Contract | Contracted | `contract-active` | `#3B5BDB` (blue) | Signed, active |
| Contract | Cancelled | `contract-cancelled` | `#A1A1AA` (light gray, strikethrough text) | No longer active |
| Payment | Unpaid | `payment-unpaid` | `#C0362C` (red) | Nothing paid yet |
| Payment | Down Payment | `payment-partial` | `#B8860B` (amber) | Partially paid |
| Payment | Paid in Full | `payment-complete` | `#1A7F4C` (green) | Fully settled |

**Rule:** payment status reuses the same green/amber/red hues as budget status, because the underlying meaning rhymes ("not done" / "in progress" / "done, good"). Contract status, by contrast, uses blue and grays, since "negotiating" isn't a warning state, it's just an earlier stage. Don't color-code contract status with the red/amber/green budget logic; that would wrongly imply "negotiating" is a problem.

### 2.4 Task and Timeline Colors

| Token | Hex | Usage |
|---|---|---|
| `task-upcoming` | `#71717A` (gray) | Incomplete task, deadline not yet passed |
| `task-overdue` | `#C0362C` (red) | Incomplete task, deadline has passed |
| `task-complete` | `#1A7F4C` (green), with strikethrough text | Completed task |
| `timeline-past` | `#E4E4E7` (light gray) | Timeline milestones already passed |
| `timeline-current` | `#3B5BDB` (blue), filled marker | The nearest upcoming or current milestone |
| `timeline-future` | `#A1A1AA` (muted gray) | Milestones further ahead |

## 3. Typography

### 3.1 Typeface

**Inter**, consistent with shadcn/ui's default typography setup. No secondary display font. This is a working tool used while on the phone with a caterer or standing at a venue walkthrough; it needs to read fast under any circumstance, not look elegant in isolation.

### 3.2 Type Scale

| Token | Size | Weight | Usage |
|---|---|---|---|
| `metric-xl` | 30px / 1.2 | 700 | Event overview's big numbers (budget remaining, days left) |
| `heading-lg` | 22px / 1.3 | 600 | Page and tab section titles |
| `heading-sm` | 16px / 1.4 | 600 | Card titles, vendor/category names |
| `body` | 14px / 1.5 | 400 | General content, form labels |
| `body-numeric` | 14px / 1.5 | 500, tabular-nums | All currency figures |
| `caption` | 12px / 1.4 | 400 | Timestamps, secondary metadata |

### 3.3 Rules

- Every currency amount uses `body-numeric` with tabular figures enabled, so a planned-vs-actual pair of numbers lines up vertically for fast scanning.
- Currency is always formatted with the Rupiah symbol and thousands separators (e.g. "Rp 40.000.000"), never abbreviated to "40jt" or similar shorthand in the UI itself, since ambiguity in a budget tool is worse than a slightly longer string.
- Overdue task titles and over-budget category names are the only text elements in the app that combine both color (red) and weight (medium/600) together. This double-signal is reserved for genuinely urgent states, not used decoratively elsewhere.

## 4. Elevation

shadcn/ui's default card and dialog elevation conventions, used minimally.

| Level | Usage |
|---|---|
| `elevation-0` (border only, no shadow) | Vendor rows, checklist rows, budget category rows |
| `elevation-1` (`shadow-sm`) | Summary cards on the Event Overview |
| `elevation-2` (`shadow-md`) | Dropdown menus, popovers (e.g. payment status selector) |
| `elevation-3` (`shadow-lg`) | Dialogs: delete confirmation, add vendor/task forms |

**Rule:** list rows (vendors, tasks, budget categories) stay flat with just a border. These are dense, scannable lists, and a shadow on every row would make a 15-vendor list look like a stack of loose cards rather than one organized table.

## 5. Components

### 5.1 Event Summary Card (Events Dashboard)

```
┌───────────────────────────────┐
│ Budi & Sari's Wedding          │  heading-sm
│ 📅 Dec 20, 2026 · 23 days left │  caption, muted-foreground
│                                 │
│ Budget: Rp 68M / Rp 90M  76%   │  body-numeric + progress bar
│ [████████████░░░░]              │  budget-under/near/over color
│ Checklist: 12/18 done           │  body, with small progress indicator
└───────────────────────────────┘
```

Days-left text shifts to `task-overdue` red styling once the event date has passed (for historical/past events still visible in the list), so a glance at the dashboard never confuses a past event with an upcoming one.

### 5.2 Budget Category Row

```
Catering                          Rp 38,500,000 / Rp 40,000,000
[██████████████████░░]  96%                         near-limit amber
```

Progress bar fill color follows section 2.2's three-state rule. The percentage label uses bold weight only in the near-limit and over-budget states, consistent with the "double signal reserved for urgency" rule in section 3.3.

### 5.3 Vendor Row

```
[Category Icon]  Sunrise Catering          CONTRACTED · PAID IN FULL
                  Rp 40,000,000 agreed      blue badge · green badge
```

Two separate status badges per vendor row, contract status and payment status, each using their own color system from section 2.3. Never merge these into a single combined badge; an organizer needs to independently know "are we committed to this vendor" and "have we paid them," and those two answers don't always move together.

### 5.4 Checklist Task Row

```
☐  Confirm final headcount with caterer        Due Dec 13 (overdue)
    Linked: Sunrise Catering                      task-overdue red
```

Checkbox interaction is immediate, no confirmation dialog for checking/unchecking a task; this is a low-stakes, frequent action and should feel light. Completed tasks move to the bottom of the list (or a collapsed "Completed" section) rather than disappearing, so the organizer retains a sense of total progress.

### 5.5 Timeline View

A horizontal (desktop) or vertical (mobile) line with milestone markers at H-30, H-7, H-1, and H-day. Each marker's fill color follows section 2.4: light gray for past, filled blue for the current/nearest upcoming milestone, muted gray for further future ones. Tasks cluster as small dots or chips along the line near their deadline date; tapping a milestone expands the tasks nearest to it.

**Rule:** the current/nearest-upcoming marker is the only one that gets the solid `primary` blue fill. This single visual anchor is what lets an organizer glance at the timeline and know "here's where we are" without reading any text.

### 5.6 Add Vendor / Add Task Dialog

Built on shadcn/ui's `Dialog` component. Required fields (name, category for vendors; title, deadline for tasks) are visually grouped at the top of the form; optional fields (notes, contact info, description) sit below a subtle divider. This keeps the fast path, add a vendor with just a name and category in a few seconds, visually obvious, while still making room for detail when the organizer has time to fill it in.

### 5.7 Over-Budget Alert Banner

Appears at the top of the Budget tab only when at least one category is in the over-budget state. Uses `budget-over` red as a left border accent on a light red-tinted background (`bg-red-50` equivalent), not a full solid red banner, which would feel alarming every time the tab is opened rather than genuinely informative.

## 6. Spacing

8px base grid, consistent with Tailwind's default spacing scale that shadcn/ui is built on.

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Badge padding, icon-to-text gaps |
| `space-2` | 8px | Gaps within a row (status badges next to each other) |
| `space-3` | 12px | Gap between a row's label and its value |
| `space-4` | 16px | Card padding |
| `space-6` | 24px | Gap between major sections (e.g. between the summary cards and the category list) |
| `space-8` | 32px | Page-level top padding |

**Rule:** vendor, task, and budget category rows all share the same internal padding (`space-4`) and row height target, so switching between tabs doesn't require the eye to recalibrate to a different list rhythm.

## 7. Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 6px | Badges, buttons, inputs (shadcn/ui default) |
| `radius-md` | 10px | Cards, dialogs |
| `radius-full` | 9999px | Status badge pills, timeline milestone markers |

Matches shadcn/ui's default rounded aesthetic, no customization needed beyond the standard theme, since consistency with a well-tested component library reduces visual bugs more than a custom radius scale would add polish.

## 8. Do's and Don'ts

### Budget Clarity

✅ **Do** always show a planned amount next to an actual amount, never actual spend in isolation.
❌ **Don't** show a raw spend total without its budget context. "Rp 38,500,000 spent" means nothing on its own; "Rp 38,500,000 of Rp 40,000,000" means everything.

✅ **Do** reserve red exclusively for the over-budget and overdue states.
❌ **Don't** use red decoratively anywhere else (icons, headers, branding accents). The moment red stops meaning "pay attention right now," the whole budget-tracking value of the app weakens.

### Vendor Status

✅ **Do** keep contract status and payment status as two visually distinct badges.
❌ **Don't** combine them into one badge or one color system. "Contracted but unpaid" and "negotiating but a deposit was somehow already sent" are both real, confusing situations that only make sense if the two statuses stay independently visible.

### Checklist and Timeline

✅ **Do** let completed tasks stay visible (moved down or collapsed), not vanish.
❌ **Don't** delete a task from view the moment it's checked off. An organizer benefits from seeing "look how much we've already handled" as much as "what's left."

✅ **Do** anchor the timeline to today's actual date, recalculated on every load.
❌ **Don't** cache or hardcode the "current" milestone marker. An event planning app that shows the wrong "where we are" position has failed at its single most reassuring feature.

### General Restraint

✅ **Do** let shadcn/ui's default component behavior carry most of the interaction design; customize color and copy, not component mechanics.
❌ **Don't** build custom interaction patterns (custom dropdowns, custom modals) where a standard shadcn/ui component already does the job well. This app's time budget is better spent on budget logic correctness than on UI novelty.
