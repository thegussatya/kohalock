# Snapshot Backend State (KohaLock)
*Dokumen ini merupakan snapshot kondisi aktual dari kode backend saat ini, bukan rencana.*

## 1. Schema Database (Prisma)
Lokasi: `apps/api/prisma/schema.prisma`

Berikut adalah daftar model, *field*, dan relasinya:

*   **`User`**: Data pengguna.
    *   *Fields*: `id`, `nama`, `role`, `email`, `passwordHash`, `jabatan`, `createdAt`.
    *   *Relasi*: `proposals`, `sekdesVerifications`, `kadesApprovals`, `kadesInterventions`, `clarificationAnswers`, `adatCases`, `supervisionNotes`, `auditorTokens`, `monthlyClosings`, `corrections`.
*   **`Proposal`**: Data program hasil Musrembang.
    *   *Fields*: `id`, `onChainId`, `dusun`, `judulUsulan`, `kategori`, `volume`, `satuan`, `paguMaksimal`, `dokumenHash`, `fileUrls`, `kaurTeknisId`, `createdAt`.
    *   *Relasi*: `kaurTeknis` (User), `disbursements`.
*   **`Disbursement`**: Data pengajuan pencairan dana.
    *   *Fields*: `id`, `onChainId`, `proposalId`, `keterangan`, `nominal`, `beritaAcaraUrl`, `beritaAcaraHash`, `fotoUrl`, `geotagLat`, `geotagLng`, `geotagTimestamp`, `status`, `catatanRevisi`, `sekdesVerifierId`, `kadesApproverId`, `submittedAt`, `verifiedAt`, `authorizedAt`, `disbursedAt`.
    *   *Relasi*: `proposal`, `sekdesVerifier` (User), `kadesApprover` (User), `rejectionLogs`, `interventionLogs`, `supervisionNotes`.
*   **`RejectionLog`**: Log penolakan.
    *   *Fields*: `id`, `disbursementId`, `jenisPenolakan`, `pesanError`, `sudahDiperbaiki`, `createdAt`.
*   **`InterventionLog`**: Log intervensi Kades.
    *   *Fields*: `id`, `disbursementId`, `kadesId`, `txHash`, `createdAt`.
*   **`ClarificationTicket`**: Tiket klarifikasi publik.
    *   *Fields*: `id`, `namaWarga`, `programId`, `pertanyaan`, `status`, `jawaban`, `dijawabOlehId`, `createdAt`, `answeredAt`.
*   **`WhistleblowerReport`**: Laporan whistleblower publik.
    *   *Fields*: `id`, `ticketCode`, `encryptedPayload`, `attachmentUrls`, `status`, `createdAt`.
*   **`AdatCase`**: Kasus hukum adat/resolusi konflik.
    *   *Fields*: `id`, `pihakTerlibat`, `kategori`, `status`, `keputusanResolusi`, `dicatatOlehId`, `createdAt`.
*   **`SupervisionNote`**: Catatan pengawasan BPD.
    *   *Fields*: `id`, `disbursementId`, `bpdUserId`, `catatan`, `createdAt`.
*   **`AuditorAccessToken`**: Token akses untuk auditor eksternal.
    *   *Fields*: `id`, `auditorId`, `expiresAt`, `revoked`, `createdAt`.
*   **`CashBookEntry`**: Entri Buku Kas Umum (BKU).
    *   *Fields*: `id`, `tanggal`, `uraian`, `penerimaan`, `pengeluaran`, `saldoBerjalan`, `bulan`, `tahun`, `statusTerkunci`.
*   **`BankBookEntry`**: Entri Buku Bank.
    *   *Fields*: `id`, `tanggal`, `keterangan`, `debit`, `kredit`, `saldo`, `bulan`, `tahun`.
*   **`TaxBookEntry`**: Entri Buku Pajak.
    *   *Fields*: `id`, `tanggal`, `jenisPajak`, `nominal`, `statusSetor`, `bulan`, `tahun`, `disbursementId`.
*   **`MonthlyClosing`**: Penutupan buku bulanan.
    *   *Fields*: `id`, `bulan`, `tahun`, `hashKunci`, `ditutupOlehId`, `ditutupPada`.
*   **`CorrectionTransaction`**: Transaksi koreksi/pembetulan BKU.
    *   *Fields*: `id`, `transaksiAsalId`, `alasan`, `nilaiKoreksi`, `dibuatOlehId`, `createdAt`.

## 2. Endpoint API
Lokasi: `apps/api/routes/`

