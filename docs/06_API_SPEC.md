# API SPEC — Express Backend

Base URL: `/api/v1` (atau Kustom di server.ts: `/api`). Auth: `Authorization: Bearer <JWT>`. Semua endpoint (kecuali yang ditandai *public*) dilindungi RBAC middleware sesuai `05_ROLES_PERMISSIONS.md`.

## 1. Auth & Users
- `POST /auth/login` *(public)* — email/nama + password -> JWT
- `GET /notifications` — Mengambil daftar notifikasi terbaru milik user yang login.
- `GET /notifications/unread-count` — Mengambil jumlah notifikasi yang belum dibaca.
- `POST /notifications/:id/read` — Menandai notifikasi spesifik menjadi sudah dibaca.

## 2. Public & Open Access (`/api/public`)
- `GET /public/summary` *(public)* — agregasi metrik ringkasan dana, realisasi, dan jumlah proyek.
- `GET /public/projects` *(public)* — daftar seluruh proyek dengan filter judul (`?search=`), dusun (`?dusun=`), dan status (`?status=`).
- `GET /public/projects/:id` *(public)* — detail publik 1 proyek lengkap dengan informasi termin pencairan dan galeri geotagging.
- `POST /public/clarifications` *(public)* — mengirim pertanyaan publik.
- `GET /public/clarifications` *(public)* — mengambil seluruh daftar tiket diskusi terbuka.
- `POST /public/whistleblower` *(public)* — menerima payload whistleblower (encrypted-only) dari masyarakat tanpa logging backend.

## 3. Proposal (Musrembang)
- `POST /proposals/` — `KAUR_TEKNIS`. Membuat proposal / usulan program baru dari Kaur Teknis.
- `GET /proposals/` — Mengambil daftar semua proposal (termasuk relasi pembuatnya).

## 4. Disbursement (Pencairan)
- `GET /disbursements/sisa-pagu/:proposalId` — Mengambil sisa pagu anggaran dari suatu proposal.
- `POST /disbursements/` — `KAUR_TEKNIS`. Membuat pengajuan pencairan (disbursement) baru dengan status awal `PENDING_SEKDES`.
- `GET /disbursements/` — Mengambil daftar pengajuan, mendukung *query parameter* `?status=`.
- `GET /disbursements/execution-queue` — `KAUR_KEUANGAN`. Mengambil antrean pengajuan dengan status `PENDING_EKSEKUSI`.
- `GET /disbursements/authorizations` — `KADES`. Mengambil riwayat otorisasi pencairan oleh Kades.
- `GET /disbursements/:id` — Mengambil detail spesifik pengajuan pencairan.
- `PUT /disbursements/:id` — `KAUR_TEKNIS`. Menyimpan revisi pengajuan pencairan yang dikembalikan (update nominal/geotag).
- `POST /disbursements/:id/verify` — `SEKDES`. Memverifikasi pengajuan. Mengubah status ke `PENDING_KADES`.
- `POST /disbursements/:id/return-revision` — `SEKDES`/`KADES`. Menolak dengan catatan revisi, status ke `RETURNED_FOR_REVISION`.
- `POST /disbursements/:id/authorize` — `KADES`. Mengotorisasi pencairan. Mengubah status ke `PENDING_EKSEKUSI`.
- `POST /disbursements/:id/execute` — `KAUR_KEUANGAN`. Mengeksekusi pencairan. Mengubah status ke `DISBURSED`, otomatis mencatat ke Buku Kas, Bank, & Pajak.

## 5. Panic Button & Interventions
- `POST /interventions/:id/reject` — `KADES`. Menolak intervensi/pencairan mencurigakan (Panic Button), mengubah status ke `REJECTED_SYSTEM`.
- `GET /interventions/:id/certificate` — `KADES`/`AUDITOR`. Mengunduh sertifikat PDF penolakan intervensi non-prosedural.

