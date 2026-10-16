# Kontrak Data — Event Planner and Budget Tracker

| Item | Detail |
|---|---|
| Status | Draft untuk review; belum ada implementasi |
| Sumber | `PRD-Event-Planner-Budget-Tracker.md` |
| Stack target | Next.js App Router + TypeScript, Prisma, Neon Postgres |
| Referensi | Context7: `/vercel/next.js/v16.2.9`, `/prisma/web` |

Dokumen ini adalah kontrak perilaku data: bentuk entitas, relasi, invarian, validasi, akses, dan hasil operasi. Skema Prisma, migrasi, UI, dan kode baru dibuat setelah kontrak ini disetujui. Kontrak ini tidak menambah fitur di luar PRD; keputusan produk yang masih terbuka ditandai **[Perlu keputusan]**.

## 1. Ruang lingkup versi

- Next.js 16 mensyaratkan Node.js >= 20.9.0 dan TypeScript >= 5.1.0 (sumber: panduan upgrade v16 di Context7).
- Route dinamis memakai `params` yang berupa `Promise`; setiap `page`/`layout`/route handler harus `await params` (v16.x, `/vercel/next.js/v16.2.9`).
- App Router: folder dalam tanda kurung membentuk route group tanpa memengaruhi URL, dan segmen dinamis seperti `[id]` disalurkan sebagai `params` ke `page`/`layout`/route handler.
- Prisma: aksi referensial `Cascade`, `Restrict`, `SetNull`, `NoAction` dipasang di sisi foreign key lewat `onDelete`; bila tidak ditulis, keputusan diserahkan ke database.

## 2. Entitas dan field

### 2.1 Konvensi umum

- ID: `String @id @default(cuid())`.
- Uang: `Decimal`, tidak boleh negatif. Usulan `Decimal(14, 2)` sudah cukup untuk nominal IDR hingga ratusan miliar rupiah; **konfirmasi presisi saat review**, lalu konsisten di seluruh dokumen.
- Waktu: `DateTime` tersimpan UTC; perhitungan H-day dan overdue memakai zona waktu pengguna yang akan ditetapkan saat implementasi.
- Enum Prisma: `ContractStatus = NEGOTIATING | CONTRACTED | CANCELLED`, `PaymentStatus = UNPAID | DOWN_PAYMENT | PAID_IN_FULL`.
- Timestamp `createdAt`/`updatedAt` sesuai PRD §10.3.1.

### 2.2 Field per entitas

**User**

| Field | Type | Wajib | Aturan |
|---|---|---|---|
| id | String cuid | Ya | PK |
| email | String | Ya | Unik. Kontrak mengasumsikan query case-insensitive (simpan lowercase). **Konfirmasi saat review** |
| passwordHash | String? | Kondisional | Wajib jika login email/password; null jika hanya provider eksternal |
| name | String? | Tidak | — |
| createdAt | DateTime | Ya | — |

**Event**

| Field | Type | Wajib | Aturan |
|---|---|---|---|
| id | String cuid | Ya | PK |
| ownerId | String | Ya | FK ke User; **tidak boleh null**; sumber kebenaran kepemilikan |
| name | String | Ya | Tidak boleh string kosong |
| eventDate | DateTime | Ya | Boleh masa lalu; tetap ditampilkan sebagai acara historis |
| location | String? | Tidak | — |
| totalTargetBudget | Decimal | Ya | >= 0 |
| createdAt / updatedAt | DateTime | Ya | — |

**VendorCategory**

| Field | Type | Wajib | Aturan |
|---|---|---|---|
| id | String cuid | Ya | PK |
| eventId | String | Ya | FK ke Event |
| name | String | Ya | Tidak kosong; unik per event **[Perlu keputusan]** |
| plannedBudget | Decimal | Ya | >= 0 |
| isDefault | Boolean | Ya | Default `false`; `true` hanya untuk kategori bawaan saat pembuatan event |

**Vendor**

| Field | Type | Wajib | Aturan |
|---|---|---|---|
| id | String cuid | Ya | PK |
| eventId | String | Ya | FK ke Event; harus sama dengan event kategori |
| categoryId | String | Ya | FK ke VendorCategory; kategori harus milik `eventId` yang sama |
| name | String | Ya | Tidak kosong |
| contactInfo | String? | Tidak | — |
| notes | String? | Tidak | — |
| agreedPrice | Decimal | Ya | >= 0; **[Perlu keputusan]** bolehkah 0 (Open Question 11) |
| contractStatus | enum | Ya | Default `NEGOTIATING` |
| paymentStatus | enum | Ya | Default `UNPAID`; harus konsisten dengan aturan pemetaan §4 |
| amountPaid | Decimal | Ya | Default 0; >= 0 |
| createdAt / updatedAt | DateTime | Ya | — |

