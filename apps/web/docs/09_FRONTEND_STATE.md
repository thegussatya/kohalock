# Status Implementasi Frontend: KOHALOCK

Dokumen ini adalah ringkasan struktur *frontend* (React + Tailwind) berdasarkan pembacaan langsung dari basis kode aktual (bukan asumsi). Segala data di sini mencerminkan state terakhir aplikasi per 24 Juli 2026.

## 1. Peta Rute & Modul (7 Role)

Berdasarkan `src/app/router.tsx`, terdapat **71 route aktif** yang dikelompokkan ke dalam 1 rute autentikasi dan 7 role terpisah. Seluruh *placeholder* generik telah dibersihkan; 100% halaman sudah memiliki komponen UI yang fungsional (beberapa halaman notifikasi dan profil meng-reuse `SharedNotificationsPage` dan `SharedProfilePage`).

### Global / Autentikasi
- `/login` - Halaman Login

### Role 1: Kaur Teknis (Pelaksana Kegiatan)
- `/kaur-teknis` - Dashboard
- `/kaur-teknis/formulir-musrembang` - Formulir Musrembang
- `/kaur-teknis/program-saya` - Program Saya
- `/kaur-teknis/program-saya/:id` - Detail Program
- `/kaur-teknis/ajukan-pencairan` - Ajukan Pencairan
- `/kaur-teknis/riwayat-penolakan` - Riwayat Penolakan
- `/kaur-teknis/notifikasi` - Notifikasi
- `/kaur-teknis/profil` - Profil
- `/kaur-teknis/bantuan` - Bantuan

### Role 2: Sekretaris Desa (Verifikator)
- `/sekdes` - Dashboard
- `/sekdes/verifikasi` - Verifikasi Pengajuan
- `/sekdes/verifikasi/:id` - Detail Review
- `/sekdes/riwayat-verifikasi` - Riwayat Verifikasi
- `/sekdes/pantauan-anggaran` - Pantauan Anggaran
- `/sekdes/klarifikasi` - Inbox Klarifikasi Warga
- `/sekdes/notifikasi` - Notifikasi
- `/sekdes/profil` - Profil
- `/sekdes/bantuan` - Bantuan

### Role 3: Kepala Desa (Otorisator Final)
- `/kades` - Dashboard
- `/kades/persetujuan-pencairan` - Persetujuan Pencairan
- `/kades/riwayat-otorisasi` - Riwayat Otorisasi
- `/kades/persetujuan-pencairan/:id` - Detail Otorisasi
- `/kades/perisai-integritas` - Perisai Integritas
- `/kades/klarifikasi-publik` - Pusat Klarifikasi Publik
- `/kades/analitik-klarifikasi` - Analitik Klarifikasi
- `/kades/pengaturan` - Pengaturan & Kredensial
- `/kades/notifikasi` - Notifikasi
- `/kades/profil` - Profil
- `/kades/bantuan` - Bantuan

### Role 4: Publik / Warga (Transparansi)
- `/publik` - Beranda
- `/publik/proyek` - Pantau Proyek
- `/publik/proyek/:id` - Detail Proyek
- `/publik/lapor-rahasia` - Lapor Rahasia (Whistleblower)
- `/publik/klarifikasi` - Klarifikasi
- `/publik/notifikasi` - Notifikasi
- `/publik/profil` - Profil
- `/publik/bantuan` - Bantuan

### Role 5: Auditor / APH (Investigasi)
- `/auditor` - Beranda Forensik
- `/auditor/kasus` - Manajemen Kasus
- `/auditor/uji-bukti` - Uji Alat Bukti
- `/auditor/ledger` - Kronologi Transaksi (Telah dilengkapi dengan tahap ke-4 Eksekusi Kaur Keuangan)
- `/auditor/kotak-rahasia` - Kotak Masuk Rahasia
- `/auditor/ekspor-laporan` - Ekspor Laporan Hukum (Paket Bukti Audit Terpadu)
- `/auditor/template-laporan` - Template Laporan
- `/auditor/notifikasi` - Notifikasi
- `/auditor/profil` - Profil
- `/auditor/bantuan` - Bantuan

### Role 6: BPD & Tokoh Adat (Pengawasan Sosial)
- `/bpd-adat` - Beranda Pengawasan
- `/bpd-adat/pantauan-transaksi` - Pantauan Transaksi (Telah ditambah kolom Status Eksekusi Kaur Keuangan)
- `/bpd-adat/resolusi-adat` - Papan Resolusi Adat
- `/bpd-adat/kalender-musyawarah` - Kalender Musyawarah
- `/bpd-adat/arsip` - Arsip Pengawasan & Etik
- `/bpd-adat/laporan-tahunan` - Laporan Tahunan
- `/bpd-adat/pengaturan` - Pengaturan Akun
- `/bpd-adat/notifikasi` - Notifikasi
- `/bpd-adat/profil` - Profil
- `/bpd-adat/bantuan` - Bantuan

### Role 7: Kaur Keuangan / Bendahara (Eksekutor & Penatausahaan)
*(Modul ini ditambahkan pada tahap adendum, menjadi langkah final pada alur pengeluaran kas).*
- `/kaur-keuangan` - Dashboard (Dilengkapi Timeline Aktivitas Terbaru)
- `/kaur-keuangan/antrean-eksekusi` - Antrean Eksekusi
- `/kaur-keuangan/buku-kas-umum` - Buku Kas Umum
- `/kaur-keuangan/buku-bank` - Buku Bank
- `/kaur-keuangan/buku-pajak` - Buku Pajak
- `/kaur-keuangan/penutupan-buku` - Penutupan Buku Bulanan
- `/kaur-keuangan/laporan` - Laporan Realisasi & LPJ
- `/kaur-keuangan/koreksi` - Transaksi Koreksi
- `/kaur-keuangan/arsip` - Arsip Buku Terkunci
- `/kaur-keuangan/pengaturan` - Pengaturan & Kredensial
- `/kaur-keuangan/bantuan` - Bantuan
- `/kaur-keuangan/notifikasi` - Notifikasi (Reusable)
- `/kaur-keuangan/profil` - Profil (Reusable)