## 6. Modul Kaur Keuangan (Buku Kas, Bank, Pajak, Pendapatan)
- `GET /cash-book/` — Mengambil seluruh entri Buku Kas Umum, mendukung filter query `?bulan=` dan `?tahun=`.
- `GET /bank-book/` — Mengambil seluruh entri Buku Bank.
- `GET /tax-book/` — Mengambil seluruh entri Buku Pajak.
- `POST /tax-book/:id/setor` — `KAUR_KEUANGAN`. Mengubah status setor pajak menjadi `SUDAH_SETOR`.
- `POST /village-income/` — `KAUR_KEUANGAN`. Mencatat pendapatan desa baru (PADes, Transfer, dll). Otomatis buat `CashBookEntry`.
- `GET /village-income/` — Mengambil daftar pendapatan desa dengan filter.
- `GET /village-income/summary` — Mengembalikan agregat total nominal per kelompok pendapatan.
- `GET /monthly-closing/archive` — List seluruh penutupan buku bulanan beserta status verifikasi hash.
- `GET /monthly-closing/status` — Cek status penutupan bulan dan validasi rekonsiliasi.
- `POST /monthly-closing/close` — `KAUR_KEUANGAN`. Mengunci buku bulanan secara permanen dengan PIN dan generate SHA-256 hash.
- `GET /monthly-closing/:id/verify` — Memverifikasi kecocokan hash kriptografis dari ledger bulanan.
- `POST /corrections/` — `KAUR_KEUANGAN`. Membuat transaksi koreksi (jurnal pembalik) untuk entri buku yang sudah closing.
- `GET /corrections/` — List transaksi koreksi, filter `?bulan=` & `?tahun=`.
- `GET /reports/realization` — Agregasi realisasi anggaran per periode (pagu, realisasi, sisa pagu, breakdown).

## 7. Ledger Explorer & Auditor Tools
- `GET /ledger/timeline` — `AUDITOR`/`BPD`/`PUBLIK`. Mengambil daftar pencairan untuk ditampilkan di eksplorer. Mendukung filter `?search=`.
- `GET /ledger/timeline/:id` — Mengambil detail 1 pencairan yang dipetakan sebagai rentetan tahapan timeline berdasarkan timestamp.
- `POST /disbursements/verify-hash` — `AUDITOR`. Mengecek kecocokan dokumen (hash PDF) dengan data blockchain/DB.
- `POST /export/legal-report` — `AUDITOR`. Generate Laporan Hukum PDF.
- `POST /export/raw-data` — `AUDITOR`. Download Export Data CSV/JSON.
- `GET /whistleblower/reports` — `AUDITOR`. List laporan whistleblower yang masuk.
- `POST /whistleblower/reports/:ticketCode/decrypt` — `AUDITOR`. Mendekripsi payload whistleblower.

## 8. BPD & Tokoh Adat
- `POST /supervision-notes` — `BPD`. Membuat catatan pengawasan atas pencairan tertentu.
- `GET /supervision-notes/history` — `BPD`. Mengambil riwayat pengawasan.
- `POST /adat-cases` — `TOKOH_ADAT`. Membuat kasus resolusi adat baru.
- `PATCH /adat-cases/:id` — `TOKOH_ADAT`. Memperbarui status resolusi adat.
- `GET /adat-cases` — `TOKOH_ADAT`/`BPD`. Mengambil daftar seluruh resolusi adat.

## 9. Dashboard Analytics (`/api/dashboard/*`)
- `GET /dashboard/kaur-teknis` — Ringkasan usulan dan pencairan Kaur Teknis.
- `GET /dashboard/sekdes` — Dashboard metrik kinerja Sekdes.
- `GET /dashboard/sekdes/budget` — Monitoring anggaran & sisa kas Sekdes.
- `GET /dashboard/kades` — Ringkasan serapan anggaran & ranking dusun (Kades).
- `GET /dashboard/kades/clarifications` — Analytics respon klarifikasi warga.
- `GET /dashboard/auditor` — Metrik anomali dan red-flags (Auditor).
- `GET /dashboard/auditor/cases` — Manajemen kasus whistleblower & intervensi (Auditor).
- `GET /dashboard/bpd-adat` — Ringkasan pengawasan, kasus adat, & timeline (BPD/Adat).
- `GET /dashboard/bpd-adat/annual-report` — Laporan kuartalan & tahunan (BPD/Adat).
- `GET /dashboard/bpd-adat/calendar` — Kalender jadwal sidang adat (BPD/Adat).
- `GET /dashboard/kaur-keuangan` — Ringkasan kas, tugas pending eksekusi & pelaporan pajak.

## Konvensi Umum
- Endpoint POST dan PUT mengirim JSON dan mengembalikan object tersimpan.
- Jika error, gunakan format HTTP Status Code sesuai. `400` untuk invalid request, `401` Unauthorized, `403` Forbidden (Role tidak pas).