**BudgetEntry**

| Field | Type | Wajib | Aturan |
|---|---|---|---|
| id | String cuid | Ya | PK |
| eventId | String | Ya | FK ke Event; harus sama dengan event kategori |
| categoryId | String | Ya | FK ke VendorCategory; kategori harus milik `eventId` yang sama |
| description | String | Ya | Tidak kosong |
| amount | Decimal | Ya | >= 0 |
| createdAt | DateTime | Ya | — |

**ChecklistTask**

| Field | Type | Wajib | Aturan |
|---|---|---|---|
| id | String cuid | Ya | PK |
| eventId | String | Ya | FK ke Event; harus sama dengan event vendor jika `vendorId` diisi |
| vendorId | String? | Tidak | FK ke Vendor; null jika vendor dihapus (SetNull) |
| title | String | Ya | Tidak kosong |
| description | String? | Tidak | — |
| deadline | DateTime | Ya | Boleh masa lalu (menandakan overdue) |
| isComplete | Boolean | Ya | Default `false` |
| completedAt | DateTime? | Tidak | Diisi saat `isComplete = true`; dikosongkan saat dibuka kembali |
| createdAt | DateTime | Ya | — |

## 3. Relasi dan aksi referensial

| Relasi | Kardinalitas | `onDelete` | Catatan |
|---|---|---|---|
| User -> Event | 1-N | Restrict | User dengan event tidak bisa dihapus (penghapusan akun di luar scope MVP) |
| Event -> VendorCategory | 1-N | Cascade | Menghapus event menghapus kategori |
| Event -> Vendor | 1-N | Cascade | — |
| Event -> BudgetEntry | 1-N | Cascade | — |
| Event -> ChecklistTask | 1-N | Cascade | — |
| VendorCategory -> Vendor | 1-N | Restrict | Blokir hapus kategori selama masih ada vendor |
| VendorCategory -> BudgetEntry | 1-N | Restrict | Blokir hapus kategori selama masih ada budget entry |
| Vendor -> ChecklistTask | 1-N opsional | SetNull | Task tetap ada; `vendorId` dikosongkan |

**Ordering mutasi untuk menghapus event [Perlu keputusan / Open Question 9]:** ada ketegangan antara cascade `Event -> VendorCategory`/`Event -> Vendor` dan `Restrict` `VendorCategory -> Vendor`/`-> BudgetEntry`. Urutan efek FK tidak bisa diatur dalam satu statement, jadi dua opsi:
1. Andalkan cascade database (satu statement) dan uji perilakunya di Neon; jika database menolak karena constraint, pindah ke opsi 2.
2. Hapus di data layer dalam satu transaksi berurutan: checklist task -> budget entry -> vendor -> kategori -> event, sehingga constraint `Restrict` aman.

**Konsistensi lintas-event (wajib di database + data layer):**
- `Vendor.categoryId` harus milik `Vendor.eventId`.
- `BudgetEntry.categoryId` harus milik `BudgetEntry.eventId`.
- `ChecklistTask.vendorId` (jika diisi) harus milik `ChecklistTask.eventId`.

## 4. Invarian dan aturan bisnis

1. **Aktual per kategori** = Σ `Vendor.amountPaid` kategori tersebut + Σ `BudgetEntry.amount` kategori tersebut. Nilai tidak pernah diisi manual.
2. **Aktual event** = Σ aktual seluruh kategori.
3. **Sisa anggaran** = `totalTargetBudget` - aktual event.
4. **Uang non-negatif:** `totalTargetBudget`, `plannedBudget`, `agreedPrice`, `amountPaid`, `BudgetEntry.amount` menolak nilai negatif di server/data layer.
5. **Pemetaan status pembayaran** (saat `agreedPrice > 0`):
   - `amountPaid = 0` -> `UNPAID`
   - `0 < amountPaid < agreedPrice` -> `DOWN_PAYMENT`
   - `amountPaid >= agreedPrice` -> `PAID_IN_FULL`
   Kombinasi status/amount yang tidak sesuai ditolak. **[Perlu keputusan]** aturan untuk `agreedPrice = 0` (Open Question 11).
6. **Overdue** = `isComplete = false` dan `deadline < now`, dihitung saat render, bukan disimpan.
7. **Milestone timeline:** pengelompokan task ke H-30/H-7/H-1/H-day menunggu definisi jendela tanggal (Open Question 7).
8. **Total planned event:** hubungan `totalTargetBudget` dengan Σ `plannedBudget` menunggu keputusan (Open Question 6).
9. **Vendor dibatalkan (CANCELLED)** dengan `amountPaid > 0`: perlakuan masuk/tidaknya ke aktual menunggu keputusan (Open Question 2).
10. **Hapus vendor dengan `amountPaid > 0`** wajib konfirmasi eksplisit; setelah dihapus, aktual kategori langsung berubah.

