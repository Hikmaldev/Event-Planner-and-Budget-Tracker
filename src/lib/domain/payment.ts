export type ContractStatus = "NEGOTIATING" | "CONTRACTED" | "CANCELLED";

export type PaymentStatus = "UNPAID" | "DOWN_PAYMENT" | "PAID_IN_FULL";

/**
 * Payment status mapping from PRD 10.4 rule 6:
 * - amountPaid === 0 -> UNPAID
 * - 0 < amountPaid < agreedPrice -> DOWN_PAYMENT (only when agreedPrice > 0)
 * - otherwise -> PAID_IN_FULL
 */
export function expectedPaymentStatus(
  agreedPrice: number,
  amountPaid: number
): PaymentStatus {
  if (amountPaid === 0) {
    return "UNPAID";
  }
  if (agreedPrice > 0 && amountPaid < agreedPrice) {
    return "DOWN_PAYMENT";
  }
  return "PAID_IN_FULL";
}

export function isPaymentStatusConsistent(
  agreedPrice: number,
  amountPaid: number,
  status: PaymentStatus
): boolean {
  return expectedPaymentStatus(agreedPrice, amountPaid) === status;
}
