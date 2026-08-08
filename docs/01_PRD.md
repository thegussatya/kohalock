# PRD — KOHALOCK (Sistem Transparansi Dana Desa)

## Catatan Versi

Dokumen ini adalah rencana awal produk. Untuk kondisi aktual implementasi frontend saat ini, silakan lihat [docs/09_FRONTEND_STATE.md](./09_FRONTEND_STATE.md).
## 1. Ringkasan Produk

KOHALOCK adalah platform digital untuk mengelola siklus dana desa (Musrembang → Pengajuan → Verifikasi → Pencairan) dengan jejak audit yang tidak bisa diubah (blockchain), melibatkan 6 peran dengan kepentingan berbeda: eksekutor teknis, verifikator internal, otorisator final, publik, pengawas eksternal (audit/hukum), dan pengawas etik/adat.

## 2. Alur Bisnis Inti (Core Flow)

```
[Kaur Teknis]                [Sekdes]                [Kades]
Usulan Musrembang   ─────►
   (lock ke chain)
                                                            
Ajukan Pencairan    ─────►  Verifikasi Tahap 1   ─────►   Otorisasi Final
(upload berkas +               (cek hash, GPS,           (tanda tangan PKI,
 geotag foto)                   PDF, approve/               eksekusi dana on-chain)
                                 revisi)
                                                            
                    ◄──── (jika revisi) ─────
```

Setiap transisi status = 1 transaksi blockchain dengan tanda tangan digital aktor terkait. Ini yang membuat **Auditor** dan **BPD** bisa melakukan pengawasan read-only tanpa perlu percaya pada satu pihak.

Paralel dengan alur di atas:
- **Publik** memantau progres via Dasbor Warga (read-only + kirim klarifikasi + lapor rahasia).
- **BPD** memantau transaksi (read-only) + memberi "catatan pengawasan" (notifikasi, bukan blocking).
- **Tokoh Adat** mengelola resolusi sengketa non-keuangan (off-chain, DB relasional biasa).
- **Auditor/APH** akses sementara (time-bound token) untuk forensik: cek integritas hash, jejak blok, dan whistleblower inbox terenkripsi E2EE yang bahkan aparat desa tidak bisa lihat.

## 3. Ringkasan per Role

Detail UI lengkap per role ada di `docs/specs/MODUL_*.md`. Ringkasan tanggung jawab & aksi kunci:

| Role | Tanggung Jawab Utama | Aksi On-Chain | Aksi Off-Chain |
|---|---|---|---|
| **Kaur Teknis** (Role 1) | Input usulan Musrembang, ajukan pencairan termin, lengkapi rincian LPJ belanja, upload bukti lapangan (foto geotag) | Lock usulan, sign & ajukan pencairan | Isi form rincian LPJ dinamis, ekspor CSV |
| **Sekdes** (Role 2) | Verifikator tahap 1: cek hash dokumen, lokasi GPS, PDF berita acara | Sign "Verifikasi & Teruskan ke Kades" | Balas klarifikasi warga, kembalikan untuk revisi |
| **Kades** (Role 3) | Otorisator final pencairan, "panic button" tolak intervensi non-prosedural, generator bukti publik (QR/link) | Sign "Cairkan Dana" (final), sign "Tolak Intervensi" | Kelola kredensial PKI |
| **Publik** (Role 4) | Pantau proyek & anggaran, ajukan klarifikasi, lapor rahasia (whistleblower) | — (read-only) | Kirim pertanyaan, lapor, scan QR |
| **Auditor/APH** (Role 5) | Forensik: cocokkan bukti fisik vs hash on-chain, telusuri kronologi blok, buka whistleblower inbox (private key), ekspor laporan hukum | Read-only ledger explorer | Dekripsi laporan (private key), export PDF/JSON bersegel |
| **BPD & Tokoh Adat** (Role 6) | BPD: pengawasan read-only + catatan (notifikasi ke Kades/Sekdes). Tokoh Adat: kelola resolusi sengketa non-keuangan | Read-only | Catatan pengawasan (notifikasi saja, tidak mengunci tx), keputusan adat (DB) |

## 4. Non-Functional Requirements

- **Integrity**: setiap file upload (PDF/foto) di-hash (SHA-256) saat upload; hash dikunci on-chain; verifikasi ulang di sisi Auditor & Sekdes harus match persis.
- **Immutability of trail**: status pencairan tidak boleh di-*edit*, hanya *append* transisi baru (mis. revisi = status baru "dikembalikan", bukan overwrite).
- **Time-bound access**: akses Auditor punya token dengan masa berlaku (countdown terlihat di UI), otomatis revoke setelah expired.
- **E2EE Whistleblower**: laporan warga di form Lapor Rahasia dienkripsi di client-side sebelum dikirim; hanya bisa didekripsi pakai private key milik Inspektorat, bukan aparat desa.
- **Geotag enforcement**: foto bukti lapangan wajib dari kamera native (bukan galeri) + watermark koordinat & timestamp otomatis; backend validasi apakah koordinat ada dalam batas wilayah desa.
- **Role-based routing**: 6 role = 6 dashboard berbeda dari satu login system, bukan 6 aplikasi terpisah.

## 5. Pelaporan & Audit (Baru)

- **LPJ Dinamis**: Laporan Pertanggungjawaban kini diinput secara baris-per-baris (item, volume, harga) oleh Kaur Teknis dan tidak boleh melebihi plafon pencairan.
- **Laporan APBDes Otomatis**: Bendahara (Kaur Keuangan) dan Kades dapat melihat agregasi dari seluruh pendapatan desa dan realisasi belanja LPJ yang terakumulasi secara otomatis di menu Pelaporan. Sistem dapat mencetak laporan akhir maupun mengekspornya ke format CSV/Excel.

## 6. Out of Scope (v1)

- Payment gateway ke rekening bank riil (asumsi: pencairan dana = update ledger status, disbursement fisik tetap manual/existing bank process, dicatat referensinya saja) — **perlu dikonfirmasi ke stakeholder desa**.
- Multi-desa/multi-tenant (v1 asumsikan 1 instance = 1 desa).
