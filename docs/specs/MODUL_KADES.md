# Role 3: Kepala Desa (Kades) / Otorisator Final

### Sidebar Menu:
*   Dashboard (Executive)
*   Persetujuan Pencairan
*   Perisai Integritas (Log Intervensi)
*   Pusat Klarifikasi Publik
*   Pengaturan & Kredensial

---

### Rincian Fitur Dashboard (Executive):
*   **Total Sisa Kas Desa:** Dibuat dalam visualisasi kartu metrik (*Card*) berukuran besar di bagian atas dengan nominal Rupiah (hijau) yang ditarik langsung secara *real-time* dari *Smart Contract*.
*   **Menunggu Otorisasi Final:** Dibuat dalam visualisasi kartu angka (*Card*) berwarna peringatan (kuning/oranye) yang menunjukkan berapa dokumen yang siap dieksekusi hari ini.
*   **Grafik Penyerapan Anggaran:** Visualisasi *Bar Chart* (Grafik Batang) yang menampilkan target penyerapan dana vs realisasi aktual per kuartal.
*   **Widget Peringatan BPD (Notifikasi Internal):** Sebuah panel khusus (*List View*) berbingkai merah/kuning yang memunculkan log "Catatan Pengawasan" dari BPD jika ada proyek yang dikritisi.

---

### Rincian Fitur Persetujuan Pencairan (Antrean Final):
*   **Tabel Antrean Eksekusi:**
    *   Menampilkan kolom ringkas: Tanggal, Nama Program, Dusun, Nominal, dan *Badge* Status Verifikasi ("✅ Sekdes Valid").
*   **Halaman Detail (Saat baris tabel diklik):**
    *   *Panel Ringkasan Pemeriksaan:* Teks *Read-Only* yang menampilkan rangkuman dari tahapan sebelumnya (Tidak perlu PDF lengkap, cukup konfirmasi: "Bukti Foto: Ada & Valid", "Status Dokumen: Otentik").
    *   *Log Persetujuan (Chain of Trust):* Menampilkan *Timeline* kecil yang memuat nama Kaur dan nama Sekdes beserta jam/tanggal mereka membubuhkan tanda tangan.
*   **Aksi Eksekusi Utama:**
    *   Tombol Besar Hijau **[Cairkan Dana (Tanda Tangan Final)]**. Saat diklik, sistem akan meminta input PIN/Sandi PKI Kades untuk mengeksekusi perpindahan dana secara absolut ke dalam *ledger blockchain*.

---

### Rincian Fitur Perisai Integritas (Log Intervensi):
Fitur khusus sebagai alat perlindungan hukum dan politik bagi Kepala Desa.
*   **Tombol Darurat (Panic Button):**
    *   Visualisasi tombol besar berwarna **Merah Mencolok** dengan tulisan **[Tolak Intervensi Non-Prosedural]** di bagian paling atas halaman.
    *   *Constraint UI:* Saat diklik, akan memunculkan *Modal Konfirmasi* berlapis (menghindari ketidaksengajaan) dengan teks peringatan: *"Anda akan mengunci pos dana ini sementara. Tindakan ini akan dicatat permanen di Blockchain."*
*   **Tabel Riwayat Penolakan Sistemik:**
    *   Menampilkan daftar log kapan saja tombol darurat digunakan. Memuat kolom: Waktu Kejadian, ID Transaksi Terkait, dan Status.
*   **Aksi Eksekusi:**
    *   Tombol **[Unduh Sertifikat Penolakan]** (Ikon PDF). Men- *generate* dokumen resmi dari sistem yang menyatakan transaksi dikunci/ditolak, yang bisa diprint oleh Kades sebagai "tameng" atau alibi jika ditekan oleh oknum luar.

---

### Rincian Fitur Pusat Klarifikasi Publik:
Modul reaktif untuk menghadapi hoaks (fenomena "No Viral No Justice").
*   **Daftar Proyek Desa:** 
    *   *Grid Card* atau Tabel yang menampilkan daftar semua proyek yang sedang berjalan. Terdapat fitur pencarian (*Search Bar*) cepat.
*   **Generator Bukti Bersih (Klik Aksi pada Proyek):**
    *   *Pop-up Modal* yang langsung menampilkan 2 elemen:
        1.  **URL (Tautan) Publik:** Tautan khusus menuju halaman Dasbor Warga yang berisi *real-time* progress proyek tersebut. Terdapat tombol **[Copy Link]**.
        2.  **QR Code Image:** Gambar *barcode* yang berisi tautan yang sama. Terdapat tombol **[Download QR]**.
*   **Tombol Share Langsung:**
    *   Tombol dengan ikon **WhatsApp** dan **Facebook**. Jika diklik (terutama di perangkat HP), otomatis membuka aplikasi tersebut dengan draf teks bantahan (Contoh: *"Berikut adalah data valid dan progres nyata dari proyek X, yang disinkronkan langsung dari Blockchain KOHALOCK: [Link]"*).

---

### Rincian Fitur Pengaturan & Kredensial:
*   **Profil Eksekutif:** 
    *   Teks *Read-Only* menampilkan Nama Lengkap Kades, Nomor SK Pengangkatan, dan Periode Jabatan.
*   **Manajemen Keamanan (PKI):**
    *   *Badge* Status Kunci Privat / Sertifikat Aktif.
    *   Tombol **[Perbarui Kredensial]** jika masa berlaku sertifikat habis.
    *   Tombol **[Ubah PIN/Kata Sandi]**.
*   **Aksi Logout:** 
    *   Tombol **[Keluar]** untuk menjaga keamanan akun ketika komputer/ponsel tidak digunakan.