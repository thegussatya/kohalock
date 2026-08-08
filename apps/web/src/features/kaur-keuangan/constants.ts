export const INCOME_CATEGORIES = {
  Transfer: [
    'Dana Desa',
    'Bagian dari hasil pajak & retribusi daerah kabupaten/kota',
    'Alokasi Dana Desa (ADD)',
    'Bantuan Keuangan Provinsi',
    'Bantuan Keuangan Kabupaten/Kota'
  ],
  PADes: [
    'Hasil Usaha',
    'Swadaya, Partisipasi dan Gotong Royong',
    'Lain-Lain Pendapatan Asli Desa yang Sah'
  ],
  'Pendapatan Lain-lain': [
    'Hibah dan Sumbangan dari pihak ke-3 yang tidak mengikat',
    'Lain-Lain Pendapatan Desa yang Sah'
  ]
};

export type IncomeCategoryGroup = keyof typeof INCOME_CATEGORIES;
