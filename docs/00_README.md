# KOHALOCK — Dokumen Proyek untuk Vibe Coding

Folder ini berisi seluruh dokumen perencanaan proyek **KOHALOCK** (Sistem Transparansi Dana Desa berbasis Blockchain). Dokumen-dokumen ini dirancang untuk jadi *context* saat kamu coding bareng AI assistant (Claude Code, Cursor, dll).

## Urutan Baca / Prioritas Context

| # | File | Kapan dipakai |
|---|------|----------------|
| 0 | `09_FRONTEND_STATE.md` | Kondisi ACTUAL frontend saat ini - baca ini dulu sebelum 01_PRD.md kalau ingin tahu apa yang SUDAH ada, bukan yang direncanakan |
| 1 | `01_PRD.md` | Saat butuh konteks kebutuhan fitur & alur bisnis per role |
| 2 | `02_ARCHITECTURE.md` | Saat setup project, decide folder structure, pilih library |
| 3 | `03_SMART_CONTRACT_SPEC.md` | Saat menulis/mengedit contract Solidity |
| 4 | `04_DATABASE_SCHEMA.md` | Saat menulis Prisma schema / query DB |
| 5 | `05_ROLES_PERMISSIONS.md` | Saat implement auth/RBAC & routing per role |
| 6 | `06_API_SPEC.md` | Saat menulis endpoint Express / integrasi frontend-backend |
| 7 | `07_CLAUDE.md` | **Taruh di root repo sebagai `CLAUDE.md`** — konvensi coding, commands, struktur repo. Ini yang otomatis dibaca Claude Code tiap sesi. |
| 8 | `08_ROADMAP.md` | Saat planning sprint / milestone |
| 9 | `11_DOCKER_GUIDE.md` | Panduan lengkap menjalankan local environment & Docker Compose |

## Cara Pakai Praktis

1. Copy semua file ini ke folder `/docs` di root repo kamu.
2. Copy `07_CLAUDE.md` juga ke root repo sebagai `CLAUDE.md` (bukan cuma di `/docs`) — Claude Code akan otomatis membacanya.
3. Saat mulai task baru, cukup bilang ke AI: "baca `docs/02_ARCHITECTURE.md` dan `docs/05_ROLES_PERMISSIONS.md`, lalu buatkan skeleton route untuk role Sekdes".
4. Update `08_ROADMAP.md` tiap kali sebuah task selesai — supaya AI tahu progres project tanpa kamu re-explain dari nol.
5. File spec role asli kamu (`MODUL_*.md`) tetap simpan di `/docs/specs/` — `01_PRD.md` merujuk ke situ untuk detail UI per layar.

## Prinsip Desain Proyek Ini

- **Off-chain untuk UX, on-chain untuk kebenaran.** Semua yang butuh dibuktikan tidak bisa diubah (hash dokumen, status pencairan, tanda tangan digital) → smart contract. Semua yang butuh fleksibel/cepat query (chat, dashboard, notifikasi) → Postgres.
- **6 role = 6 permission set, bukan 6 aplikasi.** Satu codebase React, routing & UI berbeda per role berdasarkan RBAC.
- **Custodial key management.** PIN pengguna ≠ private key blockchain secara langsung — PIN dipakai untuk decrypt private key yang disimpan terenkripsi di backend.

## Panduan Menjalankan Project di Local (Development)

Proyek ini menggunakan arsitektur *monorepo* dengan `pnpm`. Ikuti panduan di bawah ini untuk memulai dari kondisi bersih atau menjalankan ulang proyek saat seluruh terminal dalam keadaan mati.

---

### A. Alur Memulai Proyek Harian (Jika Semua Terminal Mati / Baru Dinyalakan)
Ini adalah alur yang paling sering Anda gunakan saat mulai bekerja kembali. Ikuti urutan terminal di bawah ini dengan tepat:

#### 💻 Terminal 1 — Blockchain Node
Jalankan node blockchain Hardhat lokal secara *in-memory* di terminal pertama:
```bash
cd packages/contracts
npx hardhat node
```
*(Biarkan terminal ini tetap terbuka dan berjalan)*

#### 💻 Terminal 2 — Inisialisasi Kontrak & Database
Buka terminal baru di root proyek untuk men-deploy kontrak pintar dan menyinkronkan data database Anda agar sesuai dengan blockchain yang baru berjalan:
```bash
pnpm init-local
```
> [!NOTE]
> Perintah otomatis ini akan melakukan:
> 1. Deploy smart contract ke node blockchain lokal.
> 2. Menulis konfigurasi `CONTRACT_ADDRESS` yang baru secara otomatis ke file `apps/api/.env`.
> 3. Menyalin ABI kontrak terbaru ke backend (`apps/api/src/config`).
> 4. Menghapus data transaksi lama di database agar tidak bentrok dengan blockchain baru.
> 5. **Pengisian Gas Fee (Funding)**: Mengisi ulang saldo gas (1 ETH) ke setiap wallet dinamis pengguna desa (Kaur, Sekdes, Kades, Kaur Keuangan) yang terdaftar di database, serta mendaftarkan hak akses mereka (*roles*).

#### 💻 Terminal 3 — Backend API
Jalankan server API backend:
```bash
cd apps/api
pnpm dev
```
*(Server biasanya berjalan di `http://localhost:3000`)*

#### 💻 Terminal 4 — Frontend Web
Jalankan server pengembangan frontend:
```bash
cd apps/web
pnpm dev
```
*(Buka tautan `http://localhost:5173` di web browser Anda untuk menggunakan aplikasi)*

---

### B. Setup & Persiapan Database Pertama Kali
Jika Anda baru pertama kali meng-clone repositori ini di komputer lokal, lakukan persiapan awal database Anda:

1. Masuk ke folder backend: `cd apps/api`
2. Buat file `.env` (salin dari `.env.example`) dan isi `DATABASE_URL` dengan koneksi Postgres Anda.
3. Jalankan migrasi/push schema untuk membuat tabel: `npx prisma db push`
4. Masukkan data awal (akun dummy untuk tiap role): `npx prisma db seed`

---

### C. Pemeliharaan & Troubleshooting (Penting)

#### 1. Masalah "Sender doesn't have enough funds to send tx" (Gas Fee)
Jika Anda mendapatkan error gas fee saat mencoba transaksi, hal ini terjadi karena blockchain lokal di-restart namun backend belum sempat di-seeding ulang, sehingga saldo wallet dinamis pengguna kembali menjadi `0` di blockchain.
*   **Solusi**: Pastikan Anda sudah menjalankan `pnpm init-local` di root proyek setelah Hardhat node berjalan, dan pastikan Anda me-restart server backend (`apps/api`) setelah file `.env` berubah agar ia membaca alamat kontrak yang baru.

#### 2. Mengosongkan / Reset Total Database
Jika Anda ingin menghapus seluruh data di database (termasuk data pengguna/user) dan mengatur ulang skema ke kondisi bersih (empty state) untuk memulai kembali dari awal:
1. Masuk ke folder backend: `cd apps/api`
2. Jalankan perintah hapus skema:
   ```bash
   npx prisma db push --force-reset
   ```
3. Isi kembali akun-akun dummy baru:
   ```bash
   npx prisma db seed
   ```
> [!IMPORTANT]
> **Penting**: Setelah melakukan reset total database, sesi login lama Anda di browser masih akan tersimpan. Anda **wajib menekan tombol Keluar (Log Out)** di browser dan login kembali menggunakan akun desa baru hasil seeding agar tidak terjadi konflik alamat wallet lama.
