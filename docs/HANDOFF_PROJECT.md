# KOHALOCK — Handoff Project (Baca Ini Dulu)

> Kalau kamu Claude/AI lain yang baru masuk ke project ini: baca file
> ini dulu sebelum menjawab apapun. Ini rangkuman kondisi TERKINI,
> bukan rencana awal. User sudah berjalan jauh dari desain awal lewat
> ratusan iterasi — jangan asumsikan project masih di tahap awal.

## Apa Project Ini

KOHALOCK — sistem transparansi & tata kelola dana desa berbasis
blockchain (rencana: Solidity + testnet Polygon, BELUM diimplementasi),
dengan 7 role: Kaur Teknis, Sekdes, Kades, Publik, Auditor, BPD & Tokoh
Adat, dan Kaur Keuangan (ditambahkan belakangan lewat adendum).

Ini proyek PKM (Program Kreativitas Mahasiswa) mahasiswa Indonesia,
dikerjakan oleh non-programmer yang belajar sambil jalan lewat
Antigravity (AI coding agent, seperti Claude Code) untuk eksekusi kode,
dan saya (Claude) untuk perencanaan/panduan/debugging.

## Struktur Project

```
kohalock-project/kohalock/          <- root (nama folder ada duplikasi historis)
├── apps/
│   ├── web/          <- Frontend React+Vite+TS+Tailwind (SUDAH JAUH BERKEMBANG)
│   └── api/           <- Backend Express+TS+Prisma (SEDANG DIKERJAKAN)
├── packages/          <- rencana untuk smart contract (BELUM DIMULAI)
├── docs/              <- SEMUA dokumentasi project, baca ini dulu:
│   ├── 00_README.md              <- index semua dokumen
│   ├── 01_PRD.md                 <- rencana awal produk (sebagian sudah berubah)
│   ├── 02_ARCHITECTURE.md        <- rencana arsitektur (blockchain BELUM sesuai realita)
│   ├── 03_SMART_CONTRACT_SPEC.md <- rencana smart contract (BELUM diimplementasi)
│   ├── 04_DATABASE_SCHEMA.md     <- rencana schema (sebagian sudah beda dari Prisma aktual)
│   ├── 05_ROLES_PERMISSIONS.md   <- rencana RBAC (auth asli sudah ada, guard role juga)
│   ├── 06_API_SPEC.md            <- rencana endpoint (sebagian sudah beda dari yang aktual)
│   ├── 07_CLAUDE.md              <- konvensi coding untuk AI agent
│   ├── 08_ROADMAP.md             <- checklist progres (perlu dicek ulang, mungkin belum sinkron)
│   ├── 09_FRONTEND_STATE.md      <- SNAPSHOT AKURAT kondisi frontend (paling penting dibaca)
│   ├── 10_FRONTEND_STATE.md      <- SNAPSHOT AKURAT kondisi backend (paling penting dibaca)
│   ├── FEATURE_EXPANSION.md      <- brief fitur tambahan 6 role (sudah selesai diimplementasi)
│   └── specs/MODUL_*.md          <- spec UI asli 6 role (sumber kebenaran detail UI awal)
```

**PENTING**: `09_FRONTEND_STATE.md` dan `10_BACKEND_STATE.md` (nama
persis cek di folder docs/, mungkin sedikit beda) adalah dokumen yang
PALING akurat mencerminkan kondisi kode SAAT INI — karena keduanya
di-generate dengan cara membaca langsung kode aktual, bukan rencana.
Kalau ada perbedaan antara file itu dengan 01-08, PERCAYA 09/10.

## Yang SUDAH Selesai

