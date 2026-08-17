# Frontend State - Kondisi Terkini

> Dokumen ini adalah snapshot kondisi ACTUAL kode pada repositori saat ini, bukan rencana. Jika terdapat perbedaan dengan dokumen spesifikasi lainnya, dokumen INI yang menjadi acuan kebenaran untuk kondisi implementasi frontend saat ini.

## Design System

**Font:** `"Plus Jakarta Sans", sans-serif`

**Warna Brand:**
- `--color-brand-50`: `#EAF7FE`
- `--color-brand-100`: `#D5EFFD`
- `--color-brand-500`: `#00AEEF`
- `--color-brand-600`: `#0090C7`
- `--color-brand-900`: `#2B3990`

**Komponen Dasar (Reusable) di `src/components/`:**
- **BackLink**: `<BackLink to="/path" label="Kembali" />`
- **Badge**: `<Badge label="Status" variant="success | warning | danger | info | neutral" />`
- **BudgetDonutChart**: Menampilkan chart donat komposisi anggaran berbasis `recharts`.
- **DataTable**: Tabel data dengan support kolom kustom.
- **GeotagCameraCapture**: Komponen kamera native dengan overlay watermark waktu dan lokasi otomatis (HTML5 Geolocation).
- **HashCheckerBadge**: Menampilkan indikator otentisitas dokumen kriptografi.
- **MapWidget**: Komponen peta memakai `react-leaflet`.
- **MetricCard**: Komponen kartu angka ringkasan dengan ikon dan gaya varian (termasuk fallback ke `default` jika varian tidak valid).
- **MonthlyBarChart**: Menampilkan chart bar berbasis `recharts`.
- **PageHeader**: Komponen standar judul dan deskripsi halaman.
- **RoleLayout**: Membungkus setiap halaman dengan *Sidebar* dan *Topbar* sesuai peran.
- **Topbar**: Komponen navigasi atas, memuat fungsi pencarian, bel notifikasi, dan profil *dropdown*.

## Struktur Routing per Role (7 Role Total)

*Seluruh konfigurasi menu (label, path, icon) telah diisolasi secara ketat dan disentralisasi ke dalam masing-masing `menu.ts` di tiap folder fitur.*

### 1. Operator Desa
| Path | Komponen | Label Sidebar | Icon |
|---|---|---|---|
| `/kaur-teknis` | `DashboardPage` | Dashboard | `LayoutDashboard` |
| `/kaur-teknis/formulir-musrembang` | `MusrembangFormPage` | Formulir Musrembang | `FilePlus` |
| `/kaur-teknis/program-saya` | `MyProgramsPage` | Program Saya | `FolderKanban` |
| `/kaur-teknis/program-saya/:id` | `ProgramDetailPage` | - | - |
| `/kaur-teknis/ajukan-pencairan` | `SubmitDisbursementPage` | Ajukan Pencairan | `Wallet` |
| `/kaur-teknis/lengkapi-lpj/:disbursementId` | `LengkapiLpjPage` | - | - |
| `/kaur-teknis/riwayat-penolakan` | `RejectionHistoryPage` | Riwayat Penolakan | `History` |
| `/kaur-teknis/notifikasi` | `NotificationsPage` | - | - |
| `/kaur-teknis/profil` | `ProfilePage` | - | - |
| `/kaur-teknis/bantuan` | `HelpPage` | Bantuan | `HelpCircle` |

### 2. Sekretaris Desa (Sekdes)
| Path | Komponen | Label Sidebar | Icon |
|---|---|---|---|
| `/sekdes` | `DashboardPage` | Dashboard | `LayoutDashboard` |
| `/sekdes/verifikasi` | `VerificationQueuePage` | Verifikasi Pengajuan | `FileCheck` |
| `/sekdes/verifikasi/:id` | `ReviewSubmissionPage` | - | - |
| `/sekdes/riwayat-verifikasi` | `VerificationHistoryPage` | Riwayat Verifikasi | `History` |
| `/sekdes/pantauan-anggaran` | `BudgetMonitoringPage` | Pantauan Anggaran | `PieChart` |
| `/sekdes/klarifikasi` | `ClarificationInboxPage` | Inbox Klarifikasi Warga | `MessageCircle` |
| `/sekdes/notifikasi` | `NotificationsPage` | - | - |
| `/sekdes/profil` | `ProfilePage` | - | - |
| `/sekdes/bantuan` | `HelpPage` | Bantuan | `HelpCircle` |

