/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT,
ADD COLUMN     "jabatan" TEXT,
ADD COLUMN     "passwordHash" TEXT;

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "onChainId" INTEGER NOT NULL,
    "dusun" TEXT NOT NULL,
    "judulUsulan" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "satuan" TEXT NOT NULL,
    "paguMaksimal" BIGINT NOT NULL,
    "dokumenHash" TEXT NOT NULL,
    "fileUrls" JSONB NOT NULL,
    "kaurTeknisId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disbursement" (
    "id" TEXT NOT NULL,
    "onChainId" INTEGER NOT NULL,
    "proposalId" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "nominal" BIGINT NOT NULL,
    "beritaAcaraUrl" TEXT NOT NULL,
    "beritaAcaraHash" TEXT NOT NULL,
    "fotoUrl" TEXT NOT NULL,
    "geotagLat" DOUBLE PRECISION NOT NULL,
    "geotagLng" DOUBLE PRECISION NOT NULL,
    "geotagTimestamp" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "catatanRevisi" TEXT,
    "sekdesVerifierId" TEXT,
    "kadesApproverId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "disbursedAt" TIMESTAMP(3),

    CONSTRAINT "Disbursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RejectionLog" (
    "id" TEXT NOT NULL,
    "disbursementId" TEXT NOT NULL,
    "jenisPenolakan" TEXT NOT NULL,
    "pesanError" TEXT NOT NULL,
    "sudahDiperbaiki" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RejectionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterventionLog" (
    "id" TEXT NOT NULL,
    "disbursementId" TEXT NOT NULL,
    "kadesId" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterventionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClarificationTicket" (
    "id" TEXT NOT NULL,
    "namaWarga" TEXT,
    "programId" TEXT,
    "pertanyaan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU_JAWABAN',
    "jawaban" TEXT,
    "dijawabOlehId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "ClarificationTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhistleblowerReport" (
    "id" TEXT NOT NULL,
    "ticketCode" TEXT NOT NULL,
    "encryptedPayload" TEXT NOT NULL,
    "attachmentUrls" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DITERIMA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhistleblowerReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdatCase" (
    "id" TEXT NOT NULL,
    "pihakTerlibat" JSONB NOT NULL,
    "kategori" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MUSYAWARAH',
    "keputusanResolusi" TEXT,
    "dicatatOlehId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdatCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupervisionNote" (
    "id" TEXT NOT NULL,
    "disbursementId" TEXT NOT NULL,
    "bpdUserId" TEXT NOT NULL,
    "catatan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupervisionNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditorAccessToken" (
    "id" TEXT NOT NULL,
    "auditorId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditorAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashBookEntry" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "uraian" TEXT NOT NULL,
    "penerimaan" BIGINT NOT NULL,
    "pengeluaran" BIGINT NOT NULL,
    "saldoBerjalan" BIGINT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "statusTerkunci" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CashBookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankBookEntry" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "keterangan" TEXT NOT NULL,
    "debit" BIGINT NOT NULL,
    "kredit" BIGINT NOT NULL,
    "saldo" BIGINT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,

    CONSTRAINT "BankBookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxBookEntry" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jenisPajak" TEXT NOT NULL,
    "nominal" BIGINT NOT NULL,
    "statusSetor" TEXT NOT NULL,

    CONSTRAINT "TaxBookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyClosing" (
    "id" TEXT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "hashKunci" TEXT NOT NULL,
    "ditutupOlehId" TEXT NOT NULL,
    "ditutupPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyClosing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectionTransaction" (
    "id" TEXT NOT NULL,
    "transaksiAsalId" TEXT NOT NULL,
    "alasan" TEXT NOT NULL,
    "nilaiKoreksi" BIGINT NOT NULL,
    "dibuatOlehId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CorrectionTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_onChainId_key" ON "Proposal"("onChainId");

-- CreateIndex
CREATE UNIQUE INDEX "Disbursement_onChainId_key" ON "Disbursement"("onChainId");

-- CreateIndex
CREATE UNIQUE INDEX "WhistleblowerReport_ticketCode_key" ON "WhistleblowerReport"("ticketCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_kaurTeknisId_fkey" FOREIGN KEY ("kaurTeknisId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disbursement" ADD CONSTRAINT "Disbursement_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disbursement" ADD CONSTRAINT "Disbursement_sekdesVerifierId_fkey" FOREIGN KEY ("sekdesVerifierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disbursement" ADD CONSTRAINT "Disbursement_kadesApproverId_fkey" FOREIGN KEY ("kadesApproverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RejectionLog" ADD CONSTRAINT "RejectionLog_disbursementId_fkey" FOREIGN KEY ("disbursementId") REFERENCES "Disbursement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionLog" ADD CONSTRAINT "InterventionLog_disbursementId_fkey" FOREIGN KEY ("disbursementId") REFERENCES "Disbursement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionLog" ADD CONSTRAINT "InterventionLog_kadesId_fkey" FOREIGN KEY ("kadesId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClarificationTicket" ADD CONSTRAINT "ClarificationTicket_dijawabOlehId_fkey" FOREIGN KEY ("dijawabOlehId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdatCase" ADD CONSTRAINT "AdatCase_dicatatOlehId_fkey" FOREIGN KEY ("dicatatOlehId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupervisionNote" ADD CONSTRAINT "SupervisionNote_disbursementId_fkey" FOREIGN KEY ("disbursementId") REFERENCES "Disbursement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupervisionNote" ADD CONSTRAINT "SupervisionNote_bpdUserId_fkey" FOREIGN KEY ("bpdUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditorAccessToken" ADD CONSTRAINT "AuditorAccessToken_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyClosing" ADD CONSTRAINT "MonthlyClosing_ditutupOlehId_fkey" FOREIGN KEY ("ditutupOlehId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectionTransaction" ADD CONSTRAINT "CorrectionTransaction_dibuatOlehId_fkey" FOREIGN KEY ("dibuatOlehId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
