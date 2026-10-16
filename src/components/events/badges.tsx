import type { ContractStatus, PaymentStatus } from "@/lib/data/types";

export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  NEGOTIATING: "Negotiating",
  CONTRACTED: "Contracted",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  DOWN_PAYMENT: "Down Payment",
  PAID_IN_FULL: "Paid in Full",
};

export const CONTRACT_BADGE_CLASS: Record<ContractStatus, string> = {
  NEGOTIATING: "border-border bg-muted text-contract-negotiating",
  CONTRACTED: "border-contract-active bg-contract-active text-white",
  CANCELLED:
    "border-border bg-muted text-contract-cancelled line-through",
};

export const PAYMENT_BADGE_CLASS: Record<PaymentStatus, string> = {
  UNPAID: "border-payment-unpaid bg-payment-unpaid text-white",
  DOWN_PAYMENT: "border-payment-partial bg-payment-partial text-white",
  PAID_IN_FULL: "border-payment-complete bg-payment-complete text-white",
};
