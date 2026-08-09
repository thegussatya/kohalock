/*
  Warnings:

  - Added the required column `bulan` to the `TaxBookEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tahun` to the `TaxBookEntry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LpjStatus" AS ENUM ('DRAFT', 'LOCKED_ONCHAIN');

-- AlterTable
ALTER TABLE "Disbursement" ADD COLUMN     "authorizedAt" TIMESTAMP(3),
ADD COLUMN     "lpjStatus" "LpjStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "lpjTeknisHash" TEXT,
ADD COLUMN     "lpjTeknisUrl" TEXT,
ADD COLUMN     "lpjTxHash" TEXT;

-- AlterTable
ALTER TABLE "InterventionLog" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "lpjKeuanganHash" TEXT,
ADD COLUMN     "lpjKeuanganUrl" TEXT,
ADD COLUMN     "tanggalLpjKeuangan" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TaxBookEntry" ADD COLUMN     "bulan" INTEGER NOT NULL,
ADD COLUMN     "disbursementId" TEXT,
ADD COLUMN     "tahun" INTEGER NOT NULL,
ALTER COLUMN "statusSetor" SET DEFAULT 'BELUM_SETOR';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "encryptedPrivateKey" TEXT,
ADD COLUMN     "walletAddress" TEXT;

-- CreateTable
CREATE TABLE "LpjItem" (
    "id" TEXT NOT NULL,
    "disbursementId" TEXT NOT NULL,
    "uraian" TEXT NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "satuan" TEXT NOT NULL,
    "hargaSatuan" BIGINT NOT NULL,
    "totalHarga" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LpjItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "dibaca" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VillageIncomeEntry" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "kelompok" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "uraian" TEXT NOT NULL,
    "nominal" BIGINT NOT NULL,
    "sumberReferensi" TEXT,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "dicatatOlehId" TEXT NOT NULL,
    "cashBookEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VillageIncomeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaporanRealisasiDesa" (
    "id" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "dokumenUrl" TEXT NOT NULL,
    "dokumenHash" TEXT NOT NULL,
    "kadesId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LaporanRealisasiDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditNote" (
    "id" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "catatan" TEXT NOT NULL,
    "hasil" TEXT NOT NULL,
    "hashUpload" TEXT,
    "hashOnChain" TEXT,
    "auditorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditNote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LpjItem" ADD CONSTRAINT "LpjItem_disbursementId_fkey" FOREIGN KEY ("disbursementId") REFERENCES "Disbursement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxBookEntry" ADD CONSTRAINT "TaxBookEntry_disbursementId_fkey" FOREIGN KEY ("disbursementId") REFERENCES "Disbursement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VillageIncomeEntry" ADD CONSTRAINT "VillageIncomeEntry_dicatatOlehId_fkey" FOREIGN KEY ("dicatatOlehId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VillageIncomeEntry" ADD CONSTRAINT "VillageIncomeEntry_cashBookEntryId_fkey" FOREIGN KEY ("cashBookEntryId") REFERENCES "CashBookEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaporanRealisasiDesa" ADD CONSTRAINT "LaporanRealisasiDesa_kadesId_fkey" FOREIGN KEY ("kadesId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditNote" ADD CONSTRAINT "AuditNote_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
