# PANDUAN LENGKAP KOHALOCK
## Sistem Transparansi Dana Desa Berbasis Blockchain

---

## Daftar Isi
1. [Apa Itu KohaLock?](#1-apa-itu-kohalock)
2. [Masalah yang Ingin Diatasi](#2-masalah-yang-ingin-diatasi)
3. [Teknologi yang Digunakan](#3-teknologi-yang-digunakan)
4. [Status Pengembangan Saat Ini](#4-status-pengembangan-saat-ini)
5. [Daftar Role & Fitur](#5-daftar-role--fitur)
6. [Keterkaitan Antar Fitur](#6-keterkaitan-antar-fitur)
7. [Skenario Penggunaan](#7-skenario-penggunaan)

---

## 1. Apa Itu KohaLock?

KohaLock adalah platform digital untuk mengelola **siklus penuh dana desa** — mulai dari tahap perencanaan di Musrembang, pengajuan pencairan, verifikasi bertingkat, hingga pencairan aktual — dengan **jejak audit yang tidak bisa diubah** menggunakan teknologi blockchain.

Sistem ini dirancang untuk **satu desa** (single-tenant) dan melibatkan **7 peran pengguna** yang masing-masing memiliki dashboard, menu, dan hak akses berbeda, namun semuanya berada dalam **satu aplikasi web yang sama**.

Prinsip utamanya sederhana:
> **"Apa yang harus dibuktikan tidak bisa diubah → dicatat di blockchain. Apa yang butuh kecepatan & fleksibilitas → dicatat di database biasa."**

---

## 2. Masalah yang Ingin Diatasi

Pengelolaan dana desa di Indonesia seringkali menghadapi masalah:

| Masalah | Bagaimana KohaLock Mengatasi |
|---|---|
| **Pencairan tidak transparan** — masyarakat tidak tahu dana terpakai untuk apa | Dashboard Publik real-time: siapa pun bisa melihat proyek, anggaran, dan progres pencairan tanpa perlu login |
| **Dokumen bisa dipalsukan** — berita acara atau foto bukti bisa diedit setelah pencairan | Setiap dokumen di-hash (SHA-256) saat diunggah, hash-nya dikunci di blockchain. Kalau file diubah 1 bit pun, hash-nya tidak cocok |
| **Tidak ada jejak audit independen** — sulit membuktikan siapa menyetujui apa, kapan | Setiap persetujuan (verifikasi Sekdes, otorisasi Kades, eksekusi Bendahara) tercatat sebagai transaksi blockchain dengan tanda tangan digital |
| **Whistleblower takut teridentifikasi** — laporan rahasia bisa dibaca oleh aparat desa | Laporan dienkripsi di browser pelapor menggunakan kunci publik Inspektorat (E2EE). Bahkan server tidak pernah melihat isi asli laporan |
| **Auditor bergantung pada data yang disediakan pihak yang diaudit** — conflict of interest | Auditor bisa langsung cek integritas dokumen vs hash on-chain dan menelusuri kronologi transaksi blockchain secara mandiri |

---

## 3. Teknologi yang Digunakan

### Frontend (Apa yang Dilihat Pengguna)
| Teknologi | Fungsi |
|---|---|
| **React + TypeScript** | Framework untuk membangun antarmuka pengguna |
| **Vite** | Alat build yang cepat untuk pengembangan |
| **Tailwind CSS** | Styling/desain visual |
| **Recharts** | Grafik dan chart di dashboard |
| **React Leaflet** | Peta interaktif untuk geotag lokasi |
| **TweetNaCl** | Enkripsi sisi klien untuk Whistleblower (E2EE) |

### Backend (Mesin di Balik Layar)
| Teknologi | Fungsi |
|---|---|
| **Node.js + Express** | Server API yang melayani semua request |
| **PostgreSQL** | Database utama (di-host di Supabase) |
| **Prisma ORM** | Penghubung antara kode dan database |
| **JWT (JSON Web Token)** | Sistem autentikasi & otorisasi per role |
| **Supabase RLS** | Row Level Security — memblokir akses langsung ke database dari luar |

### Blockchain (Pengunci Kebenaran)
| Teknologi | Fungsi |
|---|---|
| **Solidity + Hardhat** | Smart contract untuk mencatat transaksi yang tidak bisa diubah |
| **Polygon Amoy Testnet** | Jaringan blockchain untuk pengujian |
| **ethers.js** | Library untuk berinteraksi dengan blockchain dari backend |

### Struktur Proyek
```
kohalock/
├── apps/
│   ├── web/          ← Frontend React (semua halaman 7 role)
│   └── api/          ← Backend Express (semua API endpoint)
├── docs/             ← Dokumentasi proyek
└── package.json      ← Monorepo (pnpm workspaces)
```

---

## 4. Status Pengembangan Saat Ini

### ✅ Yang Sudah Selesai
- Seluruh **UI/halaman** untuk ke-7 role (50+ halaman) sudah dibangun
- **Backend API** untuk alur inti pencairan (Kaur Teknis → Sekdes → Kades → Kaur Keuangan) sudah berfungsi end-to-end
- **Modul Bendahara** lengkap: Buku Kas, Buku Bank, Buku Pajak, Penutupan Buku, Koreksi, Laporan Realisasi
- **Dashboard** semua role sudah terhubung ke data aktual
- **Dashboard Publik** (tanpa login) sudah bisa menampilkan proyek & progres real-time
- **Klarifikasi Warga** dan **Whistleblower** sudah terhubung frontend ↔ backend
- **Row Level Security (RLS)** sudah aktif di 16 tabel Supabase
- **Enkripsi E2EE** untuk laporan Whistleblower sudah berjalan di sisi klien

### 🚧 Yang Masih dalam Pengembangan / Belum Terhubung
- **Smart contract** belum di-deploy ke testnet (logika on-chain masih disimulasikan)
- **Tanda tangan digital (PKI/PIN)** belum diimplementasi — saat ini tombol persetujuan langsung mengubah status tanpa verifikasi kriptografis
- Beberapa halaman masih menggunakan **data dummy**: Manajemen Kasus Auditor, Integrity Checker, Riwayat Otorisasi Kades, dan lain-lain (lihat daftar lengkap di `docs/10_BACKEND_STATE.md` bagian 7)
- **Notifikasi** belum real-time (belum ada WebSocket/polling)
- **Refresh token** (`POST /auth/refresh`) belum diimplementasi

### ❌ Di Luar Cakupan Versi 1
- Integrasi pembayaran bank riil (pencairan = pencatatan status, transfer fisik tetap manual)
- Multi-desa / multi-tenant
- Deployment ke mainnet blockchain

---

## 5. Daftar Role & Fitur

### 5.1. Kaur Teknis (Operator Desa)
**Siapa:** Staf teknis desa yang bertanggung jawab menginput usulan dan mengajukan pencairan.

| Fitur | Fungsi | Terhubung Ke |
|---|---|---|
| **Dashboard** | Ringkasan jumlah proposal, status pencairan, grafik realisasi bulanan | Data real-time dari Proposal & Disbursement |
| **Formulir Musrembang** | Input program baru hasil Musrembang (judul, dusun, kategori, pagu anggaran) | Membuat data di tabel `Proposal` → muncul di Dashboard Publik |
| **Ajukan Pencairan** | Upload berita acara + foto geotagging, input nominal | Membuat `Disbursement` dengan status `PENDING_SEKDES` → masuk ke Antrean Verifikasi Sekdes |
| **Program Saya** | Melihat daftar proposal yang pernah diinput | Membaca data `Proposal` milik user ini |
| **Riwayat Penolakan** | Melihat pencairan yang ditolak/revisi beserta alasannya | Membaca `Disbursement` dengan status `RETURNED_FOR_REVISION` |

---

### 5.2. Sekretaris Desa (Sekdes)
**Siapa:** Verifikator tahap 1 yang mengecek kelengkapan dan keabsahan dokumen.

| Fitur | Fungsi | Terhubung Ke |
|---|---|---|
| **Dashboard** | Jumlah pengajuan pending, rata-rata waktu verifikasi, klarifikasi menunggu | Data real-time dari Disbursement & ClarificationTicket |
| **Verifikasi Pengajuan** | Antrean pencairan yang menunggu di-review (Split-View: peta, PDF, hash checker) | Membaca `Disbursement` status `PENDING_SEKDES` |
| **Approve / Kembalikan Revisi** | Setujui → status berubah jadi `PENDING_KADES`. Tolak → status jadi `RETURNED_FOR_REVISION` + alasan | Mengubah status Disbursement → kalau disetujui, muncul di Persetujuan Kades. Kalau ditolak, muncul di Riwayat Penolakan Kaur Teknis |
| **Pantauan Anggaran** | Monitor saldo kas, dana cair, dana dalam proses | Agregasi dari Proposal & Disbursement |
| **Inbox Klarifikasi** | Menjawab pertanyaan warga yang masuk | Membaca & membalas `ClarificationTicket` → jawaban muncul di halaman Klarifikasi Publik |

---

### 5.3. Kepala Desa (Kades)
**Siapa:** Otorisator final pencairan. Juga memiliki "Tombol Darurat" (Panic Button) untuk menolak transaksi yang dicurigai.

| Fitur | Fungsi | Terhubung Ke |
|---|---|---|
| **Dashboard** | Jumlah pending otorisasi, total realisasi tahunan, ranking dusun, grafik serapan | Data real-time |
| **Persetujuan Pencairan** | Melihat detail dan meng-otorisasi pencairan yang sudah diverifikasi Sekdes | Membaca `Disbursement` status `PENDING_KADES`. Setelah approve → status berubah jadi `PENDING_EKSEKUSI` → masuk Antrean Eksekusi Kaur Keuangan |
| **Perisai Integritas (Panic Button)** | Menolak/intervensi pencairan yang dicurigai terjadi penyimpangan | Membuat `InterventionLog` → pencairan diblokir, muncul sebagai red-flag di Dashboard Auditor & BPD |
| **Pusat Klarifikasi Publik** | Melihat pertanyaan-pertanyaan warga | Membaca `ClarificationTicket` |
| **Analitik Klarifikasi** | Statistik kategori pertanyaan dan rata-rata waktu respon | Agregasi dari ClarificationTicket |

---

### 5.4. Kaur Keuangan / Bendahara
**Siapa:** Pelaksana eksekusi pencairan aktual dan pencatatan pembukuan keuangan desa.

| Fitur | Fungsi | Terhubung Ke |
|---|---|---|
| **Dashboard** | Saldo kas, jumlah eksekusi pending, tenggat pelaporan | Data real-time dari CashBook & Disbursement |
| **Antrean Eksekusi** | Daftar pencairan yang sudah diotorisasi Kades, tinggal dicairkan | Membaca `Disbursement` status `PENDING_EKSEKUSI`. Setelah eksekusi → status jadi `DISBURSED`, otomatis tercatat di Buku Kas, Buku Bank, dan Buku Pajak |
| **Buku Kas Umum** | Pencatatan penerimaan & pengeluaran kas desa | Entri otomatis dari eksekusi pencairan |
| **Buku Bank** | Rekonsiliasi transaksi bank | Data sinkron dari Buku Kas |
| **Buku Pajak** | Pencatatan potongan & penyetoran pajak per pencairan | Terintegrasi dengan proses eksekusi pencairan |
| **Penutupan Buku Bulanan** | Mengunci seluruh catatan bulan berjalan dengan hash SHA-256 | Data dari Buku Kas, Bank, Pajak → setelah dikunci, hanya bisa dikoreksi via Transaksi Koreksi |
| **Transaksi Koreksi** | Membuat jurnal pembalik untuk kesalahan entri (tanpa menghapus data asli) | Merujuk pada entri yang sudah terkunci → menjaga audit trail |
| **Laporan Realisasi** | Rekapitulasi anggaran vs realisasi per kategori/dusun | Agregasi semua data keuangan |

---

### 5.5. Masyarakat (Publik)
**Siapa:** Warga desa atau siapa pun yang ingin memantau penggunaan dana desa. Tidak wajib login untuk melihat data.

| Fitur | Fungsi | Terhubung Ke |
|---|---|---|
| **Beranda** | Ringkasan total dana, realisasi, jumlah proyek aktif | Agregasi dari Proposal & Disbursement |
| **Pantau Proyek** | Daftar semua proyek desa dengan filter pencarian, progress bar | Data dari `Proposal` + `Disbursement` |
| **Detail Proyek** | Rincian per termin pencairan, galeri foto geotagging, hash dokumen | Data detail satu Proposal + Disbursement-nya |
| **Klarifikasi** | Mengirim pertanyaan ke perangkat desa dan melihat jawaban | Membuat `ClarificationTicket` → dijawab oleh Sekdes |
| **Lapor Rahasia (Whistleblower)** | Mengirim laporan terenkripsi yang hanya bisa dibaca Auditor | Membuat `WhistleblowerReport` dengan enkripsi E2EE → hanya bisa di-dekripsi di halaman Kotak Masuk Rahasia Auditor |

---

### 5.6. Auditor / Inspektorat
**Siapa:** Pengawas eksternal dengan akses terbatas waktu (time-bound) untuk melakukan audit forensik.

| Fitur | Fungsi | Terhubung Ke |
|---|---|---|
| **Beranda Forensik** | Jumlah total transaksi, red-flag/anomali, sisa waktu akses | Agregasi dari Disbursement & InterventionLog |
| **Manajemen Kasus** | Kanban board kasus yang perlu diinvestigasi | Data dari WhistleblowerReport & InterventionLog |
| **Uji Alat Bukti (Integrity Checker)** | Upload file dokumen, sistem mencocokkan hash-nya dengan yang tersimpan on-chain | Membandingkan hash file vs hash di `Disbursement.beritaAcaraHash` |
| **Kronologi Transaksi (Ledger Explorer)** | Timeline visual setiap tahapan pencairan: siapa, kapan, hash apa | Data dari Disbursement + timestamp setiap status |
| **Kotak Masuk Rahasia** | Membaca laporan whistleblower yang terenkripsi (dekripsi di browser, bukan di server) | Data dari `WhistleblowerReport`, dekripsi menggunakan private key Inspektorat |
| **Ekspor Laporan Hukum** | Generate PDF/CSV untuk kebutuhan BAP atau laporan audit | Data dari Disbursement yang dipilih |
| **Template Laporan** | Template dokumen standar (BAP, Surat Panggilan, dll) | Data statis |

---

### 5.7. BPD & Tokoh Adat
**Siapa:** Badan Permusyawaratan Desa (pengawas) dan Tokoh Adat (penyelesai sengketa non-keuangan). Satu dashboard, dua peran berbeda.

| Fitur | Fungsi | Terhubung Ke |
|---|---|---|
| **Beranda Pengawasan** | Performance rate, red-flags, timeline aktivitas gabungan | Agregasi dari Disbursement, InterventionLog, AdatCase, SupervisionNote |
| **Pantauan Transaksi** | Melihat semua pencairan (read-only) + menulis catatan pengawasan | Data dari Disbursement. Catatan pengawasan (`SupervisionNote`) dikirim sebagai notifikasi ke Kades & Sekdes |
| **Papan Resolusi Adat** | Mencatat kasus sengketa warga, status musyawarah, keputusan resolusi | Data dari `AdatCase` — tidak terkait keuangan, murni pencatatan |
| **Kalender Musyawarah** | Jadwal sidang adat berdasarkan kasus yang masih berstatus "Musyawarah" | Data dari AdatCase yang aktif |
| **Laporan Tahunan** | Statistik kasus adat terselesaikan dan catatan pengawasan per kuartal | Agregasi dari AdatCase & SupervisionNote |

---

## 6. Keterkaitan Antar Fitur

Berikut diagram alur bagaimana fitur-fitur saling terhubung:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        ALUR UTAMA PENCAIRAN                              │
│                                                                          │
│  KAUR TEKNIS              SEKDES                KADES              KAUR  │
│  ──────────              ──────                ─────              KEUANGAN│
│                                                                          │
│  Formulir       ┌──►  Verifikasi      ┌──►  Persetujuan    ┌──► Antrean │
│  Musrembang     │     Pengajuan       │     Pencairan      │    Eksekusi│
│  (Buat Proposal)│     (Review Docs)   │     (Otorisasi)    │    (Cair!) │
│       │         │          │          │         │           │       │    │
│       ▼         │          ▼          │         ▼           │       ▼    │
│  Ajukan    ─────┘   [Approve] ────────┘   [Authorize] ─────┘  [Execute] │
│  Pencairan        atau                  atau                       │    │
│                   [Revisi] ──► kembali  [Panic Button]             │    │
│                     ke Kaur Teknis       ──► InterventionLog       │    │
│                                              (Red-Flag)            │    │
│                                                                    ▼    │
│                                                              Buku Kas   │
│                                                              Buku Bank  │
│                                                              Buku Pajak │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                     ALUR PENGAWASAN & TRANSPARANSI                       │
│                                                                          │
│   PUBLIK               AUDITOR                BPD / ADAT                 │
│   ──────              ────────               ──────────                  │
│                                                                          │
│   Pantau Proyek ◄──── (data sama) ────► Pantauan Transaksi               │
│   (read-only)          Ledger Explorer   (read-only + catatan)           │
│                        (forensik detail)                                 │
│                                                                          │
│   Klarifikasi ────────────────────────► Inbox Klarifikasi (Sekdes)       │
│   (kirim pertanyaan)                    (jawab pertanyaan)               │
│                                                                          │
│   Lapor Rahasia ──► [ENCRYPTED] ──────► Kotak Masuk Rahasia (Auditor)    │
│   (E2EE, anonim)     Server tidak        (dekripsi di browser Auditor)   │
│                      bisa baca                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

**Ringkasan Keterkaitan Penting:**
- Pencairan yang dibuat **Kaur Teknis** akan muncul di antrean **Sekdes**, lalu **Kades**, lalu **Kaur Keuangan** secara berurutan
- Setelah **Kaur Keuangan** mengeksekusi, data otomatis tercatat di 3 buku (Kas, Bank, Pajak)
- Semua pencairan yang sudah selesai langsung terlihat di **Dashboard Publik** sebagai update progres proyek
- **Panic Button** Kades menciptakan log intervensi yang muncul sebagai red-flag di dashboard **Auditor** dan **BPD**
- **Klarifikasi** mengalir dari Publik → Sekdes (jawab) → kembali ke Publik
- **Whistleblower** mengalir dari Publik → langsung ke Auditor saja (tidak bisa dibaca perangkat desa)

---

## 7. Skenario Penggunaan

### Skenario 1: Alur Normal Pencairan Dana (Happy Path)

> **Kasus:** Dusun Mekar mengusulkan pembangunan jembatan melalui Musrembang dengan pagu anggaran Rp 150.000.000. Kaur Teknis mengajukan pencairan termin pertama sebesar Rp 50.000.000.

#### Langkah 1 — Kaur Teknis: Buat Proposal Musrembang
1. Login sebagai **Budi Santoso** (`budi.santoso.kaur-teknis@kohalock.desa` / `password123`)
2. Buka menu **Formulir Musrembang**
3. Isi formulir:
   - Dusun: `Mekar`
   - Judul Usulan: `Pembangunan Jembatan Dusun Mekar`
   - Kategori: `Infrastruktur`
   - Volume: `1`, Satuan: `Unit`
   - Pagu Maksimal: `150000000`
4. Upload dokumen pendukung (RAB, foto lokasi)
5. Klik **Kirim Usulan**
6. ✅ Proposal muncul di halaman **Program Saya** dan di **Dashboard Publik**

#### Langkah 2 — Kaur Teknis: Ajukan Pencairan Termin 1
1. Buka menu **Ajukan Pencairan**
2. Pilih proposal: `Pembangunan Jembatan Dusun Mekar`
3. Sistem menampilkan sisa pagu: `Rp 150.000.000`
4. Isi formulir:
   - Keterangan: `Termin 1 - Pondasi dan Tiang`
   - Nominal: `50000000`
5. Upload berita acara (PDF) dan foto bukti lapangan (gunakan kamera — akan otomatis ada watermark GPS + timestamp)
6. Klik **Ajukan**
7. ✅ Status pencairan: **PENDING_SEKDES**

#### Langkah 3 — Sekdes: Verifikasi Pengajuan
1. Login sebagai **Siti Rahma** (`siti.rahma.sekdes@kohalock.desa` / `password123`)
2. Buka menu **Verifikasi Pengajuan** — muncul 1 item pending
3. Klik item tersebut → tampil Split-View Reviewer:
   - Kiri: detail pengajuan, nominal, keterangan
   - Kanan: preview PDF berita acara, peta lokasi geotag, badge hash checker
4. Setelah puas dengan review, klik **Verifikasi & Teruskan ke Kades**
5. ✅ Status berubah: **PENDING_KADES**

#### Langkah 4 — Kades: Otorisasi Pencairan
1. Login sebagai **Ahmad Fauzi** (`ahmad.fauzi.kades@kohalock.desa` / `password123`)
2. Buka menu **Persetujuan Pencairan** — muncul 1 item pending
3. Klik item → lihat detail lengkap termasuk siapa yang sudah verifikasi
4. Klik **Setujui & Otorisasi**
5. ✅ Status berubah: **PENDING_EKSEKUSI**

#### Langkah 5 — Kaur Keuangan: Eksekusi & Catat Pembukuan
1. Login sebagai **Hastuti** (`hastuti.kaur-keuangan@kohalock.desa` / `password123`)
2. Buka menu **Antrean Eksekusi** — muncul 1 item siap dicairkan
3. Klik item → review nominal dan potongan pajak (jika ada)
4. Klik **Eksekusi Pencairan**
5. ✅ Status berubah: **DISBURSED**
6. ✅ Otomatis tercatat di **Buku Kas Umum** (pengeluaran Rp 50.000.000)
7. ✅ Otomatis tercatat di **Buku Bank** (kredit Rp 50.000.000)
8. ✅ Jika ada potongan pajak, tercatat di **Buku Pajak**

#### Hasil yang Terlihat di Sisi Publik
- Buka halaman **Pantau Proyek** tanpa login
- Proyek `Pembangunan Jembatan Dusun Mekar` menampilkan progress bar 33% (Rp 50jt dari Rp 150jt)
- Klik detail → terlihat rincian Termin 1, foto dengan GPS, dan status pencairan

---

### Skenario 2: Pencairan Ditolak & Direvisi

> **Kasus:** Kaur Teknis mengajukan pencairan termin 2 sebesar Rp 60.000.000, tapi Sekdes menemukan foto bukti lapangan tidak sesuai lokasi (koordinat GPS di luar area proyek).

#### Langkah 1 — Kaur Teknis: Ajukan Pencairan Termin 2
1. Login sebagai **Budi Santoso**
2. Buka **Ajukan Pencairan**, pilih proposal `Pembangunan Jembatan Dusun Mekar`
3. Sisa pagu tampil: `Rp 100.000.000` (sudah terpakai Rp 50jt dari Skenario 1)
4. Isi: Keterangan `Termin 2 - Rangka Baja`, Nominal `60000000`
5. Upload berita acara dan foto (misalnya foto yang GPS-nya keliru)
6. Klik **Ajukan** → Status: **PENDING_SEKDES**

#### Langkah 2 — Sekdes: Tolak & Kembalikan untuk Revisi
1. Login sebagai **Siti Rahma**
2. Buka **Verifikasi Pengajuan**, klik item Termin 2
3. Lihat di Split-View → titik GPS di peta tidak sesuai area proyek
4. Klik **Kembalikan untuk Revisi**
5. Isi alasan: `"Koordinat GPS foto tidak sesuai dengan lokasi proyek. Mohon foto ulang di lokasi yang benar."`
6. ✅ Status berubah: **RETURNED_FOR_REVISION**

#### Langkah 3 — Kaur Teknis: Lihat Alasan Penolakan
1. Login kembali sebagai **Budi Santoso**
2. Buka menu **Riwayat Penolakan**
3. Terlihat entry: `Termin 2 - Rangka Baja` dengan alasan revisi dari Sekdes
4. Kaur Teknis bisa mengajukan ulang dengan foto yang benar melalui **Ajukan Pencairan** (pencairan baru dengan data yang diperbaiki)

#### Langkah 4 — Kaur Teknis: Ajukan Ulang
1. Buka **Ajukan Pencairan** lagi
2. Pilih proposal yang sama, isi data serupa tapi kali ini dengan foto yang benar dari lokasi proyek
3. Klik **Ajukan** → Status: **PENDING_SEKDES** (kembali ke Sekdes)
4. Proses selanjutnya mengikuti alur normal (Sekdes approve → Kades otorisasi → Kaur Keuangan eksekusi)

---

### Skenario 3: Panic Button & Pengawasan Forensik

> **Kasus:** Kades menemukan pencairan termin 3 senilai Rp 40.000.000 yang sudah diverifikasi Sekdes, tapi mencurigai adanya mark-up harga yang signifikan. Kades menekan Panic Button. Auditor kemudian melakukan investigasi, dan warga juga mengirim laporan rahasia.

#### Langkah 1 — Kades: Intervensi Pencairan
1. Login sebagai **Ahmad Fauzi**
2. Buka **Persetujuan Pencairan** — muncul pencairan Termin 3 yang sudah verified oleh Sekdes
3. Setelah mereview detail, Kades mencurigai nominal Rp 40.000.000 untuk `"Pengecatan"` terlalu tinggi
4. Alih-alih klik **Setujui**, buka menu **Perisai Integritas**
5. Klik **Tolak Intervensi** pada pencairan tersebut
6. Isi alasan: `"Nominal Rp 40.000.000 untuk pengecatan tidak wajar. Dugaan mark-up."`
7. ✅ Pencairan diblokir dan diberi status **REJECTED (Intervention)**
8. ✅ Sistem mencatat `InterventionLog` dengan ID transaksi dan alasan

#### Langkah 2 — Publik: Kirim Laporan Rahasia
1. Buka halaman publik **Lapor Rahasia** (tanpa login)
2. Isi laporan: `"Saya melihat material cat yang dipakai bukan cat yang tertera di RAB. Harga pasaran cat tersebut hanya Rp 5.000.000, bukan Rp 40.000.000."`
3. Sistem mengenkripsi laporan di browser menggunakan kunci publik Inspektorat
4. Klik **Kirim Laporan Anonim**
5. ✅ Sistem memberikan kode tiket: `WB-A3K9F2`
6. Pelapor bisa cek status kapan saja dengan kode tiket ini tanpa mengungkapkan identitas

#### Langkah 3 — Auditor: Investigasi
1. Login sebagai **Inspektur Wilayah** (`inspektur.auditor@kohalock.desa` / `password123`)
2. Buka **Beranda Forensik**:
   - Red-flag count bertambah karena ada `InterventionLog` baru
   - Di chart anomali, bulan ini ada spike
3. Buka **Kronologi Transaksi (Ledger Explorer)**:
   - Cari pencairan `Pengecatan`
   - Lihat timeline: Submitted → Verified by Sekdes → **Rejected by Kades (Intervention)**
   - Setiap tahap ada timestamp presisi dan hash dokumen terkait
4. Buka **Uji Alat Bukti (Integrity Checker)**:
   - Upload ulang file berita acara PDF yang diperoleh dari pihak Kaur Teknis
   - Sistem mencocokkan hash → jika match, berarti dokumen ini tidak diubah sejak diunggah
5. Buka **Kotak Masuk Rahasia**:
   - Terlihat 1 laporan baru (masih berupa ciphertext)
   - Klik **Dekripsi** → masukkan passphrase private key Inspektorat
   - Isi laporan terbuka: laporan dari warga tentang dugaan mark-up cat
6. ✅ Auditor sekarang memiliki bukti dari 3 sumber independen:
   - Log intervensi Kades (on-chain)
   - Hash dokumen asli yang terverifikasi
   - Laporan anonim warga yang terenkripsi

#### Langkah 4 — Auditor: Ekspor Bukti
1. Buka **Ekspor Laporan Hukum**
2. Pilih pencairan-pencairan terkait
3. Klik **Generate PDF** → dokumen BAP siap cetak
4. Atau klik **Export Data Mentah** → file JSON/CSV untuk analisis lanjutan

#### Langkah 5 — BPD: Catatan Pengawasan
1. Login sebagai **Ketua BPD** (`ketua.bpd-adat@kohalock.desa` / `password123`)
2. Buka **Beranda Pengawasan** — terlihat red-flag baru di widget
3. Buka **Pantauan Transaksi**, cari pencairan yang bermasalah
4. Tulis catatan pengawasan: `"BPD mencatat adanya intervensi Kades pada pencairan Termin 3 proyek Jembatan Mekar. Mohon tindak lanjut oleh pihak berwenang."`
5. ✅ Catatan ini tercatat di `SupervisionNote` dan terkirim sebagai notifikasi ke Kades & Sekdes

---

## Akun Demo

Semua akun demo menggunakan password: **`password123`**

| Role | Email | Nama |
|---|---|---|
| Kaur Teknis | `budi.santoso.kaur-teknis@kohalock.desa` | Budi Santoso |
| Sekdes | `siti.rahma.sekdes@kohalock.desa` | Siti Rahma |
| Kades | `ahmad.fauzi.kades@kohalock.desa` | Ahmad Fauzi |
| Publik | `warga.publik@kohalock.desa` | Warga Publik |
| Auditor | `inspektur.auditor@kohalock.desa` | Inspektur Wilayah |
| BPD & Adat | `ketua.bpd-adat@kohalock.desa` | Ketua BPD |
| Kaur Keuangan | `hastuti.kaur-keuangan@kohalock.desa` | Hastuti |
