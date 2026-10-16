import { z } from "zod";

const MAX_MONEY = 999_999_999_999;

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Maksimal ${max} karakter`)
    .optional()
    .transform((value) =>
      value === "" || value === undefined ? undefined : value
    );
}

function optionalId() {
  return z
    .string()
    .trim()
    .optional()
    .transform((value) =>
      value === "" || value === undefined ? undefined : value
    );
}

function requiredText(label: string, max: number) {
  return z
    .string(`${label} wajib diisi`)
    .trim()
    .min(1, `${label} wajib diisi`)
    .max(max, `Maksimal ${max} karakter`);
}

function requiredMoney(label: string) {
  return z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed === "" ? undefined : Number(trimmed);
      }
      return value;
    },
    z
      .number(`${label} wajib diisi`)
      .min(0, `${label} tidak boleh negatif`)
      .max(MAX_MONEY, `${label} terlalu besar`)
  );
}

function requiredDate(label: string) {
  return z.coerce.date(`${label} wajib diisi`);
}

function idField(label: string) {
  return z.string(`${label} tidak valid`).trim().min(1, `${label} tidak valid`);
}

export const contractStatusSchema = z.enum([
  "NEGOTIATING",
  "CONTRACTED",
  "CANCELLED",
]);

export const paymentStatusSchema = z.enum([
  "UNPAID",
  "DOWN_PAYMENT",
  "PAID_IN_FULL",
]);

export const registerSchema = z.object({
  name: optionalText(120),
  email: z.string().trim().toLowerCase().pipe(z.email("Email tidak valid")),
  password: z
    .string("Password wajib diisi")
    .min(8, "Password minimal 8 karakter")
    .max(72, "Password maksimal 72 karakter"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Email tidak valid")),
  password: z.string("Password wajib diisi").min(1, "Password wajib diisi"),
});

export const resetRequestSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Email tidak valid")),
});

export const resetPasswordSchema = z.object({
  token: z.string("Token reset tidak valid").trim().min(1, "Token reset tidak valid"),
  password: z
    .string("Password wajib diisi")
    .min(8, "Password minimal 8 karakter")
    .max(72, "Password maksimal 72 karakter"),
});

export const eventCreateSchema = z.object({
  name: requiredText("Nama acara", 160),
  eventDate: requiredDate("Tanggal acara"),
  location: optionalText(240),
  totalTargetBudget: requiredMoney("Target anggaran"),
});

export const eventUpdateSchema = eventCreateSchema.extend({
  eventId: idField("ID acara"),
});

export const eventIdSchema = z.object({
  eventId: idField("ID acara"),
});

export const vendorCreateSchema = z.object({
  eventId: idField("ID acara"),
  categoryId: idField("ID kategori"),
  name: requiredText("Nama vendor", 160),
  agreedPrice: requiredMoney("Harga kesepakatan"),
  contactInfo: optionalText(240),
  notes: optionalText(2000),
});

export const vendorUpdateSchema = z.object({
  vendorId: idField("ID vendor"),
  eventId: idField("ID acara"),
  categoryId: idField("ID kategori"),
  name: requiredText("Nama vendor", 160),
  agreedPrice: requiredMoney("Harga kesepakatan"),
  contractStatus: contractStatusSchema,
  contactInfo: optionalText(240),
  notes: optionalText(2000),
});

export const vendorPaymentSchema = z.object({
  vendorId: idField("ID vendor"),
  eventId: idField("ID acara"),
  amountPaid: requiredMoney("Jumlah dibayar"),
  paymentStatus: paymentStatusSchema,
});

export const vendorDeleteSchema = z.object({
  vendorId: idField("ID vendor"),
  eventId: idField("ID acara"),
});

export const categoryCreateSchema = z.object({
  eventId: idField("ID acara"),
  name: requiredText("Nama kategori", 120),
  plannedBudget: requiredMoney("Anggaran rencana"),
});

export const categoryDeleteSchema = z.object({
  categoryId: idField("ID kategori"),
  eventId: idField("ID acara"),
});

export const budgetEntryCreateSchema = z.object({
  eventId: idField("ID acara"),
  categoryId: idField("ID kategori"),
  description: requiredText("Deskripsi", 240),
  amount: requiredMoney("Jumlah"),
});

export const taskCreateSchema = z.object({
  eventId: idField("ID acara"),
  title: requiredText("Judul tugas", 200),
  deadline: requiredDate("Tenggat"),
  description: optionalText(2000),
  vendorId: optionalId(),
});

export const taskUpdateSchema = z.object({
  taskId: idField("ID tugas"),
  eventId: idField("ID acara"),
  title: requiredText("Judul tugas", 200),
  deadline: requiredDate("Tenggat"),
  description: optionalText(2000),
  vendorId: optionalId(),
});

export const taskDeleteSchema = z.object({
  taskId: idField("ID tugas"),
  eventId: idField("ID acara"),
});

export const taskToggleSchema = z.object({
  eventId: idField("ID acara"),
  taskId: idField("ID tugas"),
  isComplete: z.boolean(),
});
