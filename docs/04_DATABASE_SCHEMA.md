# DATABASE SCHEMA (Off-Chain) — Prisma / PostgreSQL

> Prinsip: DB ini adalah *cache* dari on-chain state (untuk query cepat & UI) + penyimpanan hal-hal yang memang tidak layak/tidak boleh on-chain (chat, file metadata, resolusi adat, laporan whistleblower terenkripsi).

```prisma
enum Role {
  KAUR_TEKNIS
  SEKDES
  KADES
  PUBLIK
  AUDITOR
  BPD
  TOKOH_ADAT
}

model User {
  id                String   @id @default(cuid())
  nama              String
  role              Role
  email             String?  @unique
  passwordHash      String
  walletAddress     String   @unique   // address custodial wallet on-chain
  encryptedPrivKey  String             // AES-GCM encrypted, key turunan dari PIN
  jabatan           String?            // mis. "Ketua BPD", "Ketua Lembaga Adat"
  nomorSK           String?            // khusus Kades
  createdAt         DateTime @default(now())
}

model Proposal {
  id              String   @id @default(cuid())
  onChainId        Int      @unique     // id di smart contract
  dusun            String
  judulUsulan      String
  kategori         String
  volume           Float
  satuan           String
  paguMaksimal      BigInt
  dokumenHash       String              // SHA-256 gabungan daftar hadir + notulensi
  fileUrls          Json                // { daftarHadir: url, notulensi: url }
  kaurTeknisId      String
  kaurTeknis        User     @relation(fields: [kaurTeknisId], references: [id])
  createdAt         DateTime @default(now())
}

model Disbursement {
  id                String   @id @default(cuid())
  onChainId          Int      @unique
  proposalId         String
  proposal           Proposal @relation(fields: [proposalId], references: [id])
  keterangan         String
  nominal            BigInt
  beritaAcaraUrl     String
  beritaAcaraHash    String
  fotoUrl            String
  geotagLat          Float
  geotagLng          Float
  geotagTimestamp    DateTime
  status             String   // mirror dari enum on-chain: PENDING_SEKDES | RETURNED_FOR_REVISION | PENDING_KADES | DISBURSED | REJECTED_SYSTEM
  catatanRevisi      String?
  sekdesVerifierId   String?
  kadesApproverId    String?
  submittedAt        DateTime @default(now())
  verifiedAt         DateTime?
  disbursedAt        DateTime?
}

model RejectionLog {
  id              String   @id @default(cuid())
  disbursementId   String
  jenisPenolakan   String   // "SISTEM_BLOCKCHAIN" | "SEKDES_REVISI"
  pesanError       String
  sudahDiperbaiki  Boolean  @default(false)
  createdAt        DateTime @default(now())
}

model InterventionLog {
  id              String   @id @default(cuid())
  disbursementId   String
  kadesId          String
  txHash           String
  createdAt        DateTime @default(now())
}

model ClarificationTicket {
  id            String   @id @default(cuid())
  namaWarga     String?             // null jika anonim
  programId     String?
  pertanyaan    String
  status        String   @default("MENUNGGU_JAWABAN") // MENUNGGU_JAWABAN | SELESAI
  jawaban       String?
  dijawabOlehId String?
  createdAt     DateTime @default(now())
  answeredAt    DateTime?
}

model WhistleblowerReport {
  id                String   @id @default(cuid())
  ticketCode        String   @unique   // dikasih ke pelapor untuk tracking
  encryptedPayload  String              // ciphertext hasil E2EE client-side (box dengan public key Inspektorat)
  attachmentUrls    Json                // array url file terenkripsi
  status            String   @default("DITERIMA") // DITERIMA | SEDANG_VERIFIKASI | SELESAI
  createdAt         DateTime @default(now())
}

model AdatCase {
  id              String   @id @default(cuid())
  pihakTerlibat    Json     // array nama
  kategori         String   // "Pelanggaran Integritas Aparat" | "Sengketa Batas Tanah" | dst
  status           String   @default("MUSYAWARAH") // MUSYAWARAH | SELESAI
  keputusanResolusi String?
  dicatatOlehId     String
  createdAt         DateTime @default(now())
}

model SupervisionNote {
  id              String   @id @default(cuid())
  disbursementId   String
  bpdUserId        String
  catatan          String
  createdAt        DateTime @default(now())
}

model AuditorAccessToken {
  id          String   @id @default(cuid())
  auditorId   String
  expiresAt   DateTime
  revoked     Boolean  @default(false)
  createdAt   DateTime @default(now())
}

// Model-model Kaur Keuangan / Bendahara

model CashBookEntry {
  id             String   @id @default(cuid())
  tanggal        DateTime
  uraian         String
  penerimaan     BigInt
  pengeluaran    BigInt
  saldoBerjalan  BigInt
  bulan          Int
  tahun          Int
  statusTerkunci Boolean  @default(false)
  incomeEntries  VillageIncomeEntry[]
}

model BankBookEntry {
  id         String   @id @default(cuid())
  tanggal    DateTime
  keterangan String
  debit      BigInt
  kredit     BigInt
  saldo      BigInt
  bulan      Int
  tahun      Int
}

model TaxBookEntry {
  id             String        @id @default(cuid())
  tanggal        DateTime
  jenisPajak     String
  nominal        BigInt
  statusSetor    String        @default("BELUM_SETOR")
  bulan          Int
  tahun          Int
  disbursementId String?
  disbursement   Disbursement? @relation(fields: [disbursementId], references: [id])
}

model MonthlyClosing {
  id            String   @id @default(cuid())
  bulan         Int
  tahun         Int
  hashKunci     String
  ditutupOlehId String
  ditutupPada   DateTime
}

model CorrectionTransaction {
  id              String   @id @default(cuid())
  transaksiAsalId String
  alasan          String
  nilaiKoreksi    BigInt
  dibuatOlehId    String
  createdAt       DateTime @default(now())
}

model VillageIncomeEntry {
  id              String         @id @default(cuid())
  tanggal         DateTime
  kelompok        String
  jenis           String
  uraian          String
  nominal         BigInt
  sumberReferensi String?
  bulan           Int
  tahun           Int
  dicatatOlehId   String
  cashBookEntryId String?
  createdAt       DateTime       @default(now())
}
```

## Catatan Implementasi

- `onChainId` di `Proposal`/`Disbursement` adalah kunci untuk mencocokkan row Postgres dengan struct on-chain — di-populate oleh `chain-indexer` service setelah event `ProposalRegistered`/`DisbursementSubmitted` masuk.
- `status` di `Disbursement` **selalu** ditulis ulang dari event on-chain (lewat indexer), jangan pernah di-update langsung dari request user tanpa konfirmasi tx — supaya Postgres tidak pernah "lebih maju" dari kebenaran on-chain.
- `AuditorAccessToken` mendukung fitur "Indikator Sesi Akses (Time-Bound Token)" — middleware auth cek `expiresAt` tiap request Auditor.