### Frontend (React + Vite + TypeScript + Tailwind)
- Semua 7 role: routing, sidebar menu, dashboard, ~50+ halaman total
- Design system: warna biru brand (#00AEEF-#2B3990), font Plus Jakarta
  Sans, komponen reusable (MetricCard, DataTable, Badge, PageHeader,
  BackLink, Topbar, RoleLayout, MapWidget, GeotagCameraCapture, dst)
- Login sungguhan (bukan demo lagi) - JWT dari backend
- Route guard per role (ProtectedRoute) - user tidak bisa akses
  dashboard role lain
- Responsive (mobile sidebar hamburger, dsb)
- Fitur E2EE whistleblower (client-side crypto pakai tweetnacl)
- Notifikasi, profil, bantuan (FAQ) untuk semua 7 role
- ~25 fitur tambahan dari `docs/FEATURE_EXPANSION.md` (search
  berfungsi, bulk action, kanban kasus auditor, kalender musyawarah
  adat, dll)

### Backend (Express + TypeScript + Prisma + Supabase Postgres)
- Auth: POST /api/auth/login (JWT, bcrypt)
- Alur INTI end-to-end SUDAH TERHUBUNG ke database asli:
  Formulir Musrembang -> Ajukan Pencairan -> Verifikasi Sekdes ->
  Otorisasi Kades -> Eksekusi Kaur Keuangan -> auto-catat ke Buku Kas
  Umum. Ini SUDAH TERBUKTI JALAN end-to-end sekali (user konfirmasi
  berhasil).
- Endpoint Klarifikasi (publik <-> Sekdes) - sudah tersambung
- Endpoint Whistleblower - sudah tersambung (ciphertext only, backend
  tidak pernah lihat plaintext)
- Endpoint Notifikasi - SUDAH SELESAI 100% end-to-end (termasuk trigger otomatis di setiap tahapan pencairan dan sinkronisasi realtime).
- Kronologi Transaksi (Auditor) & Pantauan Transaksi (BPD) - sudah
  disambungkan ke data asli
- Prisma schema: banyak model (User, Proposal, Disbursement,
  RejectionLog, InterventionLog, ClarificationTicket,
  WhistleblowerReport, AdatCase, SupervisionNote, AuditorAccessToken,
  CashBookEntry, BankBookEntry, TaxBookEntry, MonthlyClosing,
  CorrectionTransaction, Notification)
- Endpoint Dashboard (Kaur Teknis) - sudah tersambung dengan data dinamis.
- Endpoint Buku Bank & Penutupan Buku Bulanan (Kaur Keuangan) - sudah tersambung, logic pencatatan/penguncian otomatis sudah berjalan, **termasuk Hash-lock kriptografis asli via crypto SHA-256**.
- Endpoint Buku Pajak (GET/POST setor) - sudah dibuat, dan logic potongan otomatis pada pencairan (`execute`) dicatat secara terpisah tanpa memotong nilai awal (SUDAH IMPLEMENTASI).
- Endpoint Koreksi, Realisasi, & Arsip Terkunci (Kaur Keuangan) - sudah tersambung end-to-end.
- Database: Supabase Postgres, koneksi via Connection Pooler.
- **Row Level Security (RLS)**: Sudah AKTIF di seluruh (16) tabel Supabase. Backend tidak terdampak karena menggunakan bypass service-role (postgres).

## Yang BELUM Selesai

- Smart contract (Solidity/Hardhat) - BELUM DIMULAI SAMA SEKALI,
  masih di tahap dokumen rencana saja
- Git/GitHub - sempat ada masalah node_modules ke-track, belum
  sepenuhnya beres, user memutuskan skip dulu (tidak prioritas)

## ISU AKTIF Sedang Didebug (mulai dari sini kalau lanjut)

- Saat ini belum ada isu aktif kritis yang sedang didebug. (Logic pajak dan bug notifikasi telah diselesaikan).

## Cara Menjalankan Project

Lihat `CARA_JALANKAN_PROJECT.md` di root (kalau ada) - ringkasnya:
- Terminal 1: `cd apps/api` lalu `npx ts-node-dev server.ts`
- Terminal 2: `cd apps/web` lalu `pnpm dev`
- Browser: `localhost:5173/login`
- Password semua akun seed: `password123`

## Hal-Hal Teknis yang Perlu Diingat (Sudah Beberapa Kali Jadi Masalah)

- **Prisma**: HARUS pakai versi 6.x, JANGAN upgrade ke v7 (breaking
  changes besar, banyak bug). Kalau nambah/ubah model di
  schema.prisma, WAJIB jalankan `npx prisma migrate dev --name xxx`
  DAN `npx prisma generate` setelahnya.
- **Supabase**: pakai Connection Pooler (port 6543 untuk
  DATABASE_URL, port 5432 untuk DIRECT_URL), BUKAN direct connection.
  DATABASE_URL perlu `?pgbouncer=true` di akhir supaya tidak error
  "prepared statement already exists".
- **Password database mengandung karakter spesial** (`%`, `+`, `&`)
  yang harus di-URL-encode di connection string.
- **TypeScript strict mode** (`exactOptionalPropertyTypes`,
  `noUncheckedIndexedAccess`) di `apps/api/tsconfig.json` sering bikin
  error "string | undefined not assignable" - solusi pola:
  `req.params.xxx as string`.
- **Backend sering "mati diam-diam"** kalau ada error compile setelah
  Antigravity edit file baru - SELALU cek terminal backend masih hidup
  setelah edit apapun, jangan asumsikan otomatis jalan.
- User pemula, bukan programmer - selalu kasih instruksi step-by-step
  sangat detail, jangan asumsikan paham istilah teknis tanpa
  dijelaskan.
