# PANDUAN BLOCKCHAIN UNTUK ORANG AWAM — KOHALOCK

> Dokumen ini menjelaskan konsep blockchain, smart contract, dompet digital, dan bagaimana
> semua itu diintegrasikan ke dalam sistem KohaLock secara sederhana dan mudah dipahami.
> Ditujukan untuk perangkat desa, penguji, dan siapa saja yang ingin memahami cara kerja sistem ini.

---

## BAGIAN 1 — APA ITU BLOCKCHAIN?

### Analogi Paling Sederhana: Buku Tamu Desa yang Tidak Bisa Dihapus

Bayangkan sebuah **Buku Tamu** di Balai Desa. Setiap kali ada tamu yang datang, nama dan
keperluannya dicatat di buku tersebut. Buku tamu biasa bisa saja dirobek halamannya, diedit
dengan tip-ex, atau bahkan dibakar oleh orang yang tidak bertanggung jawab.

**Blockchain** ibarat buku tamu versi ajaib:
- Setiap catatan yang sudah ditulis **tidak bisa dihapus atau diubah oleh siapa pun**, bahkan
  oleh orang yang mencetaknya sekalipun.
- Bukan cuma disimpan di satu tempat (satu lemari di balai desa), melainkan **disalin dan
  disimpan secara bersamaan di ribuan komputer** di seluruh dunia.
- Untuk memalsukan satu catatan, seseorang harus secara bersamaan mengubah ribuan salinan
  buku tersebut di ribuan komputer berbeda — hal yang secara praktis **mustahil dilakukan**.

### Blockchain Secara Teknis (Tapi Tetap Sederhana)

Bayangkan blockchain sebagai sebuah **rantai (chain) dari kotak-kotak (block)**:

```
[BLOK 1]  -->  [BLOK 2]  -->  [BLOK 3]  -->  [BLOK 4]  --> ...
Pengajuan      Verifikasi     Persetujuan    Pencairan
Dana Desa      Sekdes         Kades          Cair
```