### 3. Kepala Desa (Kades)
| Path | Komponen | Label Sidebar | Icon |
|---|---|---|---|
| `/kades` | `DashboardPage` | Dashboard | `LayoutDashboard` |
| `/kades/persetujuan-pencairan` | `DisbursementApprovalPage` | Persetujuan Pencairan | `BadgeCheck` |
| `/kades/persetujuan-pencairan/:id` | `DisbursementDetailPage` | - | - |
| `/kades/riwayat-otorisasi` | `AuthorizationHistoryPage` | Riwayat Otorisasi | `History` |
| `/kades/perisai-integritas` | `IntegrityShieldPage` | Perisai Integritas | `ShieldAlert` |
| `/kades/klarifikasi-publik` | `PublicClarificationCenterPage` | Pusat Klarifikasi Publik | `QrCode` |
| `/kades/analitik-klarifikasi` | `ClarificationAnalyticsPage` | Analitik Klarifikasi | `BarChart3` |
| `/kades/pengaturan` | `SettingsPage` | Pengaturan & Kredensial | `Settings` |
| `/kades/notifikasi` | `NotificationsPage` | - | - |
| `/kades/profil` | `ProfilePage` | - | - |
| `/kades/bantuan` | `HelpPage` | Bantuan | `HelpCircle` |

### 4. Masyarakat (Publik)
| Path | Komponen | Label Sidebar | Icon |
|---|---|---|---|
| `/publik` | `DashboardPage` | Beranda | `Home` |
| `/publik/proyek` | `ProjectListPage` | Pantau Proyek | `Building2` |
| `/publik/proyek/:id` | `ProjectDetailPage` | - | - |
| `/publik/klarifikasi` | `ClarificationPage` | Klarifikasi | `MessageCircleQuestion` |
| `/publik/lapor-rahasia` | `WhistleblowerReportPage` | Lapor Rahasia | `Lock` |
| `/publik/notifikasi` | `NotificationsPage` | - | - |
| `/publik/profil` | `ProfilePage` | - | - |
| `/publik/bantuan` | `HelpPage` | Bantuan | `HelpCircle` |

### 5. Auditor (Inspektorat)
| Path | Komponen | Label Sidebar | Icon |
|---|---|---|---|
| `/auditor` | `DashboardPage` | Beranda Forensik | `Search` |
| `/auditor/kasus` | `CaseManagementPage` | Manajemen Kasus | `Kanban` |
| `/auditor/uji-bukti` | `IntegrityCheckerPage` | Uji Alat Bukti | `FileSearch` |
| `/auditor/ledger` | `LedgerExplorerPage` | Kronologi Transaksi | `Workflow` |
| `/auditor/kotak-rahasia` | `WhistleblowerInboxPage` | Kotak Masuk Rahasia | `LockKeyhole` |
| `/auditor/ekspor-laporan` | `LegalExportPage` | Ekspor Laporan Hukum | `Download` |
| `/auditor/template-laporan` | `ReportTemplatesPage` | Template Laporan | `FileStack` |
| `/auditor/notifikasi` | `NotificationsPage` | - | - |
| `/auditor/profil` | `ProfilePage` | - | - |
| `/auditor/bantuan` | `HelpPage` | Bantuan | `HelpCircle` |

### 6. BPD & Tokoh Adat
| Path | Komponen | Label Sidebar | Icon |
|---|---|---|---|
| `/bpd-adat` | `DashboardPage` | Beranda Pengawasan | `LayoutDashboard` |
| `/bpd-adat/pantauan-transaksi` | `TransactionMonitoringPage` | Pantauan Transaksi | `Eye` |
| `/bpd-adat/resolusi-adat` | `AdatResolutionBoardPage` | Papan Resolusi Adat | `Scale` |
| `/bpd-adat/kalender-musyawarah` | `AdatCalendarPage` | Kalender Musyawarah | `CalendarDays` |
| `/bpd-adat/arsip` | `SupervisionArchivePage` | Arsip Pengawasan & Etik | `Archive` |
| `/bpd-adat/laporan-tahunan` | `AnnualReportPage` | Laporan Tahunan | `FileBarChart` |
| `/bpd-adat/pengaturan` | `SettingsPage` | Pengaturan Akun | `Settings` |
| `/bpd-adat/notifikasi` | `NotificationsPage` | - | - |
| `/bpd-adat/profil` | `ProfilePage` | - | - |
| `/bpd-adat/bantuan` | `HelpPage` | Bantuan | `HelpCircle` |

