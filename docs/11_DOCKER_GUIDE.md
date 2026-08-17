# PANDUAN DOCKER LOCAL ENVIRONMENT — KOHALOCK

Dokumen ini berisi panduan lengkap untuk menginstal, mendokkerkan, dan menjalankan seluruh ekosistem **KOHALOCK** di lingkungan lokal menggunakan Docker & Docker Compose.

---

## 1. Arsitektur Layanan & Service Matrix

KOHALOCK diorkestrasi menggunakan Docker Compose dengan 4 layanan utama yang saling terhubung dalam jaringan internal (`kohalock-network`):

| Service Name | Deskripsi Layanan | Port Lokal | Internal Hostname | Status Persistence |
|---|---|---|---|---|
| **`postgres`** | PostgreSQL 16 Database untuk Off-chain Data | `5432` | `postgres:5432` | Volume `postgres_data` |
| **`blockchain`** | Hardhat Local EVM Node untuk Smart Contracts | `8545` | `blockchain:8545` | In-memory node |
| **`api`** | Node.js + Express API Backend (Prisma ORM) | `3000` | `api:3000` | Volume `uploads_data` |
| **`web`** | React + Vite Frontend (UI Dashboard & Public) | `5173` | `web:5173` | Ephemeral |

---

## 2. Persiapan Environment (.env)

Sebelum menjalankan container, buat file `.env` lokal dengan menyalin dari `.env.example`:

```bash
cp .env.example .env
```

Isi file `.env` default yang digunakan:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/kohalock?schema=public"
DIRECT_URL="postgresql://postgres:postgres@postgres:5432/kohalock?schema=public"
JWT_SECRET="supersecretjwtkeykohalocklocal2026"
BLOCKCHAIN_RPC_URL="http://blockchain:8545"
CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
VITE_API_URL="http://localhost:3000/api"
```

---

## 3. Langkah Menjalankan (Step-by-Step Guide)

### Langkah 1: Build dan Jalankan Container
Jalankan perintah berikut di root folder proyek:

```bash
docker compose up --build -d
```

> **Apa yang terjadi di balik layar saat `docker compose up`?**
> 1. `postgres` dinyalakan dan ditunggu sampai siap menerima koneksi (Healthcheck).
> 2. `blockchain` (Hardhat node) dinyalakan di port 8545.
> 3. `api` otomatis mengeksekusi script inisialisasi (`scripts/docker-entrypoint-api.sh`):
>    - Menunggu `postgres` dan `blockchain` aktif.
>    - Mempublikasikan Smart Contract `DanaDesaLedger` ke node Hardhat.
>    - Menyalin ABI terbaru ke `apps/api/src/config/DanaDesaLedger.json`.
>    - Menjalankan migrasi Prisma (`npx prisma db push`).
>    - Memasukkan data awal & hak akses role pada blockchain (`npx prisma db seed`).
>    - Menjalankan Express API server.
> 4. `web` menyalakan Vite dev server di port 5173.

### Langkah 2: Cek Status Container
Untuk memastikan seluruh layanan berjalan normal (*healthy*):

```bash
docker compose ps
```

### Langkah 3: Pantau Log Inisialisasi API
Untuk melihat log proses migrasi database dan penyebar kontrak:

```bash
docker compose logs -f api
```

---

## 4. URL Akses Layanan Lokal

Setelah seluruh container berstatus `running`:

- 🌐 **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
- 🔌 **Backend Express API**: [http://localhost:3000/api](http://localhost:3000/api)
- 🏥 **API Health Check**: [http://localhost:3000/health](http://localhost:3000/health)
- ⛓️ **Hardhat Blockchain RPC**: `http://localhost:8545`
- 🗄️ **PostgreSQL Connection**: `postgresql://postgres:postgres@localhost:5432/kohalock`

---

## 5. Kredensial Akun Testing (Seed Initial Users)

Semua akun awal memiliki password default: **`password123`** dan PIN Wallet default: **`123456`**.

| Role | Email Login | Nama User | Jabatan |
|---|---|---|---|
| **KAUR_TEKNIS** | `budi.santoso.kaur-teknis@kohalock.desa` | Budi Santoso | Kaur Teknis |
| **SEKDES** | `siti.rahma.sekdes@kohalock.desa` | Siti Rahma | Sekretaris Desa |
| **KADES** | `ahmad.fauzi.kades@kohalock.desa` | Ahmad Fauzi | Kepala Desa |
| **KAUR_KEUANGAN** | `hastuti.kaur-keuangan@kohalock.desa` | Hastuti | Bendahara / Kaur Keuangan |
| **PUBLIK** | `warga.publik@kohalock.desa` | Warga Publik | Warga Masyarakat |
| **AUDITOR** | `inspektur.auditor@kohalock.desa` | Inspektur Wilayah | Auditor Inspektorat |
| **BPD_ADAT** | `ketua.bpd-adat@kohalock.desa` | Ketua BPD | Ketua BPD & Tokoh Adat |

---

## 6. Perintah Perawatan & Troubleshooting

### Mematikan Seluruh Container
```bash
docker compose down
```

### Reset Total (Hapus Database Volume & Rebuild Clean)
Gunakan perintah ini jika ingin mengulang proses seed dan migrasi dari awal:

```bash
docker compose down -v
docker compose up --build -d
```

### Menjalankan Perintah Prisma / Seed Manual di Dalam Container API
```bash
# Re-seed database
docker compose exec api pnpm --filter api exec prisma db seed

# Run Prisma Studio (GUI Database Viewer)
docker compose exec api pnpm --filter api exec prisma studio
```
