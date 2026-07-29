# API SPEC — Express Backend

Base URL: `/api/v1` (atau Kustom di server.ts: `/api`). Auth: `Authorization: Bearer <JWT>`. Semua endpoint (kecuali yang ditandai *public*) dilindungi RBAC middleware sesuai `05_ROLES_PERMISSIONS.md`.

## Auth
- `POST /auth/login` *(public)* — email/nama + password → JWT
- `POST /auth/refresh` *(Belum diimplementasi)*

## Public & Open Access (`/api/public`)
- `GET /public/summary` *(public)* — total dana, realisasi %, jumlah proyek
- `GET /public/projects?search=&dusun=&status=` *(public)* — daftar proyek & progress
- `GET /public/projects/:id` *(public)* — detail proyek, progress pencairan, & geotag photo
- `POST /public/clarifications` *(public, optional auth)* — submit pertanyaan warga
- `GET /public/clarifications` *(public)* — list pertanyaan & jawaban
- `POST /public/whistleblower` *(public)* — submit laporan rahasia (encrypted)
- `GET /public/whistleblower/:ticketCode/status` *(public)* — cek status laporan tanpa membocorkan konten

## Proposal (Musrembang)
- `POST /proposals` — `KAUR_TEKNIS`. Body: dusun, judul, kategori, volume, satuan, pagu, files (multipart).
- `GET /proposals` — List proposal berdasarkan filter.

## Disbursement (Pencairan)
- `GET /disbursements/sisa-pagu/:proposalId` — real-time sisa pagu anggaran per proposal
- `POST /disbursements` — `KAUR_TEKNIS`. Ajukan pencairan baru (nominal, berita acara, geotagging).
- `GET /disbursements` — List pencairan sesuai role/dusun.
- `GET /disbursements/rejections` — Riwayat pencairan yang ditolak atau direvisi.
- `GET /disbursements/execution-queue` — Daftar antrean eksekusi pencairan (Kaur Keuangan).
- `GET /disbursements/verifications` — Daftar pencairan yang sudah diverifikasi (Sekdes).
- `GET /disbursements/authorizations` — Daftar pencairan yang sudah diotorisasi (Kades).
- `GET /disbursements/:id` — Detail lengkap pencairan.
- `POST /disbursements/:id/verify` — `SEKDES`. Verifikasi tahap 1 (sign tx).
- `POST /disbursements/:id/return-revision` — `SEKDES`. Kembalikan pencairan untuk direvisi.
- `POST /disbursements/:id/authorize` — `KADES`. Persetujuan final sebelum pencairan dieksekusi.
- `POST /disbursements/:id/execute` — `KAUR_KEUANGAN`. Eksekusi pencairan on-chain & transfer dana aktual.
- `POST /disbursements/verify-hash` — Upload file dan verifikasi hash on-chain vs dokumen (Auditor/Sekdes).

## Panic Button / Intervention
- `POST /disbursements/:id/reject-intervention` — `KADES`. Mengintervensi/membatalkan pencairan darurat (Panic Button).
- `GET /interventions` — read (`KADES`, `AUDITOR`, `BPD`).
- `GET /interventions/:id/certificate` — generate PDF "Sertifikat Penolakan".

## Modul Bendahara & Kaur Keuangan
- `GET /monthly-closing/status` — Cek status penutupan buku kas.
- `GET /monthly-closing/archive` — Arsip bulanan.
- `POST /monthly-closing/close` — Menutup buku bulanan (mengunci CashBook & BankBook).
- `GET /monthly-closing/:id/verify` — Verifikasi tutup buku.
- `GET /cash-book` — Buku kas umum.
- `GET /bank-book` — Buku pembantu bank.
- `POST /bank-book/reconcile` — Rekonsiliasi bank.
- `GET /tax-book` — Buku pembantu pajak.
- `POST /tax-book/:id/setor` — Penyetoran pajak.
- `GET /corrections` — Riwayat koreksi transaksi.
- `POST /corrections` — Koreksi nilai nominal pencairan.
- `GET /reports/realization` — Rekapitulasi realisasi anggaran.

## Notifikasi (Universal)
- `GET /notifications` — Daftar notifikasi user.
- `GET /notifications/unread-count` — Jumlah notifikasi belum dibaca.
- `POST /notifications/:id/read` — Menandai notifikasi dibaca.

## Dashboard Role-Based (`/api/dashboard`)
- `GET /dashboard/kaur-teknis` — Ringkasan usulan dan pencairan Kaur Teknis.
- `GET /dashboard/sekdes` — Dashboard metrik kinerja Sekdes.
- `GET /dashboard/sekdes/budget` — Monitoring anggaran & sisa kas Sekdes.
- `GET /dashboard/kades` — Ringkasan serapan anggaran & ranking dusun (Kades).
- `GET /dashboard/kades/clarifications` — Analytics respon klarifikasi warga.
- `GET /dashboard/auditor` — Metrik anomali dan red-flags (Auditor).
- `GET /dashboard/auditor/cases` — Manajemen kasus whistleblower & intervensi (Auditor).
- `GET /dashboard/auditor/templates` — Template BAP & Surat Laporan (Auditor).
- `GET /dashboard/bpd-adat` — Ringkasan pengawasan, kasus adat, & timeline (BPD/Adat).
- `GET /dashboard/bpd-adat/annual-report` — Laporan kuartalan & tahunan (BPD/Adat).
- `GET /dashboard/bpd-adat/calendar` — Kalender jadwal sidang adat (BPD/Adat).
- `GET /dashboard/kaur-keuangan` — Ringkasan kas, tugas pending eksekusi & pelaporan pajak.

## Ledger Explorer (Auditor)
- `GET /ledger/timeline` — Timeline transaksi blok on-chain.
- `GET /ledger/timeline/:id` — Timeline history transaksi untuk pencairan spesifik.
- `GET /ledger/blocks/:blockId/metadata` *(Belum diimplementasi)* — timestamp presisi, signature, geolocation.

## Whistleblower
- `GET /whistleblower/reports` — `AUDITOR`. List laporan whistleblower.
- `POST /whistleblower/reports/:id/decrypt` — `AUDITOR`. Dekripsi ciphertext (private key tidak disimpan).

## Clarification (Publik ↔ Sekdes)
- `GET /clarifications` — Daftar klarifikasi yang masuk ke dashboard perangkat desa.
- `POST /clarifications/:id/reply` — `SEKDES`. Membalas pertanyaan/klarifikasi dari warga.

## Supervision (BPD) & Adat
- `POST /supervision-notes` — `BPD`. Membuat catatan pengawasan.
- `GET /supervision-notes/history` — Riwayat pengawasan BPD.
- `POST /adat-cases` — `TOKOH_ADAT`. Mencatat hasil resolusi adat.
- `GET /adat-cases` — List kasus adat.

## Legal Export (Auditor)
- `POST /export/legal-report` — `AUDITOR`. Generate PDF bersegel digital untuk kebutuhan BAP.
- `POST /export/raw-data` — `AUDITOR`. Export raw JSON/CSV.

## Konvensi Umum
- Semua endpoint yang men-trigger transaksi blockchain **return segera** dengan status `pending_confirmation` + `txHash`, lalu frontend polling `GET /tx/:txHash/status` atau dengar websocket event dari `chain-indexer`. Jangan bikin request HTTP menunggu block confirmation (lambat, UX buruk).
- Semua file upload: validasi tipe (PDF/JPEG only sesuai spec), hash dihitung di backend segera setelah upload selesai, bukan dipercaya dari klien.
