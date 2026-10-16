import "dotenv/config";

import { createBudgetEntry, createVendorCategory } from "@/lib/data/budget";
import { createEvent, deleteEvent } from "@/lib/data/events";
import { createChecklistTask, setTaskCompletion } from "@/lib/data/tasks";
import { createUser, findUserByEmail, updateUserPassword } from "@/lib/data/users";
import {
  createVendor,
  updateVendor,
  updateVendorPayment,
} from "@/lib/data/vendors";
import { prisma } from "@/lib/db";
import {
  expectedPaymentStatus,
  type ContractStatus,
} from "@/lib/domain/payment";
import { hashPassword } from "@/lib/password";
import type { DataResult } from "@/lib/result";

const DEMO_EMAIL = process.env.DEMO_EMAIL?.trim() || "demo@example.com";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo12345";
const DEMO_NAME = "Demo Organizer";

type SeedCategory = { name: string; plannedBudget: number };

type SeedVendor = {
  categoryIndex: number;
  name: string;
  agreedPrice: number;
  amountPaid: number;
  contractStatus?: ContractStatus;
  contactInfo?: string;
  notes?: string;
};

type SeedEntry = {
  categoryIndex: number;
  description: string;
  amount: number;
};

type SeedTask = {
  title: string;
  /** Negative = before the event date (matches H-30/H-7/H-1 milestones). */
  daysFromEvent: number;
  isComplete?: boolean;
  vendorIndex?: number;
};

type SeedEvent = {
  name: string;
  /** Negative = the event is in the past. */
  daysFromToday: number;
  location?: string;
  totalTargetBudget: number;
  /** Minimum 5 per menu: categories, vendors, entries, and tasks. */
  categories: SeedCategory[];
  vendors: SeedVendor[];
  entries: SeedEntry[];
  tasks: SeedTask[];
};

