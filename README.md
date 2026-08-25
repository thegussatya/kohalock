# 🏛️ KOHALOCK — Sistem Transparansi & Akuntabilitas Dana Desa Berbasis Blockchain Polygon Mainnet

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Polygon](https://img.shields.io/badge/Blockchain-Polygon%20PoS%20Mainnet-8247E5.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)

**KOHALOCK** adalah platform tata kelola dan transparansi pengelolaan **Dana Desa** berbasis teknologi blockchain hybrid (EVM / Polygon PoS Mainnet & PostgreSQL). Platform ini dirancang untuk mencegah korupsi, penyalahgunaan anggaran, dan manipulasi data dengan menerapkan **Role-Based Access Control (RBAC)** 4-pintu pada alur pencairan anggaran desa serta imutabilitas smart contract.

---

## 📌 Gambaran Umum Arsitektur

KOHALOCK menggabungkan kecepatan basis data relasional (*off-chain*) untuk antarmuka pengguna dengan keandalan transparansi blockchain (*on-chain*):

- **Off-chain (PostgreSQL & Express API)**: Menyimpan detail laporan, notifikasi, catatan pengawasan, dan memfasilitasi antarmuka pengajuan yang responsif.
- **On-chain (Polygon PoS Mainnet / Smart Contract `DanaDesaLedger`)**: Mencatat *hash* otentik dokumen Berita Acara, status verifikasi 4-pintu, serta bukti ketersediaan saldo dan eksekusi pencairan secara permanen dan tidak dapat diubah (*immutable*).
- **Custodial Gas Relayer (Auto-Funding)**: Pengguna desa tidak perlu mengelola saldo POL secara manual. Backend API secara otomatis menyalurkan gas fee secukupnya (*Auto-Funding 0.08 POL*) dari Master Wallet saat pengguna melakukan transaksi di aplikasi.

---

## ✨ Katalog Fitur Lengkap (Exhaustive Feature List)

Aplikasi KOHALOCK memiliki katalog fitur yang terstruktur berdasarkan modul operasional dan peran pengguna (*User Roles*):

### 🔒 1. Modul Autentikasi & Keamanan Sesi (Authentication & Security)
- **Login Multi-Role**: Autentikasi aman berbasis JWT (JSON Web Token) dengan klasifikasi role pengguna otomatis.
- **Manajemen Wallet Custodial**: Penjanaan wallet EVM unik secara otomatis untuk setiap pengguna desa dengan enkripsi private key berbasis PIN (`123456`).
- **Auto-Funding Relayer Gas**: Sistem penyaluran saldo POL otomatis *on-demand* (0.08 POL dengan threshold <= 0.055 POL) dari Master Wallet agar pengguna tidak perlu top-up manual.

### 📝 2. Modul Musrembang & Perencanaan (Role: `KAUR_TEKNIS`)
- **Formulir Musrembang On-Chain**: Pendaftaran program/kegiatan desa baru beserta volume, satuan, dan pagu anggaran maksimal yang dikunci langsung ke smart contract.
- **Daftar Program Desa**: Pengelolaan daftar program kerja desa per dusun.
- **Pengajuan Termin Pencairan**: Formulir pengajuan pencairan dana termin beserta unggah dokumen PDF Berita Acara, foto Geotag lokasi (latitude/longitude), dan deskripsi pekerjaan.
- **Pengisian Rincian LPJ Teknis**: Pembuatan item rincian Belanja Barang/Jasa (LPJ Item) per termin pencairan.
- **Riwayat Revisi & Penolakan**: Halaman pemantauan catatan revisi berkas dari Sekdes/Kades.

### 🛡️ 3. Modul Verifikasi Dokumen & Otentikasi (Role: `SEKDES`)
- **Verifikasi Berkas Tahap 1**: Pemeriksaan kelengkapan administrasi pencairan dana dari Kaur Teknis.
- **Otentikasi Hash Berita Acara**: Verifikasi kesesuaian hash dokumen PDF Berita Acara dengan data yang tercatat di smart contract.
- **Preview Dokumen & Geotag**: Pratinjau (*viewer*) berkas PDF Berita Acara dan gambar Geotag lokasi fisik proyek.
- **Aksi Approve & Request Revisi**: Pembubuhan tanda tangan verifikasi Sekdes atau pengembalian berkas dengan catatan revisi spesifik.

### 👑 4. Modul Otorisasi & Kepemimpinan (Role: `KADES`)
- **Otorisasi Final Pencairan**: Persetujuan tingkat akhir Kepala Desa sebelum dana siap dicairkan oleh Bendahara.
- **Panic Button (Intervensi Darurat)**: Fitur penghentian/penguncian transaksi secara *on-chain* jika terindikasi adanya intimidasi atau pemaksaan pencairan yang tidak sah.
- **Riwayat Otorisasi**: Log rekapitulasi persetujuan dan transaksi intervensi Kades.

### 💰 5. Modul Eksekusi Dana & Pembukuan Keuangan (Role: `KAUR_KEUANGAN`)
- **Antrean Eksekusi Pencairan Dana**: Pelaksanaan eksekusi pencairan dana dan pencatatan transaksi final (*disbursed*) ke jaringan Polygon Mainnet.
- **Buku Kas Umum (BKU)**: Pembukuan kas otomatis yang mencatat setiap penerimaan dan pengeluaran dana desa.
- **Buku Bank Desa**: Pencatatan mutasi transaksi perbankan desa (debit/kredit/saldo berjalan).
- **Buku Pembantu Pajak**: Pencatatan kewajiban dan status penyetoran pajak (PPN/PPh) atas transaksi kegiatan desa.
- **Pencatatan Pendapatan Desa (Village Income)**: Input penerimaan Dana Desa (DD), Alokasi Dana Desa (ADD), Pendapatan Asli Desa (PADes), dan bagi hasil pajak.
- **Penutupan Buku Bulanan (Monthly Closing)**: Penguncian saldo BKU bulanan dengan pencetakan hash kunci permanen.
- **Koreksi Transaksi (Correction Module)**: Pencatatan penyesuaian transaksi pembukuan dengan jejak audit ketat.

### 📊 6. Modul Pengawasan, BPD & Tokoh Adat (Role: `BPD` & `TOKOH_ADAT`)
- **Beranda Pengawasan BPD**: Dashboard pemantauan realisasi anggaran dan transparansi pencairan dana.
- **Catatan Pengawasan Non-Blocking**: Fitur pengiriman masukan/catatan BPD atas pelaksanaan proyek tanpa menghentikan alur pencairan.
- **Modul Kasus & Resolusi Adat**: Pencatatan musyawarah adat dan keputusan resolusi konflik lahan/wilayah adat desa.

### 🔍 7. Modul Audit, Time-Bound Access & Whistleblower (Role: `AUDITOR`)
- **Integrity Checker Tool**: Alat verifikasi independen untuk mengunggah PDF Berita Acara / LPJ dan mencocokkan hash dokumen terhadap smart contract secara *real-time*.
- **Token Akses Terbatas Waktu (Auditor Access Token)**: Akses inspeksi dengan masa berlaku terbatas (*time-bound*) yang dipantau middleware backend.
- **Kotak Aduan Rahasia (Whistleblower Inbox)**: Penerimaan dan dekripsi laporan aduan pelanggaran terenkripsi yang hanya dapat dibuka oleh Inspektorat.
- **Catatan Audit (Audit Notes)**: Pencatatan hasil pemeriksaan keabsahan dokumen (Otentik / Berbeda / Belum Ada).

### 🌐 8. Modul Portal Transparansi Publik (Role: `PUBLIK` & Anonymous)
- **Portal Informasi Desa**: Halaman publik untuk memantau ringkasan realisasi APBDes dan progres proyek desa.
- **Ledger Explorer (Kronologi Blok)**: Penjelajah jejak audit *on-chain* untuk melihat riwayat blok transaksi secara terbuka.
- **Tiket Klarifikasi Warga**: Formulir pengajuan pertanyaan/klarifikasi dari masyarakat kepada pemerintah desa beserta fitur balasan resmi.
- **Laporan Realisasi Desa**: Akses unduh dokumen Laporan Realisasi Semesteran & Tahunan desa.

---

## 📂 Struktur Direktori & Penjelasan Folder (Project Directory Layout)

Repositori KOHALOCK menggunakan arsitektur **PNPM Monorepo Workspace** yang teratur:

```text
kohalock/
├── apps/
│   ├── api/                      # Backend REST API Application (Express.js + Prisma ORM)
│   │   ├── lib/                  # Library & helper internal backend
│   │   ├── middleware/           # Middleware autentikasi JWT & Role-Based Access Control (RBAC)
│   │   ├── prisma/               # Schema Prisma (schema.prisma) & skrip seeding (seed.ts)
│   │   ├── routes/               # Endpoint routing REST API (auth, proposal, disbursement, dll.)
│   │   ├── scripts/              # Skrip operasional & maintenance (sweep-wallets.ts)
│   │   ├── src/                  # Layanan utama backend (crypto.service.ts, signer.service.ts)
│   │   ├── uploads/              # Direktori penyimpanan fisik dokumen PDF Berita Acara & Foto Geotag
│   │   ├── Dockerfile            # Docker configuration untuk Service API Backend
│   │   └── server.ts             # Entry point utama Express API server
│   │
│   └── web/                      # Frontend Single Page Application (React + Vite + TailwindCSS)
│       ├── public/               # Aset statis publik (Logo, Favicon, Ikon)
│       ├── src/
│       │   ├── components/       # Komponen Reusable UI (DocumentPreviewViewer, IntegrityBadge, Navbar, dll.)
│       │   ├── features/         # Halaman & fitur UI terkelompok berdasarkan Role:
│       │   │   ├── auditor/      # Halaman Integrity Checker, Whistleblower Inbox, & Audit Notes
│       │   │   ├── auth/         # Halaman Login
│       │   │   ├── bpd-adat/     # Halaman Pengawasan BPD & Resolusi Adat
│       │   │   ├── kades/        # Halaman Otorisasi Final, Panic Button, & Riwayat
│       │   │   ├── kaur-keuangan/# Halaman Antrean Eksekusi, BKU, Bank Book, Pajak, & Income
│       │   │   ├── kaur-teknis/  # Halaman Musrembang, Ajukan Pencairan, & LPJ
│       │   │   ├── publik/       # Halaman Portal Transparansi Publik & Klarifikasi
│       │   │   └── sekdes/       # Halaman Verifikasi Berkas & Pratinjau Dokumen
│       │   └── lib/              # Helper frontend (axios client, getMediaUrl, auth state)
│       ├── Dockerfile            # Multi-stage Docker build untuk Frontend
│       ├── nginx.conf            # Konfigurasi Reverse Proxy Nginx untuk Production Build
│       └── vite.config.ts        # Konfigurasi Bundler Vite
│
├── docs/                         # Pusat Dokumentasi Perencanaan & Spesifikasi Proyek
│   └── specs/                    # Dokumentasi spesifikasi per modul role
│
├── packages/
│   └── contracts/                # Smart Contract Development Environment (Hardhat + Solidity)
│       ├── contracts/            # Smart contract Solidity (DanaDesaLedger.sol)
│       ├── scripts/              # Skrip deployment Solidity (deploy-direct.ts)
│       ├── test/                 # Unit test smart contract
│       ├── Dockerfile            # Docker configuration untuk Hardhat Service
│       └── hardhat.config.ts     # Konfigurasi Hardhat (Polygon Mainnet / Local Network)
│
├── respon/                       # Folder Laporan Diagnostik & Audit Internal (Di-ignore dari Git)
├── scripts/                      # Skrip pembantu container (docker-entrypoint-api.sh)
├── docker-compose.yml            # Konfigurasi Orchestration Docker Compose
├── pnpm-workspace.yaml           # Definisi PNPM Monorepo Workspace
├── package.json                  # Root package configuration
└── README.md                     # Dokumentasi Utama Repositori
```

---

## 🗄️ Struktur & Skema Basis Data (Database Architecture)

Basis data KOHALOCK dirancang menggunakan **Prisma ORM** yang terhubung ke **PostgreSQL**. Berikut adalah penjelasan 20+ entitas/tabel utama beserta fungsi dan relasinya:

```mermaid
erDiagram
    User ||--o{ Proposal : "membuat (kaurTeknis)"
    User ||--o{ Disbursement : "verifikasi (sekdes)"
    User ||--o{ Disbursement : "otorisasi (kades)"
    Proposal ||--o{ Disbursement : "memiliki termin"
    Disbursement ||--o{ LpjItem : "memiliki rincian"
    Disbursement ||--o{ RejectionLog : "memiliki log penolakan"
    Disbursement ||--o{ InterventionLog : "memiliki log intervensi"
    Disbursement ||--o{ SupervisionNote : "memiliki catatan BPD"
    Disbursement ||--o{ TaxBookEntry : "memiliki transaksi pajak"
    CashBookEntry ||--o{ VillageIncomeEntry : "terhubung pendapatan"
```

### 📋 Rincian Entitas / Tabel Database:

| Nama Tabel / Model | Fungsi Utama | Primary Key & Foreign Keys | Atribut Penting & Keterangan |
|---|---|---|---|
| **`User`** | Menyimpan data akun pengguna desa & wallet custodial | `id` (CUID) | `nama`, `role`, `email`, `passwordHash`, `jabatan`, `walletAddress`, `encryptedPrivateKey` (terenkripsi PIN). |
| **`Proposal`** | Master usulan program Musrembang | `id` (CUID)<br>FK: `kaurTeknisId` -> `User` | `onChainId` (Unique), `dusun`, `judulUsulan`, `kategori`, `volume`, `satuan`, `paguMaksimal` (BigInt), `dokumenHash`, `fileUrls`. |
| **`Disbursement`** | Transaksi pengajuan pencairan termin dana | `id` (CUID)<br>FK: `proposalId` -> `Proposal`<br>FK: `sekdesVerifierId` -> `User`<br>FK: `kadesApproverId` -> `User` | `onChainId` (Unique), `nominal` (BigInt), `beritaAcaraUrl`, `beritaAcaraHash`, `fotoUrl`, `geotagLat`, `geotagLng`, `status`, `catatanRevisi`, `lpjTeknisHash`. |
| **`LpjItem`** | Item rincian belanja LPJ Teknis | `id` (CUID)<br>FK: `disbursementId` -> `Disbursement` | `uraian`, `volume`, `satuan`, `hargaSatuan` (BigInt), `totalHarga` (BigInt). |
| **`RejectionLog`** | Rekam catatan revisi/penolakan berkas | `id` (CUID)<br>FK: `disbursementId` -> `Disbursement` | `jenisPenolakan`, `pesanError`, `sudahDiperbaiki` (Boolean). |
| **`InterventionLog`** | Log intervensi Panic Button Kades | `id` (CUID)<br>FK: `disbursementId` -> `Disbursement`<br>FK: `kadesId` -> `User` | `txHash` (On-chain tx), `status` (PENDING/EXECUTED). |
| **`ClarificationTicket`** | Tiket pertanyaan & klarifikasi warga | `id` (CUID)<br>FK: `dijawabOlehId` -> `User` | `namaWarga`, `programId`, `pertanyaan`, `status`, `jawaban`, `answeredAt`. |
| **`WhistleblowerReport`** | Aduan rahasia terenkripsi | `id` (CUID) | `ticketCode` (Unique), `encryptedPayload` (Ciphertext), `attachmentUrls` (JSON). |
| **`Notification`** | Notifikasi internal pengguna | `id` (CUID) | `userId`, `judul`, `pesan`, `dibaca` (Boolean). |
| **`AdatCase`** | Pencatatan musyawarah & resolusi adat | `id` (CUID)<br>FK: `dicatatOlehId` -> `User` | `pihakTerlibat` (JSON), `kategori`, `status`, `keputusanResolusi`. |
| **`SupervisionNote`** | Catatan pengawasan BPD non-blocking | `id` (CUID)<br>FK: `disbursementId` -> `Disbursement`<br>FK: `bpdUserId` -> `User` | `catatan`, `createdAt`. |
| **`AuditorAccessToken`** | Token masa berlaku akses auditor | `id` (CUID)<br>FK: `auditorId` -> `User` | `expiresAt` (DateTime), `revoked` (Boolean). |
| **`CashBookEntry`** | Pembukuan Buku Kas Umum (BKU) | `id` (CUID) | `tanggal`, `uraian`, `penerimaan` (BigInt), `pengeluaran` (BigInt), `saldoBerjalan` (BigInt), `statusTerkunci` (Boolean). |
| **`BankBookEntry`** | Pembukuan mutasi bank desa | `id` (CUID) | `tanggal`, `keterangan`, `debit` (BigInt), `kredit` (BigInt), `saldo` (BigInt). |
| **`TaxBookEntry`** | Pembukuan kewajiban pajak desa | `id` (CUID)<br>FK: `disbursementId` -> `Disbursement` | `jenisPajak`, `nominal` (BigInt), `statusSetor` (BELUM_SETOR/SUDAH_SETOR). |
| **`MonthlyClosing`** | Penguncian kas bulanan desa | `id` (CUID)<br>FK: `ditutupOlehId` -> `User` | `bulan`, `tahun`, `hashKunci` (Hash transaksi closing), `ditutupPada`. |
| **`CorrectionTransaction`** | Transaksi koreksi penyesuaian kas | `id` (CUID)<br>FK: `dibuatOlehId` -> `User` | `transaksiAsalId`, `alasan`, `nilaiKoreksi` (BigInt). |
| **`VillageIncomeEntry`** | Catatan penerimaan/pendapatan APBDes | `id` (CUID)<br>FK: `dicatatOlehId` -> `User`<br>FK: `cashBookEntryId` -> `CashBookEntry` | `kelompok`, `jenis`, `uraian`, `nominal` (BigInt), `sumberReferensi`. |
| **`LaporanRealisasiDesa`** | Laporan realisasi semesteran/tahunan | `id` (CUID)<br>FK: `kadesId` -> `User` | `tahun`, `semester`, `dokumenUrl`, `dokumenHash`. |
| **`AuditNote`** | Catatan audit hash Inspektorat | `id` (CUID)<br>FK: `auditorId` -> `User` | `docType`, `docId`, `catatan`, `hasil` (OTENTIK/BERBEDA), `hashUpload`, `hashOnChain`. |

---

## 👥 Daftar Role & Kredensial Pengujian (Seeding Account)

Seluruh akun di bawah ini telah disiapkan secara otomatis melalui skrip *database seed* dengan kata sandi default: **`password123`**

| Role Enum | Nama Akun | Email Login | Jabatan & Tanggung Jawab |
|---|---|---|---|
| `kaur-teknis` | Budi Santoso | `budi.santoso.operator-desa@kohalock.desa` | **Kaur Teknis / Operator Desa**: Input Musrembang & Ajukan Pencairan |
| `sekdes` | Siti Rahma | `siti.rahma.sekdes@kohalock.desa` | **Sekretaris Desa**: Verifikasi Dokumen & Hash Berita Acara (Tahap 1) |
| `kades` | Ahmad Fauzi | `ahmad.fauzi.kades@kohalock.desa` | **Kepala Desa**: Otorisasi Final Pencairan & Intervensi Panic Button |
| `kaur-keuangan` | Hastuti | `hastuti.kaur-keuangan@kohalock.desa` | **Kaur Keuangan / Bendahara**: Eksekusi Pencairan Dana ke Blockchain |
| `auditor` | Inspektur Wilayah | `inspektur.auditor@kohalock.desa` | **Auditor Inspektorat**: Audit Log Integrity Checker & Dekripsi Whistleblower |
| `bpd-adat` | Ketua BPD | `ketua.bpd-adat@kohalock.desa` | **BPD & Tokoh Adat**: Beranda Pengawasan & Resolusi Adat |
| `publik` | Warga Publik | `warga.publik@kohalock.desa` | **Masyarakat**: Portal Publik & Formulir Tanggapan Warga |

---

## 💻 Prasyarat Sistem (System Prerequisites)

Sebelum memulai, pastikan perangkat Anda telah terpasang perangkat lunak berikut:

- **Docker** (v20.10+) & **Docker Compose** (v2.0+) — *(Metode Tercepat & Direkomendasikan)*
- **Node.js** (v18.0.0 atau v20.0.0+) — *(Untuk Mode Development Manual)*
- **PNPM** (v8.0.0+) — `npm install -g pnpm`
- **Git**

---

## 🛠️ Konfigurasi Environment Variable (`.env`)

Proyek ini menyediakan templat konfigurasi `.env.example` pada setiap sub-direktori:

### 1. Backend API (`apps/api/.env.example`)
Salin berkas `apps/api/.env.example` menjadi `apps/api/.env`:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kohalock?schema=public"
JWT_SECRET="super-secret-jwt-key-kohalock-2026"
PRIVATE_KEY="0x4DDEa3f08800Dd8cb130a3Fc6AAcc2ab0FB902A0"
POLYGON_MAINNET_RPC_URL="https://polygon-mainnet.g.alchemy.com/v2/alch_iS927Gncl1WqbvodECN7O"
CONTRACT_ADDRESS="0xC627605BC2f7f1BddE0f68D43A369E5317cc7ED3"
```

### 2. Frontend Web (`apps/web/.env.example`)
Salin berkas `apps/web/.env.example` menjadi `apps/web/.env`:
```env
VITE_API_URL="/api"
```

---

## 🚀 Panduan Instalasi & Cara Menjalankan Aplikasi

### 🐳 CARA A: Menggunakan Docker Compose (Sangat Mudah & Siap Pakai)

Ini adalah cara tercepat untuk menjalankan seluruh ekosistem KOHALOCK (Database Postgres, Backend Express API, dan Frontend React Nginx Web) hanya dengan satu perintah:

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/thegussatya/kohalock.git
   cd kohalock
   ```

2. **Jalankan Docker Compose**:
   ```bash
   docker compose up -d --build
   ```

3. **Akses Aplikasi**:
   - **Frontend Web**: Buka browser di [http://localhost](http://localhost) (atau port 80 / domain Anda)
   - **Backend API Health Check**: [http://localhost:3000/health](http://localhost:3000/health)

4. **Menghentikan Container**:
   ```bash
   docker compose down
   ```

---

### 💻 CARA B: Mode Development Manual (PNPM & Local Node)

Jika Anda ingin melakukan pengembangan (*development*) kode program secara langsung di komputer lokal:

#### 1. Install Seluruh Dependensi Monorepo:
```bash
pnpm install
```

#### 2. Persiapkan Database PostgreSQL & Migration:
```bash
cd apps/api
cp .env.example .env
npx prisma db push
npx prisma db seed
```

#### 3. Jalankan Server Backend API (Terminal 1):
```bash
cd apps/api
pnpm dev
```
*(Backend API berjalan di http://localhost:3000)*

#### 4. Jalankan Server Frontend Web (Terminal 2):
```bash
cd apps/web
cp .env.example .env
pnpm dev
```
*(Frontend Web berjalan di http://localhost:5173)*

---

## ⛓️ Pengelolaan Smart Contract (Polygon Mainnet)

Smart Contract **`DanaDesaLedger.sol`** telah terdeploy dan terverifikasi di jaringan **Polygon PoS Mainnet**:

- **Contract Address**: [`0xC627605BC2f7f1BddE0f68D43A369E5317cc7ED3`](https://polygonscan.com/address/0xC627605BC2f7f1BddE0f68D43A369E5317cc7ED3)
- **Master Deployer / Gas Relayer Wallet**: `0x4DDEa3f08800Dd8cb130a3Fc6AAcc2ab0FB902A0`

### Menjalankan Skrip Refund / Sweep Balance (Jika Perlu Draw Sisa Gas User):
```bash
docker compose exec api pnpm --filter api exec ts-node scripts/sweep-wallets.ts
```

---

## ❓ Troubleshooting & FAQ

### 1. Gambar Geotag atau Preview PDF Berita Acara Tampil 404
- **Penyebab**: Nginx proxy tidak meneruskan URL media tanpa prefix `/api`.
- **Solusi**: Pastikan frontend menggunakan helper `getMediaUrl()` yang memanggil `/api/uploads/...`. Perbaikan ini sudah diterapkan secara default pada kode terbaru.

### 2. Error `INSUFFICIENT_FUNDS` Saat Transaksi Blockchain
- **Penyebab**: Biaya gas fee Polygon Mainnet mengalami lonjakan fluktuasi sementara.
- **Solusi**: Sistem kami sudah dilengkapi Auto-Funding otomatis sebesar `0.08 POL` dengan threshold `0.055 POL`. Pastikan Master Wallet (`0x4DDEa3...`) memiliki minimal `0.5 POL` saldo POL.

### 3. Reset Total Database Ke Kondisi Bersih
```bash
docker compose exec api npx prisma db push --force-reset
docker compose exec api npx prisma db seed
```

---

## 👥 Tim Pengembang & Pengakuan (Team & Acknowledgments)

Proyek dan perangkat lunak **KOHALOCK** ini dikembangkan dalam rangka **Program Kreativitas Mahasiswa (PKM)** oleh **Tim PKM Kohalock**.

### 🏆 Struktur Peran & Kontribusi Tim:

| Peran & Spesialisasi | Kontributor | Tanggung Jawab Utama |
|---|---|---|
| 💡 **Ide & Konsep Proyek** | **Tim PKM Kohalock** | Penggagas ide awal, riset kebutuhan tata kelola dana desa, dan perumusan inovasi sistem transparansi. |
| 💻 **Lead Developer & Software Engineering** | **Degus Satya Mudana** | Bertanggung jawab penuh atas perancangan arsitektur sistem dan pengembangan *codebase* aplikasi secara keseluruhan (Frontend & Backend API). |
| 🚀 **DevOps & Blockchain Deployment Support** | **Muhammad Fathan Fuad** | Bertanggung jawab atas konfigurasi & *deployment* aplikasi ke server VPS production, penataan *environment*, manajemen *wallet*, serta integrasi/deployment *smart contract* ke jaringan Polygon Mainnet via Alchemy RPC. |

---

## 📄 Lisensi & Kontribusi

Proyek ini dikembangkan di bawah lisensi [MIT License](LICENSE).  
Kontribusi, perbaikan bug, dan saran perbaikan fitur sangat dialokasikan melalui Pull Request.