### 7. Kaur Keuangan
*Lihat seksi "Role ke-7: Kaur Keuangan" untuk penjelasan lebih dalam.*
| Path | Komponen | Label Sidebar | Icon |
|---|---|---|---|
| `/kaur-keuangan` | `DashboardPage` | Dashboard | `LayoutDashboard` |
| `/kaur-keuangan/antrean-eksekusi` | `ExecutionQueuePage` | Antrean Eksekusi | `Landmark` |
| `/kaur-keuangan/pendapatan-desa` | `VillageIncomePage` | Pendapatan Desa | `Coins` |
| `/kaur-keuangan/buku-kas-umum` | `GeneralCashBookPage` | Buku Kas Umum | `BookOpen` |
| `/kaur-keuangan/buku-bank` | `BankBookPage` | Buku Bank | `Building2` |
| `/kaur-keuangan/buku-pajak` | `TaxBookPage` | Buku Pajak | `Receipt` |
| `/kaur-keuangan/penutupan-buku` | `MonthlyClosingPage` | Penutupan Buku Bulanan | `Lock` |
| `/kaur-keuangan/laporan-apbdes` | `LaporanKeuanganPage` | Laporan APBDes | `FileText` |
| `/kaur-keuangan/laporan` | `RealizationReportPage` | Realisasi Anggaran | `FileBarChart` |
| `/kaur-keuangan/koreksi` | `CorrectionTransactionPage` | Transaksi Koreksi | `Undo2` |
| `/kaur-keuangan/arsip` | `LockedArchivePage` | Arsip Buku Terkunci | `Archive` |
| `/kaur-keuangan/pengaturan` | `SettingsPage` | Pengaturan & Kredensial | `Settings` |
| `/kaur-keuangan/notifikasi` | `NotificationsPage` | - | - |
| `/kaur-keuangan/profil` | `ProfilePage` | - | - |
| `/kaur-keuangan/bantuan` | `HelpPage` | Bantuan | `HelpCircle` |

## Fitur Lintas-Role (Shared)

- **LoginPage (`/login`)**: Halaman login yang akan me-redirect pengguna ke rute dashboard berdasarkan *role*.
- **Halaman Universal**: `/role/notifikasi`, `/role/profil`, `/role/bantuan`. Disuplai oleh komponen yang modular dan dipakai ulang per-role. Khusus `HelpPage`, tiap role mem-passing kumpulan *FAQ Item* yang relevan dengan tugasnya.
- **Halaman 404 (`NotFoundPage`)**: Menangani _fallback routing_ jika _path_ tidak ditemukan.
- **Toast UI**: Menggunakan `react-hot-toast` secara merata di semua aksi submit / konfirmasi untuk umpan balik *real-time*.

## Fitur Keamanan/Kripto yang Sudah Berjalan
- **Client-Side E2EE**: Implementasi dasar di `src/lib/crypto.ts` untuk laporan anonim publik (Whistleblower).
- **Simulasi Hash Kriptografi**: Digunakan pada *Penutupan Buku Bulanan* (Kaur Keuangan) yang mensimulasikan perhitungan hash kriptografi (dengan jeda/timer spinner lalu *output* _SHA-256 string_) untuk memberikan ilusi penyegelan _ledger_. 
- **HashCheckerBadge**: UI yang siap terhubung (diimplementasi di halaman Auditor dan arsip) untuk memverifikasi secara visual keaslian/otentisitas suatu dokumen.

## Role ke-7: Kaur Keuangan (Baru)
Role ini dirancang untuk mendigitalisasi penatausahaan keuangan setelah pencairan disetujui, sejalan dengan praktik transparansi dan standar Permendagri. 
- **Perubahan Wewenang Pencairan**: Tombol tindakan di fitur Kepala Desa (khususnya di halaman `DisbursementDetailPage.tsx`) telah diubah maknanya dari *Cairkan Dana Final* menjadi semata-mata **Otorisasi Pencairan**. Eksekusi transfer riil uang dari kas desa sekarang dilakukan di modul bendahara (Kaur Keuangan).
- **Ringkasan Alur Kerja Kaur Keuangan**:
  1. **Antrean Eksekusi**: Transaksi yang telah diotorisasi Kades masuk ke sini menunggu dieksekusi oleh bendahara.
  2. **Pencatatan Berjenjang**: Setelah uang bergerak, transaksi tercatat ke **Buku Kas Umum**, **Buku Bank** (dengan fitur perbandingan/ *rekonsiliasi*), dan **Buku Pajak**.
  3. **Penutupan Buku Bulanan**: Proses sakral mengunci seluruh transaksi bulan berjalan. Terdapat *checklist* visual pra-syarat seimbang, kemudian menggunakan modal otorisasi PIN 6 digit, dan simulasi enkripsi *Hash-lock*.
  4. **Laporan & Arsip**: Hasil realisasi disusun otomatis di fitur **Laporan Realisasi & LPJ**. Semua bukti masa lalu masuk di **Arsip Buku Terkunci**.
  5. **Koreksi Data**: Jika ada kesalahan entri, data terkunci tidak boleh diubah. Pengguna wajib memakai fitur **Transaksi Koreksi** (jurnal pembalik) untuk tetap mempertahankan *audit trail* sempurna.