const EVENTS: SeedEvent[] = [
  {
    name: "Pernikahan Andi & Rina",
    daysFromToday: 60,
    location: "Balai Kartini, Jakarta",
    totalTargetBudget: 90_000_000,
    categories: [
      { name: "Catering", plannedBudget: 40_000_000 },
      { name: "Dekorasi", plannedBudget: 15_000_000 },
      { name: "Dokumentasi", plannedBudget: 10_000_000 },
      { name: "Venue", plannedBudget: 20_000_000 },
      { name: "Undangan & Souvenir", plannedBudget: 5_000_000 },
    ],
    vendors: [
      {
        categoryIndex: 0,
        name: "Sunrise Catering",
        agreedPrice: 40_000_000,
        amountPaid: 10_000_000,
        contractStatus: "CONTRACTED",
        contactInfo: "0812-1111-2222",
      },
      {
        categoryIndex: 1,
        name: "Bloom Decor",
        agreedPrice: 15_000_000,
        amountPaid: 0,
        contractStatus: "CONTRACTED",
      },
      {
        categoryIndex: 2,
        name: "Lensa Cerita",
        agreedPrice: 10_000_000,
        amountPaid: 0,
        notes: "Menunggu contoh portofolio terbaru",
      },
      {
        categoryIndex: 3,
        name: "Balai Kartini",
        agreedPrice: 20_000_000,
        amountPaid: 15_000_000,
        contractStatus: "CONTRACTED",
        contactInfo: "021-555-0100",
      },
      {
        categoryIndex: 4,
        name: "Kertas & Kata",
        agreedPrice: 5_000_000,
        amountPaid: 0,
      },
      {
        categoryIndex: 1,
        name: "Aneka Bunga",
        agreedPrice: 2_000_000,
        amountPaid: 0,
        notes: "Opsi vendor bunga tambahan",
      },
    ],
    entries: [
      {
        categoryIndex: 0,
        description: "Biaya tasting menu",
        amount: 500_000,
      },
      {
        categoryIndex: 1,
        description: "Sewa standing flower tambahan",
        amount: 750_000,
      },
      {
        categoryIndex: 2,
        description: "Cetak album preview",
        amount: 300_000,
      },
      {
        categoryIndex: 3,
        description: "Biaya kebersihan & keamanan",
        amount: 1_000_000,
      },
      {
        categoryIndex: 4,
        description: "Ongkos kirim undangan",
        amount: 250_000,
      },
    ],
    tasks: [
      { title: "Buat guest list awal", daysFromEvent: -50, isComplete: true },
      {
        title: "Konfirmasi tanggal tasting katering",
        daysFromEvent: -40,
        vendorIndex: 0,
      },
      {
        title: "Tanda tangan kontrak venue",
        daysFromEvent: -35,
        vendorIndex: 3,
        isComplete: true,
      },
      {
        title: "Finalisasi desain undangan",
        daysFromEvent: -30,
        vendorIndex: 4,
      },
      {
        title: "Pelunasan DP katering",
        daysFromEvent: -7,
        vendorIndex: 0,
      },
      {
        title: "Briefing dekorasi pelaminan",
        daysFromEvent: -1,
        vendorIndex: 1,
      },
    ],
  },
  {
    name: "Ulang Tahun Perusahaan Nusantara",
    daysFromToday: 7,
    location: "Hotel Santika, Bandung",
    totalTargetBudget: 60_000_000,
    categories: [
      { name: "Venue & Ruangan", plannedBudget: 25_000_000 },
      { name: "Konsumsi", plannedBudget: 15_000_000 },
      { name: "Dokumentasi", plannedBudget: 5_000_000 },
      { name: "Dekorasi", plannedBudget: 8_000_000 },
      { name: "Hadiah & Doorprize", plannedBudget: 7_000_000 },
    ],
    vendors: [
      {
        categoryIndex: 0,
        name: "Hotel Santika",
        agreedPrice: 25_000_000,
        amountPaid: 20_000_000,
        contractStatus: "CONTRACTED",
        contactInfo: "022-777-1234",
      },
      {
        categoryIndex: 1,
        name: "Dapur Nusantara",
        agreedPrice: 15_000_000,
        amountPaid: 12_000_000,
        contractStatus: "CONTRACTED",
      },
      {
        categoryIndex: 2,
        name: "Tim Dokumentasi Internal",
        agreedPrice: 5_000_000,
        amountPaid: 0,
        notes: "Menunggu konfirmasi tim internal",
      },
      {
        categoryIndex: 3,
        name: "Dekorasi Kilat",
        agreedPrice: 8_000_000,
        amountPaid: 9_500_000,
        contractStatus: "CONTRACTED",
        notes: "Tambahan backdrop dan lampu",
      },
      {
        categoryIndex: 4,
        name: "Toko Hadiah Kita",
        agreedPrice: 7_000_000,
        amountPaid: 3_500_000,
        contractStatus: "CONTRACTED",
      },
    ],
    entries: [
      {
        categoryIndex: 1,
        description: "Tambahan snack sore",
        amount: 2_000_000,
      },
      {
        categoryIndex: 3,
        description: "Sewa lampu tambahan",
        amount: 1_500_000,
      },
      {
        categoryIndex: 4,
        description: "Cetak voucher doorprize",
        amount: 500_000,
      },
      {
        categoryIndex: 0,
        description: "Biaya overtime ballroom",
        amount: 1_000_000,
      },
      {
        categoryIndex: 2,
        description: "Beli baterai & memory card",
        amount: 400_000,
      },
    ],
    tasks: [
      { title: "Fixed rundown acara", daysFromEvent: -21, isComplete: true },
      { title: "Konfirmasi jumlah peserta", daysFromEvent: -10 },
      {
        title: "Pesan doorprize",
        daysFromEvent: -10,
        vendorIndex: 4,
        isComplete: true,
      },
      { title: "Gladi bersih", daysFromEvent: -3 },
      { title: "Cetak banner & name tag", daysFromEvent: -2 },
      {
        title: "Cek sound & lighting",
        daysFromEvent: -1,
        vendorIndex: 3,
      },
    ],
  },
  {
    name: "Gathering Komunitas Fotografi",
    daysFromToday: -5,
    location: "Kebun Raya, Bogor",
    totalTargetBudget: 25_000_000,
    categories: [
      { name: "Konsumsi", plannedBudget: 10_000_000 },
      { name: "Sewa Tempat", plannedBudget: 6_000_000 },
      { name: "Dokumentasi", plannedBudget: 4_000_000 },
      { name: "Perlengkapan", plannedBudget: 3_000_000 },
      { name: "Transportasi", plannedBudget: 2_000_000 },
    ],
    vendors: [
      {
        categoryIndex: 0,
        name: "Warung Kebun Rasa",
        agreedPrice: 10_000_000,
        amountPaid: 10_000_000,
        contractStatus: "CONTRACTED",
      },
      {
        categoryIndex: 1,
        name: "Pendopo Kebun Raya",
        agreedPrice: 6_000_000,
        amountPaid: 5_500_000,
        contractStatus: "CONTRACTED",
      },
      {
        categoryIndex: 2,
        name: "Lensa Komunitas",
        agreedPrice: 4_000_000,
        amountPaid: 3_500_000,
        contractStatus: "CONTRACTED",
      },
      {
        categoryIndex: 3,
        name: "Sewa Perlengkapan Event",
        agreedPrice: 3_000_000,
        amountPaid: 2_500_000,
        contractStatus: "CONTRACTED",
      },
      {
        categoryIndex: 4,
        name: "Travel Bogor Express",
        agreedPrice: 2_000_000,
        amountPaid: 0,
        contractStatus: "CANCELLED",
        notes: "Dibatalkan; peserta urun kendaraan sendiri",
      },
    ],
    entries: [
      {
        categoryIndex: 0,
        description: "Tambahan air mineral",
        amount: 300_000,
      },
      {
        categoryIndex: 1,
        description: "Biaya kebersihan",
        amount: 250_000,
      },
      {
        categoryIndex: 2,
        description: "Cetak foto kenang-kenangan",
        amount: 500_000,
      },
      {
        categoryIndex: 3,
        description: "Sewa kursi tambahan",
        amount: 400_000,
      },
      {
        categoryIndex: 4,
        description: "Tol & parkir panitia",
        amount: 150_000,
      },
    ],
    tasks: [
      {
        title: "Konfirmasi jumlah peserta",
        daysFromEvent: -21,
        isComplete: true,
      },
      {
        title: "Booking pendopo",
        daysFromEvent: -14,
        vendorIndex: 1,
        isComplete: true,
      },
      { title: "Susun rundown foto", daysFromEvent: -7, isComplete: true },
      {
        title: "Sewa perlengkapan",
        daysFromEvent: -7,
        vendorIndex: 3,
        isComplete: true,
      },
      {
        title: "Briefing relawan",
        daysFromEvent: -3,
        isComplete: true,
      },
      {
        title: "Upload hasil foto ke drive",
        daysFromEvent: -1,
        vendorIndex: 2,
        isComplete: true,
      },
    ],
  },
];

