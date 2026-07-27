# Role 5: Inspektorat / Auditor / APH

### Sidebar Menu:
*   Beranda Forensik (Audit Dashboard)
*   Uji Alat Bukti (Integrity Checker)
*   Kronologi Transaksi (Ledger Explorer)
*   Kotak Masuk Rahasia (Whistleblower Inbox)
*   Ekspor Laporan Hukum

---

### Rincian Fitur Beranda Forensik (Audit Dashboard):
*   **Indikator Sesi Akses (Time-Bound Token):** Visualisasi *Countdown Timer* (Hitung Mundur) besar berwarna merah/kuning di sudut layar yang menunjukkan sisa waktu akses Auditor (Contoh: "Sisa Akses: 12 Jam 45 Menit").
*   **Ringkasan Postur Anggaran:** *Card* metrik angka untuk melihat total perputaran uang desa yang sedang diaudit.
*   **Widget Anomali Otomatis (Red Flags):** 
    *   Visualisasi *List Box* yang otomatis menyorot transaksi mencurigakan. 
    *   Menampilkan transaksi yang berulang kali gagal verifikasi (*auto-reject*) atau log ketika "Tombol Tolak Intervensi" ditekan oleh Kades.

---

### Rincian Fitur Uji Alat Bukti (Integrity Checker):
Fitur "Laboratorium Forensik" untuk mencocokkan dokumen fisik hasil sitaan dengan data asli di *blockchain*.
*   **Pemilih ID Transaksi:** *Search Bar* untuk mencari dan memilih ID Transaksi mana yang ingin diuji buktinya.
*   **Area Unggah Berkas:** 
    *   Kotak *Drag-and-Drop* berukuran besar yang bertuliskan "Tarik & Lepas File Berita Acara (PDF) / Foto di Sini untuk Uji Hash".
*   **Panel Hasil Komparasi (Sistem Keabsahan Otomatis):**
    *   *Kolom Kiri (Dokumen Unggahan):* Menampilkan deret alfanumerik nilai Hash SHA-256 dari file yang baru saja diunggah auditor.
    *   *Kolom Kanan (Ledger On-Chain):* Menampilkan nilai Hash asli yang terkunci di dalam *blockchain* saat hari pencairan.
    *   *Status Badge (Hasil Uji):* 
        *   Hijau (OTENTIK): "Hash Cocok. File sah dan belum dimodifikasi."
        *   Merah (DIMANIPULASI): "Peringatan! Hash Berbeda. File ini telah direkayasa."

---

### Rincian Fitur Kronologi Transaksi (Ledger Explorer):
Modul pelacakan rantai pasok dana (*Follow The Money*).
*   **Bilah Pencarian Canggih (Advanced Filter):** Filter pencarian berdasarkan Nama Program, ID Blok, atau Rentang Tanggal spesifik.
*   **Visualisasi Timeline Blok:**
    *   Bentuk grafis berupa node/titik-titik yang terhubung (*Timeline View*).
    *   Secara berurutan menampilkan: Blok Musrembang ➔ Blok Pengajuan Kaur ➔ Blok Persetujuan Sekdes ➔ Blok Eksekusi Kades.
*   **Detail Metadata Investigasi (Saat blok diklik):**
    *   *Panel Metadata:* Memunculkan informasi *Timestamp* (Waktu presisi hingga milidetik), *Digital Signature* (Tanda Tangan Kriptografi) aktor yang menyetujui, dan *Geolocation* (Koordinat asal *upload*). 

---

### Rincian Fitur Kotak Masuk Rahasia (Whistleblower Inbox):
Ruang isolasi khusus untuk membuka laporan dari warga yang terenkripsi E2EE. (Aparat desa tidak bisa melihat halaman ini).
*   **Daftar Laporan Terenkripsi:** Tabel sederhana berisi ID Tiket Laporan dan Tanggal Masuk (semua judul/isi teks masih berupa karakter acak/tersandi).
*   **Formulir Dekripsi:** 
    *   *Input Password / Private Key:* Kolom khusus di mana Auditor wajib memasukkan Kunci Privat (*Private Key*) milik instansi Inspektorat.
    *   Tombol **[Buka Gembok Laporan]**.
*   **Panel Bukti Laporan (Setelah gembok dibuka):**
    *   Menampilkan teks murni berupa kronologi laporan dari warga dan *Thumbnail* foto/dokumen rahasia yang dilampirkan warga untuk diunduh auditor.

---

### Rincian Fitur Ekspor Laporan Hukum (Legal Export):
*   **Pemilih Modul Ekspor:**
    *   *Checkbox* List untuk memilih rentang data mana saja yang ingin diekspor (Contoh: "Pilih Proyek Pengaspalan Jalan Dusun 2 Termin 1 hingga 3").
*   **Aksi Eksekusi Forensik:**
    *   Tombol **[Unduh Log Bukti (PDF Bersegel Digital)]**: Menghasilkan dokumen resmi untuk dilampirkan dalam Berita Acara Pemeriksaan (BAP) pengadilan.
    *   Tombol **[Unduh Data Mentah (JSON/CSV)]**: Mengekspor baris *database/ledger* mentah untuk keperluan analisis lanjutan menggunakan *software* audit eksternal.