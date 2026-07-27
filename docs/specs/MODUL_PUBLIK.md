# Role 4: Masyarakat / Pengawas Publik

### Navigasi (Top Navbar / Bottom Bar):
*   🏠 **Beranda** (Ringkasan Anggaran)
*   🏗️ **Pantau Proyek** (Galeri & Progres)
*   📢 **Klarifikasi** (Tanya Jawab)
*   🕵️ **Lapor Rahasia** (Whistleblower)

---

### Rincian Fitur Beranda (Ringkasan Anggaran):
*   **Hero Card:** Menampilkan "Dana Desa Tahun Ini" dalam angka besar dan mudah dibaca, dengan *Progress Bar* melingkar yang menunjukkan persentase total realisasi dana di seluruh desa.
*   **Peta Desa Interaktif:** Visualisasi sederhana lokasi dusun. Jika salah satu dusun diklik, akan muncul daftar proyek yang sedang berjalan di dusun tersebut.
*   **Panduan Warga:** Ikon kecil bertanda tanya `(?)` yang jika diklik memunculkan *pop-up* sederhana: "Apa itu Pagu?", "Apa itu Realisasi?", dan "Apa itu Dana Cair?" menggunakan bahasa awam.

---

### Rincian Fitur Pantau Proyek (Galeri & Progres):
*   **Search Bar:** Kolom pencarian untuk mencari nama program (Contoh: "Jalan", "Drainase", "Posyandu").
*   **List Card Proyek:** 
    *   Setiap kartu proyek menampilkan: Judul Proyek, Status (Sedang Berjalan / Selesai), dan *Progress Bar* (0-100%).
*   **Halaman Detail Proyek (Saat Kartu Proyek diklik):**
    *   **Galeri Foto:** *Slider* foto lapangan yang memiliki label "Waktu Foto" dan "Lokasi" (Menampilkan metadata geotag secara transparan).
    *   **Transparansi Dana:** Menampilkan Anggaran vs Dana yang sudah cair (Termin 1, 2, dst).
    *   **Tombol Interaksi:** Tombol **[Tanya Tentang Proyek Ini]** yang akan mengarah ke menu Klarifikasi.

---

### Rincian Fitur Klarifikasi (Tanya Jawab):
*   **List Diskusi Publik:** Menampilkan daftar pertanyaan warga yang sudah pernah dijawab oleh aparat desa.
*   **Formulir Pertanyaan Baru:** 
    *   *Input:* Nama (Opsional/Bisa Anonim), Pertanyaan/Keluhan.
    *   *Aksi:* Tombol **[Kirim Pertanyaan]**.
*   **Status Balasan:** Menampilkan *badge* "Dijawab oleh Sekdes" atau "Menunggu Jawaban" pada setiap pertanyaan agar warga tahu keluhannya diproses.

---

### Rincian Fitur Lapor Rahasia (Whistleblower):
Menu ini dirancang dengan gaya "Kotak Pos Rahasia" yang aman dan terenkripsi.
*   **Banner Keamanan:** Teks besar dan jelas: "Identitas Anda dijamin aman & terlindungi oleh sistem enkripsi."
*   **Formulir Laporan:** 
    *   *Input Textarea:* Kronologi kejadian (apa yang terjadi, siapa pelakunya).
    *   *Input File:* Unggah bukti foto/dokumen (Maksimal 3 file).
    *   *Aksi:* Tombol **[Kirim Laporan Anonim]**.
*   **Fitur Pelacak Tiket (Ticket Tracker):**
    *   *Input:* Kotak untuk memasukkan "Kode Tiket" (didapatkan setelah mengirim laporan).
    *   *Hasil:* Menampilkan status laporan (Contoh: "Laporan diterima oleh Inspektorat", "Sedang dalam verifikasi bukti").

---

### Rincian Tambahan:
*   **Akses QR Code:** Aplikasi menyediakan fitur *scan* QR code yang bisa langsung ditempel di setiap papan proyek fisik di lapangan. Saat di-scan, warga langsung diarahkan ke **Halaman Detail Proyek** yang bersangkutan.
*   **Tombol "Bagikan":** Ikon *share* di setiap halaman agar warga bisa dengan mudah membagikan link transparansi ke WhatsApp atau media sosial jika mereka merasa ada proyek yang perlu "dijaga" bersama.