**Detail Alur Kerja Kaur Keuangan:**
1. **Antrean Eksekusi**: Kaur Keuangan menerima dokumen yang **sudah diotorisasi** oleh Kades. (Persetujuan Kades tidak lagi bermakna eksekusi tunai, melainkan otorisasi hukum/formal).
2. **Penatausahaan (Buku Kas, Bank, Pajak)**: Transaksi dicatat ke BKU, kemudian mutasi bank dicocokkan (rekonsiliasi) di Buku Bank, dan pajak yang dipungut/disetor dicatat di Buku Pajak.
3. **Penutupan Buku Bulanan (Hash-Lock)**: Setiap akhir bulan, ketiga buku diverifikasi kelengkapannya, dan ditutup/dikunci menggunakan hash kriptografi SHA-256 (saat ini simulasi visual di `MonthlyClosingPage.tsx`).
4. **Koreksi Transaksi**: Data bulan lalu yang sudah dikunci tidak bisa diubah langsung. Jika ada salah catat, dilakukan lewat *Transaksi Pembalik* (Koreksi) yang mengkristalkan jejak audit baru.
5. **Pelaporan & Arsip**: Laporan Realisasi Anggaran dan LPJ digenerate dari akumulasi buku bulanan. File hash dan data *immutable* disimpan di *Arsip Buku Terkunci*.

Penyempurnaan juga telah dilakukan di role pengawasan:
- **Ledger Explorer (Auditor)** telah diperbarui sehingga jejak audit secara konsisten menampakkan 4 tahap: `Pengajuan (Kaur)` -> `Verifikasi (Sekdes)` -> `Otorisasi (Kades)` -> `Eksekusi (Kaur Keuangan)`.
- **Legal Export (Auditor)** sekarang memproduksi satu bundel utuh bernama "Paket Bukti Audit Terpadu".
- **Transaction Monitoring (BPD)** sudah ditambahkan kolom pemantauan untuk status dari tahap Kaur Keuangan.

## 2. Pustaka Komponen Shared

Terdapat 12 komponen di `src/components/` yang digunakan lintas halaman untuk konsistensi desain dan mempercepat *development*:
1. `BackLink.tsx`
2. `Badge.tsx`
3. `BudgetDonutChart.tsx`
4. `DataTable.tsx`
5. `GeotagCameraCapture.tsx`
6. `HashCheckerBadge.tsx`
7. `MapWidget.tsx`
8. `MetricCard.tsx` (telah dilengkapi tipe `info` berwarna *teal*)
9. `MonthlyBarChart.tsx`
10. `PageHeader.tsx`
11. `RoleLayout.tsx` (Komponen *layouting* dan pembungkus *topbar* serta *sidebar* tiap role)
12. `Topbar.tsx`

Terdapat juga folder `src/features/shared/` berisi *page components* (`NotificationsPage.tsx`, `ProfilePage.tsx`, dan `HelpPage.tsx`) yang dipakai bersama-sama di seluruh role.

## 3. Catatan Integritas Halaman & Fitur Placeholder

- 100% halaman *route* sekarang **SUDAH** terhubung dengan tata letak UI riil.
- **TIDAK ADA LAGI** sisa teks *placeholder* generik tertinggal (seperti *"Halaman ini akan dikembangkan..."*) baik secara parsial maupun keseluruhan.
- Pembersihan terakhir dilakukan dengan menyambungkan notifikasi & profil Kaur Keuangan agar mengimpor dari `src/features/shared/`, dan membarui dashboard Kaur Keuangan dengan widget Aktivitas Terbaru.

## 4. Yang Masih Dummy / Belum Terhubung Backend

Seluruh UI saat ini bergantung sepenuhnya pada data statis / variabel `dummy` *hardcode* dalam komponen React. Fitur fungsional ini menanti integrasi ke *backend*/API:
- **Filter & Search**: UI pencarian (*topbar*, *ledger*) sudah interaktif merespons input `value`, tapi data yang difilter adalah _array state_ lokal. Global Topbar Search tidak benar-benar disalurkan lintas halaman.
- **Autentikasi**: *Login form* tidak mengecek ke database; siapa saja bisa masuk jika menekan tombol (meski UI sudah memperlihatkan pemisahan role dengan baik).
- **Proses Kriptografis (Hash Lock)**: Pada modul *Penutupan Buku Bulanan* (Kaur Keuangan) atau *Perisai Integritas* (Kades), komputasi SHA-256 yang terlihat di UI hanyalah berupa *mockup* simulasi *timeout* (delay pura-pura) dan deretan karakter heksadesimal statis, belum dilakukan _hashing_ aktual dari JSON *payload* di server.
- **Tanda Tangan Digital**: Modal input PIN hanya pengecekan string biasa, tidak terhubung dengan *Public Key Infrastructure* asli.
- **Paket Bukti Audit Terpadu**: Tombol "Unduh" saat ini baru merender pop-up _Alert_, belum men-generate file `.zip` fisik.

---
**Ringkasan Akhir:**
- **Total Halaman (Routes):** 71 rute.
- **Total Role:** 7 Role (+1 Global Login).
- **Status UI:** 100% Lengkap (Bebas Placeholder).
