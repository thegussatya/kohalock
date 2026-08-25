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

## ✨ Fitur-Fitur Utama

1. 📝 **Formulir Musrembang & Pencatatan Proposal On-Chain**: Pendaftaran program kegiatan desa langsung dikunci dengan hash otentik ke blockchain.
2. 🛡️ **Verifikasi Pencairan 4-Pintu (Multi-Role Authorization)**:
   - **Kaur Teknis / Operator Desa**: Membuat proposal & mengajukan termin pencairan (beserta bukti Geotag & LPJ).
   - **Sekretaris Desa (Sekdes)**: Memeriksa kelengkapan berkas & meluluskan verifikasi Tahap 1.
   - **Kepala Desa (Kades)**: Memberikan otorisasi final pencairan atau menekan *Panic Button* jika ada indikasi intervensi.
   - **Kaur Keuangan / Bendahara**: Mengeksekusi dana pencairan dan mencatat transaksi akhir ke blockchain.
3. 🔍 **Portal Transparansi Publik & Inspektorat**:
   - **Masyarakat**: Dapa memantau progres kegiatan desa, mengecek transparansi BKU, dan mengajukan klarifikasi.
   - **Auditor / Inspektorat**: Memiliki *Integrity Checker Tool* untuk memverifikasi keaslian berkas Berita Acara PDF langsung terhadap smart contract.
   - **BPD & Tokoh Adat**: Memberikan catatan pengawasan non-blocking dan resolusi adat.

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