function assertOk<T>(result: DataResult<T>, context: string): T {
  if (!result.ok) {
    throw new Error(`${context}: ${result.error.message}`);
  }
  return result.data;
}

function startOfUtcToday(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

function addDays(base: Date, days: number): Date {
  const result = new Date(base);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function assertDevelopment(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Seed demo tidak boleh dijalankan saat NODE_ENV=production (aturan: seed hanya untuk development)."
    );
  }
}

async function cleanDemo(): Promise<void> {
  const user = await findUserByEmail(DEMO_EMAIL);
  if (!user) {
    console.log(`Tidak ada data demo untuk dibersihkan (${DEMO_EMAIL}).`);
    return;
  }

  const events = await prisma.event.findMany({
    where: { ownerId: user.id },
    select: { id: true },
  });
  for (const event of events) {
    assertOk(await deleteEvent(user.id, event.id), "hapus event demo");
  }
  await prisma.user.delete({ where: { id: user.id } });

  console.log(
    `Data demo dibersihkan: ${events.length} event dan akun ${DEMO_EMAIL} dihapus.`
  );
}

async function seedDemo(): Promise<void> {
  const existing = await findUserByEmail(DEMO_EMAIL);
  let userId: string;

  if (existing) {
    userId = existing.id;
    const staleEvents = await prisma.event.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    for (const event of staleEvents) {
      assertOk(await deleteEvent(userId, event.id), "reset event demo");
    }
    await updateUserPassword(userId, await hashPassword(DEMO_PASSWORD));
  } else {
    const created = assertOk(
      await createUser({
        email: DEMO_EMAIL,
        name: DEMO_NAME,
        passwordHash: await hashPassword(DEMO_PASSWORD),
      }),
      "buat user demo"
    );
    userId = created.id;
  }

  const today = startOfUtcToday();

  for (const definition of EVENTS) {
    const eventDate = addDays(today, definition.daysFromToday);
    const event = assertOk(
      await createEvent(userId, {
        name: definition.name,
        eventDate,
        location: definition.location,
        totalTargetBudget: definition.totalTargetBudget,
      }),
      `buat event "${definition.name}"`
    );

    const categoryIds: string[] = [];
    for (const category of definition.categories) {
      const created = assertOk(
        await createVendorCategory(userId, {
          eventId: event.id,
          name: category.name,
          plannedBudget: category.plannedBudget,
        }),
        `buat kategori "${category.name}"`
      );
      categoryIds.push(created.id);
    }

    const vendorIds: string[] = [];
    for (const vendor of definition.vendors) {
      const categoryId = categoryIds[vendor.categoryIndex];
      const created = assertOk(
        await createVendor(userId, {
          eventId: event.id,
          categoryId,
          name: vendor.name,
          agreedPrice: vendor.agreedPrice,
          contactInfo: vendor.contactInfo,
          notes: vendor.notes,
        }),
        `buat vendor "${vendor.name}"`
      );
      vendorIds.push(created.id);

      if (vendor.contractStatus && vendor.contractStatus !== "NEGOTIATING") {
        assertOk(
          await updateVendor(userId, {
            vendorId: created.id,
            categoryId,
            name: vendor.name,
            agreedPrice: vendor.agreedPrice,
            contractStatus: vendor.contractStatus,
            contactInfo: vendor.contactInfo,
            notes: vendor.notes,
          }),
          `perbarui kontrak vendor "${vendor.name}"`
        );
      }

      if (vendor.amountPaid > 0) {
        assertOk(
          await updateVendorPayment(userId, {
            vendorId: created.id,
            amountPaid: vendor.amountPaid,
            paymentStatus: expectedPaymentStatus(
              vendor.agreedPrice,
              vendor.amountPaid
            ),
          }),
          `perbarui pembayaran vendor "${vendor.name}"`
        );
      }
    }

    for (const entry of definition.entries) {
      assertOk(
        await createBudgetEntry(userId, {
          eventId: event.id,
          categoryId: categoryIds[entry.categoryIndex],
          description: entry.description,
          amount: entry.amount,
        }),
        `buat budget entry "${entry.description}"`
      );
    }

    for (const task of definition.tasks) {
      const created = assertOk(
        await createChecklistTask(userId, {
          eventId: event.id,
          title: task.title,
          deadline: addDays(eventDate, task.daysFromEvent),
          vendorId:
            task.vendorIndex === undefined
              ? undefined
              : vendorIds[task.vendorIndex],
        }),
        `buat task "${task.title}"`
      );

      if (task.isComplete) {
        assertOk(
          await setTaskCompletion(userId, created.id, true),
          `selesaikan task "${task.title}"`
        );
      }
    }
  }

  const [eventCount, vendorCount, entryCount, taskCount] = await Promise.all([
    prisma.event.count({ where: { ownerId: userId } }),
    prisma.vendor.count({ where: { event: { ownerId: userId } } }),
    prisma.budgetEntry.count({ where: { event: { ownerId: userId } } }),
    prisma.checklistTask.count({ where: { event: { ownerId: userId } } }),
  ]);

  console.log(
    [
      "Seed demo selesai (minimal 5 data per menu di setiap event).",
      `- ${eventCount} event, ${vendorCount} vendor, ${entryCount} budget entry, ${taskCount} task untuk akun ${DEMO_EMAIL}.`,
      `- Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`,
      "- Jalankan `npm run db:seed:clean` untuk menghapus seluruh data demo.",
    ].join("\n")
  );
}

async function main(): Promise<void> {
  assertDevelopment();
  if (process.argv.includes("--clean")) {
    await cleanDemo();
  } else {
    await seedDemo();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