| Endpoint | Method | Protected | Ringkasan Fungsi |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | Tidak | Melakukan autentikasi menggunakan email dan password, lalu mengembalikan token JWT. |
| `/api/proposals/` | POST | Ya | Membuat proposal / usulan program baru dari Kaur Teknis. |
| `/api/proposals/` | GET | Ya | Mengambil daftar semua proposal (termasuk relasi pembuatnya). |
| `/api/disbursements/sisa-pagu/:proposalId` | GET | Ya | Mengambil sisa pagu anggaran dari suatu proposal (paguMaksimal dikurangi total pencairan yang valid). |
| `/api/disbursements/` | POST | Ya | Membuat pengajuan pencairan (disbursement) baru dengan status awal `PENDING_SEKDES`. |
| `/api/disbursements/` | GET | Ya | Mengambil daftar pengajuan, mendukung *query parameter* `?status=` untuk memfilter berdasarkan status. |
| `/api/disbursements/execution-queue` | GET | Ya | Mengambil khusus pengajuan dengan status `PENDING_EKSEKUSI` (untuk Kaur Keuangan). |
| `/api/disbursements/:id` | GET | Ya | Mengambil detail spesifik pengajuan pencairan. |
| `/api/disbursements/:id/verify` | POST | Ya | (Sekdes) Memverifikasi pengajuan. Mengubah status ke `PENDING_KADES` dan set `verifiedAt`. |
| `/api/disbursements/:id/return-revision` | POST | Ya | (Sekdes/Kades) Menolak dengan catatan revisi, mengubah status ke `RETURNED_FOR_REVISION`. |
| `/api/disbursements/:id/authorize` | POST | Ya | (Kades) Mengotorisasi pencairan. Mengubah status ke `PENDING_EKSEKUSI` dan set `authorizedAt`. |
| `/api/disbursements/:id/execute` | POST | Ya | (Kaur Keuangan) Mengeksekusi pencairan. Mengubah status ke `DISBURSED`, set `disbursedAt`, dan otomatis mencatat ke `CashBookEntry`, `BankBookEntry`, dan `TaxBookEntry` (jika ada potongan pajak yang dilampirkan). |
| `/api/cash-book/` | GET | Ya | Mengambil seluruh entri Buku Kas Umum, mendukung filter query `?bulan=` dan `?tahun=`. |
| `/api/bank-book/` | GET | Ya | Mengambil seluruh entri Buku Bank. |
| `/api/tax-book/` | GET | Ya | Mengambil seluruh entri Buku Pajak. |
| `/api/tax-book/:id/setor` | POST | Ya | (Kaur Keuangan) Mengubah status setor pajak menjadi `SUDAH_SETOR`. |
| `/api/corrections/` | GET | Ya | (Kaur Keuangan) Mengambil riwayat catatan jurnal pembalik (koreksi transaksi). |
| `/api/corrections/` | POST | Ya | (Kaur Keuangan) Membuat transaksi koreksi (jurnal pembalik) untuk entri buku kas yang sudah ditutup/terkunci. |
| `/api/reports/realization` | GET | Ya | (Kaur Keuangan) Mengambil agregasi Laporan Realisasi & LPJ (pagu, realisasi, sisa, breakdown dusun/kategori, rekap pajak). |
| `/api/monthly-closing/archive` | GET | Ya | (Kaur Keuangan) Mengambil arsip seluruh ledger yang telah dikunci beserta validasi ulang integritas SHA-256 hash-nya secara real-time. |
| `/api/monthly-closing/status` | GET | Ya | Cek status penutupan bulan dan validasi rekonsiliasi. |
| `/api/monthly-closing/close` | POST | Ya | Mengunci buku bulanan secara permanen dengan PIN dan meng-generate SHA-256 hash kriptografis asli dari rekam jejak ledger. |
| `/api/monthly-closing/:id/verify` | GET | Ya | Memverifikasi kecocokan hash kriptografis dari ledger bulanan yang tersimpan dengan data historis. |
| `/api/ledger/timeline` | GET | Ya | Mengambil daftar pencairan untuk ditampilkan di eksplorer. Mendukung filter pencarian (`?search=`) berbasis judul usulan. |
| `/api/ledger/timeline/:id` | GET | Ya | Mengambil detail 1 pencairan yang dipetakan sebagai rentetan tahapan timeline berdasarkan timestamp. |
| `/api/dashboard/*` | GET | Ya | Endpoint agregasi metrik spesifik untuk 5 role (Kaur Teknis, Sekdes, Kades, Auditor, BPD). |
| `/api/public/summary` | GET | Tidak | Endpoint agregasi metrik ringkasan dana, realisasi, dan jumlah proyek untuk dashboard publik. |
| `/api/public/projects` | GET | Tidak | Mengambil daftar seluruh proyek dengan filter judul (`?search=`), dusun (`?dusun=`), dan status (`?status=`). |
| `/api/public/projects/:id` | GET | Tidak | Mengambil detail publik 1 proyek lengkap dengan informasi termin pencairan dan galeri geotagging. |
| `/api/public/clarifications` | POST/GET | Tidak | Mengirim pertanyaan publik (POST) dan mengambil seluruh daftar tiket diskusi terbuka (GET). |
| `/api/public/whistleblower` | POST | Tidak | Menerima payload whistleblower (encrypted-only) dari masyarakat tanpa logging backend. |
| `/api/public/whistleblower/:ticketCode/status` | GET | Tidak | Cek status tiket laporan whistleblower tanpa mengembalikan payload enkripsi aslinya. |

