# ARCHITECTURE — KOHALOCK

## 1. Stack

| Layer | Pilihan | Alasan |
|---|---|---|
| Frontend | React + Vite + TypeScript | Cepat untuk dev, sesuai preferensi |
| Styling | Tailwind CSS | Cepat implement dashboard/card/table dari spec |
| State/Data fetching | TanStack Query | Cocok untuk polling status blockchain (pending → confirmed) |
| Backend | Node.js + Express + TypeScript | Terpisah dari frontend sesuai preferensi |
| Auth | JWT + refresh token, RBAC middleware | 6 role, permission granular |
| Off-chain DB | PostgreSQL + Prisma ORM | Relasional, cocok untuk user, chat, arsip |
| File storage | S3-compatible (mis. Cloudflare R2/MinIO) | Simpan PDF/foto asli |
| Blockchain | Solidity + Hardhat, deploy ke testnet EVM (Polygon Amoy) | Sesuai preferensi "smart contract asli" |
| Blockchain client | ethers.js v6 (backend-side, custodial signer) | Backend yang sign tx, bukan wallet user langsung |
| Encryption (whistleblower) | Client-side asymmetric encryption (mis. libsodium / TweetNaCl box) pakai public key Inspektorat | E2EE beneran, bukan cuma "encrypted at rest" |

## 2. Kenapa Custodial Signer (bukan MetaMask dsb)?

Aparat desa (Kaur/Sekdes/Kades) di spec kamu "input PIN/Sandi PKI" — ini pola **custodial wallet**:

1. Saat akun dibuat, backend generate keypair (private key) untuk user tsb.
2. Private key dienkripsi pakai kunci turunan dari PIN user (mis. PBKDF2/Argon2 → AES-GCM), disimpan di DB.
3. Saat user klik "Verifikasi & Teruskan" / "Cairkan Dana" dan input PIN, backend:
   - decrypt private key sementara di memory,
   - sign transaksi dengan ethers.js `Wallet`,
   - broadcast ke testnet,
   - langsung *wipe* private key dari memory.
4. PIN **tidak pernah** dikirim ke chain atau disimpan plaintext di mana pun.

> Kalau ternyata kamu mau tiap aparat pegang wallet sendiri (MetaMask/WalletConnect), kasih tahu — arsitektur auth & signing-nya beda, lebih sederhana di backend tapi butuh UX literasi crypto yang aparat desa mungkin belum siap.

## 3. Struktur Monorepo

```
kohalock-project/
├── apps/
│   ├── web/                  # React + Vite frontend
│   │   ├── src/
│   │   │   ├── app/          # routing (react-router)
│   │   │   ├── features/     # per-role feature folders
│   │   │   │   ├── kaur-teknis/
│   │   │   │   ├── sekdes/
│   │   │   │   ├── kades/
│   │   │   │   ├── publik/
│   │   │   │   ├── auditor/
│   │   │   │   └── bpd-adat/
│   │   │   ├── components/   # shared UI (Card, Badge, Timeline, MapWidget, PdfViewer)
│   │   │   ├── hooks/
│   │   │   ├── lib/          # api client, formatters (rupiah, tanggal)
│   │   │   └── types/
│   │   └── vite.config.ts
│   └── api/                  # Node/Express backend
│       ├── src/
│       │   ├── routes/       # per-domain: auth, proposals, disbursements, ledger, whistleblower
│       │   ├── controllers/
│       │   ├── services/
│       │   │   ├── blockchain.service.ts   # wraps ethers.js calls
│       │   │   ├── signer.service.ts       # custodial key decrypt+sign
│       │   │   ├── hash.service.ts         # SHA-256 file hashing
│       │   │   └── storage.service.ts      # upload to S3/R2
│       │   ├── middleware/   # auth, rbac, rate-limit
│       │   └── prisma/
│       └── server.ts
├── packages/
│   ├── contracts/            # Hardhat project
│   │   ├── contracts/
│   │   │   └── DanaDesaLedger.sol
│   │   ├── scripts/deploy.ts
│   │   ├── test/
│   │   └── hardhat.config.ts
│   ├── shared-types/         # TS types shared web<->api (status enum, role enum, dsb)
│   └── config/                # eslint/tsconfig base
├── docs/                      # semua file .md ini + specs asli
└── package.json               # workspaces (pnpm/turborepo)
```

Rekomendasi tooling monorepo: **pnpm workspaces + Turborepo** (ringan, cocok untuk 3 package: web, api, contracts).

## 4. Alur Data End-to-End (contoh: Ajukan Pencairan)

1. **Operator Desa** isi form di `apps/web` → submit ke `POST /api/disbursements`.
2. `apps/api` terima file upload → `hash.service` hitung SHA-256 → `storage.service` simpan file ke S3 → simpan metadata ke Postgres (status: `PENDING_SEKDES`).
3. `signer.service` decrypt private key Kaur (pakai PIN dari request) → sign & kirim tx `submitDisbursement(hash, nominal, programId)` ke contract via `blockchain.service`.
4. Frontend polling status tx (pending → confirmed) pakai TanStack Query.
5. **Sekdes** buka Split-View Reviewer → data ditarik dari Postgres (metadata) + on-chain (hash pembanding) + S3 (file untuk preview).
6. Sekdes approve → tx baru `verifyBySekdes(id)` on-chain, status Postgres di-update jadi `PENDING_KADES` (event listener dari contract atau langsung dari response tx).
7. **Kades** approve final → tx `disburse(id)` on-chain → status `DISBURSED`.
8. **Auditor/BPD/Publik** semua baca dari kombinasi Postgres (untuk UI cepat) + langsung verifikasi ke chain untuk *source of truth* integritas.

## 5. Sinkronisasi On-chain ↔ Off-chain

Gunakan **event listener** (backend service `chain-indexer`) yang subscribe ke event contract (`Submitted`, `Verified`, `Disbursed`, `InterventionRejected`) dan menulis ulang status ke Postgres — supaya Postgres selalu jadi *cache* yang konsisten dengan chain, bukan sumber kebenaran independen. Ini penting untuk fitur "Status Sinkronisasi Node" (LED hijau/merah) di dashboard Sekdes.
