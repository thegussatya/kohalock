# Role 2: Sekretaris Desa (Sekdes) / Verifikator Tahap 1

### Sidebar Menu:
*   Dashboard
*   Verifikasi Pengajuan
*   Pantauan Anggaran
*   Inbox Klarifikasi Warga

---

### Rincian Fitur Dashboard:
*   **Total Pengajuan Menunggu:** Dibuat dalam visualisasi kartu metrik (*Card*) berwarna kuning/oranye untuk menandakan tumpukan dokumen yang butuh segera diperiksa.
*   **Total Pengajuan Disetujui (Bulan Ini):** Dibuat dalam visualisasi kartu angka (*Card*) berwarna hijau lengkap dengan total nominal uang yang telah divalidasi.
*   **Tiket Warga Belum Dijawab:** Dibuat dalam visualisasi kartu angka (*Card*) dengan ikon lonceng peringatan (berwarna merah jika ada pesan yang lewat dari 1x24 jam belum dibalas).
*   **Log Aktivitas Terkini (Recent Activity):** Dibuat dalam bentuk visualisasi *Timeline* vertikal sederhana di bagian bawah halaman (Contoh: "Kaur Dusun 1 baru saja mengirim pengajuan Pencairan Termin 2 - 15 Menit yang lalu").
*   **Status Sinkronisasi Node:** Indikator visual berupa ikon lampu LED hijau (Terkoneksi ke Jaringan Blockchain) atau merah (Koneksi Terputus).

---

### Rincian Fitur Verifikasi Pengajuan:
*   **Filter Antrean:** 
    *   Tiga Tab Navigasi Horizontal: "Menunggu Verifikasi", "Telah Diteruskan (Ke Kades)", dan "Dikembalikan (Revisi)".
*   **Tabel Antrean Utama:**
    *   Menampilkan kolom: Tanggal Masuk, Nama Program, Nama Kaur Pengaju, Nominal Pengajuan, dan Tombol **[Periksa Berkas]**.
*   **Halaman Pemeriksaan (Split-View Reviewer - Muncul saat tombol ditekan):**
    *   **Panel Kiri (Data Teknis & Lapangan):**
        *   Rincian Anggaran: Teks *Read-Only* yang membandingkan (Sisa Pagu vs Nominal Diajukan).
        *   Visualisasi Lokasi: *Widget Map* interaktif (Peta) yang langsung menampilkan titik merah (*pin*) dari koordinat GPS foto yang diunggah Kaur Teknis. Ada *preview* foto di atas peta.
        *   Status Keabsahan File (Hash Checker): *Badge* otomatis. Hijau "✅ Dokumen Otentik" atau Merah "🚨 Peringatan: Hash Berbeda / File Dimodifikasi".
    *   **Panel Kanan (Pratinjau Dokumen):**
        *   *PDF Viewer* yang tertanam (*embedded*) langsung di halaman sehingga Sekdes bisa langsung membaca lembar Berita Acara tanpa harus *download* file-nya ke komputer.
*   **Aksi Eksekusi:**
    *   Tombol Hijau **[Verifikasi & Teruskan ke Kades]**: Saat diklik, meminta input PIN/Sandi PKI untuk membubuhkan Tanda Tangan Digital Tahap 1.
    *   Tombol Kuning **[Kembalikan untuk Revisi]**: Saat diklik, akan memunculkan *Pop-up Form* berupa *Textarea* yang mewajibkan Sekdes mengetik alasan penolakan (Contoh: "Foto material kurang jelas, tolong ambil ulang").

---

### Rincian Fitur Pantauan Anggaran (Ledger Read-Only):
*   **Ringkasan Postur Anggaran:**
    *   Visualisasi *Donut Chart* (Grafik Donat) yang membagi total Pagu Musrembang menjadi 3 warna: "Dana Telah Cair" (Hijau), "Dalam Proses Verifikasi" (Kuning), dan "Sisa Kas Belum Terpakai" (Biru/Abu-abu).
*   **Filter Pencarian Anggaran:**
    *   *Dropdown* Filter: Berdasarkan "Nama Dusun", "Kategori Program", atau "Kuartal Pelaksanaan".
*   **Tabel Realisasi per Program:**
    *   Menampilkan daftar seluruh program dengan *Progress Bar* (Bar Persentase) di sebelahnya (Contoh: Pengaspalan Jalan - Progress 50%). 

---

### Rincian Fitur Inbox Klarifikasi Warga:
*   **Daftar Pesan / Keluhan:**
    *   Visualisasi mirip kotak masuk email (*List View*). Di sebelah kiri terdapat *Badge* status: "Menunggu Jawaban" atau "Selesai".
*   **Detail Pesan (Saat pesan diklik):**
    *   Menampilkan ID Tiket anonim, Nama Program yang ditanyakan warga, Waktu pengiriman, dan Teks/Isi keluhan warga.
*   **Formulir Tanggapan:**
    *   *Textarea* berukuran sedang khusus untuk Sekdes mengetik balasan instansi secara formal.
*   **Aksi Eksekusi:**
    *   Tombol Biru **[Kirim Balasan Resmi]**. Sistem akan menampilkan peringatan *Pop-up*: "Jawaban Anda akan dipublikasikan secara terbuka di Dasbor Warga. Lanjutkan?"