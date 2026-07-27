# API SPEC — Express Backend

Base URL: `/api/v1`. Auth: `Authorization: Bearer <JWT>`. Semua endpoint (kecuali yang ditandai *public*) dilindungi RBAC middleware sesuai `05_ROLES_PERMISSIONS.md`.

## Auth
- `POST /auth/login` *(public)* — email/nama + password → JWT
- `POST /auth/refresh`

## Proposal (Musrembang)
- `POST /proposals` — `KAUR_TEKNIS`. Body: dusun, judul, kategori, volume, satuan, pagu, files (multipart). Alur: hash file → upload S3 → simpan DB → sign+kirim tx `registerProposal` → return `{ id, onChainTxHash, status: "pending_confirmation" }`
- `GET /proposals` — semua role (read), filter `?dusun=&kategori=`
- `GET /proposals/:id/sisa-pagu` — real-time dari contract `getSisaPagu`

## Disbursement (Pencairan)
- `POST /disbursements` — `KAUR_TEKNIS`. Body: proposalId, keterangan, nominal, beritaAcara (file), foto (file dgn geotag metadata), pin. Validasi nominal vs sisa pagu **sebelum** kirim tx (agar UI bisa warning merah instan, bukan nunggu revert on-chain).
- `GET /disbursements?status=&dusun=&kaurId=` — read, scoped sesuai role (mis. Kaur hanya lihat riwayat sendiri kalau perlu, atau semua kalau desa kecil)
- `GET /disbursements/:id` — detail lengkap (dipakai Split-View Reviewer Sekdes & halaman detail Kades)
- `POST /disbursements/:id/verify` — `SEKDES`. Body: `{ pin }` → sign tx `verifyBySekdes`
- `POST /disbursements/:id/return-revision` — `SEKDES`. Body: `{ alasan }`
- `POST /disbursements/:id/disburse` — `KADES`. Body: `{ pin }` → sign tx `disburse`
- `POST /disbursements/:id/verify-hash` — upload file, hitung hash, bandingkan ke on-chain (dipakai Sekdes reviewer & Auditor integrity checker)

## Panic Button / Intervention
- `POST /disbursements/:id/reject-intervention` — `KADES`. Body: `{ alasan, pin }` → sign tx `rejectIntervention`
- `GET /interventions` — read (`KADES`, `AUDITOR`, `BPD`)
- `GET /interventions/:id/certificate` — generate PDF "Sertifikat Penolakan"

## Ledger Explorer (Auditor)
- `GET /ledger/timeline?programId=&blockId=&dateFrom=&dateTo=`
- `GET /ledger/blocks/:blockId/metadata` — timestamp presisi, signature, geolocation

## Whistleblower
- `POST /whistleblower/reports` *(public)* — body: `{ ticketCode (generated server-side), encryptedPayload, attachmentUrls }`. Server **tidak pernah** melihat plaintext.
- `GET /whistleblower/reports/:ticketCode/status` *(public)* — tracker status
- `GET /whistleblower/reports` — `AUDITOR` only, list ciphertext + tanggal
- `POST /whistleblower/reports/:id/decrypt` — `AUDITOR`. Body: `{ privateKeyPassphrase }` — dekripsi terjadi **client-side di browser Auditor** idealnya (privateKey tidak boleh dikirim ke server); endpoint ini cuma return ciphertext + metadata, dekripsi di frontend.

## Clarification (Publik ↔ Sekdes)
- `POST /clarifications` *(public, optional auth)* — body: `{ nama?, programId?, pertanyaan }`
- `GET /clarifications?status=`
- `POST /clarifications/:id/reply` — `SEKDES`

## Supervision (BPD) & Adat
- `POST /supervision-notes` — `BPD`. Body: `{ disbursementId, catatan }` → trigger notifikasi ke Kades & Sekdes (websocket/polling)
- `GET /supervision-notes/history`
- `POST /adat-cases` — `TOKOH_ADAT`
- `GET /adat-cases?status=`

## Legal Export (Auditor)
- `POST /export/legal-report` — body: `{ disbursementIds: [] }` → generate PDF bersegel digital
- `POST /export/raw-data` — body: `{ disbursementIds: [] }` → JSON/CSV

## Public Dashboard
- `GET /public/summary` *(public)* — total dana, realisasi %
- `GET /public/projects?search=` *(public)*
- `GET /public/projects/:id` *(public)* — detail + galeri foto + transparansi dana

## Konvensi Umum

- Semua endpoint yang men-trigger transaksi blockchain **return segera** dengan status `pending_confirmation` + `txHash`, lalu frontend polling `GET /tx/:txHash/status` atau dengar websocket event dari `chain-indexer`. Jangan bikin request HTTP menunggu block confirmation (lambat, UX buruk).
- Semua file upload: validasi tipe (PDF/JPEG only sesuai spec), hash dihitung di backend segera setelah upload selesai, bukan dipercaya dari klien.
