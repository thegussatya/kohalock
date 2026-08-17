# ROLES & PERMISSIONS MATRIX

## 1. Daftar Role

| Role Enum | Nama | Sifat Akses |
|---|---|---|
| `KAUR_TEKNIS` | Operator Desa / Operator Desa | Write (proposal & disbursement) |
| `SEKDES` | Sekretaris Desa | Write (verifikasi tahap 1) |
| `KADES` | Kepala Desa | Write (otorisasi final, panic button) |
| `KAUR_KEUANGAN` | Kaur Keuangan / Bendahara | Write (eksekusi pencairan, BKU, rekonsiliasi bulanan) |
| `PUBLIK` | Masyarakat | Read-only + submit klarifikasi/laporan (public-facing, tanpa login wajib atau login ringan) |
| `AUDITOR` | Inspektorat/APH | Read-only + akses time-bound + dekripsi whistleblower |
| `BPD` | Badan Permusyawaratan Desa | Read-only + catatan pengawasan (non-blocking) |
| `TOKOH_ADAT` | Tokoh Adat | Write (resolusi adat only, tidak terkait keuangan) |

> `BPD` dan `TOKOH_ADAT` berbagi satu shell dashboard (`Beranda Pengawasan`) tapi punya menu & permission berbeda — implementasikan sebagai 2 role terpisah di enum, bukan 1 role dengan sub-mode, supaya RBAC middleware tetap sederhana.

## 2. Matriks Permission per Endpoint/Fitur

| Fitur / Endpoint | KAUR_TEKNIS | SEKDES | KADES | KAUR_KEUANGAN | PUBLIK | AUDITOR | BPD | TOKOH_ADAT |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Buat proposal Musrembang | ✅ create | — | — | — | 👁 read | 👁 read | 👁 read | — |
| Ajukan pencairan | ✅ create | 👁 read | 👁 read | 👁 read | — | 👁 read | 👁 read | — |
| Verifikasi tahap 1 (approve/revisi) | — | ✅ write | — | — | — | 👁 read | — | — |
| Otorisasi final (kades) | — | — | ✅ write | 👁 read | — | 👁 read | — | — |
| Eksekusi pencairan (cair) | — | — | — | ✅ write | — | 👁 read | — | — |
| BKU & Buku Bank | — | 👁 read | 👁 read | ✅ write | — | 👁 read | — | — |
| Tutup Buku Bulanan | — | — | — | ✅ write | — | 👁 read | — | — |
| Lengkapi Rincian LPJ | ✅ write | 👁 read | 👁 read | 👁 read | — | 👁 read | — | — |
| Laporan APBDes / Laporan Keuangan | — | 👁 read | 👁 read | ✅ write | 👁 read | 👁 read | 👁 read | — |
| Panic button (tolak intervensi) | — | — | ✅ write | — | — | 👁 read (flagged) | 👁 read (flagged) | — |
| Ledger Explorer (kronologi blok) | — | — | — | — | 👁 read (progress publik saja) | ✅ full detail | 👁 read | — |
| Integrity/Hash Checker | — | 👁 (built-in di reviewer) | — | — | — | ✅ full tool | — | — |
| Whistleblower inbox | — | ❌ no access | ❌ no access | ❌ no access | ✅ submit only | ✅ decrypt & read | ❌ no access | ❌ no access |
| Klarifikasi warga | — | ✅ balas | 👁 read | — | ✅ submit | — | — | — |
| Catatan pengawasan | — | 👁 notif | 👁 notif | — | — | 👁 read | ✅ write | — |
| Resolusi adat | — | — | — | — | — | — | — | ✅ write |
| Ekspor laporan hukum | — | — | — | — | — | ✅ | — | — |

Legenda: ✅ = write/execute, 👁 = read-only, ❌ = eksplisit diblokir walau secara teknis bisa akses server.

## 3. Catatan Kritis untuk Implementasi Auth

1. **Whistleblower inbox harus di-enforce di level backend & kriptografi, bukan cuma UI hiding.** Aparat desa (Kaur/Sekdes/Kades/BPD) yang mencoba akses endpoint whistleblower harus dapat 403 — dan bahkan kalau bisa akses row-nya, isinya tetap ciphertext karena mereka tidak punya private key Inspektorat.
2. **Auditor access harus dicek `expiresAt` di setiap request**, bukan cuma saat login — pakai middleware yang query `AuditorAccessToken` tiap call ke endpoint sensitif.
3. **Panic button (Kades) dan Catatan Pengawasan (BPD) bukan aksi yang saling meniadakan** — panic button mengunci transaksi on-chain, catatan BPD hanya notifikasi. Jangan campur logic keduanya di satu endpoint.
4. **Publik tidak selalu butuh login** — untuk baca dashboard & progress proyek bisa anonymous; login/identitas ringan baru dibutuhkan saat submit klarifikasi (opsional nama) atau lapor rahasia (anonim by design).
