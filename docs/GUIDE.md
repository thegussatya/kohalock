# PANDUAN LENGKAP KOHALOCK

## Sistem Transparansi Dana Desa Berbasis Blockchain

---

## Daftar Isi

1. [Apa Itu KOHALOCK?](#1-apa-itu-kohalock)
2. [Masalah yang Ingin Diatasi](#2-masalah-yang-ingin-diatasi)
3. [Teknologi yang Digunakan](#3-teknologi-yang-digunakan)
4. [Status Pengembangan Saat Ini](#4-status-pengembangan-saat-ini)
5. [Konsep Keamanan & PIN Custodial Wallet](#5-konsep-keamanan--pin-custodial-wallet) _(baru)_
6. [Daftar Role & Fitur](#6-daftar-role--fitur)
7. [Matriks Input ➔ Harapan Output per Role](#7-matriks-input--harapan-output-per-role)
8. [Keterkaitan Antar Fitur](#8-keterkaitan-antar-fitur)
9. [Skenario Penggunaan](#9-skenario-penggunaan)
   - [Skenario 1: Alur Normal Pencairan Dana (Happy Path)](#skenario-1-alur-normal-pencairan-dana-happy-path)
   - [Skenario 2: Pencairan Ditolak & Direvisi](#skenario-2-pencairan-ditolak--direvisi)
   - [Skenario 3: Panic Button & Pengawasan Forensik](#skenario-3-panic-button--pengawasan-forensik)
   - [Skenario 4: Tolak Intervensi Non-Prosedural & Sertifikat Penolakan (Kades)](#skenario-4-tolak-intervensi-non-prosedural--sertifikat-penolakan-kades)
   - [Skenario 5: Penutupan Buku Bulanan & Koreksi Jurnal](#skenario-5-penutupan-buku-bulanan--koreksi-jurnal)
   - [Skenario 6: Mencatat Pendapatan Desa & Dampaknya ke BKU](#skenario-6-mencatat-pendapatan-desa--dampaknya-ke-bku) _(baru)_

---

## 1. Apa Itu KOHALOCK?

KOHALOCK adalah platform digital untuk mengelola **siklus penuh dana desa** — mulai dari tahap perencanaan di Musrembang, pengajuan pencairan, verifikasi bertingkat, hingga pencairan aktual — dengan **jejak audit yang tidak bisa diubah** menggunakan teknologi blockchain.

Sistem ini dirancang untuk **satu desa** (single-tenant) dan melibatkan **7 peran pengguna** yang masing-masing memiliki dashboard, menu, dan hak akses berbeda, namun semuanya berada dalam **satu aplikasi web yang sama**.

Prinsip utamanya sederhana:

> **"Apa yang harus dibuktikan tidak bisa diubah → dicatat di blockchain. Apa yang butuh kecepatan & fleksibilitas → dicatat di database biasa."**

---

## 2. Masalah yang Ingin Diatasi

Pengelolaan dana desa di Indonesia seringkali menghadapi masalah:

| Masalah                                                                                    | Bagaimana KOHALOCK Mengatasi                                                                                                                  |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pencairan tidak transparan** — masyarakat tidak tahu dana terpakai untuk apa             | Dashboard Publik real-time: siapa pun bisa melihat proyek, anggaran, dan progres pencairan tanpa perlu login                                  |
| **Dokumen bisa dipalsukan** — berita acara atau foto bukti bisa diedit setelah pencairan   | Setiap dokumen di-hash (SHA-256) saat diunggah, hash-nya dikunci di blockchain. Kalau file diubah 1 bit pun, hash-nya tidak cocok             |
| **Tidak ada jejak audit independen** — sulit membuktikan siapa menyetujui apa, kapan       | Setiap persetujuan (verifikasi Sekdes, otorisasi Kades, eksekusi Bendahara) tercatat sebagai transaksi blockchain dengan tanda tangan digital |
| **Whistleblower takut teridentifikasi** — laporan rahasia bisa dibaca oleh aparat desa     | Laporan dienkripsi di browser pelapor menggunakan kunci publik Inspektorat (E2EE). Bahkan server tidak pernah melihat isi asli laporan        |
| **Auditor bergantung pada data yang disediakan pihak yang diaudit** — conflict of interest | Auditor bisa langsung cek integritas dokumen vs hash on-chain dan menelusuri kronologi transaksi blockchain secara mandiri                    |

---

## 3. Teknologi yang Digunakan

### Frontend (Apa yang Dilihat Pengguna)

| Teknologi              | Fungsi                                         |
| ---------------------- | ---------------------------------------------- |
| **React + TypeScript** | Framework untuk membangun antarmuka pengguna   |
| **Vite**               | Alat build yang cepat untuk pengembangan       |
| **Tailwind CSS**       | Styling/desain visual                          |
| **Recharts**           | Grafik dan chart di dashboard                  |
| **React Leaflet**      | Peta interaktif untuk geotag lokasi            |
| **TweetNaCl**          | Enkripsi sisi klien untuk Whistleblower (E2EE) |

### Backend (Mesin di Balik Layar)

| Teknologi                | Fungsi                                                              |
| ------------------------ | ------------------------------------------------------------------- |
| **Node.js + Express**    | Server API yang melayani semua request                              |
| **PostgreSQL**           | Database utama (di-host di Supabase)                                |
| **Prisma ORM**           | Penghubung antara kode dan database                                 |
| **JWT (JSON Web Token)** | Sistem autentikasi & otorisasi per role                             |
| **Supabase RLS**         | Row Level Security — memblokir akses langsung ke database dari luar |

### Blockchain (Pengunci Kebenaran)

| Teknologi                | Fungsi                                                         |
| ------------------------ | -------------------------------------------------------------- |
| **Solidity + Hardhat**   | Smart contract untuk mencatat transaksi yang tidak bisa diubah |
| **Polygon Amoy Testnet** | Jaringan blockchain untuk pengujian                            |
| **ethers.js**            | Library untuk berinteraksi dengan blockchain dari backend      |

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
- **Backend API** untuk alur inti pencairan (Operator Desa → Sekdes → Kades → Kaur Keuangan) sudah berfungsi end-to-end
- **Modul Bendahara** lengkap: Buku Kas, Buku Bank, Buku Pajak, Penutupan Buku, Koreksi, Laporan Realisasi
- **Modul Pendapatan Desa** (VillageIncomePage) sudah terhubung penuh: form input, filter, tabel, MetricCards & Chart dari API — otomatis sync ke Buku Kas Umum
- **Dashboard** semua role sudah terhubung ke data aktual
- **Dashboard Publik** (tanpa login) sudah bisa menampilkan proyek & progres real-time
- **Klarifikasi Warga** dan **Whistleblower** sudah terhubung frontend ↔ backend
- **Perisai Integritas / Panic Button** (di `DisbursementDetailPage` & `IntegrityShieldPage`) sudah terhubung penuh ke backend
- **Row Level Security (RLS)** sudah aktif di 17 tabel Supabase
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

## 5. Konsep Keamanan & PIN Custodial Wallet

### Mengapa Beberapa Aksi Membutuhkan PIN?

Dalam KOHALOCK, aksi-aksi krusial seperti **otorisasi pencairan** dan **penutupan buku** merupakan transaksi yang harus bisa dibuktikan secara kriptografis — artinya harus ada tanda tangan digital yang sah dari pejabat yang berwenang.

Namun aparat desa tidak bisa diminta menginstal wallet crypto seperti MetaMask. Solusinya adalah **Custodial Wallet** yang dikelola sistem:

| Konsep                                   | Penjelasan                                                                                                                                                                       |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Private Key Terenkripsi**              | Setiap user punya Private Key yang disimpan terenkripsi di server. Key ini tidak pernah bisa diakses langsung dari luar.                                                         |
| **PIN 6-Digit sebagai Dekriptor**        | Saat user memasukkan PIN, server mendekripsi Private Key tersebut **secara sementara di memori** (milidetik), menandatangani transaksi, lalu langsung menghapus key dari memori. |
| **Non-Repudiation (Tolak Penyangkalan)** | Karena hanya pemilik akun yang tahu PIN-nya, tanda tangan yang dihasilkan membuktikan bahwa transaksi dilakukan secara sadar dan sah.                                            |
| **PIN Per-Akun, Bukan Per-Transaksi**    | PIN adalah identitas kriptografis pemilik akun. PIN digunakan setiap kali transaksi krusial dilakukan, tapi nilainya tetap (tidak berubah per transaksi).                        |

> **Analogi:** PIN ATM. Kamu tidak perlu tahu cara kerja mesin kriptografinya — tapi ATM tidak akan mencairkan dana tanpa PIN yang benar.

---

## 6. Daftar Role & Fitur

### 5.1. Operator Desa (Operator Desa)

**Siapa:** Staf teknis desa yang bertanggung jawab menginput usulan dan mengajukan pencairan.

| Fitur                   | Fungsi                                                                      | Terhubung Ke                                                                               |
| ----------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Dashboard**           | Ringkasan jumlah proposal, status pencairan, grafik realisasi bulanan       | Data real-time dari Proposal & Disbursement                                                |
| **Formulir Musrembang** | Input program baru hasil Musrembang (judul, dusun, kategori, pagu anggaran) | Membuat data di tabel `Proposal` → muncul di Dashboard Publik                              |
| **Ajukan Pencairan**    | Upload berita acara + foto geotagging, input nominal                        | Membuat `Disbursement` dengan status `PENDING_SEKDES` → masuk ke Antrean Verifikasi Sekdes |
| **Program Saya**        | Melihat daftar proposal yang pernah diinput                                 | Membaca data `Proposal` milik user ini                                                     |
| **Riwayat Penolakan**   | Melihat pencairan yang ditolak/revisi beserta alasannya                     | Membaca `Disbursement` dengan status `RETURNED_FOR_REVISION`                               |

---

### 5.2. Sekretaris Desa (Sekdes)

**Siapa:** Verifikator tahap 1 yang mengecek kelengkapan dan keabsahan dokumen.

| Fitur                           | Fungsi                                                                                              | Terhubung Ke                                                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**                   | Jumlah pengajuan pending, rata-rata waktu verifikasi, klarifikasi menunggu                          | Data real-time dari Disbursement & ClarificationTicket                                                                              |
| **Verifikasi Pengajuan**        | Antrean pencairan yang menunggu di-review (Split-View: peta, PDF, hash checker)                     | Membaca `Disbursement` status `PENDING_SEKDES`                                                                                      |
| **Approve / Kembalikan Revisi** | Setujui → status berubah jadi `PENDING_KADES`. Tolak → status jadi `RETURNED_FOR_REVISION` + alasan | Mengubah status Disbursement → kalau disetujui, muncul di Persetujuan Kades. Kalau ditolak, muncul di Riwayat Penolakan Operator Desa |
| **Pantauan Anggaran**           | Monitor saldo kas, dana cair, dana dalam proses                                                     | Agregasi dari Proposal & Disbursement                                                                                               |
| **Inbox Klarifikasi**           | Menjawab pertanyaan warga yang masuk                                                                | Membaca & membalas `ClarificationTicket` → jawaban muncul di halaman Klarifikasi Publik                                             |

---

### 5.3. Kepala Desa (Kades)

**Siapa:** Otorisator final pencairan. Juga memiliki "Tombol Darurat" (Panic Button) untuk menolak transaksi yang dicurigai.

| Fitur                                 | Fungsi                                                                           | Terhubung Ke                                                                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**                         | Jumlah pending otorisasi, total realisasi tahunan, ranking dusun, grafik serapan | Data real-time                                                                                                                                 |
| **Persetujuan Pencairan**             | Melihat detail dan meng-otorisasi pencairan yang sudah diverifikasi Sekdes       | Membaca `Disbursement` status `PENDING_KADES`. Setelah approve → status berubah jadi `PENDING_EKSEKUSI` → masuk Antrean Eksekusi Kaur Keuangan |
| **Perisai Integritas (Panic Button)** | Menolak/intervensi pencairan yang dicurigai terjadi penyimpangan                 | Membuat `InterventionLog` → pencairan diblokir, muncul sebagai red-flag di Dashboard Auditor & BPD                                             |
| **Pusat Klarifikasi Publik**          | Melihat pertanyaan-pertanyaan warga                                              | Membaca `ClarificationTicket`                                                                                                                  |
| **Analitik Klarifikasi**              | Statistik kategori pertanyaan dan rata-rata waktu respon                         | Agregasi dari ClarificationTicket                                                                                                              |

---

### 5.4. Kaur Keuangan / Bendahara

**Siapa:** Pelaksana eksekusi pencairan aktual dan pencatatan pembukuan keuangan desa.

| Fitur                      | Fungsi                                                                    | Terhubung Ke                                                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**              | Saldo kas, jumlah eksekusi pending, tenggat pelaporan                     | Data real-time dari CashBook & Disbursement                                                                                                                               |
| **Antrean Eksekusi**       | Daftar pencairan yang sudah diotorisasi Kades, tinggal dicairkan          | Membaca `Disbursement` status `PENDING_EKSEKUSI`. Setelah eksekusi → status jadi `DISBURSED`, otomatis tercatat di Buku Kas, Buku Bank, dan Buku Pajak                    |
| **Pendapatan Desa**        | Mencatat semua sumber penerimaan kas desa (Transfer, PADes, Lain-lain)    | Membuat `VillageIncomeEntry` + otomatis buat `CashBookEntry` penerimaan. Ditolak jika periode sudah di-closing. Ditampilkan di MetricCard, Donut Chart, dan tabel riwayat |
| **Buku Kas Umum**          | Pencatatan penerimaan & pengeluaran kas desa                              | Entri otomatis dari eksekusi pencairan **dan** dari Pendapatan Desa                                                                                                       |
| **Buku Bank**              | Rekonsiliasi transaksi bank                                               | Data sinkron dari Buku Kas                                                                                                                                                |
| **Buku Pajak**             | Pencatatan potongan & penyetoran pajak per pencairan                      | Terintegrasi dengan proses eksekusi pencairan                                                                                                                             |
| **Penutupan Buku Bulanan** | Mengunci seluruh catatan bulan berjalan dengan hash SHA-256               | Data dari Buku Kas, Bank, Pajak → setelah dikunci, hanya bisa dikoreksi via Transaksi Koreksi. Juga memblokir pencatatan Pendapatan Desa untuk periode terkunci           |
| **Transaksi Koreksi**      | Membuat jurnal pembalik untuk kesalahan entri (tanpa menghapus data asli) | Merujuk pada entri yang sudah terkunci → menjaga audit trail                                                                                                              |
| **Laporan Realisasi**      | Rekapitulasi anggaran vs realisasi per kategori/dusun                     | Agregasi semua data keuangan                                                                                                                                              |

---

### 5.5. Masyarakat (Publik)

**Siapa:** Warga desa atau siapa pun yang ingin memantau penggunaan dana desa. Tidak wajib login untuk melihat data.

| Fitur                             | Fungsi                                                             | Terhubung Ke                                                                                                       |
| --------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Beranda**                       | Ringkasan total dana, realisasi, jumlah proyek aktif               | Agregasi dari Proposal & Disbursement                                                                              |
| **Pantau Proyek**                 | Daftar semua proyek desa dengan filter pencarian, progress bar     | Data dari `Proposal` + `Disbursement`                                                                              |
| **Detail Proyek**                 | Rincian per termin pencairan, galeri foto geotagging, hash dokumen | Data detail satu Proposal + Disbursement-nya                                                                       |
| **Klarifikasi**                   | Mengirim pertanyaan ke perangkat desa dan melihat jawaban          | Membuat `ClarificationTicket` → dijawab oleh Sekdes                                                                |
| **Lapor Rahasia (Whistleblower)** | Mengirim laporan terenkripsi yang hanya bisa dibaca Auditor        | Membuat `WhistleblowerReport` dengan enkripsi E2EE → hanya bisa di-dekripsi di halaman Kotak Masuk Rahasia Auditor |

---

### 5.6. Auditor / Inspektorat

**Siapa:** Pengawas eksternal dengan akses terbatas waktu (time-bound) untuk melakukan audit forensik.

| Fitur                                     | Fungsi                                                                                | Terhubung Ke                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Beranda Forensik**                      | Jumlah total transaksi, red-flag/anomali, sisa waktu akses                            | Agregasi dari Disbursement & InterventionLog                                  |
| **Manajemen Kasus**                       | Kanban board kasus yang perlu diinvestigasi                                           | Data dari WhistleblowerReport & InterventionLog                               |
| **Uji Alat Bukti (Integrity Checker)**    | Upload file dokumen, sistem mencocokkan hash-nya dengan yang tersimpan on-chain       | Membandingkan hash file vs hash di `Disbursement.beritaAcaraHash`             |
| **Kronologi Transaksi (Ledger Explorer)** | Timeline visual setiap tahapan pencairan: siapa, kapan, hash apa                      | Data dari Disbursement + timestamp setiap status                              |
| **Kotak Masuk Rahasia**                   | Membaca laporan whistleblower yang terenkripsi (dekripsi di browser, bukan di server) | Data dari `WhistleblowerReport`, dekripsi menggunakan private key Inspektorat |
| **Ekspor Laporan Hukum**                  | Generate PDF/CSV untuk kebutuhan BAP atau laporan audit                               | Data dari Disbursement yang dipilih                                           |
| **Template Laporan**                      | Template dokumen standar (BAP, Surat Panggilan, dll)                                  | Data statis                                                                   |

---

### 5.7. BPD & Tokoh Adat

**Siapa:** Badan Permusyawaratan Desa (pengawas) dan Tokoh Adat (penyelesai sengketa non-keuangan). Satu dashboard, dua peran berbeda.

| Fitur                   | Fungsi                                                                 | Terhubung Ke                                                                                                |
| ----------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Beranda Pengawasan**  | Performance rate, red-flags, timeline aktivitas gabungan               | Agregasi dari Disbursement, InterventionLog, AdatCase, SupervisionNote                                      |
| **Pantauan Transaksi**  | Melihat semua pencairan (read-only) + menulis catatan pengawasan       | Data dari Disbursement. Catatan pengawasan (`SupervisionNote`) dikirim sebagai notifikasi ke Kades & Sekdes |
| **Papan Resolusi Adat** | Mencatat kasus sengketa warga, status musyawarah, keputusan resolusi   | Data dari `AdatCase` — tidak terkait keuangan, murni pencatatan                                             |
| **Kalender Musyawarah** | Jadwal sidang adat berdasarkan kasus yang masih berstatus "Musyawarah" | Data dari AdatCase yang aktif                                                                               |
| **Laporan Tahunan**     | Statistik kasus adat terselesaikan dan catatan pengawasan per kuartal  | Agregasi dari AdatCase & SupervisionNote                                                                    |

---

## 7. Matriks Input ➔ Harapan Output per Role

Bagian ini menjelaskan secara spesifik: **jika input data sekian → harapan hasil yang muncul di fitur/role terhubung adalah sekian.**

### 7.1. Operator Desa — Input & Output Terhubung

| Fitur                   | Input Pengguna                                                                                                      | Harapan Output di Fitur Lain                                                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Formulir Musrembang** | Dusun, Judul, Kategori, Volume + Satuan, Pagu Maksimal, Upload RAB/PDF                                              | 1. Record `Proposal` dibuat.<br>2. Muncul di **Program Saya** Operator Desa.<br>3. Muncul di **Dashboard Publik → Pantau Proyek** (progress 0%).<br>4. Menjadi pilihan di dropdown **Ajukan Pencairan**.                              |
| **Ajukan Pencairan**    | Pilih Proposal, Pilih Termin (mis. `Tahap I`), Nominal otomatis (`60000000`), Upload PDF Berita Acara, Ambil Foto Geotagging Native | 1. Validasi: jika `Nominal > Sisa Pagu` → ditolak sistem, pesan error muncul.<br>2. Jika lolos: `Disbursement` dibuat status `PENDING_SEKDES`.<br>3. Item otomatis muncul di **Verifikasi Pengajuan Sekdes** (Split-View Reviewer). |
| **Riwayat Penolakan**   | Klik item yang statusnya `RETURNED_FOR_REVISION`                                                                    | 1. Detail alasan revisi dari Sekdes ditampilkan.<br>2. Tombol **[Perbaiki & Ajukan Ulang]** membuka form Ajukan Pencairan dengan data lama (_pre-filled_), Operator Desa cukup mengganti berkas yang salah.                           |

### 7.2. Sekdes — Input & Output Terhubung

| Fitur                   | Input Pengguna                                         | Harapan Output di Fitur Lain                                                                                                                       |
| ----------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Split-View Reviewer** | Klik item `PENDING_SEKDES` di Verifikasi Pengajuan     | Membuka tampilan dua panel: (kiri) detail nominal & keterangan, (kanan) preview PDF Berita Acara + Peta GPS Geotag + Badge Hash Checker.           |
| **Aksi: Setujui**       | Klik **[Verifikasi & Teruskan ke Kades]** + PIN Sekdes | 1. Status `Disbursement` → `PENDING_KADES`.<br>2. Item berpindah ke **Persetujuan Pencairan Kades**.<br>3. Notifikasi dikirim ke Kades.            |
| **Aksi: Kembalikan**    | Klik **[Kembalikan untuk Revisi]** + Isi teks alasan   | 1. Status → `RETURNED_FOR_REVISION`.<br>2. Item muncul di **Riwayat Penolakan Operator Desa** beserta catatan alasan.<br>3. `RejectionLog` tercatat. |
| **Inbox Klarifikasi**   | Pilih tiket warga + Ketik teks jawaban resmi + Kirim   | 1. Jawaban tersimpan di `ClarificationTicket`.<br>2. Tampil otomatis di **halaman Klarifikasi Publik** untuk warga yang bertanya.                  |

### 7.3. Kades — Input & Output Terhubung

| Fitur                               | Input Pengguna                                                                                                                          | Harapan Output di Fitur Lain                                                                                                                                                                                                                     |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Buka Detail Pengajuan**           | Klik item `PENDING_KADES` di Persetujuan Pencairan                                                                                      | Menampilkan ringkasan pengajuan: nominal, keterangan, nama Sekdes yang memverifikasi, dan timestamp verifikasi.                                                                                                                                  |
| **Otorisasi Pencairan**             | Klik **[Setujui & Otorisasi]** → Konfirmasi → Masukkan PIN 6-Digit                                                                      | 1. Status → `PENDING_EKSEKUSI`.<br>2. Notifikasi dikirim ke Kaur Keuangan.<br>3. Item masuk ke **Antrean Eksekusi Kaur Keuangan**.                                                                                                               |
| **Tolak Intervensi Non-Prosedural** | Klik tombol merah **[Tolak Intervensi Non-Prosedural]** (di halaman Detail Pengajuan atau Perisai Integritas) → Isi Alasan → Konfirmasi | 1. Status → `REJECTED_SYSTEM` (Terkunci permanen).<br>2. `InterventionLog` dibuat dan dicatat on-chain.<br>3. Tombol **[Unduh Sertifikat Penolakan PDF]** aktif langsung di halaman.<br>4. Red-flag bertambah +1 di **Dashboard Auditor & BPD**. |

### 7.4. Kaur Keuangan — Input & Output Terhubung

| Fitur                      | Input Pengguna                                                                                                                                                         | Harapan Output di Fitur Lain                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pendapatan Desa (Baru)** | Pilih Kelompok (`Transfer`/`PADes`/`Pendapatan Lain-lain`), Pilih Jenis (cascading), Isi Tanggal, Nominal, Uraian, Referensi (opsional) → Klik **[Simpan Pendapatan]** | 1. Validasi: jika periode sudah di-closing → ditolak sistem, pesan error: _"Periode ini sudah ditutup, gunakan Transaksi Koreksi"_.<br>2. Jika lolos: `VillageIncomeEntry` dibuat.<br>3. `CashBookEntry` penerimaan dibuat **otomatis** dengan saldo berjalan = saldo sebelumnya + nominal.<br>4. Keduanya di-_link_ (`cashBookEntryId`).<br>5. **MetricCard & Donut Chart** di halaman Pendapatan Desa langsung refresh.<br>6. Entri baru tampil di **Buku Kas Umum** pada kolom Penerimaan — tanpa reload halaman. |
| **Eksekusi Pencairan**     | Pilih item `PENDING_EKSEKUSI`, isi rincian Potongan Pajak (PPh/PPN), klik **[Eksekusi Pencairan]**                                                                     | 1. Status → `DISBURSED`.<br>2. Entri pengeluaran otomatis di **Buku Kas Umum**.<br>3. Entri kredit otomatis di **Buku Bank**.<br>4. Potongan pajak dicatat di **Buku Pajak**.<br>5. **Dashboard Publik** menampilkan progress realisasi proyek yang meningkat.                                                                                                                                                                                                                                                       |
| **Penutupan Buku Bulanan** | Pilih Bulan & Tahun → Verifikasi checklist saldo seimbang → Masukkan PIN                                                                                               | 1. `MonthlyClosing` dibuat dengan SHA-256 Hash Lock.<br>2. Semua transaksi bulan itu dikunci (`statusTerkunci = true`).<br>3. Eksekusi pencairan baru pada bulan tersebut diblokir sistem secara otomatis.<br>4. Pencatatan Pendapatan Desa baru pada bulan tersebut juga diblokir.                                                                                                                                                                                                                                  |
| **Transaksi Koreksi**      | Pilih entri terkunci yang salah → Isi Nominal Koreksi & Uraian Jurnal Pembalik                                                                                         | 1. Entri Jurnal Pembalik dibuat tanpa menghapus data asli.<br>2. Saldo Buku Kas & Bank terhitung ulang secara presisi. Audit trail terjaga 100%.                                                                                                                                                                                                                                                                                                                                                                     |

### 7.5. Masyarakat (Publik) — Input & Output Terhubung

| Fitur                             | Input Pengguna                                                 | Harapan Output di Fitur Lain                                                                                                                                                                                                                                                                                                          |
| --------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pantau Proyek**                 | Ketik nama program / filter kategori / klik detail proyek      | Menampilkan: progress bar serapan anggaran, rincian setiap termin yang sudah cair, foto geotagging dengan koordinat GPS, dan badge hash otentisitas dokumen.                                                                                                                                                                          |
| **Klarifikasi Warga**             | Input Nama (opsional), Pilih Program, Ketik Pertanyaan → Kirim | 1. `ClarificationTicket` status `MENUNGGU` dibuat.<br>2. Muncul di **Inbox Klarifikasi Sekdes**.<br>3. Saat Sekdes membalas → Jawaban tampil otomatis di halaman ini untuk publik.                                                                                                                                                    |
| **Lapor Rahasia (Whistleblower)** | Isi teks laporan anonim → Klik **[Kirim Laporan Anonim]**      | 1. Laporan dienkripsi di browser (E2EE, TweetNaCl) sebelum dikirim ke server.<br>2. Server hanya menyimpan Ciphertext — tidak bisa dibaca siapapun selain Auditor.<br>3. Pelapor mendapat Kode Tiket Unik untuk cek status tanpa mengungkapkan identitas.<br>4. Laporan muncul di **Kotak Masuk Rahasia Auditor** sebagai ciphertext. |

### 7.6. Auditor / Inspektorat — Input & Output Terhubung

| Fitur                                     | Input Pengguna                                                                 | Harapan Output di Fitur Lain                                                                                                                                                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Uji Alat Bukti (Integrity Checker)**    | Pilih ID Disbursement → Upload ulang file PDF Berita Acara                     | Sistem menghitung SHA-256 file tersebut dan mencocokkan dengan hash yang disimpan saat upload pertama.<br>→ **Cocok:** Badge hijau "Dokumen Otentik".<br>→ **Tidak Cocok:** Badge merah "Dokumen Dimodifikasi" + timestamp perubahan. |
| **Kotak Masuk Rahasia**                   | Klik laporan whistleblower → Masukkan Passphrase Kunci Privat Inspektorat      | Mendekripsi Ciphertext menjadi teks asli laporan rahasia warga di memori browser (tidak pernah dikirim ke server dalam bentuk plaintext).                                                                                             |
| **Kronologi Transaksi (Ledger Explorer)** | Pilih ID Disbursement atau rentang tanggal                                     | Timeline visual lengkap: Submitted by Operator Desa → Verified by Sekdes → Authorized/Rejected by Kades → Executed by Bendahara. Setiap tahap ada timestamp, nama user, dan hash dokumen.                                               |
| **Ekspor Laporan Hukum**                  | Centang transaksi yang relevan → Klik **[Generate PDF]** atau **[Export CSV]** | File PDF Berita Acara Pemeriksaan (BAP) atau CSV data mentah siap digunakan untuk keperluan hukum dan penyidikan.                                                                                                                     |

### 7.7. BPD & Tokoh Adat — Input & Output Terhubung

| Fitur                   | Input Pengguna                                                                 | Harapan Output di Fitur Lain                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pantauan Transaksi**  | Pilih transaksi → Klik **[Tulis Catatan Pengawasan]** → Isi teks catatan resmi | `SupervisionNote` tersimpan dan otomatis terkirim sebagai Notifikasi ke Kades & Sekdes. Tercatat di Laporan Tahunan BPD.                                |
| **Papan Resolusi Adat** | Input: Nama Pihak Bersengketa, Detail Masalah, Keputusan Resolusi Adat         | `AdatCase` dibuat untuk mengarsipkan musyawarah desa. Muncul di **Kalender Musyawarah** selama statusnya aktif. Tidak mempengaruhi saldo keuangan desa. |

---

## 8. Keterkaitan Antar Fitur

Berikut diagram alur bagaimana fitur-fitur saling terhubung:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        ALUR UTAMA PENCAIRAN                              │
│                                                                          │
│  OPERATOR DESA              SEKDES                KADES              KAUR  │
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
│                     ke Operator Desa       ──► InterventionLog       │    │
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

- Pencairan yang dibuat **Operator Desa** akan muncul di antrean **Sekdes**, lalu **Kades**, lalu **Kaur Keuangan** secara berurutan
- Setelah **Kaur Keuangan** mengeksekusi, data otomatis tercatat di 3 buku (Kas, Bank, Pajak)
- Semua pencairan yang sudah selesai langsung terlihat di **Dashboard Publik** sebagai update progres proyek
- **Panic Button** Kades menciptakan log intervensi yang muncul sebagai red-flag di dashboard **Auditor** dan **BPD**
- **Klarifikasi** mengalir dari Publik → Sekdes (jawab) → kembali ke Publik
- **Whistleblower** mengalir dari Publik → langsung ke Auditor saja (tidak bisa dibaca perangkat desa)

---

## 9. Skenario Penggunaan

### Skenario 1: Alur Normal Pencairan Dana (Happy Path)

> **Kasus:** Dusun Mekar mengusulkan pembangunan jembatan melalui Musrembang dengan pagu anggaran Rp 150.000.000. Operator Desa mengajukan pencairan termin pertama sebesar Rp 60.000.000 (40% dari pagu).

#### Langkah 1 — Operator Desa: Buat Proposal Musrembang

1. Login sebagai **Budi Santoso** (`budi.santoso.operator-desa@kohalock.desa` / `password123`)
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

#### Langkah 2 — Operator Desa: Ajukan Pencairan Termin 1

1. Buka menu **Ajukan Pencairan**
2. Pilih proposal: `Pembangunan Jembatan Dusun Mekar`
3. Sistem menampilkan sisa pagu: `Rp 150.000.000`
4. Isi formulir:
   - Termin Pencairan: `Tahap I`
   - Nominal Pengajuan: (Otomatis terisi `Rp 60.000.000`)
   - Keterangan: `Pondasi dan Tiang`
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
6. ✅ Otomatis tercatat di **Buku Kas Umum** (pengeluaran Rp 60.000.000)
7. ✅ Otomatis tercatat di **Buku Bank** (kredit Rp 60.000.000)
8. ✅ Jika ada potongan pajak, tercatat di **Buku Pajak**

#### Hasil yang Terlihat di Sisi Publik

- Buka halaman **Pantau Proyek** tanpa login
- Proyek `Pembangunan Jembatan Dusun Mekar` menampilkan progress bar 40% (Rp 60jt dari Rp 150jt)
- Klik detail → terlihat rincian Termin 1, foto dengan GPS, dan status pencairan

---

### Skenario 2: Pencairan Ditolak & Direvisi

> **Kasus:** Operator Desa mengajukan pencairan termin 2 sebesar Rp 60.000.000, tapi Sekdes menemukan foto bukti lapangan tidak sesuai lokasi (koordinat GPS di luar area proyek).

#### Langkah 0 — Persiapan Data (Jika Database Kosong)
Skenario ini mensyaratkan Anda sudah memiliki **Program/Usulan** yang terdaftar. Jika database Anda kosong, silakan login sebagai Operator Desa dan buat satu Program baru terlebih dahulu.

#### Langkah 1 — Operator Desa: Ajukan Pencairan Termin 2

1. Login sebagai **Budi Santoso**
2. Buka **Ajukan Pencairan**, pilih proposal `Pembangunan Jembatan Dusun Mekar`
3. Sisa pagu tampil: `Rp 90.000.000` (sudah terpakai Rp 60jt dari Skenario 1)
4. Isi formulir:
   - Termin Pencairan: `Tahap II`
   - Nominal Pengajuan: (Otomatis terisi `Rp 60.000.000`)
   - Keterangan: `Rangka Baja`
5. Upload berita acara dan foto (misalnya foto yang GPS-nya keliru)
6. Klik **Ajukan** → Status: **PENDING_SEKDES**

#### Langkah 2 — Sekdes: Tolak & Kembalikan untuk Revisi

1. Login sebagai **Siti Rahma**
2. Buka **Verifikasi Pengajuan**, klik item Termin 2
3. Lihat di Split-View → titik GPS di peta tidak sesuai area proyek
4. Klik **Kembalikan untuk Revisi**
5. Isi alasan: `"Koordinat GPS foto tidak sesuai dengan lokasi proyek. Mohon foto ulang di lokasi yang benar."`
6. ✅ Status berubah: **RETURNED_FOR_REVISION**

#### Langkah 3 — Operator Desa: Lihat Alasan Penolakan

1. Login kembali sebagai **Budi Santoso**
2. Buka menu **Riwayat Penolakan**
3. Terlihat entry: `[Tahap II] Rangka Baja` dengan alasan revisi dari Sekdes
4. Operator Desa bisa mengajukan ulang dengan foto yang benar melalui **Ajukan Pencairan** (pencairan baru dengan data yang diperbaiki)

#### Langkah 4 — Operator Desa: Ajukan Ulang

1. Buka **Ajukan Pencairan** lagi
2. Pilih proposal yang sama, isi data serupa tapi kali ini dengan foto yang benar dari lokasi proyek
3. Klik **Ajukan** → Status: **PENDING_SEKDES** (kembali ke Sekdes)
4. Proses selanjutnya mengikuti alur normal (Sekdes approve → Kades otorisasi → Kaur Keuangan eksekusi)

---

### Skenario 3: Panic Button & Pengawasan Forensik

> **Kasus:** Kades menemukan pencairan termin 3 senilai Rp 40.000.000 yang sudah diverifikasi Sekdes, tapi mencurigai adanya mark-up harga yang signifikan. Kades menekan Panic Button. Auditor kemudian melakukan investigasi, dan warga juga mengirim laporan rahasia.

#### Langkah 0 — Persiapan Data (Wajib Dibaca)
Skenario ini mensyaratkan ada pencairan yang berstatus **`PENDING_KADES`**. Jika database kosong:
1. Login sebagai **Operator Desa**, buat program baru (contoh: Pagu Rp 200.000.000) lalu buka detail program dan Ajukan Pencairan (Pilih `Tahap III` yang otomatis bernilai 20% yaitu Rp 40.000.000).
2. Login sebagai **Sekdes**, verifikasi pengajuan tersebut agar statusnya naik ke Kades.

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
   - Upload ulang file berita acara PDF yang diperoleh dari pihak Operator Desa
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

### Skenario 4: Tolak Intervensi Non-Prosedural & Sertifikat Penolakan (Kades)

> **Kasus:** Kades mendapat tekanan dari pihak tertentu untuk segera menyetujui pencairan yang mencurigakan. Kades memanfaatkan fitur "Tolak Intervensi Non-Prosedural" langsung dari halaman detail pengajuan untuk membekukan transaksi dan menerbitkan sertifikat resmi penolakan.

#### Langkah 0 — Persiapan Data (Wajib Dibaca)
Karena fitur ini bekerja pada pengajuan yang **menunggu persetujuan Kades**, Anda harus membuat data dari awal jika database masih kosong.

**A. Login sebagai Operator Desa — Buat Program**
1. Login: `budi.santoso.operator-desa@kohalock.desa` / `password123`
2. Buka menu **Program Saya** → klik **[+ Buat Program Baru]**
3. Isi form **Musrembang**:
   - Dusun: `Dusun Timur`
   - Judul Usulan: `Pengadaan Pipa HDPE Jaringan Air Bersih`
   - Kategori: `Infrastruktur`
   - Volume: `500`, Satuan: `Meter`
   - Pagu Maksimal: `75000000`
   - Upload **Formulir Musrembang** (PDF apa saja), Upload **RAB** (PDF apa saja)
4. Klik **[Daftarkan ke Blockchain]**, masukkan PIN: `123456` → tunggu konfirmasi
5. ✅ Program tersimpan dan muncul di daftar program Anda

**B. Login sebagai Operator Desa — Ajukan Pencairan**
1. Masih login sebagai Budi Santoso
2. Buka detail program **Pengadaan Pipa HDPE** yang baru dibuat
3. Klik tombol **[Ajukan Pencairan Termin]**
4. Isi form:
   - Termin Pencairan: `Tahap I`
   - Nominal Pengajuan: (Otomatis terisi `Rp 30.000.000`)
   - Keterangan: `Pembelian Material Pipa`
   - Upload **Berita Acara** (PDF apa saja)
   - Upload **Foto Lapangan** (foto/gambar apa saja)
   - Geotag: biarkan sistem mengambil lokasi, atau masukkan koordinat manual
5. Masukkan PIN: `123456` → klik **[Ajukan]**
6. ✅ Status pencairan: **PENDING_SEKDES**
7. Logout

**C. Login sebagai Sekdes — Verifikasi & Teruskan ke Kades**
1. Login: `siti.rahma.sekdes@kohalock.desa` / `password123`
2. Buka menu **Verifikasi Pengajuan** — terlihat 1 pengajuan baru
3. Klik item **[Tahap I] Pembelian Material Pipa**
4. Review detail di halaman, pastikan semua dokumen terlihat
5. Klik tombol **[Setujui & Teruskan ke Kades]**, masukkan PIN: `123456`
6. ✅ Status berubah: **PENDING_KADES**
7. Logout. Data siap untuk Skenario 4.

#### Langkah 1 — Kades: Buka Halaman Detail Pengajuan yang Mencurigakan

1. Login sebagai **Ahmad Fauzi** (`ahmad.fauzi.kades@kohalock.desa` / `password123`)
2. Buka menu **Persetujuan Pencairan** — muncul pencairan yang statusnya `PENDING_KADES`
3. Klik item tersebut → buka `DisbursementDetailPage`
4. Lihat detail: nominal mencurigakan, dokumen yang tidak konsisten

#### Langkah 2 — Kades: Aktifkan Panic Button di Halaman Detail

1. Di bawah tombol **[Otorisasi Pencairan]**, tersedia tombol merah **[Tolak Intervensi Non-Prosedural]**
   - _(Tombol ini hanya muncul jika status masih `PENDING_KADES`)_
2. Klik tombol tersebut → muncul **Modal Konfirmasi Peringatan Kritis**:
   > _"Anda akan mengunci pos dana ini sementara. Tindakan ini akan dicatat permanen."_
3. Isi textarea alasan: `"Terdapat dugaan nominal tidak sesuai RAB. Dana dikunci sementara untuk investigasi."`
4. Klik **[Ya, Kunci Transaksi Ini]**

#### Langkah 3 — Sistem: Hasil Otomatis

- ✅ Status transaksi berubah menjadi **REJECTED_SYSTEM** (Terkunci)
- ✅ `InterventionLog` dibuat dan dicatat on-chain dengan timestamp & alasan
- ✅ Badge status di halaman berubah menjadi _"Intervensi Ditolak (Locked)"_
- ✅ Tombol **[Unduh Sertifikat Penolakan]** muncul langsung di halaman detail ini
- ✅ Red-flag di **Dashboard Auditor** dan **Dashboard BPD** bertambah +1

#### Langkah 4 — Kades: Unduh Sertifikat

1. Klik **[Unduh Sertifikat Penolakan]** — mengambil PDF dari `GET /interventions/:id/certificate`
2. ✅ Sertifikat PDF berisi: ID transaksi, nominal, alasan penolakan, timestamp, dan tanda tangan digital Kades
3. Sertifikat ini adalah bukti formal bahwa penolakan dilakukan secara prosedural dan tercatat

#### Langkah 5 — Kades: Cek Riwayat di Perisai Integritas

1. Buka menu **Perisai Integritas** (IntegrityShieldPage)
2. ✅ Semua riwayat penolakan intervensi tampil di sini sebagai log lengkap
3. Sertifikat bisa diunduh ulang dari sini kapan saja

---

### Skenario 5: Penutupan Buku Bulanan & Koreksi Jurnal

> **Kasus:** Di akhir bulan, Kaur Keuangan menutup buku bulan Juli. Setelah dikunci, ditemukan kesalahan nominal pada satu entri — Kaur Keuangan melakukan koreksi melalui jurnal pembalik tanpa merusak audit trail.

#### Langkah 0 — Persiapan Data (Wajib Dibaca)
Skenario ini membutuhkan **minimal 1 pencairan yang sudah dieksekusi** (status `DISBURSED`) agar ada entri di Buku Kas Umum. Ikuti seluruh alur berikut jika database Anda kosong.

**A. Operator Desa — Buat Program & Ajukan Pencairan**
1. Login: `budi.santoso.operator-desa@kohalock.desa` / `password123`
2. Buat program baru dengan data:
   - Dusun: `Dusun Selatan`, Judul: `Pengaspalan Jalan Lingkar RT 03`
   - Kategori: `Infrastruktur`, Volume: `200`, Satuan: `M2`
   - Pagu Maksimal: `100000000`
   - Upload formulir & RAB (PDF apa saja)
3. Daftarkan ke blockchain, PIN: `123456`
4. Buka detail program, klik **[Ajukan Pencairan Termin]**:
   - Termin Pencairan: `Tahap I`
   - Nominal Pengajuan: (Otomatis terisi `Rp 40.000.000`)
   - Keterangan: `Pembelian Aspal`
   - Upload berita acara & foto (file apa saja)
5. Masukkan PIN `123456`, klik **[Ajukan]**
6. Logout

**B. Sekdes — Verifikasi**
1. Login: `siti.rahma.sekdes@kohalock.desa` / `password123`
2. Buka **Verifikasi Pengajuan**, klik item Termin 1
3. Klik **[Setujui & Teruskan ke Kades]**, PIN: `123456`
4. Logout

**C. Kades — Otorisasi**
1. Login: `ahmad.fauzi.kades@kohalock.desa` / `password123`
2. Buka **Persetujuan Pencairan**, klik item Termin 1
3. Klik **[Otorisasi Pencairan]**, masukkan PIN: `123456`
4. Logout

**D. Kaur Keuangan — Eksekusi (Cairkan Dana)**
1. Login: `hastuti.kaur-keuangan@kohalock.desa` / `password123`
2. Buka menu **Antrean Eksekusi**, klik item Termin 1
3. Klik **[Eksekusi Pencairan]**, masukkan PIN: `123456`
4. ✅ Status: **DISBURSED** — entri `Rp 40.000.000` otomatis muncul di Buku Kas bulan berjalan
5. Tetap login sebagai Hastuti untuk melanjutkan ke Langkah 1 di bawah

#### Langkah 1 — Kaur Keuangan: Verifikasi Sebelum Menutup Buku

1. Login sebagai **Hastuti** (`hastuti.kaur-keuangan@kohalock.desa` / `password123`)
2. Buka menu **Penutupan Buku Bulanan**
3. Pilih Bulan: `Juli`, Tahun: `2025`
4. Sistem menampilkan checklist:
   - Total Penerimaan: ✅
   - Total Pengeluaran: ✅
   - Saldo Akhir seimbang: ✅
5. Semua hijau → klik **[Kunci Buku Bulan Ini]** + Masukkan PIN Bendahara

#### Langkah 2 — Sistem: Hasil Penutupan Buku

- ✅ `MonthlyClosing` dibuat dengan **SHA-256 Hash Lock** dari semua transaksi bulan Juli
- ✅ Semua entri bulan Juli dikunci (`statusTerkunci = true`)
- ✅ Sistem memblokir eksekusi pencairan baru yang mencoba menggunakan tanggal bulan Juli
- ✅ Badge bulan Juli di Buku Kas berubah menjadi **"Terkunci"** (dengan ikon gembok)

#### Langkah 3 — Kaur Keuangan: Temukan Kesalahan Entri

1. Buka **Buku Kas Umum** → filter bulan Juli
2. Temukan entri: `[Tahap I] Pembelian Aspal` tercatat `Rp 40.000.000`
3. Seharusnya `Rp 4.000.000` (kesalahan input satu nol lebih)
4. Karena sudah terkunci, tidak bisa diedit langsung

#### Langkah 4 — Kaur Keuangan: Buat Transaksi Koreksi

1. Buka menu **Transaksi Koreksi**
2. Pilih entri yang salah: `Eksekusi Pencairan [Tahap I] Pembelian Aspal / Rp 40.000.000`
3. Isi form koreksi:
   - Jenis: `Jurnal Pembalik (Kredit)`
   - Nominal Koreksi: `36000000` _(selisih Rp 40jt - Rp 4jt)_
   - Uraian: `"Koreksi kesalahan input Termin 1. Nominal seharusnya Rp 4.000.000 bukan Rp 40.000.000."`
4. Klik **[Simpan Koreksi]**

#### Langkah 5 — Sistem: Hasil Transaksi Koreksi

- ✅ Entri asli `Rp 40.000.000` **tidak dihapus** — tetap ada untuk audit trail
- ✅ Entri baru Jurnal Pembalik `Rp 36.000.000 (Kredit)` ditambahkan di bawahnya
- ✅ Saldo bersih Buku Kas terhitung ulang: `Rp 40.000.000 - Rp 36.000.000 = Rp 4.000.000` ✓
- ✅ Laporan Realisasi otomatis menggunakan saldo koreksi terbaru

---

### Skenario 6: Mencatat Pendapatan Desa & Dampaknya ke BKU

> **Kasus:** Di awal bulan Agustus, desa menerima dua sumber penerimaan: pencairan Dana Desa Tahap 2 dari pemerintah pusat sebesar Rp 350.000.000 (Transfer), dan setoran hasil BUMDes Maju Bersama sebesar Rp 18.500.000 (PADes). Kaur Keuangan perlu mencatat keduanya agar saldo BKU terupdate sebelum proses eksekusi pencairan berjalan.

#### Langkah 0 — Catatan
Skenario ini **tidak memerlukan data sebelumnya** — Kaur Keuangan bisa langsung mencatat pendapatan kapan saja. Skenario ini berdiri sendiri.

#### Langkah 1 — Kaur Keuangan: Catat Dana Desa Tahap 2 (Transfer)

1. Login sebagai **Hastuti** (`hastuti.kaur-keuangan@kohalock.desa` / `password123`)
2. Buka menu **Pendapatan Desa**
3. Lihat MetricCard: Total Transfer, Total PADes, Pendapatan Lain-lain (masih 0 atau data bulan lalu)
4. Klik tombol **[+ Catat Pendapatan]** — muncul modal form
5. Isi form:
   - Kelompok: `Transfer`
   - Jenis: `Dana Desa (DD)` _(dropdown cascading, muncul setelah kelompok dipilih)_
   - Tanggal: `2025-08-05`
   - Nominal: `350000000`
   - Uraian: `Pencairan Dana Desa APBN Tahap 2 TA 2025`
   - Referensi/Sumber: `SP2D Pusat No. 12345/DD/2025`
6. Klik **[Simpan Pendapatan]**
7. ✅ Toast sukses muncul: _"Pendapatan berhasil dicatat!"_
8. ✅ Tabel riwayat di bawah langsung refresh — muncul 1 entri baru
9. ✅ MetricCard **"Total Transfer"** langsung update: `Rp 350.000.000`

#### Langkah 2 — Kaur Keuangan: Catat Hasil BUMDes (PADes)

1. Masih di halaman **Pendapatan Desa**
2. Klik **[+ Catat Pendapatan]** lagi
3. Isi form:
   - Kelompok: `PADes`
   - Jenis: `Hasil BUMDes`
   - Tanggal: `2025-08-07`
   - Nominal: `18500000`
   - Uraian: `Setoran laba BUMDes Maju Bersama Triwulan II`
   - Referensi/Sumber: `Direktur BUMDes`
4. Klik **[Simpan Pendapatan]**
5. ✅ MetricCard **"Total PADes"** update: `Rp 18.500.000`
6. ✅ **Donut Chart** komposisi pendapatan terbaru tergambar ulang

#### Langkah 3 — Verifikasi di Buku Kas Umum

1. Buka menu **Buku Kas Umum**
2. Filter bulan: `Agustus 2025`
3. ✅ Terlihat **2 entri penerimaan baru** dengan prefix `"Pendapatan: ..."` yang dihasilkan otomatis:
   - `Pendapatan: Pencairan Dana Desa APBN Tahap 2 TA 2025` → Penerimaan Rp 350.000.000
   - `Pendapatan: Setoran laba BUMDes Maju Bersama Triwulan II` → Penerimaan Rp 18.500.000
4. ✅ Saldo berjalan telah terakumulasi dari kedua penerimaan tersebut, siap digunakan untuk eksekusi pencairan

#### Langkah 4 — Verifikasi Proteksi Closing

1. Misalkan Kaur Keuangan mencoba mencatat pendapatan dengan tanggal `2025-07-15` (bulan Juli yang sudah di-closing)
2. Isi form, klik **[Simpan Pendapatan]**
3. ✅ API menolak dengan pesan: _"Periode ini sudah ditutup, gunakan Transaksi Koreksi"_
4. ✅ Toast error merah muncul — data tidak tersimpan, BKU terlindungi

#### Langkah 5 — Filter & Pencarian

1. Di halaman **Pendapatan Desa**, gunakan dropdown filter:
   - Filter Kelompok: `Transfer` → tabel hanya menampilkan entri Transfer
   - Filter Jenis: `Dana Desa (DD)` → tersedia setelah kelompok dipilih
   - Ketik di search bar: `BUMDes` → tabel langsung memfilter ke entri BUMDes
2. ✅ Semua filter bekerja secara _cascading_ dan real-time tanpa reload halaman

---

### Skenario 7: Pelaporan LPJ Berjenjang & Berlapis

> **Kasus:** Setelah pencairan dieksekusi, dana desa harus dilaporkan pertanggungjawabannya. KOHALOCK menggunakan konsep LPJ 3 Lapis: LPJ Teknis (per pencairan), LPJ Keuangan (per program), dan LPJ Desa (per semester/tahun).

#### Langkah 0 — Persiapan Data (Wajib Dibaca)
LPJ Teknis hanya bisa diisi pada pencairan berstatus **`DISBURSED`**. Selesaikan **Skenario 1** (atau Skenario 5 Langkah 0) terlebih dahulu hingga Kaur Keuangan mengeksekusi dana. Setelah ada data DISBURSED, lanjutkan ke bawah.

Jika ingin membuat data fresh untuk skenario ini, ikuti langkah berikut:

**A. Operator Desa — Buat Program**
1. Login: `budi.santoso.operator-desa@kohalock.desa` / `password123`
2. Buat program:
   - Dusun: `Dusun Barat`, Judul: `Pembangunan Tembok Penahan Tanah`
   - Kategori: `Infrastruktur`, Volume: `50`, Satuan: `M3`, Pagu: `100000000`
3. Daftarkan ke blockchain, PIN: `123456`
4. Buka detail program, klik **[Ajukan Pencairan Termin]**:
   - Termin Pencairan: `Tahap I`
   - Nominal Pengajuan: (Otomatis terisi `Rp 40.000.000`)
   - Keterangan: `Pekerjaan Pondasi`
   - Upload berita acara & foto (file apa saja), PIN: `123456`
5. Logout

**B. Sekdes — Verifikasi → C. Kades — Otorisasi → D. Kaur Keuangan — Eksekusi**
_(Ikuti langkah B, C, D yang sama persis seperti di Skenario 5 Langkah 0 di atas)_

Setelah eksekusi berhasil, lanjutkan ke Langkah 1 skenario ini sebagai Operator Desa.

#### Langkah 1 — Operator Desa: Melaporkan LPJ Teknis (Rincian Belanja)

1. Login sebagai **Budi Santoso** (`budi.santoso.operator-desa@kohalock.desa` / `password123`)
2. Buka menu **Formulir LPJ Teknis**
3. Pilih transaksi pencairan yang sudah berstatus `DISBURSED` (sudah dieksekusi).
4. Isi tabel rincian belanja aktual. Berikut contoh data yang bisa Anda gunakan (pastikan totalnya mencapai Rp 40.000.000 sesuai pencairan Termin 1):
   - **Barang/Jasa**: `Batu Kali` | **Volume**: `50` | **Satuan**: `Truk` | **Harga Satuan**: `200000`
   - **Barang/Jasa**: `Semen Portland` | **Volume**: `100` | **Satuan**: `Sak` | **Harga Satuan**: `75000`
   - **Barang/Jasa**: `Besi Beton 12mm` | **Volume**: `100` | **Satuan**: `Batang` | **Harga Satuan**: `80000`
   - **Barang/Jasa**: `Pasir Pasang` | **Volume**: `20` | **Satuan**: `Truk` | **Harga Satuan**: `250000`
   - **Barang/Jasa**: `Upah Tukang (HOK)` | **Volume**: `20` | **Satuan**: `Hari` | **Harga Satuan**: `150000`
   - **Barang/Jasa**: `Upah Pekerja (HOK)` | **Volume**: `50` | **Satuan**: `Hari` | **Harga Satuan**: `130000`
5. Di bagian atas halaman, klik **[Template LPJ (Word)]** untuk mengunduh *template* kosong, dan klik **[Export ke Excel (CSV)]** untuk mengunduh rincian tabel Anda.
6. Buka kedua *file* tersebut, *copy-paste* rincian belanja dari Excel ke dalam tabel di dokumen Word, sesuaikan formatnya jika perlu, lalu **simpan/export dokumen Word tersebut menjadi PDF**.
7. Pada bagian bawah halaman web, unggah *file* PDF tadi ke bagian **Upload Dokumen LPJ Fisik (PDF) - Wajib untuk Audit**.
8. Klik tombol **Kunci ke Blockchain**, lalu masukkan PIN Smart Contract: `123456`.
9. ✅ Data rincian beserta hash PDF akan disimpan permanen ke Blockchain. Status LPJ transaksi menjadi `LOCKED_ONCHAIN`.

#### Langkah 2 — Kaur Keuangan: Mengunci LPJ Keuangan Program

1. Login sebagai **Hastuti** (`hastuti.kaur-keuangan@kohalock.desa` / `password123`)
2. Buka menu **Laporan LPJ Keuangan**
3. Sistem akan menampilkan daftar program/kegiatan yang sedang berjalan atau sudah selesai.
4. Pilih program yang seluruh termin pencairannya sudah di-LPJ-kan.
5. Upload rekapitulasi pembukuan program (PDF).
6. Masukkan PIN Smart Contract.
7. ✅ Dokumen terkunci on-chain. Progress bar program di halaman publik akan menampilkan ikon *Verified/Locked*.
8. Untuk melihat hasilnya, buka menu **Dashboard Publik → Pantau Proyek → Detail Proyek**. Pada bagian "Transparansi Dana", dokumen LPJ Keuangan Final kini telah tampil secara publik dan diverifikasi oleh sistem blockchain.

#### Langkah 3 — Kades: Mengesahkan Laporan Realisasi Desa (LPJ Desa)

Sebelum pengesahan, dokumen LPJ Desa biasanya disiapkan melalui proses berikut:
1. Melalui menu **Laporan Keuangan Desa (APBDes)**, klik tombol **[Template (Word)]** untuk mengunduh *template* kosong, dan **[Export ke Excel]** untuk mengunduh rekapitulasi angka APBDes yang digenerate otomatis oleh sistem.
2. *Copy-paste* data APBDes dari Excel ke dalam tabel di dokumen Word, sesuaikan formatnya, lalu cetak dan simpan sebagai **PDF**. Dokumen PDF inilah yang menjadi LPPD/LPJ Desa final.

Setelah dokumen siap, Kades melakukan pengesahan secara *on-chain*:
1. Login sebagai **Ahmad Fauzi** (`ahmad.fauzi.kades@kohalock.desa` / `password123`)
2. Buka menu **Laporan Realisasi Desa**
3. Pilih `Tahun Anggaran` dan `Semester`.
4. Upload dokumen Laporan Penyelenggaraan Pemerintahan Desa (LPPD/LPJ Desa) berformat PDF tadi.
5. Masukkan PIN Smart Contract.
6. ✅ Laporan tingkat desa ini secara resmi dipublikasikan dan terkunci di Blockchain, siap untuk diaudit oleh Inspektorat atau dipantau masyarakat umum.

---

### Skenario 8: Alat Uji Integritas Dokumen (Auditor Forensik)

> **Kasus:** Auditor dari Inspektorat menerima flashdisk berisi file PDF Berita Acara dan LPJ dari perangkat desa. Auditor ingin memastikan bahwa file tersebut benar-benar asli (otentik) dan tidak diedit atau dimanipulasi setelah dana cair.

#### Langkah 0 — Persiapan Data
Untuk menguji fitur ini, Anda membutuhkan sebuah **file PDF Berita Acara yang pernah di-upload ke sistem** (dari proses pengajuan pencairan sebelumnya).

1. Jika belum ada data: selesaikan alur Skenario 1 (buat pengajuan dan upload Berita Acara).
2. Setelah ada pencairan, buka halaman detail pencairan tersebut — di sana ada link **[Lihat Berita Acara]**. Klik dan simpan file PDF tersebut ke komputer Anda (ini mensimulasikan "file dari flashdisk").
3. File yang sama akan dipakai di Langkah 2 untuk diuji keasliannya.

**Untuk menguji kasus PALSU:** Edit dulu file PDF tersebut dengan aplikasi apa saja (misal: buka di browser → print to PDF lagi), lalu upload. Karena byte-nya berubah, hash-nya juga akan berbeda dan sistem akan mendeteksinya sebagai **manipulasi**.

#### Langkah 1 — Auditor: Akses Alat Uji Bukti Digital

1. Login sebagai **Inspektur Wilayah** (`inspektur.auditor@kohalock.desa` / `password123`)
2. Buka menu **Alat Uji Bukti Digital** (Integrity Checker).

#### Langkah 2 — Auditor: Uji File PDF Luring (Offline File)

1. Pilih metode pencarian: **Cari berdasarkan ID Transaksi** atau **Cari berdasarkan Hash**.
2. Masukkan ID transaksi (atau biarkan kosong jika ingin mencocokkan hash secara global).
3. Seret dan lepas (drag & drop) file PDF dari flashdisk ke dalam area upload.
4. Sistem akan melakukan hashing SHA-256 secara lokal di browser Auditor (file tidak dikirim ke server).
5. Sistem akan mencocokkan hash lokal tersebut dengan *Golden Hash* yang tersimpan di dalam Smart Contract (Blockchain).

#### Langkah 3 — Hasil Analisis Keaslian

- **Jika File ASLI (Otentik):** Sistem akan menampilkan banner hijau dengan pesan **"Dokumen Valid & Otentik"**, menunjukkan bahwa byte per byte file tersebut sama persis dengan saat diunggah pertama kali.
- **Jika File PALSU/DIUBAH:** Sistem akan menampilkan peringatan merah **"Palsu/Dimanipulasi"**. Ini membuktikan bahwa file di flashdisk sudah diedit (misal: angka diedit dengan Photoshop), karena hash-nya berbeda dengan yang ada di Blockchain.

---

## Akun Demo

Semua akun demo menggunakan password: **`password123`**

| Role          | Email                                    | Nama              |
| ------------- | ---------------------------------------- | ----------------- |
| Operator Desa   | `budi.santoso.operator-desa@kohalock.desa` | Budi Santoso      |
| Sekdes        | `siti.rahma.sekdes@kohalock.desa`        | Siti Rahma        |
| Kades         | `ahmad.fauzi.kades@kohalock.desa`        | Ahmad Fauzi       |
| Publik        | `warga.publik@kohalock.desa`             | Warga Publik      |
| Auditor       | `inspektur.auditor@kohalock.desa`        | Inspektur Wilayah |
| BPD & Adat    | `ketua.bpd-adat@kohalock.desa`           | Ketua BPD         |
| Kaur Keuangan | `hastuti.kaur-keuangan@kohalock.desa`    | Hastuti           |

---
