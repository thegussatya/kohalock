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

Proyek ini menggunakan arsitektur *monorepo* dengan `pnpm`. Untuk menjalankan seluruh ekosistem (Frontend, Backend, dan Blockchain) di komputer lokal, ikuti langkah-langkah berikut:

### 1. Persiapan Database
Pastikan Anda sudah memiliki PostgreSQL yang berjalan.
1. Masuk ke folder backend: `cd apps/api`
2. Buat file `.env` (copy dari `.env.example` jika ada) dan isi `DATABASE_URL` dengan koneksi Postgres Anda.
3. Jalankan migrasi/push schema: `npx prisma db push`
4. Masukkan data awal (akun dummy untuk tiap role): `npx prisma db seed`

> [!TIP]
> **Mengosongkan / Reset Total Database**: 
> Jika Anda ingin menghapus seluruh data di database (termasuk data pengguna/user) dan mengatur ulang skema ke kondisi bersih (empty state), jalankan perintah berikut di folder `apps/api`:
> ```bash
> npx prisma db push --force-reset
> ```
> Setelah itu, Anda bisa menjalankan kembali `npx prisma db seed` untuk mengisi ulang akun-akun dummy jika diperlukan.


### 2. Menjalankan Jaringan Blockchain Lokal (Hardhat)
Buka **Terminal 1** khusus untuk menjalankan node blockchain:
```bash
cd packages/contracts
npx hardhat node
```
*(Biarkan terminal ini tetap terbuka dan berjalan)*

### 3. Deploy Smart Contract ke Jaringan Lokal
Buka **Terminal 2**, lalu lakukan deploy kontrak dan salin ABI ke backend:
```bash
cd packages/contracts
npx hardhat run scripts/deploy.ts --network localhost
npm run copy-abi
```
Setelah berhasil, catat `Contract Address` yang muncul, lalu masukkan ke dalam file `.env` di backend (`apps/api`) jika diperlukan (misalnya variabel `CONTRACT_ADDRESS`).

### 4. Menjalankan Backend (API)
Masih di **Terminal 2** (atau terminal baru):
```bash
cd apps/api
pnpm dev
```
*(Backend biasanya berjalan di `http://localhost:3000` atau port yang diset di .env)*

### 5. Menjalankan Frontend (Web)
Buka **Terminal 3**:
```bash
cd apps/web
pnpm dev
```
*(Buka URL yang muncul, biasanya `http://localhost:5173`, di browser Anda)*

**Catatan:** Pastikan alamat API di frontend (`apps/web/.env` atau `apiClient.ts`) sudah mengarah ke localhost backend Anda.

### 6. Mereset Database setelah Deploy Ulang Blockchain
Jika Anda merestart node blockchain lokal (`npx hardhat node`) dan mendeploy ulang kontrak, data transaksi di database relasional akan menjadi usang atau tidak sinkron dengan status hash di blockchain yang baru. Oleh karena itu, jalankan perintah berikut untuk mereset on-chain data:

1. Pastikan Anda sudah menjalankan ulang deploy smart contract (Langkah 3).
2. Dari root proyek, masuk ke folder backend:
```bash
cd apps/api
npx ts-node scripts/reset-onchain-data.ts
```
*(Script ini akan otomatis menghapus semua data transaksi lama seperti proposal, pencairan, atau buku kas, sehingga Anda bisa memulai simulasi ulang dari awal)*

> [!IMPORTANT]
> **Masalah "Sender doesn't have enough funds to send tx"**: 
> Jika Anda mendapati error ini saat mencoba transaksi setelah me-restart node/mendeploy ulang kontrak, hal itu karena saldo wallet dinamis di database telah ter-reset menjadi `0` di blockchain yang baru. Untuk mengatasinya, jalankan kembali perintah database seed untuk mengisi saldo wallet (funding 1 ETH) dan memperbarui hak akses peran:
> ```bash
> cd apps/api
> npx prisma db seed
> ```

