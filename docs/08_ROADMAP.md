# ROADMAP — KOHALOCK

> Update file ini (centang checklist) tiap kali task selesai, supaya AI assistant tahu progres tanpa perlu dijelaskan ulang.

## Fase 0 — Setup Fondasi
- [ ] Init monorepo (pnpm workspaces + Turborepo)
- [x] Setup `apps/web` (Vite + React + TS + Tailwind), routing kosong per role
- [ ] Setup `apps/api` (Express + TS), health-check endpoint
- [ ] Setup `packages/contracts` (Hardhat), deploy contract kosong ke local network
- [ ] Setup Postgres + Prisma, migrate schema awal (`04_DATABASE_SCHEMA.md`)
- [ ] Setup auth dasar (login, JWT, RBAC middleware skeleton) (UI login selesai, logic asli belum)

## Fase 1 — Alur Inti Kaur Teknis → Sekdes → Kades (MVP Kritis)
- [ ] Contract: `registerProposal`, `submitDisbursement`, `verifyBySekdes`, `disburse`, `returnForRevision` + test Hardhat
- [ ] Deploy contract ke testnet (Polygon Amoy)
- [ ] Custodial signer service (generate keypair saat user dibuat, encrypt/decrypt via PIN)
- [ ] `chain-indexer` service (listen event → update Postgres)
- [ ] UI Kaur Teknis: Dashboard, Form Musrembang, Ajukan Pencairan (dengan kamera native + geotag watermark), Riwayat Penolakan (UI selesai, logic asli belum)
- [ ] UI Sekdes: Dashboard, Verifikasi Pengajuan (Split-View Reviewer + Map widget + PDF viewer + Hash checker), Pantauan Anggaran (UI selesai, logic asli belum)
- [ ] UI Kades: Dashboard, Persetujuan Pencairan, halaman detail + tombol Cairkan Dana (UI selesai, logic asli belum)

## Fase 1.5 — Pengelolaan Keuangan (Kaur Keuangan)
- [x] UI & API Buku Kas Umum (sinkronisasi saat eksekusi pencairan)
- [x] UI & API Buku Bank (pencatatan otomatis dari buku kas)
- [x] UI & API Penutupan Buku Bulanan (lock periode & simulasi hash)
- [x] UI & API Buku Pajak (integrasi potong pajak manual saat eksekusi pencairan)
- [x] UI & API Correction Transaction, Realization Report, Locked Archive

## Fase 2 — Transparansi Publik
- [ ] UI Publik: Beranda, Pantau Proyek (galeri + progress), Klarifikasi (UI selesai, logic asli belum)
- [ ] Endpoint public (read-only, tanpa auth wajib)
- [ ] QR code generator per proyek + halaman detail proyek

## Fase 3 — Pengawasan & Forensik
- [ ] Contract: `rejectIntervention` (panic button Kades)
- [ ] UI Kades: Perisai Integritas (panic button + sertifikat penolakan) (UI selesai, logic asli belum)
- [ ] UI BPD: Pantauan Transaksi read-only + Catatan Pengawasan (notifikasi ke Kades/Sekdes) (UI selesai, logic asli belum)
- [ ] UI Tokoh Adat: Papan Resolusi Adat (case management, DB only) (UI selesai, logic asli belum)
- [ ] Auditor: time-bound access token + middleware
- [ ] Auditor: Uji Alat Bukti (integrity checker), Ledger Explorer (timeline blok) (UI selesai, logic asli belum)

## Fase 4 — Whistleblower & Legal Export
- [x] Client-side E2EE encryption (keypair Inspektorat, public key dipakai warga saat submit)
- [ ] UI Publik: form Lapor Rahasia + ticket tracker (UI selesai, logic asli belum)
- [ ] UI Auditor: Kotak Masuk Rahasia (decrypt di client, bukan server) (UI selesai, logic asli belum)
- [ ] Ekspor Laporan Hukum (PDF bersegel) & Ekspor Data Mentah (JSON/CSV) (UI selesai, logic asli belum)

## Fase 5 — Polish & Hardening
- [ ] Audit smart contract (internal review minimal, idealnya third-party sebelum mainnet)
- [ ] Rate limiting & abuse protection untuk endpoint publik (klarifikasi, whistleblower)
- [ ] Backup & disaster recovery untuk Postgres + S3
- [ ] Load test alur pencairan (concurrent submissions)
- [ ] Dokumentasi onboarding untuk aparat desa (non-teknis) — cara pakai PIN, kamera geotag, dsb

## Keputusan yang Masih Perlu Dikonfirmasi ke Stakeholder Desa
- [ ] Apakah "Cairkan Dana" di sistem = transfer bank riil (perlu integrasi payment gateway) atau cuma pencatatan status (transfer tetap manual di luar sistem)?
- [ ] Siapa yang pegang public key Inspektorat untuk E2EE whistleblower — 1 device khusus? HSM?
- [ ] Testnet dulu berapa lama sebelum pertimbangkan mainnet/L2 production?
