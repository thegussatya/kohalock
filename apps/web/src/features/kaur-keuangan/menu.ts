import { LayoutDashboard, Landmark, BookOpen, Building2, Receipt, Lock, FileBarChart, Undo2, Archive, Settings, HelpCircle, Coins, FileText } from "lucide-react";

export const KAUR_KEUANGAN_MENU = [
  { label: "Dashboard", path: "/kaur-keuangan", icon: LayoutDashboard },
  { label: "Antrean Eksekusi", path: "/kaur-keuangan/antrean-eksekusi", icon: Landmark },
  { label: "Pendapatan Desa", path: "/kaur-keuangan/pendapatan-desa", icon: Coins },
  { label: "Buku Kas Umum", path: "/kaur-keuangan/buku-kas-umum", icon: BookOpen },
  { label: "Buku Bank", path: "/kaur-keuangan/buku-bank", icon: Building2 },
  { label: "Buku Pajak", path: "/kaur-keuangan/buku-pajak", icon: Receipt },
  { label: "Penutupan Buku Bulanan", path: "/kaur-keuangan/penutupan-buku", icon: Lock },
  { label: "Laporan APBDes", path: "/kaur-keuangan/laporan-apbdes", icon: FileText },
  { label: "Laporan LPJ Keuangan", path: "/kaur-keuangan/kumpul-lpj", icon: FileText },
  { label: "Realisasi Anggaran", path: "/kaur-keuangan/laporan", icon: FileBarChart },
  { label: "Transaksi Koreksi", path: "/kaur-keuangan/koreksi", icon: Undo2 },
  { label: "Arsip Buku Terkunci", path: "/kaur-keuangan/arsip", icon: Archive },
  { label: "Pengaturan & Kredensial", path: "/kaur-keuangan/pengaturan", icon: Settings },
  { label: "Bantuan", path: "/kaur-keuangan/bantuan", icon: HelpCircle },
];