## 5. Validasi server-side (lapisan data)

Semua input divalidasi ulang di server dengan schema (mis. Zod `safeParse`), bukan hanya di UI. Sumber: panduan Forms Next.js v16.2.9 (validasi server-side + `useActionState`).

| Field | Aturan | Kode error |
|---|---|---|
| name (event, vendor, kategori), title (task), description (budget entry) | non-empty setelah trim | `REQUIRED` |
| eventDate, deadline | tanggal valid | `INVALID_DATE` |
| totalTargetBudget, plannedBudget, agreedPrice, amountPaid, amount | `>= 0` | `NEGATIVE_AMOUNT` |
| amountPaid vs agreedPrice | sesuai pemetaan §4.5 | `PAYMENT_STATUS_MISMATCH` |
| categoryId | milik event yang sama | `CROSS_EVENT_LINK` |
| vendorId | milik event yang sama | `CROSS_EVENT_LINK` |
| email | format valid; unik (case-insensitive) | `INVALID_EMAIL`, `EMAIL_TAKEN` |
| hapus kategori | tidak ada vendor/budget entry tertaut | `CATEGORY_HAS_DEPENDENTS` |

## 6. Kontrak hasil operasi

Semua Server Action mengembalikan bentuk diskriminatif (nilai, bukan `throw` untuk error yang diharapkan):

```ts
// kode saja; belum diimplementasikan
type FieldErrors = Record<string, string[]>;

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: 'VALIDATION'; fieldErrors: FieldErrors }
  | { ok: false; code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'CONFLICT' | 'INTERNAL'; message: string };
```

| Kode | Kondisi | Efek data |
|---|---|---|
| `ok: true` | Operasi valid | Perubahan tersimpan, revalidasi dijalankan |
| `VALIDATION` | Input gagal schema/invarian | Tidak ada perubahan |
| `UNAUTHENTICATED` | Tidak ada sesi valid | Tidak ada perubahan |
| `NOT_FOUND` | ID tidak ada atau bukan milik user | Tidak ada perubahan (tanpa membocorkan keberadaan data user lain) |
| `CONFLICT` | Pelanggaran constraint (mis. `CATEGORY_HAS_DEPENDENTS`, `EMAIL_TAKEN`) | Tidak ada perubahan |
| `INTERNAL` | Kegagalan tak terduga | Tidak ada perubahan; pengguna dapat mencoba ulang |

Aturan Next.js yang diadopsi:
- Error yang diharapkan dikembalikan sebagai nilai, bukan dilempar (panduan Error Handling v16).
- Error tidak terduga ditangani dengan `error.tsx` per segmen; `not-found.tsx` untuk data yang tidak ditemukan.

## 7. Akses data (DAL) dan otorisasi

- Struktur yang diusulkan: `lib/db.ts` (Prisma client), `lib/data/*` (query/mutasi), `app/**/actions.ts` (Server Actions tipis yang memanggil lapisan data).
- Pola otorisasi: setiap query anak menyertakan relasi event dengan `ownerId` user sesi:
  - `vendorCategory.findFirst({ where: { id, event: { ownerId: userId } } })`, dan setara untuk `vendor`, `budgetEntry`, `checklistTask`.
  - Insert memverifikasi `eventId` milik user dan `categoryId`/`vendorId` berada di event yang sama.
- Sumber: panduan Authentication & Data Security Next.js v16 — jangan hanya mengandalkan pengecekan di layout; setiap Server Action/Route Handler memverifikasi ulang sesi + kepemilikan (mencegah IDOR).
- `verifySession` di-memoize dengan `cache` dari React dan dipanggil dari setiap akses data.
- Kepemilikan transparan bagi pengguna: data user lain selalu menghasilkan `NOT_FOUND`.

## 8. Peta aksi (mengacu Action Inventory PRD §11)

Setiap aksi memetakan input, cek tambahan, dan target revalidasi. Nama modul final menyesuaikan struktur proyek saat implementasi.

