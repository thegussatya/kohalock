# KOHALOCK — Feature & UI Expansion Brief

> Dokumen ini untuk kebutuhan GENERATE UI DI TOOL LAIN. Berisi analisis
> kekurangan fitur pada kondisi frontend saat ini (lihat konteks di
> `09_FRONTEND_STATE.md`) dibanding standar web dashboard modern, plus
> daftar fitur/komponen UI konkret yang perlu ditambahkan per role.
> Setiap item ditulis selengkap mungkin (layout, komponen, data yang
> ditampilkan, interaksi) supaya bisa langsung dipakai sebagai prompt
> ke AI generate-UI tanpa perlu konteks tambahan.

## Konteks Produk (untuk AI yang belum familiar)

KOHALOCK adalah platform transparansi dana desa berbasis blockchain
dengan 6 peran pengguna: Kaur Teknis (operator input), Sekdes
(verifikator), Kades (otorisator final), Publik (warga), Auditor
(pengawas eksternal/hukum), BPD & Tokoh Adat (pengawas internal &
etik). Desain visual: minimalis modern gaya dashboard fintech,
warna dominan biru (#00AEEF hingga #2B3990) dan putih, font Plus
Jakarta Sans, card putih rounded dengan shadow lembut, sidebar kiri +
topbar atas.

## Masalah Umum: Kenapa Terasa "Kosong"

Kondisi saat ini tiap role rata-rata hanya punya 4-5 halaman dengan 1
fungsi utama per halaman. Dashboard modern pada umumnya punya elemen
tambahan yang membuat halaman terasa "hidup" dan informatif meski
belum ada aktivitas baru:

1. **Activity feed/timeline** yang lebih kaya (bukan cuma di 1-2
   halaman) — riwayat aksi lintas fitur, bukan cuma per modul
2. **Quick actions** — shortcut aksi umum langsung dari dashboard
   (tanpa harus ke menu tertentu dulu)
3. **Search & filter yang benar-benar berfungsi** — saat ini search
   bar di Topbar cuma UI kosong tanpa hasil
4. **Empty state yang informatif** — bukan cuma "Tidak ada data"
5. **Insight/analytics ringan** — perbandingan periode, tren
6. **Help/Support center** — tidak ada satupun role yang punya ini
7. **Halaman daftar/arsip yang lebih detail** (list semua item milik
   user, bukan cuma yang sedang pending)

Bagian di bawah ini merinci fitur tambahan per role berdasarkan
kekosongan ini.

---

## 1. Kaur Teknis

### Kondisi Saat Ini
Dashboard (3 metric card + bar chart), Formulir Musrembang, Ajukan
Pencairan, Riwayat Penolakan. Total 4 halaman.

### Fitur Baru yang Perlu Ditambahkan

**A. Halaman "Daftar Program Saya" (baru)**
- Route: `/kaur-teknis/program-saya`
- List/grid card semua program Musrembang yang pernah diusulkan Kaur
  ini (bukan cuma yang aktif di dropdown pencairan)
- Tiap card: nama program, kategori (badge warna), status (Aktif/
  Selesai/Ditolak), progress bar realisasi dana, sisa pagu
- Filter: dropdown kategori, dropdown status, search bar nama
  program
- Klik card → halaman detail program (baru juga): riwayat semua
  termin pencairan untuk program itu, timeline status per termin

**B. Widget "Aktivitas Terbaru" di Dashboard (perluasan)**
- Timeline vertikal (mirip yang sudah ada di role lain) tapi berisi
  gabungan semua aktivitas Kaur ini: submit usulan, submit
  pencairan, revisi diterima, dll — bukan cuma metric statis

**C. Widget "Tugas Mendesak" di Dashboard (baru)**
- Card khusus menonjol (border kuning/oranye) berisi list singkat:
  "2 pengajuan perlu revisi", "1 program mendekati akhir tahun
  anggaran, sisa pagu belum terpakai" — dengan tombol aksi langsung
  ke halaman terkait

**D. Halaman "Bantuan/Panduan" (baru, shared pattern semua role)**
- Route: `/kaur-teknis/bantuan`
- Accordion FAQ (5-6 pertanyaan umum: cara upload geotag, kenapa
  pengajuan ditolak, dll), plus kontak/link ke Sekdes jika butuh
  bantuan langsung

---

## 2. Sekdes

### Kondisi Saat Ini
Dashboard, Verifikasi Pengajuan (+ Split-View Reviewer), Pantauan
Anggaran, Inbox Klarifikasi. Total 5 halaman.

### Fitur Baru yang Perlu Ditambahkan

**A. Widget "Statistik Kinerja Verifikasi" di Dashboard (baru)**
- Card metrik tambahan: "Rata-rata Waktu Verifikasi" (misal "1.2
  hari"), "Tingkat Approval" (persentase disetujui vs revisi)
- Mini bar chart perbandingan bulan ini vs bulan lalu

**B. Bulk Action di Halaman Verifikasi Pengajuan (perluasan)**
- Tambahkan checkbox di tiap baris tabel antrean
- Toolbar muncul saat ada yang dicentang: tombol "Verifikasi Semua
  yang Dipilih" (dengan modal konfirmasi ringkas)

**C. Halaman "Riwayat Verifikasi Saya" (baru)**
- Route: `/sekdes/riwayat-verifikasi`
- Tabel lengkap semua keputusan yang pernah dibuat Sekdes ini
  (approve/revisi), dengan filter tanggal & search nama program,
  bisa export ke CSV

**D. Notifikasi Deadline di Dashboard (baru)**
- Card peringatan: "3 pengajuan sudah menunggu >3 hari, segera
  ditinjau" dengan link langsung ke antrean terfilter

---

## 3. Kades

### Kondisi Saat Ini
Dashboard, Persetujuan Pencairan (+detail), Perisai Integritas,
Pusat Klarifikasi Publik, Pengaturan. Total 5 halaman.

### Fitur Baru yang Perlu Ditambahkan

**A. Widget "Ringkasan Eksekutif Tahunan" di Dashboard (perluasan)**
- Card besar: total dana terserap tahun ini vs target, dengan
  progress ring/donut
- Perbandingan performa antar dusun (mini bar chart horizontal,
  ranking dusun mana yang realisasinya paling tinggi/rendah)

**B. Halaman "Riwayat Otorisasi" (baru)**
- Route: `/kades/riwayat-otorisasi`
- Tabel semua pencairan yang pernah di-approve Kades ini, dengan
  filter dusun/kategori/tanggal, total nominal per periode

**C. Halaman "Analitik Klarifikasi Publik" (baru)**
- Route: `/kades/analitik-klarifikasi`
- Chart topik pertanyaan warga yang paling sering muncul (bar chart
  kategori keluhan), tingkat respon time rata-rata aparat desa

**D. Widget "Kalender Jatuh Tempo" di Dashboard (baru)**
- Mini calendar/list menampilkan tanggal-tanggal penting: akhir
  termin, tenggat laporan triwulan, dll

---

## 4. Publik

### Kondisi Saat Ini
Beranda, Pantau Proyek (+detail), Klarifikasi, Lapor Rahasia. Total
4 halaman.

### Fitur Baru yang Perlu Ditambahkan

**A. Filter & Search Berfungsi di Beranda/Pantau Proyek (perluasan)**
- Search bar yang benar-benar memfilter list card berdasarkan nama/
  kategori, plus filter dropdown dusun & status (Berjalan/Selesai)

**B. Halaman "Pusat Bantuan Warga" (baru)**
- Route: `/publik/bantuan`
- Accordion FAQ istilah awam ("Apa itu Pagu?", dll — sesuai spec asli
  yang sudah disebut tapi belum jadi halaman sendiri), plus panduan
  cara menggunakan fitur Lapor Rahasia

**C. Fitur "Ikuti Proyek Ini" di Halaman Detail Proyek (baru)**
- Tombol bell/subscribe di halaman detail proyek — warga bisa
  "follow" 1 proyek untuk mendapat notifikasi progres (masuk ke
  halaman Notifikasi milik user itu)

**D. Widget "Statistik Transparansi Desa" di Beranda (baru)**
- Card kecil menampilkan angka membanggakan: "X% dana desa sudah
  transparan on-chain", "Y proyek selesai tahun ini", "Z laporan
  warga sudah ditindaklanjuti" — untuk membangun kepercayaan publik

**E. Tombol "Unduh Laporan Transparansi" di Beranda (baru)**
- Generate PDF ringkasan realisasi anggaran desa untuk periode
  tertentu, bisa diunduh warga

---

## 5. Auditor

### Kondisi Saat Ini
Beranda Forensik, Uji Alat Bukti, Kronologi Transaksi, Kotak Masuk
Rahasia, Ekspor Laporan Hukum. Total 5 halaman.

### Fitur Baru yang Perlu Ditambahkan

**A. Halaman "Manajemen Kasus Investigasi" (baru)**
- Route: `/auditor/kasus`
- Kanban board (To Investigate / In Progress / Closed) untuk
  mengelola kasus yang sedang diselidiki, tiap kartu kasus terhubung
  ke 1+ transaksi/laporan whistleblower terkait

**B. Widget "Tren Anomali" di Beranda Forensik (perluasan)**
- Line/bar chart jumlah red flag per bulan (6 bulan terakhir) —
  untuk melihat apakah tren membaik/memburuk

**C. Halaman "Pustaka Template Laporan" (baru)**
- Route: `/auditor/template-laporan`
- List template dokumen forensik standar yang bisa dipakai ulang
  (BAP, surat panggilan klarifikasi, dll) — card dengan tombol
  "Gunakan Template"

**D. Filter Lanjutan di Kronologi Transaksi (perluasan)**
- Tambahkan filter by aktor (nama Kaur/Sekdes/Kades tertentu), by
  range nominal, dan opsi "Hanya tampilkan yang di-flag"

---

## 6. BPD & Tokoh Adat

### Kondisi Saat Ini
Beranda Pengawasan, Pantauan Transaksi, Papan Resolusi Adat, Arsip,
Pengaturan Akun. Total 5 halaman.

### Fitur Baru yang Perlu Ditambahkan

**A. Halaman "Kalender Musyawarah" (baru, khusus Tokoh Adat)**
- Route: `/bpd-adat/kalender-musyawarah`
- Tampilan kalender bulanan menampilkan jadwal sidang/musyawarah
  adat yang akan datang, klik tanggal untuk lihat detail kasus
  terkait

**B. Widget "Skor Kepatuhan Desa" di Beranda Pengawasan (baru)**
- Card metrik: jumlah catatan pengawasan yang direspon aparat desa
  vs diabaikan (persentase responsivitas)

**C. Thread Komentar di Catatan Pengawasan (perluasan)**
- Di halaman Pantauan Transaksi, tiap catatan pengawasan yang sudah
  dikirim bisa dibalas oleh Kades/Sekdes — tampilkan sebagai thread
  kecil (bukan cuma kirim 1 arah)

**D. Halaman "Laporan Evaluasi Tahunan" (baru)**
- Route: `/bpd-adat/laporan-tahunan`
- Ringkasan otomatis (dari data Arsip yang sudah ada) untuk bahan
  rapat evaluasi Kades — chart jumlah catatan per kuartal, jumlah
  kasus adat terselesaikan, tombol export PDF

---

## Fitur Lintas-Role Tambahan (Berlaku Semua Role)

1. **Search bar Topbar benar-benar berfungsi** — saat ini cuma
   dekorasi. Idealnya: search global yang mencari di seluruh data
   milik role tsb (nama program, ID transaksi, nama pelapor, dst),
   hasil muncul sebagai dropdown suggestion saat mengetik.

2. **Halaman Bantuan/Panduan per role** — pola sama seperti disebut
   di Kaur Teknis & Publik, terapkan versi masing-masing untuk
   Sekdes, Kades, Auditor, BPD-Adat.

3. **Dark mode toggle** — opsional, bisa di halaman Pengaturan/
   Profil, biar terasa lebih lengkap sebagai produk (prioritas
   rendah, boleh dilewati kalau waktu terbatas).

4. **Onboarding tour untuk first-time user** — highlight/tooltip
   singkat menunjukkan fitur utama saat pertama kali login (relevan
   karena target user proposal adalah aparat desa yang belum tentu
   melek teknologi).

---

## Panduan untuk AI Generate-UI

Saat memakai brief ini untuk generate UI:
- Semua fitur baru harus mengikuti design system yang sudah ada
  (warna brand biru #00AEEF-#2B3990, font Plus Jakarta Sans, card
  putih rounded-2xl shadow-sm) — JANGAN membuat gaya visual baru
  yang berbeda dari halaman existing.
- Semua fitur baru tetap dalam struktur RoleLayout (sidebar kiri +
  topbar atas) yang sudah ada — bukan halaman standalone terpisah.
- Prioritaskan fitur yang ditandai "(baru)" untuk halaman, dan
  "(perluasan)" untuk menambah elemen ke halaman yang sudah ada.
