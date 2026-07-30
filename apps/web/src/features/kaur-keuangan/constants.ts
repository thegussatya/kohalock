export const INCOME_CATEGORIES = {
  Transfer: [
    'Dana Desa (DD)',
    'Alokasi Dana Desa (ADD)',
    'Bagi Hasil Pajak & Retribusi (BHR)',
    'Bantuan Keuangan Provinsi/Kabupaten'
  ],
  PADes: [
    'Hasil BUMDes',
    'Hasil Aset Desa (Sewa Pasar/Tanah Kas Desa)',
    'Swadaya Masyarakat'
  ],
  'Pendapatan Lain-lain': [
    'Hibah',
    'Sumbangan Pihak Ketiga',
    'Bunga Bank Desa'
  ]
};

export type IncomeCategoryGroup = keyof typeof INCOME_CATEGORIES;