| Aksi | Input inti | Cek tambahan di luar skema | Revalidasi |
|---|---|---|---|
| `createEvent` | name, eventDate, location?, totalTargetBudget | sesi | `revalidatePath('/events')` |
| `updateEvent` | eventId, field yang berubah | kepemilikan via `ownerId` | path event + `/events` |
| `deleteEvent` | eventId, konfirmasi nama | kepemilikan | path event + `/events` |
| `createVendorCategory` | eventId, name, plannedBudget, isDefault? | kepemilikan event | path budget event |
| `deleteVendorCategory` | categoryId | kepemilikan; tidak ada dependen -> `CONFLICT` | path budget event |
| `createVendor` | eventId, categoryId, name, agreedPrice, status? | kategori satu event | path vendor + budget event |
| `updateVendor` | vendorId, field detail | kepemilikan; konsistensi status/amount | path vendor + budget event |
| `updateVendorPayment` | vendorId, amountPaid, paymentStatus | kepemilikan; pemetaan §4.5 | path vendor + budget event |
| `deleteVendor` | vendorId, konfirmasi bila `amountPaid > 0` | kepemilikan | path vendor + budget event |
| `createBudgetEntry` | eventId, categoryId, description, amount | kategori satu event | path budget event |
| `createChecklistTask` | eventId, title, deadline, vendorId? | vendor satu event | path checklist + timeline event |
| `updateChecklistTask` | taskId, field yang berubah | kepemilikan; vendor satu event | path checklist + timeline event |
| `toggleTaskComplete` | taskId, isComplete | kepemilikan; set/kosongkan `completedAt` | path checklist + timeline event |
| `deleteChecklistTask` | taskId | kepemilikan | path checklist + timeline event |

Auth (ACT-01, ACT-13, ACT-14, ACT-21) memakai Auth.js v5 (`next-auth`) dengan Credentials + JWT session; form register/reset memakai `ActionResult` ini sedangkan login mengandalkan redirect `signIn`.

## 9. Kontrak tipe untuk UI

- Semua nilai `Decimal` dikonversi ke `number` di batas server (setelah agregasi) atau dikirim sebagai string desimal; UI memformat Rupiah penuh (mis. `Rp 40.000.000`) sesuai design system. **[Perlu keputusan]** representasi angka di UI (number vs string).
- Tanggal dikirim sebagai ISO-8601 UTC; label dan perhitungan relatif dilakukan di server untuk konsistensi.
- Semua layar data menerima satu dari tiga keadaan: `loading`, `empty`, `error` — tidak ada fallback ke data contoh.
- Kontrak agregat minimal untuk UI:
  - `EventSummary`: `daysRemaining`, `totalTargetBudget`, `totalActual`, `remaining`, `checklistDone`, `checklistTotal`.
  - `CategoryRow`: `plannedBudget`, `actual`, `ratio`, `status: 'under' | 'near' | 'over'`.
  - `VendorRow`: `contractStatus`, `paymentStatus`, `agreedPrice`, `amountPaid`.
  - `TimelineMilestone`: `key`, `date`, `state: 'past' | 'current' | 'future'`, `tasks[]`.

## 10. Pembaruan tanpa refresh manual

- Server Action memanggil `revalidatePath`/`revalidateTag` sesuai peta §8 setelah mutasi berhasil (pola resmi v16: `revalidatePath` untuk invalidasi cache setelah mutasi).
- Data yang memblokir render langsung (nama, status, angka) menerima hasil action lewat `useActionState` sehingga UI langsung konsisten.
- Tag yang diusulkan: `events:{userId}`, `event:{eventId}`, `event:{eventId}:budget`, `event:{eventId}:timeline`. Aksi budget/vendor/task menandai tag terkait; halaman lain yang membaca data sama ikut segar.
- Tab dalam event di-render dari data yang sudah difetch halaman; pindah tab tidak memicu fetch baru.

## 11. Keputusan yang masih terbuka

| # | Keputusan | Menghambat |
|---|---|---|
| 5 | Model kepemilikan: `ownerId` di semua tabel anak atau warisan lewat `Event` (usulan kontrak: warisan) | Relasi dan constraint DB |
| 6 | Definisi "total planned" event saat Σ kategori tidak sama dengan target | Agregat UI dan acceptance test |
| 7 | Jendela pengelompokan task ke milestone | Timeline dan ACT-12 |
| 8 | Transport email produksi untuk reset password (Auth.js v5 sudah dipakai) | ACT-14/ACT-21 di produksi |
| 9 | Urutan hapus event dengan `Restrict` kategori | Strategi migrasi/transaksi |
| 10 | Siklus hidup BudgetEntry saat kategori akan dihapus | ACT-20 |
| 11 | `agreedPrice = 0` | Pemetaan status pembayaran |

## 12. Referensi

- Context7 `/vercel/next.js/v16.2.9` — Server Actions (`'use server'`), validasi form + `useActionState`, revalidasi `revalidatePath`/`revalidateTag`, error handling, data security (re-verifikasi auth di setiap entry point), route handlers & `params` sebagai Promise, upgrade v16 (Node >= 20.9, TS >= 5.1).
- Context7 `/prisma/web` — `onDelete` (Cascade, Restrict, SetNull), relasi 1-N, transaksi, agregasi per grup.
- PRD `PRD-Event-Planner-Budget-Tracker.md` §10.3–§11.