- Setiap **Blok** berisi sekumpulan data transaksi (misalnya: "Kaur Teknis mengajukan
  pencairan Rp 50 juta untuk perbaikan jalan desa pada tanggal 1 Agustus 2026").
- Setiap blok juga menyimpan **sidik jari digital (hash)** dari blok sebelumnya, sehingga
  semua blok saling terhubung seperti rantai.
- Jika seseorang mencoba mengubah data di Blok 2, maka **sidik jari Blok 3 akan langsung
  berubah** dan tidak cocok lagi dengan yang tersimpan. Sistem akan langsung mendeteksi
  adanya kecurangan.

---

## BAGIAN 2 — APA ITU SIDIK JARI DIGITAL (HASH)?

Istilah **hash** atau **hash kriptografi** mungkin terdengar asing, tapi konsepnya
sebenarnya sangat mudah dipahami.

### Analogi: Mesin Penggiling Makanan

Bayangkan sebuah mesin penggiling yang canggih:
- Apapun yang Anda masukkan (satu lembar dokumen, satu foto, satu file PDF), mesin ini akan
  **menggiling** dan menghasilkan serbuk unik sepanjang 64 karakter persis.
- Input yang sama akan **selalu menghasilkan output yang sama persis**.
- Jika isi dokumen berubah bahkan **satu huruf saja**, maka output serbuknya akan **berubah
  total dan berbeda sama sekali**.
- Dan yang terpenting: Anda **tidak bisa** merekonstruksi isi dokumen asli hanya dari
  serbuknya.

Contoh nyata:
```
Input: "Dana desa bulan Januari Rp 50.000.000"
Hash:  a3f8c1d2e9b7...  (64 karakter)

Input: "Dana desa bulan Januari Rp 50.000.001"  (berubah 1 digit!)
Hash:  f72a9e3c1b4d...  (SAMA SEKALI BERBEDA)
```

Di dalam KohaLock, hash ini digunakan untuk:
1. **Memverifikasi Berita Acara**: Apakah file PDF yang diserahkan auditor sama persis dengan
   yang diunggah saat pencairan, atau sudah diedit?
2. **Memverifikasi Arsip Buku Kas**: Apakah data buku kas bulan lalu sudah diubah seseorang
   secara ilegal sejak dikunci?

---

## BAGIAN 3 — APA ITU SMART CONTRACT?

### Analogi: Mesin Penjual Otomatis (Vending Machine)

Anda pasti pernah melihat mesin penjual minuman. Cara kerjanya:
- Anda masukkan uang koin → pilih minuman → minuman keluar secara otomatis.
- **Tidak ada manusia** yang perlu menyerahkan minumannya kepada Anda.
- Mesin tidak bisa dibujuk, disuap, atau ditawar. Jika uang kurang, minuman tidak akan
  keluar. Titik.

**Smart Contract** adalah "mesin penjual otomatis" yang berjalan di blockchain:
- Ini adalah **program komputer** (kode) yang disimpan di blockchain.
- Program ini berjalan secara otomatis sesuai aturan yang sudah ditulis di dalamnya.
- **Tidak ada manusia atau administrator** yang bisa mengintervensi, mengubah hasil, atau
  membuatnya melanggar aturannya sendiri setelah program tersebut di-deploy.

### Smart Contract di KohaLock: `DanaDesaLedger.sol`

Smart contract KohaLock dinamakan `DanaDesaLedger` (Buku Besar Dana Desa Digital).
File kodenya ada di: `packages/contracts/contracts/DanaDesaLedger.sol`

Program ini berisi sekumpulan **aturan besi** yang tidak bisa dilanggar:

| Aturan di Smart Contract | Artinya dalam Bahasa Sederhana |
|---|---|
| `revert ExceedsPagu()` | "Jika nominal pencairan melebihi sisa pagu, transaksi OTOMATIS DIBATALKAN dan tidak bisa diproses." |
| `onlyRole(KADES_ROLE)` | "Hanya akun yang terdaftar sebagai Kepala Desa yang boleh menekan tombol Setujui Final. Akun lain akan langsung ditolak." |
| `onlyRole(SEKDES_ROLE)` | "Hanya Sekretaris Desa yang boleh memverifikasi pengajuan pada tahap 1." |
| `require(status == PENDING_KADES)` | "Kepala Desa hanya bisa menyetujui pengajuan yang sudah diverifikasi Sekdes terlebih dahulu. Tidak bisa loncat tahap." |

---

## BAGIAN 4 — APA ITU DOMPET DIGITAL?

### Analogi: Stempel Basah + Kunci Brankas

Di dunia nyata, seorang pejabat memiliki dua hal untuk mengesahkan sebuah dokumen:
1. **Stempel Basah** → Siapa saja bisa melihat nama dan jabatan di stempel ini (bersifat
   publik).
2. **Tanda Tangan Asli** → Hanya pejabat bersangkutan yang bisa membubuhkan tanda tangan ini
   karena hanya dia yang tahu "caranya" (bersifat rahasia).

Dalam dunia blockchain:
- **Alamat Dompet (Public Address)** = Stempel Basah / Nomor Rekening. Format: `0xf39Fd6e51...`
  Ini bersifat publik. Semua orang boleh tahu.
- **Kunci Privat (Private Key)** = Tanda Tangan Asli. Ini adalah kode rahasia sepanjang 64
  karakter yang hanya dipegang oleh pemiliknya. Siapa saja yang memegang kunci ini, bisa
  menandatangani transaksi atas nama pemiliknya.

### Bagaimana Dompet Digital Digunakan di KohaLock?

KohaLock menggunakan sistem **Custodial Wallet** (Dompet yang Dikelola Sistem).
Perangkat desa tidak perlu mengerti tentang blockchain atau menginstal aplikasi dompet seperti
MetaMask. Sistem mengelola semuanya di balik layar.

Prosesnya saat perangkat desa mendaftar:
```
1. Akun "Hastuti (Kaur Keuangan)" dibuat oleh admin.
2. Sistem OTOMATIS membuat sepasang kunci:
   - Alamat Publik: 0xAbCd1234...  (disimpan di database, bersifat publik)
   - Kunci Privat:  0x9f8e7d6c...  (DIENKRIPSI pakai PIN Hastuti, disimpan terenkripsi di DB)
3. Saat Hastuti menekan tombol "Eksekusi Pencairan" dan memasukkan PIN-nya:
   - Sistem mendekripsi kunci privat di memori komputer sesaat.
   - Menggunakan kunci privat untuk menandatangani transaksi di blockchain.
   - Kunci privat langsung dihapus dari memori setelah selesai.
   - PIN Hastuti tidak pernah dikirim ke blockchain atau disimpan di manapun.
```

---

## BAGIAN 5 — APA ITU DEPLOY CONTRACT?

### Analogi: Memasang Mesin Vending Machine di Lobi Kantor

Sebelum mesin vending machine bisa digunakan, seseorang harus:
1. **Membuatnya** di pabrik (menulis program/kode).
2. **Mengangkutnya** ke lobi kantor (mengirim ke jaringan blockchain).
3. **Menyalakan dan mendaftarkannya** di kantor (menyebarkan/deploy ke jaringan).
4. Mesin mendapat **nomor seri tetap** (alamat kontrak) yang tidak bisa berubah.

Proses ini disebut **Deploy Smart Contract**. Di KohaLock, langkah-langkahnya:

**Langkah 1 — Tulis Kode Contract** (sudah selesai)
- File: `packages/contracts/contracts/DanaDesaLedger.sol`
- Ditulis dalam bahasa Solidity (bahasa pemrograman khusus untuk blockchain Ethereum).

**Langkah 2 — Kompilasi (Terjemahkan ke Bahasa Mesin)**
```bash
# Hardhat mengkompilasi Solidity menjadi bytecode yang bisa dijalankan di blockchain
npx hardhat compile
```

**Langkah 3 — Jalankan Jaringan Blockchain Lokal** (untuk pengujian)
```bash
# Menyalakan blockchain "buatan" di laptop Anda sendiri untuk testing
# Ini yang Anda jalankan dengan perintah:
npx hardhat node
# Output: "Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/"
```

**Langkah 4 — Deploy Contract ke Jaringan**
```bash
# Mengirim program smart contract ke blockchain yang sedang berjalan
npx hardhat run scripts/deploy.ts --network localhost
# Output: "DanaDesaLedger deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3"
```
Setelah ini, smart contract mendapatkan **alamat permanen**: `0x5FbDB...`. Alamat ini dicatat
di file `.env` pada API backend agar bisa terhubung.

**Langkah 5 (Produksi) — Deploy ke Jaringan Publik**
Untuk sistem yang sudah siap produksi, langkah yang sama diulang di jaringan blockchain
publik seperti **Polygon Amoy Testnet** agar semua orang di seluruh dunia bisa memverifikasi
transaksinya.

---

## BAGIAN 6 — INTEGRASI BLOCKCHAIN PER ROLE DAN MENU DI KOHALOCK

Inilah inti dari dokumen ini. Di bawah ini dijelaskan secara rinci **menu mana saja** yang
melibatkan blockchain, **role siapa** yang menggunakannya, dan **apa yang terjadi di blockchain**
ketika menu tersebut diakses.

---

### 6.1 ROLE: KAUR TEKNIS

#### Menu: Formulir Musrembang (Pengajuan Program)
- **Alur di Aplikasi**: Kaur Teknis mengisi formulir usulan program desa (nama program, lokasi
  dusun, kategori kegiatan, pagu maksimal anggaran) beserta upload dokumen musrembang.
- **Yang Terjadi di Backend**:
  1. File dokumen musrembang (PDF daftar hadir, notulensi) di-upload ke server.
  2. Sistem menghitung **hash SHA-256** dari file dokumen tersebut
     (menghasilkan "sidik jari digital" unik dari dokumen).
  3. Data proposal dan dokumen disimpan ke database (PostgreSQL).
- **Yang Terjadi di Blockchain**:
  - Fungsi `registerProposal(dusun, kategori, paguMaksimal, dokumenHash)` di smart contract
    dipanggil menggunakan kunci privat Kaur Teknis.
  - Blockchain mencatat: "Proposal dengan ID #1 terdaftar atas nama dompet `0x123...` dengan
    hash dokumen `a3f8...`, pagu maksimal Rp X, pada blok ke-1024."
  - Peristiwa ini tercatat dalam sebuah **Event** bernama `ProposalRegistered` di blockchain.
- **Apa Jaminannya**: Data pagu anggaran yang sudah terdaftar di blockchain **tidak bisa
  diubah** oleh siapa pun di kemudian hari, termasuk admin sistem, untuk menaikkan atau
  menurunkan limit anggaran secara curang.

#### Menu: Ajukan Pencairan Dana
- **Alur di Aplikasi**: Kaur Teknis mengisi formulir pencairan termin (nominal, keterangan,
  foto lokasi dengan geotag, upload Berita Acara).
- **Yang Terjadi di Backend**:
  1. Foto dan Berita Acara (PDF) di-upload ke server.
  2. Sistem menghitung **hash SHA-256** dari file Berita Acara.
  3. Sistem memeriksa apakah `nominal` yang diminta masih dalam batas sisa pagu.
     Jika melebihi → pengajuan LANGSUNG DITOLAK di level API sebelum menyentuh blockchain.
  4. Data pencairan disimpan ke database dengan status `PENDING_SEKDES`.
- **Yang Terjadi di Blockchain**:
  - Fungsi `submitDisbursement(proposalId, nominal, beritaAcaraHash, geotag)` dipanggil.
  - Blockchain kembali memeriksa sisa pagu sebagai lapisan keamanan kedua.
    Jika nominal melebihi batas → blockchain `revert ExceedsPagu()` → transaksi BATAL.
  - Jika lolos → Event `DisbursementSubmitted` dicatat permanen di blockchain.
- **Apa Jaminannya**: Hash Berita Acara yang tersimpan di blockchain menjadi **bukti autentik**
  yang bisa diverifikasi kapan saja oleh Auditor untuk memastikan dokumen fisik tidak dipalsukan.

---

### 6.2 ROLE: SEKRETARIS DESA (SEKDES)

#### Menu: Antrean Verifikasi (Review Pengajuan)
- **Alur di Aplikasi**: Sekdes membuka detail pengajuan, melihat dokumen, foto, dan hash.
  Terdapat fitur Hash Checker bawaan untuk mencocokkan hash file yang ditampilkan dengan
  hash yang tersimpan di blockchain. Sekdes kemudian memilih "Setujui & Teruskan ke Kades"
  atau "Kembalikan untuk Revisi".
- **Yang Terjadi di Blockchain (jika Disetujui)**:
  - Fungsi `verifyBySekdes(disbursementId)` dipanggil menggunakan kunci privat Sekdes.
  - Status di blockchain berubah: `PENDING_SEKDES` → `PENDING_KADES`.
  - Alamat dompet Sekdes (`0xSEKDES...`) dicatat secara permanen sebagai
    `sekdesVerifier` beserta timestamp verifikasi.
  - Event `VerifiedBySekdes` dipancarkan.
- **Yang Terjadi di Blockchain (jika Dikembalikan)**:
  - Fungsi `returnForRevision(disbursementId, catatan)` dipanggil.
  - Status berubah: `PENDING_SEKDES` → `RETURNED_FOR_REVISION`.
  - Catatan alasan pengembalian tersimpan di blockchain.
  - Event `ReturnedForRevision` dipancarkan.
- **Apa Jaminannya**: Keputusan Sekdes (setuju atau tolak) beserta **identitas digitalnya dan
  waktu pastinya** tercatat permanen. Tidak bisa diklaim Sekdes tidak pernah menyetujui
  sesuatu, dan tidak bisa ada yang mengubah siapa yang menyetujui.

---

### 6.3 ROLE: KEPALA DESA (KADES)

#### Menu: Persetujuan Pencairan (Otorisasi Final)
- **Alur di Aplikasi**: Kepala Desa melihat pengajuan yang sudah diverifikasi Sekdes.
  Menekan tombol "Otorisasi & Teruskan ke Pencairan" atau "Tolak & Kembalikan".
- **Yang Terjadi di Blockchain (jika Disetujui)**:
  - Fungsi `authorizeByKades(disbursementId)` dipanggil menggunakan kunci privat Kades.
  - Smart contract **MEMERIKSA**: "Apakah pemanggil benar-benar memiliki `KADES_ROLE`?"
    Jika tidak → transaksi OTOMATIS DITOLAK oleh blockchain.
  - Smart contract **MEMERIKSA**: "Apakah status pencairan ini `PENDING_KADES`?"
    Jika tidak (misalnya belum diverifikasi Sekdes) → transaksi OTOMATIS DITOLAK.
  - Jika lolos semua pemeriksaan → Status berubah: `PENDING_KADES` → `PENDING_EKSEKUSI`.
  - Alamat dompet Kades tersimpan sebagai `kadesApprover` di blockchain.
  - Event `AuthorizedByKades` dipancarkan.
- **Apa Jaminannya**: Tidak ada pencairan yang bisa terjadi tanpa persetujuan resmi dari akun
  yang terdaftar sebagai Kepala Desa. Urutan alur juga **dikunci oleh smart contract** —
  tidak bisa ada yang "loncat tahap".

#### Menu: Perisai Integritas (Panic Button / Tolak Intervensi)
- **Alur di Aplikasi**: Ini adalah tombol darurat. Jika Kepala Desa menemukan kecurigaan atau
  tekanan untuk menyetujui pencairan yang tidak wajar, ia bisa langsung memblokir transaksi
  tersebut dari menu ini.
- **Yang Terjadi di Blockchain**:
  - Fungsi `rejectIntervention(disbursementId, reasonHash)` dipanggil.
  - Status berubah menjadi `REJECTED_SYSTEM` di blockchain.
  - Event `InterventionRejected` dipancarkan dengan `reasonHash` (hash alasan penolakan).
  - **Ini langsung terdeteksi sebagai "Red Flag"** yang muncul di dashboard Auditor dan BPD.
- **Apa Jaminannya**: Penolakan darurat ini **tidak bisa dihapus atau dibatalkan** setelah
  dikirim ke blockchain. Ini menjadi catatan audit permanen yang bisa diselidiki APH
  (Aparat Penegak Hukum) jika diperlukan.

---

### 6.4 ROLE: KAUR KEUANGAN

#### Menu: Antrean Eksekusi (Eksekusi Pencairan Dana)
- **Alur di Aplikasi**: Kaur Keuangan melihat daftar pencairan yang sudah disetujui Kades
  dan siap untuk dicairkan. Menekan tombol "Eksekusi Pencairan" setelah memasukkan PIN.
- **Yang Terjadi di Blockchain**:
  - Fungsi `executeDisbursement(disbursementId)` dipanggil menggunakan kunci privat
    Kaur Keuangan.
  - Smart contract kembali melakukan **pengecekan pagu terakhir** (double-check) sebelum
    finalisasi, untuk mencegah kemungkinan manipulasi di tingkat database.
  - Jika lolos → Status berubah: `PENDING_EKSEKUSI` → `DISBURSED`.
  - Nilai `totalDisbursedPerProposal` diperbarui di blockchain (akumulasi dana yang sudah cair
    untuk proposal tersebut).
  - Timestamp `disbursedAt` dicatat permanen.
  - Event `Disbursed` dipancarkan.
- **Apa Jaminannya**: Momen kapan dana benar-benar dicairkan dan siapa yang mengeksekusi
  tercatat permanen di blockchain sebagai bukti transaksi final yang **tidak bisa dipungkiri**.

#### Menu: Penutupan Buku Bulanan
- **Alur di Aplikasi**: Kaur Keuangan menutup buku kas bulan yang sudah selesai dengan
  memasukkan PIN.
- **Yang Terjadi di Backend (Bukan di Blockchain)**:
  - Sistem mengambil semua data entri dari Buku Kas Umum, Buku Bank, dan Buku Pajak bulan
    tersebut.
  - Semua data tersebut "dirangkum" menjadi satu string panjang, lalu dihitung
    **hash SHA-256**-nya (sidik jari digital dari seluruh buku kas bulan itu).
  - Hash tersebut disimpan ke database sebagai `hashKunci`.
  - Semua entri kas bulan tersebut **dikunci** (`statusTerkunci = true`) sehingga tidak bisa
    diedit lagi.
- **Catatan Penting**: Proses penutupan buku ini menggunakan hash kriptografi di level
  database (Off-chain), belum dikirim ke blockchain Ethereum secara langsung. Namun prinsip
  kerjanya sama: sekali dikunci, data tidak bisa diubah.

#### Menu: Arsip Buku Terkunci (Verifikasi Hash)
- **Alur di Aplikasi**: Kaur Keuangan atau Auditor membuka detail arsip buku bulanan dan
  menekan tombol "Verifikasi Ulang Hash".
- **Yang Terjadi di Backend**:
  1. Sistem mengambil hash yang tersimpan saat buku dikunci (hashKunci lama).
  2. Sistem menghitung ulang hash dari data buku kas yang ada saat ini di database.
  3. Keduanya dibandingkan:
     - ✅ **Cocok** → Data aman, tidak ada yang diubah sejak buku dikunci.
     - ❌ **Tidak Cocok** → **PERINGATAN!** Ada data yang berubah secara ilegal sejak buku
       dikunci. Ini indikasi manipulasi data.

---

### 6.5 ROLE: AUDITOR / INSPEKTORAT

#### Menu: Ledger Explorer (Penjelajah Blok Transaksi)
- **Alur di Aplikasi**: Auditor bisa menelusuri seluruh riwayat transaksi dan melihat
  timeline lengkap dari setiap pencairan: dari Pengajuan → Verifikasi Sekdes →
  Otorisasi Kades → Eksekusi.
- **Apa yang Ditampilkan**:
  - ID transaksi on-chain (`onChainId`) yang bisa dicek di blockchain explorer.
  - Timestamp setiap tahap yang tercatat permanen.
  - Nama dan identitas digital perangkat desa yang terlibat di setiap tahap.
- **Apa Jaminannya**: Data yang ditampilkan bersumber dari blockchain sebagai *source of truth*,
  bukan hanya dari database internal yang bisa saja dimanipulasi oleh admin.

#### Menu: Uji Bukti / Integrity Checker (Pemeriksa Keaslian Dokumen)
- **Alur di Aplikasi**: Auditor mengunggah file PDF Berita Acara fisik yang diperoleh dari
  desa (bisa saat sidak lapangan).
- **Yang Terjadi**:
  1. Sistem menghitung hash SHA-256 dari file yang diunggah auditor.
  2. Hash tersebut dibandingkan dengan hash yang tersimpan di blockchain saat pencairan
     dulu terjadi (menggunakan fungsi `verifyHash()` di smart contract).
  3. Hasilnya:
     - ✅ **Hash Cocok** → File yang dipegang auditor adalah file asli yang sama persis yang
       diunggah saat pengajuan pencairan. Tidak ada pemalsuan.
     - ❌ **Hash Tidak Cocok** → File yang dipegang auditor berbeda dengan yang asli.
       Kemungkinan besar dokumen Berita Acara telah dipalsukan.
- **Ini adalah fitur anti-pemalsuan dokumen yang paling kuat** di sistem KohaLock.

---

### 6.6 ROLE: MASYARAKAT PUBLIK (READ-ONLY)

#### Menu: Pantauan Proyek (Dashboard Publik)
- Masyarakat bisa melihat status kemajuan semua proyek desa secara transparan tanpa harus login.
- Data yang ditampilkan bersumber dari rekap transaksi blockchain, sehingga pemerintah desa
  **tidak bisa menyembunyikan atau memperindah** status proyek yang sebenarnya.
- Tidak ada aksi blockchain yang dipicu oleh publik (murni read-only).

---

## BAGIAN 7 — RINGKASAN: MANA YANG BLOCKCHAIN, MANA YANG BUKAN?

Berikut adalah tabel ringkasan yang menjelaskan mana fitur yang benar-benar berjalan di
atas blockchain dan mana yang bekerja di database biasa (off-chain):

| Fitur / Aksi | Blockchain? | Keterangan |
|---|:---:|---|
| Daftar proposal Musrembang | ✅ Ya | Tercatat di `registerProposal()` |
| Ajukan pencairan (submit) | ✅ Ya | Tercatat di `submitDisbursement()` |
| Verifikasi oleh Sekdes | ✅ Ya | Tercatat di `verifyBySekdes()` |
| Pengembalian revisi oleh Sekdes | ✅ Ya | Tercatat di `returnForRevision()` |
| Otorisasi oleh Kades | ✅ Ya | Tercatat di `authorizeByKades()` |
| Eksekusi pencairan (cair) | ✅ Ya | Tercatat di `executeDisbursement()` |
| Panic button Kades | ✅ Ya | Tercatat di `rejectIntervention()` |
| Verifikasi hash dokumen (Auditor) | ✅ Ya | Via `verifyHash()` di smart contract |
| Penutupan buku bulanan | ⚠️ Parsial | Hash SHA-256 dihitung & disimpan di DB lokal |
| Verifikasi arsip buku terkunci | ⚠️ Parsial | Hash dibandingkan di level API/DB |
| Data profil pengguna | ❌ Tidak | Hanya di database PostgreSQL |
| Laporan whistleblower | ❌ Tidak | Di DB, dilindungi enkripsi end-to-end |
| Chat klarifikasi warga | ❌ Tidak | Di DB biasa (tidak perlu blockchain) |
| Catatan pengawasan BPD | ❌ Tidak | Di DB biasa |

---

## BAGIAN 8 — MENGAPA TIDAK SEMUA DISIMPAN DI BLOCKCHAIN?

Pertanyaan yang wajar: "Kalau blockchain begitu aman, kenapa tidak semua data disimpan di sana?"

Ada beberapa alasan praktis:

1. **Biaya (Gas Fee)**: Setiap transaksi ke blockchain publik membutuhkan biaya komputasi
   (disebut "gas fee"). Menyimpan file PDF besar di blockchain akan sangat mahal.
   KohaLock hanya menyimpan **ringkasan (hash)** dokumen di blockchain, bukan file aslinya.

2. **Kecepatan**: Transaksi blockchain membutuhkan waktu beberapa detik hingga menit untuk
   dikonfirmasi. Data seperti chat, notifikasi, dan profil pengguna perlu diakses
   secara instan, sehingga tetap disimpan di database biasa.

3. **Privasi**: Blockchain bersifat publik dan transparan. Data sensitif seperti
   laporan whistleblower **tidak boleh** bisa dibaca sembarangan orang.
   Data jenis ini dilindungi dengan enkripsi khusus dan disimpan off-chain.

4. **Relevansi**: Hanya data yang perlu diaudit dan harus tidak bisa dimanipulasi
   yang perlu masuk ke blockchain. Data operasional harian (profil, notifikasi, dll.)
   tidak perlu jaminan sekuat itu.

---

## BAGIAN 9 — GLOSSARY (KAMUS ISTILAH)

| Istilah | Penjelasan Sederhana |
|---|---|
| **Blockchain** | Buku besar digital yang tersebar di ribuan komputer, tidak bisa diubah |
| **Blok (Block)** | Satu "halaman" dalam buku besar yang berisi kumpulan transaksi |
| **Hash / Hash Kriptografi** | "Sidik jari digital" dari sebuah file/data. Berubah satu karakter pun, hash langsung beda total |
| **Smart Contract** | Program komputer yang berjalan otomatis di blockchain tanpa bisa diintervensi manusia |
| **Deploy** | Proses "memasang" dan mengaktifkan smart contract di jaringan blockchain |
| **Dompet Digital (Wallet)** | Identitas seseorang di blockchain, terdiri dari Alamat Publik (seperti nomor rekening) dan Kunci Privat (seperti PIN) |
| **Alamat Publik (Public Address)** | Nomor identitas dompet yang boleh dibagikan ke publik. Format: `0xAbCd1234...` |
| **Kunci Privat (Private Key)** | Kode rahasia yang digunakan untuk menandatangani (menyetujui) transaksi. TIDAK BOLEH dibagikan ke siapa pun |
| **Transaction (Tx)** | Sebuah aksi yang dikirim ke blockchain (misalnya: menyetujui pencairan) |
| **Event** | "Pengumuman" yang dipancarkan smart contract setelah sebuah aksi berhasil dijalankan |
| **Gas Fee** | Biaya komputasi untuk menjalankan transaksi di blockchain publik |
| **Testnet** | Jaringan blockchain "percobaan" untuk pengujian. Uang/token di sini tidak bernilai nyata |
| **Mainnet** | Jaringan blockchain "sungguhan" yang beroperasi dengan uang/token asli bernilai |
| **Hardhat** | Alat pengembangan yang digunakan untuk menulis, menguji, dan men-deploy smart contract |
| **Ethers.js** | Pustaka kode yang digunakan oleh backend KohaLock untuk berkomunikasi dengan blockchain |
| **ABI (Application Binary Interface)** | "Buku petunjuk" yang memberitahu backend cara memanggil fungsi-fungsi di smart contract |
| **RPC URL** | Alamat "pintu masuk" ke jaringan blockchain. Di KohaLock lokal: `http://127.0.0.1:8545` |
| **On-chain** | Data atau aksi yang terjadi langsung di blockchain |
| **Off-chain** | Data atau aksi yang terjadi di server/database biasa (di luar blockchain) |
| **Custodial Wallet** | Sistem di mana kunci privat pengguna dikelola oleh aplikasi, bukan oleh pengguna sendiri |
| **Immutable** | Tidak bisa diubah. Sifat utama data yang sudah masuk ke blockchain |
| **RBAC (Role-Based Access Control)** | Sistem hak akses berdasarkan jabatan. Misalnya hanya Kades yang bisa menekan tombol otorisasi final |

---

*Dokumen ini dibuat sebagai panduan teknis yang mudah dipahami untuk proyek KohaLock.*
*Versi: 1.0 | Terakhir diperbarui: Agustus 2026*
