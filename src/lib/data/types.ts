export type ContractStatus = "NEGOTIATING" | "CONTRACTED" | "CANCELLED";

export type PaymentStatus = "UNPAID" | "DOWN_PAYMENT" | "PAID_IN_FULL";

export type BudgetStatus = "under" | "near" | "over";

export type MilestoneKey = "H-30" | "H-7" | "H-1" | "H-day";

export type MilestoneState = "past" | "current" | "future";

export type EventListItem = {
  id: string;
  name: string;
  eventDate: string;
  location: string | null;
  daysUntilEvent: number;
  totalTargetBudget: number;
  totalPlanned: number;
  totalActual: number;
  remaining: number;
  budgetStatus: BudgetStatus;
  checklistDone: number;
  checklistTotal: number;
  checklistPct: number;
};

export type CategoryView = {
  id: string;
  name: string;
  isDefault: boolean;
  plannedBudget: number;
  actual: number;
  status: BudgetStatus;
};

export type VendorView = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  contactInfo: string | null;
  notes: string | null;
  agreedPrice: number;
  contractStatus: ContractStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;
};

export type BudgetEntryView = {
  id: string;
  categoryId: string;
  categoryName: string;
  description: string;
  amount: number;
  createdAt: string;
};

export type TaskView = {
  id: string;
  vendorId: string | null;
  vendorName: string | null;
  title: string;
  description: string | null;
  deadline: string;
  isComplete: boolean;
  completedAt: string | null;
  isOverdue: boolean;
};

export type MilestoneView = {
  key: MilestoneKey;
  label: string;
  offsetDays: number;
  date: string | null;
  state: MilestoneState;
  tasks: TaskView[];
};

export type EventWorkspace = {
  event: {
    id: string;
    name: string;
    eventDate: string;
    location: string | null;
    totalTargetBudget: number;
    daysUntilEvent: number;
  };
  summary: {
    totalPlanned: number;
    totalActual: number;
    remaining: number;
    budgetStatus: BudgetStatus;
    checklistDone: number;
    checklistTotal: number;
    checklistPct: number;
    hasOverBudgetCategory: boolean;
  };
  categories: CategoryView[];
  vendors: VendorView[];
  budgetEntries: BudgetEntryView[];
  tasks: TaskView[];
  milestones: MilestoneView[];
  todayIso: string;
};