## 3. Middleware Autentikasi
Lokasi: `apps/api/middleware/auth.middleware.ts`
*   **Mekanisme**: Menggunakan **JSON Web Token (JWT)**.
*   **Proses Verifikasi**: Middleware `authenticate` mengambil token dari header `Authorization` (format: `Bearer <token>`). Token diverifikasi menggunakan `jsonwebtoken` dengan kunci rahasia (`JWT_SECRET`). Payload token (yang berisi `userId`, `role`, dan `nama`) disematkan ke dalam *object* request (`req.user`). Apabila token tidak valid, kadaluwarsa, atau tidak ada, request akan ditolak dengan status HTTP 401 Unauthorized.

## 4. Konfigurasi Server & Route
Lokasi: `apps/api/server.ts`

Rute (*route*) didaftarkan pada Express *app* dengan urutan berikut:
1.  `cors()` dan `express.json()` (Global Middleware)
2.  `app.use('/api/auth', authRouter)`
3.  `app.use('/api/proposals', proposalRouter)`
4.  `app.use('/api/disbursements', disbursementRouter)`
5.  `app.use('/api/cash-book', cashBookRouter)`
6.  `app.use('/api/bank-book', bankBookRouter)`
7.  `app.use('/api/ledger', ledgerRouter)`
8.  `app.use('/api/monthly-closing', monthlyClosingRouter)`
9.  `app.use('/api/tax-book', taxBookRouter)`
10. `app.get('/health', ...)` (Health check inline route)

## 5. Alur Inti yang Sudah Terhubung End-to-End
Sistem tata kelola desa KohaLock saat ini telah memfasilitasi alur transaksi dari hulu ke hilir:

1.  **Musrembang**: Kaur Teknis membuat program kerja / proposal baru di `/api/proposals`.
2.  **Ajukan Pencairan**: Kaur Teknis mengajukan dana untuk proposal tersebut di `/api/disbursements`. Status: **`PENDING_SEKDES`** (mencatat `submittedAt`).
3.  **Verifikasi Sekdes**: Sekdes mereviu dan menyetujui. Status transisi: **`PENDING_KADES`** (mencatat id sekdes dan `verifiedAt`).
4.  **Otorisasi Kades**: Kepala Desa meninjau kembali dan memberikan persetujuan final. Status transisi: **`PENDING_EKSEKUSI`** (mencatat id kades dan *field* `authorizedAt` yang baru ditambahkan untuk mengakomodasi timeline yang lebih akurat).
5.  **Eksekusi Kaur Keuangan**: Bendahara mencairkan dana. Status transisi: **`DISBURSED`** (mencatat `disbursedAt`).
6.  **Buku Kas Umum (BKU)**: Pada proses eksekusi di langkah ke-5, API secara transaksional juga membuat catatan pengeluaran baru di tabel `CashBookEntry` dengan mengurangi saldo berjalan secara otomatis.

## 6. Yang Sudah Tersambung ke Backend
Halaman-halaman frontend yang **SUDAH** diintegrasikan untuk memanggil data langsung dari API asli (bukan data statis):

