# Role 6: BPD & Tokoh Adat / Pengawas Internal & Etik

### Sidebar Menu:

- Beranda Pengawasan (Dashboard Bersama)
- Pantauan Transaksi (Khusus BPD)
- Papan Resolusi Adat (Khusus Tokoh Adat)
- Arsip Pengawasan & Etik
- Pengaturan Akun

---

### Rincian Fitur Beranda Pengawasan (Dashboard Bersama):

- **Hero Card Kinerja Desa:** Visualisasi berupa angka persentase total program yang sudah berjalan dibandingkan dengan target tahunan Musrembang.
- **Widget Status Keamanan (Flags):** _Card_ peringatan otomatis jika ada transaksi yang mendapat label "Ditolak Sistem" atau "Tombol Darurat Ditekan Kades".
- **Aktivitas Terkini (Timeline Beranda):** Menampilkan daftar log campuran secara kronologis (Contoh: "Kades mencairkan Termin 1", disusul "Tokoh Adat mencatat Resolusi Sengketa Dusun 2").

---

### Rincian Fitur Pantauan Transaksi (Khusus BPD):

Antarmuka ini murni bersifat _Read-Only_ (Tidak ada tombol setuju/tolak/cairkan), khusus untuk _check and balance_.

- **Tabel Ledger Pengawasan:** Menampilkan daftar pengajuan pencairan dari Kaur yang telah/sedang diproses.
- **Halaman Detail Transaksi (Saat baris diklik):**
  - _Pratinjau Bukti:_ Menampilkan foto _geotag_ dan _embedded_ PDF Berita Acara yang sama persis dengan yang dilihat Sekdes/Kades.
- **Panel Evaluasi Kinerja (Catatan Pengawasan):**
  - _Input Textarea:_ Kolom teks khusus di bagian bawah halaman detail transaksi.
  - _Aksi Eksekusi:_ Tombol Kuning **[Tambah Catatan Pengawasan]**.
  - _Output:_ Saat diklik, catatan ini tidak menunda/mengunci transaksi di _blockchain_, melainkan akan terkirim sebagai "Bendera Peringatan" (Notifikasi) yang langsung muncul di layar Kades dan Sekdes sebagai bentuk teguran/saran resmi BPD (Contoh: _"Progres fisik terlihat lambat, mohon cek ulang kontraktornya"_).

---

### Rincian Fitur Papan Resolusi Adat (Khusus Tokoh Adat):

Modul manajemen kasus untuk menjaga penerapan nilai budaya _Kohanu_ (rasa malu untuk berbuat tercela) dan keharmonisan desa.

- **Papan Kasus (Kanban / List View):**
  - Menampilkan daftar sengketa warga atau indikasi pelanggaran etik aparatur dengan _Badge_ status: "Sedang Musyawarah" (Kuning) atau "Selesai/Mufakat" (Hijau).
- **Formulir Keputusan Adat (Case Entry):**
  - _Input Teks Multi (Tags):_ Nama Pihak Terlibat / Terlapor.
  - _Dropdown Kategori:_ Jenis Indikasi Pelanggaran (Contoh: "Pelanggaran Integritas Aparat", "Sengketa Batas Tanah", "Perselisihan Warga").
  - _Input Textarea (Besar):_ Kolom "Keputusan Resolusi Adat" untuk mengetik hasil musyawarah dan sanksi moral/sosial yang disepakati.
- **Aksi Eksekusi:**
  - Tombol **[Simpan Keputusan Adat]**. Data akan dikunci di _database_ relasional desa sebagai rekam jejak.

---

### Rincian Fitur Arsip Pengawasan & Etik:

Berfungsi sebagai perpustakaan digital atau yurisprudensi (referensi sejarah penyelesaian masalah di desa).

- **Dua Tab Navigasi Horizontal:**
  - **Tab Histori BPD:** Menampilkan tabel seluruh "Catatan Pengawasan" yang pernah diketik oleh BPD sejak awal tahun hingga akhir tahun. (Bisa diekspor ke Excel/PDF untuk bahan rapat tahunan evaluasi Kades).
  - **Tab Histori Adat:** Menampilkan arsip lengkap dokumen penyelesaian sengketa (Resolusi Adat) yang bisa dicari menggunakan _Search Bar_.

---

### Rincian Fitur Pengaturan Akun:

- **Profil Pengawas:** Teks _Read-Only_ menampilkan Nama, Jabatan (Ketua BPD / Ketua Lembaga Adat).
- **Manajemen Kredensial:**
  - Formulir sederhana untuk memperbarui Kata Sandi (Password) atau alamat Email pemulihan.
- **Aksi Keluar:** Tombol merah **[Logout]** untuk keluar dari sistem.
