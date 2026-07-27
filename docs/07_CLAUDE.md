# CLAUDE.md — Konteks Project untuk AI Pair Programming

> File ini ditaruh di **root repo** (bukan cuma di `/docs`). Tools seperti Claude Code otomatis membacanya di awal tiap sesi.

## Apa Project Ini

KOHALOCK — platform transparansi dana desa berbasis blockchain, 6 role (Kaur Teknis, Sekdes, Kades, Publik, Auditor, BPD/Tokoh Adat). Detail lengkap: lihat `docs/01_PRD.md`, `docs/02_ARCHITECTURE.md`.

## Struktur Repo

```
apps/web        → React + Vite + TypeScript (frontend, semua role)
apps/api        → Node + Express + TypeScript (backend REST API)
packages/contracts → Hardhat + Solidity (smart contract)
packages/shared-types → tipe TS yang dipakai web & api (enum Role, Status, dsb — JANGAN duplikat, selalu import dari sini)
docs/           → semua dokumen spec (PRD, architecture, API, dsb)
docs/specs/     → spec UI asli per role (MODUL_*.md) — sumber kebenaran untuk detail komponen UI
```

## Commands

```bash
pnpm install              # install semua workspace
pnpm --filter web dev     # jalankan frontend
pnpm --filter api dev     # jalankan backend
pnpm --filter contracts test   # test smart contract (Hardhat)
pnpm --filter contracts deploy:testnet
pnpm -w prisma migrate dev     # migrasi DB (dari apps/api)
```

## Konvensi Coding

- **TypeScript strict mode** di semua package, tidak ada `any` tanpa alasan jelas.
- **Nama role & status pakai enum dari `packages/shared-types`**, bukan string literal lepas (`"KADES"` dsb) — biar sinkron dengan Prisma enum & Solidity constant.
- **Uang selalu `BigInt`/string di boundary API**, jangan `number` biasa (presisi rupiah).
- **Komponen React per role** ditaruh di `apps/web/src/features/<role>/`, bukan campur di folder umum — memudahkan reasoning "fitur ini punya siapa".
- **Semua endpoint yang trigger tx blockchain harus async/pending-pattern** (lihat `docs/06_API_SPEC.md` § Konvensi Umum) — jangan bikin controller nunggu block confirmation.
- **Custodial signing**: private key user TIDAK PERNAH di-log, di-return ke response, atau disimpan plaintext. Selalu lewat `signer.service.ts`, decrypt-sign-wipe dalam satu function scope.
- Commit message: `feat(role-sekdes): ...`, `fix(contract): ...`, `chore(docs): ...` — prefix dengan area yang disentuh.

## Saat Diminta Membuat Fitur Baru

1. Cek `docs/specs/MODUL_<ROLE>.md` untuk detail UI komponen yang diminta.
2. Cek `docs/05_ROLES_PERMISSIONS.md` untuk permission yang benar.
3. Kalau menyentuh data on-chain, cek `docs/03_SMART_CONTRACT_SPEC.md` dulu — jangan asal tambah fungsi contract tanpa update spec ini juga.
4. Kalau menyentuh DB, cek `docs/04_DATABASE_SCHEMA.md` — update schema file itu juga kalau ada perubahan model.
5. Update `docs/08_ROADMAP.md` (centang task yang selesai) di akhir sesi kalau relevan.

## Yang Sering Salah (Guardrails)

- Jangan taruh logic bisnis approval di frontend — semua validasi status transition harus terjadi di backend + di-enforce ulang oleh smart contract (`require` di Solidity), frontend cuma UX.
- Jangan simpan file asli (PDF/foto) di DB Postgres — itu tugas storage service (S3/R2), DB cuma simpan URL + hash.
- Whistleblower payload: jangan pernah decode/log isi plaintext di backend, bahkan untuk debugging.
