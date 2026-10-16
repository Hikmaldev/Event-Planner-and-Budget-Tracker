# Petunjuk Agen

## Konteks repo
- Stack terverifikasi di `package.json`: Next.js `16.4.0` (App Router, Turbopack, `cacheComponents: true`), React `19.3.0`, TypeScript `^5`, Tailwind CSS `^4`, shadcn/ui `^4.21.4`, Prisma `7.10.1` + `@prisma/adapter-neon` (Neon Postgres), Auth.js/`next-auth` `5.0.0-beta.32` (Credentials + JWT session), Zod 4, bcryptjs, Vitest 5.
- Perintah: `npm run dev` | `npm run lint` | `npm run test` (Vitest: unit + integrasi DB nyata) | `npm run build` | `npm run db:migrate` | `npm run db:generate` | `npm run db:studio` | `npm run db:seed` | `npm run db:seed:clean`.
- Database: Neon project `event-planner-budget-tracker` (region `aws-ap-southeast-1`). Rahasia di `.env`: `DATABASE_URL` (pooled, runtime), `DIRECT_URL` (direct, Prisma CLI via `prisma.config.ts`), `AUTH_SECRET`. Jangan hardcode connection string.
- Produksi: Vercel project `event-planner-and-budget-tracker` (team `hikmaldevs-projects`, alias `event-planner-and-budget-tracker.vercel.app`) + Neon project terpisah `event-planner-budget-tracker-prod`. Env Vercel: `DATABASE_URL`/`DIRECT_URL`/`AUTH_SECRET`. Catatan MCP Vercel: jangan kirim `teamId` eksplisit (403 "re-authenticate to scope"); `create_git_project` belum bisa dipakai, jadi push belum auto-deploy — deploy manual via `create_deployment` (gitSource github) atau hubungkan repo di dashboard Vercel.
- Data demo untuk review hanya boleh lewat seed `prisma/seed.ts` (dev-only; menolak berjalan saat `NODE_ENV=production`): `npm run db:seed` membuat akun `demo@example.com` + 3 event contoh (minimal 5 data per menu: kategori, vendor, budget entry, task); `npm run db:seed:clean` menghapusnya. Dilarang menaruh data contoh di komponen/halaman/state awal. Kredensial demo dibaca server-side dari `DEMO_EMAIL`/`DEMO_PASSWORD` di `.env` (dipakai seed dan tombol autofill ACT-33 di halaman login; tombol tidak pernah tampil saat production — jangan hardcode kredensial di komponen).
- `README.md` (root) adalah pintu masuk publik: jaga agar perintah, versi stack, dan alur setup tetap sinkron saat ada perubahan; `.env.example` wajib diperbarui setiap kali variabel env berubah (jangan pernah menaruh nilai rahasia asli di sana).
- PRD berstatus Draft. Gunakan `PRD-Event-Planner-Budget-Tracker.md` sebagai sumber requirement: §§10.3–10.4 untuk data dan aturan bisnis, §11 untuk Action Inventory, dan §12 untuk acceptance criteria. Jangan menambah layar/aksi di luar PRD tanpa persetujuan.
- Ikuti `design-system-event-planner.md` untuk token dan pola UI. Token ada di `src/app/globals.css` (`@theme inline` + `:root`), komponen shadcn di `src/components/ui`.

## Arsitektur
- Alur: App Router UI (`src/app`, `src/components`) → Server Actions (`src/app/actions`) → lapisan data (`src/lib/data`) → Prisma → Neon. Domain murni di `src/lib/domain` (budget, payment, timeline) — satu sumber kebenaran untuk perhitungan, dipakai data layer dan test.
- Header (`src/app/layout.tsx` + `SessionNav` di dalam `<Suspense>`): saat belum login hanya brand yang tampil (halaman login/reset punya navigasinya sendiri); navigasi "Events Dashboard" + tombol Logout hanya muncul setelah login. Pertahankan `await connection()` di `SessionNav` — `auth()` tidak boleh berjalan saat prerender.
- Kepemilikan data: `Event.ownerId`; tabel anak memakai `eventId` (warisan). Constraint lintas-event ada di database: `Vendor`/`BudgetEntry` memakai composite FK `(categoryId, eventId)` ke `VendorCategory(id, eventId)`.
- Keputusan yang sudah diambil: `amountPaid = 0` → `UNPAID`; `0 < amountPaid < agreedPrice` → `DOWN_PAYMENT`; selain itu `PAID_IN_FULL` (berlaku juga saat `agreedPrice = 0`). Task timeline memakai milestone terdekat; seri → milestone lebih awal. Hapus event memakai transaksi berurutan (task → entry → vendor → kategori → event) agar constraint `Restrict` aman.
- Detail review: `docs/data-contract.md`.

## Aturan implementasi
- Validasi input di server (schema Zod di `src/lib/validation.ts`) dan di lapisan data (guard invariant, mis. uang non-negatif, konsistensi status pembayaran, cross-event link). Jangan hapus deviasi ini tanpa alasan.
- Sesi/ownership diperiksa per operasi lewat `requireUser()` (`src/lib/session.ts`); jangan mengandalkan UI. Query anak selalu difilter `event: { ownerId: userId }`.
- Baca/tulis data lewat `src/lib/data/*`; jangan tampilkan data demo sebagai fallback. Setiap layar data punya loading, empty, dan error state. Setelah mutasi, Server Action memanggil `revalidatePath` dan komponen memanggil `router.refresh()` (tanpa refresh manual).
- Reset password: token di-hash di DB; produksi butuh transport email nyata — saat ini `src/lib/email.ts` hanya mencatat tautan di console saat non-production (Open Question 8).
- Setiap tombol, form, dan link harus punya handler serta cocok dengan Action Inventory. Jangan menambah elemen atau perilaku di luar PRD tanpa persetujuan.
- Gunakan token dan komponen design system; jangan menambahkan nilai visual hardcode atau pola UI baru tanpa persetujuan. Skala tipografi `.type-*` ada di `@layer components` (bukan `utilities`) supaya utility Tailwind tetap bisa menimpanya; jangan dipindahkan — pernah menyebabkan bug cascade ukuran/bobot huruf.
- Sebelum memakai API library, verifikasi dokumentasi melalui Context7 untuk versi yang benar-benar tercatat di `package.json`. Jangan menebak API atau mengarang versi.
- Kerjakan satu fitur per sesi; jangan lanjut ke fitur berikutnya sebelum pengguna mengonfirmasi. Jika PRD tidak cukup atau bertentangan, tanyakan sebelum mengambil keputusan produk.
- Test integrasi memakai database dev Neon yang sama dengan cleanup otomatis di `afterAll` (email ber-prefix `test+`); test tidak boleh bergantung pada data seed demo maupun menambah data demo lain di luar `prisma/seed.ts`.
- Sebelum melapor selesai, jalankan `npm run lint`, `npm run test`, dan `npm run build`. Sertakan tabel `ID aksi | status (tersambung/belum) | catatan`, status build/test, serta elemen UI yang belum tersambung.
