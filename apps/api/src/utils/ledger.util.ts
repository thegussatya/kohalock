import { PrismaClient } from '../../generated/prisma';

export async function recalculateCashBookBalances(prisma: PrismaClient) {
  const entries = await prisma.cashBookEntry.findMany({
    orderBy: [
      { tanggal: 'asc' },
      { id: 'asc' }
    ]
  });

  let currentBalance = BigInt(0);
  for (const entry of entries) {
    currentBalance = BigInt(currentBalance) + BigInt(entry.penerimaan as any) - BigInt(entry.pengeluaran as any);
    if (BigInt(entry.saldoBerjalan as any) !== currentBalance) {
      await prisma.cashBookEntry.update({
        where: { id: entry.id },
        data: { saldoBerjalan: currentBalance }
      });
    }
  }
}

export async function recalculateBankBookBalances(prisma: PrismaClient) {
  const entries = await prisma.bankBookEntry.findMany({
    orderBy: [
      { tanggal: 'asc' },
      { id: 'asc' }
    ]
  });

  let currentBalance = BigInt(0);
  for (const entry of entries) {
    currentBalance = BigInt(currentBalance) + BigInt(entry.debit as any) - BigInt(entry.kredit as any);
    if (BigInt(entry.saldo as any) !== currentBalance) {
      await prisma.bankBookEntry.update({
        where: { id: entry.id },
        data: { saldo: currentBalance }
      });
    }
  }
}