*   **Formulir Musrembang** (`SubmitDisbursementPage.tsx`)
*   **Ajukan Pencairan** (`SubmitDisbursementPage.tsx`)
*   **Verifikasi Pengajuan & Antrean Sekdes** (`VerificationQueuePage.tsx`)
*   **Split-View Reviewer (Sekdes)** (`ReviewSubmissionPage.tsx`)
*   **Persetujuan Pencairan (Kades)** (`DisbursementApprovalPage.tsx`)
*   **Detail Otorisasi (Kades)** (`DisbursementDetailPage.tsx`)
*   **Antrean Eksekusi (Kaur Keuangan)** (`ExecutionQueuePage.tsx`)
*   **Buku Kas Umum** (`GeneralCashBookPage.tsx`)
*   **Buku Bank** (`BankBookPage.tsx`)
*   **Buku Pajak** (`TaxBookPage.tsx`) - *Baru disambungkan!*
*   **Tutup Buku Bulanan** (`MonthlyClosingPage.tsx`)
*   **Transaksi Koreksi** (`CorrectionTransactionPage.tsx`) - *Baru disambungkan!*
*   **Laporan Realisasi** (`RealizationReportPage.tsx`) - *Baru disambungkan!*
*   **Arsip Buku Terkunci** (`LockedArchivePage.tsx`) - *Baru disambungkan!*
*   **Dashboard (Kaur Teknis, Sekdes, Kades, Auditor, BPD/Adat)** (`DashboardPage.tsx`) - *Baru disambungkan!*
*   **Kronologi Transaksi (Auditor)** (`LedgerExplorerPage.tsx`) - *Baru disambungkan!*
*   **Pantauan Transaksi (BPD/Adat)** (`TransactionMonitoringPage.tsx`) - *Baru disambungkan!*
*   **Dashboard Publik** (`DashboardPage.tsx`) - *Baru disambungkan!*
*   **Daftar Proyek Publik** (`ProjectListPage.tsx`) - *Baru disambungkan!*
*   **Detail Proyek Publik** (`ProjectDetailPage.tsx`) - *Baru disambungkan!*
*   **Klarifikasi Warga** (`ClarificationPage.tsx`) - *Baru disambungkan!*
*   **Whistleblower Report** (`WhistleblowerReportPage.tsx`) - *Baru disambungkan!*

## 7. Yang MASIH Dummy
Fitur/halaman frontend yang **MASIH** menggunakan data *dummy* statis dan belum terhubung (maupun belum ada) ke *endpoint* API asli:

*   **BPD/Adat**: Adat Calendar, Adat Resolution Board, Annual Report, Notifikasi, Supervision Archive, Catatan Pengawasan (Komentar di dalam Pantauan Transaksi).
*   **Auditor**: Case Management, Integrity Checker, Legal Export, Notifikasi, Report Templates, Whistleblower Inbox.
*   **Publik**: Notifikasi.
*   **Kaur Keuangan**: Dashboard.
*   **Kades**: Authorization History, Clarification Analytics, Integrity Shield, Public Clarification Center, Notifikasi.
*   **Kaur Teknis**: My Programs, Program Detail, Rejection History, Notifikasi.
*   **Sekdes**: Budget Monitoring, Clarification Inbox, Verification History, Notifikasi.

## 8. Konfigurasi & Environment
Variabel *environment* (`.env`) yang saat ini digunakan di backend (tanpa _value_ asli):
*   `DATABASE_URL`
*   `DIRECT_URL`
*   `JWT_SECRET`
*   `PORT`

## 9. Isu Diketahui
*   **Terkait Field `authorizedAt`**: *Field* `authorizedAt` merupakan tambahan terbaru pada model `Disbursement` untuk mencatat stempel waktu otorisasi Kades secara khusus. Karena sifatnya opsional (`nullable`), data transaksi lama (yang dibuat dan diotorisasi sebelum *field* ini ditambahkan ke database) mungkin memiliki nilai `null` pada kolom ini, yang menyebabkan ketidakkonsistenan pada status timeline (tampil sebagai "Menunggu proses") kecuali data tersebut di-_backfill_ manual di database.
*   **Ketidaksesuaian Caching TypeScript**: Mengubah struktur schema Prisma terkadang membuat *compiler* internal `ts-node-dev` gagal mendeteksi penambahan tipe baru, sehingga memerlukan casting `as any` di kode atau restart bersih dari lingkungan pengembangan.

## 10. Row Level Security (RLS) Status
Seluruh **16 tabel** di Supabase saat ini **SUDAH DIBERLAKUKAN (ENABLED)** Row Level Security (RLS) untuk keamanan. 
Tabel-tabel tersebut adalah: `User`, `Proposal`, `Disbursement`, `RejectionLog`, `InterventionLog`, `ClarificationTicket`, `WhistleblowerReport`, `Notification`, `AdatCase`, `SupervisionNote`, `AuditorAccessToken`, `CashBookEntry`, `BankBookEntry`, `TaxBookEntry`, `MonthlyClosing`, dan `CorrectionTransaction`.
*Catatan: Backend Prisma secara default melakukan bypass pada RLS karena dikoneksikan dengan service role credentials (postgres) di URL database-nya.*