## Yang Masih Dummy/Belum Terhubung Backend

- **Topbar Search**: Fungsi pencarian di navigasi atas saat ini sudah siap secara logika lokal (kode memfilter `searchData`), namun karena prop jarang diteruskan naik, fungsinya lebih dominan sebagai dummy UI.
- **Filter UI Publik**: Fitur pencarian/filter tabel di `ProjectListPage` Publik adalah yang paling fungsional karena diintegrasikan langsung pada _local dummy data state_. Halaman lain seperti Kanban Auditor menggunakan status statis sementara.
- **State Management Lokal**: Belum ada integrasi ke server REST / GraphQL API. Seluruh *state* ada pada memori instan React.
- **Koneksi Blockchain Asli**: *Ledger Explorer* dan penandatanganan kriptografis saat ini beroperasi sebatas *mockup* simulasi front-end.

## Catatan/Isu Diketahui
1. **Pengecekan Duplikasi Array Menu Lokal**: Dari hasil pemindaian langsung pada kode sumber `src/features/`, **TIDAK DITEMUKAN** satupun duplikasi dari definisi tipe _array menu_ lokal di dalam file komponen halaman. Semua dependensi terkait navigasi (`KADES_MENU`, `KAUR_KEUANGAN_MENU`, dsb) telah dengan rapi di-ekstrak dan disentralisasi ke dalam file `menu.ts` di masing-masing modul. Pola *bug* yang pernah ada di versi-versi lampau kini sudah dipastikan bersih seutuhnya.
2. **Crash Variant pada MetricCard**: Ditemukan sebelumnya *error crash* pada UI akibat properti string untuk warna komponen di `MetricCard` yang tidak dikenali (`info`). Perbaikan telah dikerjakan dengan menambahkan _fallback style_ statis sehingga komponen tidak akan *crash* di saat aplikasi berjalan, betapapun keliru _props_ diturunkan.

## Pembaruan Terkini (Full-Stack Integrations)
1. **Alur Revisi Pencairan (Operator Desa - Sekdes)**: 
   - Halaman `RejectionHistoryPage` kini memiliki tombol aksi "Perbaiki" untuk pencairan yang dikembalikan.
   - Halaman `SubmitDisbursementPage` mendukung mode edit (`?edit=id`) yang otomatis memuat ulang data lama, dan menggunakan tombol "Kirim Revisi" untuk mengupdate data via API `PUT /disbursements/:id` (mengubah status kembali ke `PENDING_SEKDES`).
2. **Uji Alat Bukti / Integrity Checker (Auditor)**:
   - Filter `?status=DISBURSED` telah dilepas. Auditor sekarang dapat melihat dan memindai hash dokumen dari seluruh riwayat pencairan, termasuk yang berstatus ditolak (`REJECTED_SYSTEM`) untuk keperluan investigasi forensik.
3. **Formulir Musrembang (Operator Desa)**:
   - Menambahkan kolom unggahan **RAB & Gambar Desain (PDF)** untuk melengkapi dokumen induk selain Daftar Hadir dan Notulensi.
4. **LPJ Otomatis & Laporan Keuangan (Operator Desa & Kaur Keuangan)**:
   - Operator Desa kini menginput rincian pengeluaran LPJ (baris-demi-baris) dengan kalkulasi sisa dana. Format laporan bisa dicetak atau diekspor ke Excel (CSV).
   - Menu Laporan APBDes otomatis ditambahkan di Kaur Keuangan yang merekapitulasi seluruh pendapatan & LPJ secara matematis.
5. **Perbaikan UX & Bug Resolusi (UI/Routing)**:
   - Halaman yang sengaja dihapus (seperti `CorrectionTransactionPage`) telah dibersihkan dari `router.tsx` dan `menu.ts` untuk menghindari *crash* HMR Vite.
   - Mengganti seluruh fungsi native `alert()` dan `confirm()` yang mengganggu dengan Modal Pop-up *native* bergaya modern (seperti pada konfirmasi Panic Button Kades dan konfirmasi Penguncian Blockchain Kaur Keuangan).
   - Komponen kamera *geotagging* untuk Sekdes telah disempurnakan agar tidak terjadi duplikasi foto berulang di pratinjau.
   - Pembatasan file ekstensi PDF telah dikunci dengan atribut `accept=".pdf"` pada UI unggah dokumen LPJ.
