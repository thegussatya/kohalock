# Role 1: Kaur Teknis / Operator Desa

### Sidebar Menu:
*   Dashboard
*   Formulir Musrembang (Usulan Baru)
*   Ajukan Pencairan
*   Riwayat Penolakan

---

### Rincian Fitur Dashboard:
*   **Total Pagu Musrembang Tahun Ini:** Dibuat dalam visualisasi kartu metrik (*Card*) dengan ikon brankas/dompet dan angka nominal besar (Mata Uang Rupiah).
*   **Pencairan yang Disetujui:** Dibuat dengan visualisasi *Bar Chart* (Grafik Batang) yang membandingkan total pencairan dari bulan ke bulan.
*   **Pengajuan Pencairan yang Dipending:** Dibuat dalam visualisasi kartu angka (*Card*) berwarna kuning/oranye untuk menandakan dokumen yang masih tertahan di meja Sekdes atau Kades.
*   **Usulan yang Disetujui (Terkunci di Blockchain):** Dibuat dalam bentuk *List* atau tabel ringkas (menampilkan 5 usulan terbaru yang sukses menjadi blok acuan).
*   **Usulan / Pencairan yang Ditolak:** Dibuat dalam visualisasi kartu angka (*Card*) berwarna merah mencolok, yang jika diklik akan langsung mengarah ke halaman "Riwayat Penolakan".

---

### Rincian Fitur Formulir Musrembang:
*   **Identitas Usulan dan Agenda:**
    *   Nama Dusun / Wilayah: Diisi menggunakan *Dropdown* (Pilihan: "Dusun 1", "Dusun 2", "Dusun 3", dst).
    *   Penanggung Jawab Usulan: Teks *Read-Only* (Otomatis terisi dari nama Kaur Teknis yang sedang *login*).
    *   Dokumen Pendukung Musrembang: *Input File* ganda (Hanya menerima PDF).
        *   Unggah Daftar Hadir Warga.
        *   Unggah Notulensi Rapat.
*   **Rincian Usulan Program:**
    *   Judul Usulan: *Input String / Text* (Contoh: "Pengaspalan Jalan Lingkungan").
    *   Kategori Program: *Dropdown* (Pilihan: "Infrastruktur", "Pemberdayaan Masyarakat", "Kesehatan", "Pendidikan", "Bencana & Keadaan Darurat").
    *   Volume Pekerjaan: *Input Number* dipasangkan dengan *Dropdown* Satuan (Contoh: Input `500` - Dropdown `Meter` / `Unit` / `Paket`).
    *   Pagu Anggaran Maksimal: *Input Currency* (Angka otomatis terformat dengan titik ribuan dan awalan Rp).
*   **Aksi Eksekusi:**
    *   Tombol **[Simpan & Kunci ke Blockchain]**. Saat diklik, akan muncul *pop-up* meminta PIN/Password dari Sertifikat Digital (PKI) milik Kaur.

---

### Rincian Fitur Ajukan Pencairan:
*   **Pemilihan Program:**
    *   Pilih Program Terdaftar: *Dropdown Searchable* (Hanya memunculkan program yang sudah disetujui di Formulir Musrembang).
    *   Sisa Pagu Anggaran: Teks *Read-Only* (Angka otomatis muncul dan menyesuaikan saat program di atas dipilih, diambil *real-time* dari *Smart Contract*).
*   **Detail Pencairan Termin:**
    *   Keterangan Pengajuan: *Input String / Textarea* (Contoh: "Pencairan Termin 1 - Belanja Material Batu dan Pasir").
    *   Nominal Pengajuan: *Input Currency* (Jika nominal melebihi "Sisa Pagu Anggaran", *form input* otomatis berubah warna menjadi merah sebagai peringatan awal).
*   **Kelengkapan Berkas Fisik:**
    *   Berita Acara Fisik: *Input File* (Hanya PDF, maksimal 5MB).
    *   Bukti Lapangan / Geotagging: Tombol **[Buka Kamera Aplikasi]**.
        *   *Constraint UI:* Tidak ada opsi "Pilih dari Galeri". Harus menggunakan kamera *native*.
        *   *Overlay UI:* Saat kamera terbuka, layar akan menampilkan teks *watermark* berupa Titik Koordinat (Latitude, Longitude) dan *Timestamp* secara langsung.
*   **Aksi Eksekusi:**
    *   Tombol **[Tanda Tangani & Ajukan]**.

---

### Rincian Fitur Riwayat Penolakan (Auto-Reject Dashboard):
*   **Filter Pencarian:**
    *   Bulan Pengajuan (*Dropdown*).
    *   Jenis Penolakan (*Dropdown*: "Ditolak Sistem/Blockchain", "Dikembalikan oleh Sekdes").
*   **Tabel Riwayat Penolakan:**
    *   Menampilkan kolom: Tanggal, Nama Program, Tahap (Musrembang/Pencairan), dan Status (*Badge*: "Belum Diperbaiki" / "Sudah Diperbaiki").
*   **Detail Penolakan (Saat baris tabel diklik):**
    *   Visualisasi Teks Peringatan: Teks tebal berwarna merah yang menampilkan kode balasan dari sistem.
        *   *Contoh 1:* "ERROR: Nilai pengajuan Rp 150.000.000 melebihi sisa pagu Rp 100.000.000."
        *   *Contoh 2:* "ERROR: Koordinat GPS foto berada di luar batas wilayah desa."
        *   *Contoh 3:* "REVISI SEKDES: Tolong lengkapi tanda tangan ketua RT di Berita Acara."
    *   Tombol **[Perbaiki Pengajuan]**: Mengarahkan Kaur Teknis kembali ke halaman "Ajukan Pencairan" dengan form yang sudah terisi data lama, sehingga Kaur hanya perlu mengganti bagian yang salah.