# KOHALOCK — Dokumen Proyek untuk Vibe Coding

Folder ini berisi seluruh dokumen perencanaan proyek **KOHALOCK** (Sistem Transparansi Dana Desa berbasis Blockchain). Dokumen-dokumen ini dirancang untuk jadi *context* saat kamu coding bareng AI assistant (Claude Code, Cursor, dll).

## Urutan Baca / Prioritas Context

| # | File | Kapan dipakai |
|---|------|----------------|
| 0 | `09_FRONTEND_STATE.md` | Kondisi ACTUAL frontend saat ini - baca ini dulu sebelum 01_PRD.md kalau ingin tahu apa yang SUDAH ada, bukan yang direncanakan |
| 1 | `01_PRD.md` | Saat butuh konteks kebutuhan fitur & alur bisnis per role |
| 2 | `02_ARCHITECTURE.md` | Saat setup project, decide folder structure, pilih library |
| 3 | `03_SMART_CONTRACT_SPEC.md` | Saat menulis/mengedit contract Solidity |
| 4 | `04_DATABASE_SCHEMA.md` | Saat menulis Prisma schema / query DB |
| 5 | `05_ROLES_PERMISSIONS.md` | Saat implement auth/RBAC & routing per role |
| 6 | `06_API_SPEC.md` | Saat menulis endpoint Express / integrasi frontend-backend |
| 7 | `07_CLAUDE.md` | **Taruh di root repo sebagai `CLAUDE.md`** — konvensi coding, commands, struktur repo. Ini yang otomatis dibaca Claude Code tiap sesi. |
| 8 | `08_ROADMAP.md` | Saat planning sprint / milestone |

## Cara Pakai Praktis

1. Copy semua file ini ke folder `/docs` di root repo kamu.
2. Copy `07_CLAUDE.md` juga ke root repo sebagai `CLAUDE.md` (bukan cuma di `/docs`) — Claude Code akan otomatis membacanya.
3. Saat mulai task baru, cukup bilang ke AI: "baca `docs/02_ARCHITECTURE.md` dan `docs/05_ROLES_PERMISSIONS.md`, lalu buatkan skeleton route untuk role Sekdes".
4. Update `08_ROADMAP.md` tiap kali sebuah task selesai — supaya AI tahu progres project tanpa kamu re-explain dari nol.
5. File spec role asli kamu (`MODUL_*.md`) tetap simpan di `/docs/specs/` — `01_PRD.md` merujuk ke situ untuk detail UI per layar.

## Prinsip Desain Proyek Ini

- **Off-chain untuk UX, on-chain untuk kebenaran.** Semua yang butuh dibuktikan tidak bisa diubah (hash dokumen, status pencairan, tanda tangan digital) → smart contract. Semua yang butuh fleksibel/cepat query (chat, dashboard, notifikasi) → Postgres.
- **6 role = 6 permission set, bukan 6 aplikasi.** Satu codebase React, routing & UI berbeda per role berdasarkan RBAC.
- **Custodial key management.** PIN pengguna ≠ private key blockchain secara langsung — PIN dipakai untuk decrypt private key yang disimpan terenkripsi di backend.
