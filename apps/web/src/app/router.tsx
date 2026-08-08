import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import NotFoundPage from '../features/shared/NotFoundPage';
import KaurTeknisDashboard from '../features/kaur-teknis/DashboardPage';
import KaurTeknisMusrembang from '../features/kaur-teknis/MusrembangFormPage';
import KaurTeknisMyPrograms from '../features/kaur-teknis/MyProgramsPage';
import KaurTeknisProgramDetail from '../features/kaur-teknis/ProgramDetailPage';
import KaurTeknisRejectionHistory from '../features/kaur-teknis/RejectionHistoryPage';
import KaurTeknisSubmitDisbursement from '../features/kaur-teknis/SubmitDisbursementPage';
import KaurTeknisSubmitLpj from '../features/kaur-teknis/LengkapiLpjPage';
import SekdesDashboard from '../features/sekdes/DashboardPage';
import SekdesBudgetMonitoring from '../features/sekdes/BudgetMonitoringPage';
import SekdesVerificationQueue from '../features/sekdes/VerificationQueuePage';
import SekdesVerificationHistory from '../features/sekdes/VerificationHistoryPage';
import SekdesReviewSubmission from '../features/sekdes/ReviewSubmissionPage';
import SekdesClarificationInbox from '../features/sekdes/ClarificationInboxPage';
import KadesDashboard from '../features/kades/DashboardPage';
import KadesDisbursementApproval from '../features/kades/DisbursementApprovalPage';
import KadesAuthorizationHistory from '../features/kades/AuthorizationHistoryPage';
import KadesDisbursementDetail from '../features/kades/DisbursementDetailPage';
import KadesIntegrityShield from '../features/kades/IntegrityShieldPage';
import KadesPublicClarificationCenter from '../features/kades/PublicClarificationCenterPage';
import KadesClarificationAnalytics from '../features/kades/ClarificationAnalyticsPage';
import KadesSettings from '../features/kades/SettingsPage';
import KadesLaporanDesa from '../features/kades/LaporanDesaPage';
import PublikDashboard from '../features/publik/DashboardPage';
import PublikWhistleblower from '../features/publik/WhistleblowerReportPage';
import PublikClarification from '../features/publik/ClarificationPage';
import PublikProjectList from '../features/publik/ProjectListPage';
import PublikProjectDetail from '../features/publik/ProjectDetailPage';
import AuditorDashboard from '../features/auditor/DashboardPage';
import AuditorCaseManagement from '../features/auditor/CaseManagementPage';
import AuditorIntegrityChecker from '../features/auditor/IntegrityCheckerPage';
import AuditorLedgerExplorer from '../features/auditor/LedgerExplorerPage';
import AuditorWhistleblowerInbox from '../features/auditor/WhistleblowerInboxPage';
import AuditorLegalExport from '../features/auditor/LegalExportPage';
import BpdAdatDashboard from '../features/bpd-adat/DashboardPage';
import BpdAdatCalendar from '../features/bpd-adat/AdatCalendarPage';
import BpdAdatAnnualReport from '../features/bpd-adat/AnnualReportPage';
import BpdAdatTransactionMonitoring from '../features/bpd-adat/TransactionMonitoringPage';
import BpdAdatResolutionBoard from '../features/bpd-adat/AdatResolutionBoardPage';
import BpdAdatSupervisionArchive from '../features/bpd-adat/SupervisionArchivePage';
import BpdAdatSettings from '../features/bpd-adat/SettingsPage';
import { LoginPage } from '../features/auth/LoginPage';
import KaurTeknisNotifications from '../features/kaur-teknis/NotificationsPage';
import SekdesNotifications from '../features/sekdes/NotificationsPage';
import KadesNotifications from '../features/kades/NotificationsPage';
import PublikNotifications from '../features/publik/NotificationsPage';
import AuditorNotifications from '../features/auditor/NotificationsPage';
import BpdAdatNotifications from '../features/bpd-adat/NotificationsPage';
import KaurKeuanganNotifications from '../features/kaur-keuangan/NotificationsPage';
import KaurTeknisProfile from '../features/kaur-teknis/ProfilePage';
import SekdesProfile from '../features/sekdes/ProfilePage';
import KadesProfile from '../features/kades/ProfilePage';
import PublikProfile from '../features/publik/ProfilePage';
import AuditorProfile from '../features/auditor/ProfilePage';
import BpdAdatProfile from '../features/bpd-adat/ProfilePage';
import KaurKeuanganProfile from '../features/kaur-keuangan/ProfilePage';
import KaurTeknisHelp from '../features/kaur-teknis/HelpPage';
import SekdesHelp from '../features/sekdes/HelpPage';
import KadesHelp from '../features/kades/HelpPage';
import PublikHelp from '../features/publik/HelpPage';
import AuditorHelp from '../features/auditor/HelpPage';
import BpdAdatHelp from '../features/bpd-adat/HelpPage';
import KaurKeuanganDashboard from '../features/kaur-keuangan/DashboardPage';
import KaurKeuanganExecutionQueue from '../features/kaur-keuangan/ExecutionQueuePage';
import KaurKeuanganVillageIncome from '../features/kaur-keuangan/VillageIncomePage';
import KaurKeuanganGeneralCashBook from '../features/kaur-keuangan/GeneralCashBookPage';
import KaurKeuanganBankBook from '../features/kaur-keuangan/BankBookPage';
import KaurKeuanganTaxBook from '../features/kaur-keuangan/TaxBookPage';
import KaurKeuanganMonthlyClosing from '../features/kaur-keuangan/MonthlyClosingPage';
import KaurKeuanganRealizationReport from '../features/kaur-keuangan/RealizationReportPage';
import KaurKeuanganLockedArchive from '../features/kaur-keuangan/LockedArchivePage';
import KaurKeuanganSettings from '../features/kaur-keuangan/SettingsPage';
import KaurKeuanganHelp from '../features/kaur-keuangan/HelpPage';
import KaurKeuanganLaporanKeuangan from '../features/kaur-keuangan/LaporanKeuanganPage';
import KaurKeuanganLaporanLpj from '../features/kaur-keuangan/LaporanLpjPage';
import KaurKeuanganUploadLpj from '../features/kaur-keuangan/UploadLpjKeuanganPage';

export const router = createBrowserRouter([
  {
    errorElement: <NotFoundPage />,
    children: [
      {
        path: '/',
        element: <Navigate to="/login" replace />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/kaur-teknis',
        element: <ProtectedRoute allowedRole="kaur-teknis"><KaurTeknisDashboard /></ProtectedRoute>,
      },
      {
        path: '/kaur-teknis/formulir-musrembang',
        element: <ProtectedRoute allowedRole="kaur-teknis"><KaurTeknisMusrembang /></ProtectedRoute>,
      },
      {
        path: '/kaur-teknis/program-saya',
        element: <ProtectedRoute allowedRole="kaur-teknis"><KaurTeknisMyPrograms /></ProtectedRoute>,
      },
      {
        path: '/kaur-teknis/program-saya/:id',
        element: <ProtectedRoute allowedRole="kaur-teknis"><KaurTeknisProgramDetail /></ProtectedRoute>,
      },
      {
        path: '/kaur-teknis/ajukan-pencairan',
        element: <ProtectedRoute allowedRole="kaur-teknis"><KaurTeknisSubmitDisbursement /></ProtectedRoute>,
      },
      {
        path: '/kaur-teknis/lengkapi-lpj/:disbursementId',
        element: <ProtectedRoute allowedRole="kaur-teknis"><KaurTeknisSubmitLpj /></ProtectedRoute>,
      },
      {
        path: '/kaur-teknis/riwayat-penolakan',
        element: <ProtectedRoute allowedRole="kaur-teknis"><KaurTeknisRejectionHistory /></ProtectedRoute>,
      },
      {
        path: '/sekdes',
        element: <ProtectedRoute allowedRole="sekdes"><SekdesDashboard /></ProtectedRoute>,
      },
      {
        path: '/sekdes/verifikasi',
        element: <ProtectedRoute allowedRole="sekdes"><SekdesVerificationQueue /></ProtectedRoute>,
      },
      {
        path: '/sekdes/verifikasi/:id',
        element: <ProtectedRoute allowedRole="sekdes"><SekdesReviewSubmission /></ProtectedRoute>,
      },
      {
        path: '/sekdes/riwayat-verifikasi',
        element: <ProtectedRoute allowedRole="sekdes"><SekdesVerificationHistory /></ProtectedRoute>,
      },
      {
        path: '/sekdes/pantauan-anggaran',
        element: <ProtectedRoute allowedRole="sekdes"><SekdesBudgetMonitoring /></ProtectedRoute>,
      },
      {
        path: '/sekdes/klarifikasi',
        element: <ProtectedRoute allowedRole="sekdes"><SekdesClarificationInbox /></ProtectedRoute>,
      },
      {
        path: '/kades',
        element: <ProtectedRoute allowedRole="kades"><KadesDashboard /></ProtectedRoute>,
      },
      {
        path: '/kades/persetujuan-pencairan',
        element: <ProtectedRoute allowedRole="kades"><KadesDisbursementApproval /></ProtectedRoute>,
      },
      {
        path: '/kades/riwayat-otorisasi',
        element: <ProtectedRoute allowedRole="kades"><KadesAuthorizationHistory /></ProtectedRoute>,
      },
      {
        path: '/kades/persetujuan-pencairan/:id',
        element: <ProtectedRoute allowedRole="kades"><KadesDisbursementDetail /></ProtectedRoute>,
      },
      {
        path: '/kades/perisai-integritas',
        element: <ProtectedRoute allowedRole="kades"><KadesIntegrityShield /></ProtectedRoute>,
      },
      {
        path: '/kades/klarifikasi-publik',
        element: <ProtectedRoute allowedRole="kades"><KadesPublicClarificationCenter /></ProtectedRoute>,
      },
      {
        path: '/kades/analitik-klarifikasi',
        element: <ProtectedRoute allowedRole="kades"><KadesClarificationAnalytics /></ProtectedRoute>,
      },
      {
        path: '/kades/laporan-desa',
        element: <ProtectedRoute allowedRole="kades"><KadesLaporanDesa /></ProtectedRoute>,
      },
      {
        path: '/kades/pengaturan',
        element: <ProtectedRoute allowedRole="kades"><KadesSettings /></ProtectedRoute>,
      },
      {
        path: '/publik',
        element: <PublikDashboard />,
      },
      {
        path: '/publik/proyek',
        element: <PublikProjectList />,
      },
      {
        path: '/publik/proyek/:id',
        element: <PublikProjectDetail />,
      },
      {
        path: '/publik/lapor-rahasia',
        element: <PublikWhistleblower />,
      },
      {
        path: '/publik/klarifikasi',
        element: <PublikClarification />,
      },
      {
        path: '/auditor',
        element: <ProtectedRoute allowedRole="auditor"><AuditorDashboard /></ProtectedRoute>,
      },
      {
        path: '/auditor/kasus',
        element: <ProtectedRoute allowedRole="auditor"><AuditorCaseManagement /></ProtectedRoute>,
      },
      {
        path: '/auditor/uji-bukti',
        element: <ProtectedRoute allowedRole="auditor"><AuditorIntegrityChecker /></ProtectedRoute>,
      },
      {
        path: '/auditor/ledger',
        element: <ProtectedRoute allowedRole="auditor"><AuditorLedgerExplorer /></ProtectedRoute>,
      },
      {
        path: '/auditor/kotak-rahasia',
        element: <ProtectedRoute allowedRole="auditor"><AuditorWhistleblowerInbox /></ProtectedRoute>,
      },
      {
        path: '/auditor/ekspor-laporan',
        element: <ProtectedRoute allowedRole="auditor"><AuditorLegalExport /></ProtectedRoute>,
      },

      {
        path: '/bpd-adat',
        element: <ProtectedRoute allowedRole="bpd-adat"><BpdAdatDashboard /></ProtectedRoute>,
      },
      {
        path: '/bpd-adat/pantauan-transaksi',
        element: <ProtectedRoute allowedRole="bpd-adat"><BpdAdatTransactionMonitoring /></ProtectedRoute>,
      },
      {
        path: '/bpd-adat/resolusi-adat',
        element: <ProtectedRoute allowedRole="bpd-adat"><BpdAdatResolutionBoard /></ProtectedRoute>,
      },
      {
        path: '/bpd-adat/kalender-musyawarah',
        element: <ProtectedRoute allowedRole="bpd-adat"><BpdAdatCalendar /></ProtectedRoute>,
      },
      {
        path: '/bpd-adat/arsip',
        element: <ProtectedRoute allowedRole="bpd-adat"><BpdAdatSupervisionArchive /></ProtectedRoute>,
      },
      {
        path: '/bpd-adat/laporan-tahunan',
        element: <ProtectedRoute allowedRole="bpd-adat"><BpdAdatAnnualReport /></ProtectedRoute>,
      },
      {
        path: '/bpd-adat/pengaturan',
        element: <ProtectedRoute allowedRole="bpd-adat"><BpdAdatSettings /></ProtectedRoute>,
      },
      {
        path: '/kaur-teknis/notifikasi',
        element: <ProtectedRoute allowedRole="kaur-teknis"><KaurTeknisNotifications /></ProtectedRoute>,
      },
      {
        path: '/sekdes/notifikasi',
        element: <ProtectedRoute allowedRole="sekdes"><SekdesNotifications /></ProtectedRoute>,
      },
      {
        path: '/kades/notifikasi',
        element: <ProtectedRoute allowedRole="kades"><KadesNotifications /></ProtectedRoute>,
      },
      {
        path: '/publik/notifikasi',
        element: <PublikNotifications />,
      },
      {
        path: '/auditor/notifikasi',
        element: <ProtectedRoute allowedRole="auditor"><AuditorNotifications /></ProtectedRoute>,
      },
      {
        path: '/bpd-adat/notifikasi',
        element: <ProtectedRoute allowedRole="bpd-adat"><BpdAdatNotifications /></ProtectedRoute>,
      },
      {
        path: '/kaur-keuangan/notifikasi',
        element: <ProtectedRoute allowedRole="kaur-keuangan"><KaurKeuanganNotifications /></ProtectedRoute>,
      },
      {
        path: '/kaur-teknis/profil',
        element: <ProtectedRoute allowedRole="kaur-teknis"><KaurTeknisProfile /></ProtectedRoute>,
      },
      {
        path: '/sekdes/profil',
        element: <ProtectedRoute allowedRole="sekdes"><SekdesProfile /></ProtectedRoute>,
      },
      {
        path: '/kades/profil',
        element: <ProtectedRoute allowedRole="kades"><KadesProfile /></ProtectedRoute>,
      },
      {
        path: '/publik/profil',
        element: <PublikProfile />,
      },
      {
        path: '/auditor/profil',
        element: <ProtectedRoute allowedRole="auditor"><AuditorProfile /></ProtectedRoute>,
      },
      {
        path: '/bpd-adat/profil',
        element: <ProtectedRoute allowedRole="bpd-adat"><BpdAdatProfile /></ProtectedRoute>,
      },
      {
        path: '/kaur-keuangan/profil',
        element: <ProtectedRoute allowedRole="kaur-keuangan"><KaurKeuanganProfile /></ProtectedRoute>,
      },
      {
        path: '/kaur-teknis/bantuan',
        element: <ProtectedRoute allowedRole="kaur-teknis"><KaurTeknisHelp /></ProtectedRoute>,
      },
      {
        path: '/sekdes/bantuan',
        element: <ProtectedRoute allowedRole="sekdes"><SekdesHelp /></ProtectedRoute>,
      },
      {
        path: '/kades/bantuan',
        element: <ProtectedRoute allowedRole="kades"><KadesHelp /></ProtectedRoute>,
      },
      {
        path: '/publik/bantuan',
        element: <PublikHelp />,
      },
      {
        path: '/auditor/bantuan',
        element: <ProtectedRoute allowedRole="auditor"><AuditorHelp /></ProtectedRoute>,
      },
      {
        path: '/bpd-adat/bantuan',
        element: <ProtectedRoute allowedRole="bpd-adat"><BpdAdatHelp /></ProtectedRoute>,
      },
      {
        path: '/kaur-keuangan',
        element: <ProtectedRoute allowedRole="kaur-keuangan"><KaurKeuanganDashboard /></ProtectedRoute>,
      },
      {
        path: '/kaur-keuangan/antrean-eksekusi',
        element: <ProtectedRoute allowedRole="kaur-keuangan"><KaurKeuanganExecutionQueue /></ProtectedRoute>,
      },
      {
        path: '/kaur-keuangan/pendapatan-desa',
        element: <ProtectedRoute allowedRole="kaur-keuangan"><KaurKeuanganVillageIncome /></ProtectedRoute>,
      },
      {
        path: '/kaur-keuangan/buku-kas-umum',
        element: <ProtectedRoute allowedRole="kaur-keuangan"><KaurKeuanganGeneralCashBook /></ProtectedRoute>,
      },
      {
        path: '/kaur-keuangan/buku-bank',
        element: <ProtectedRoute allowedRole="kaur-keuangan"><KaurKeuanganBankBook /></ProtectedRoute>,
      },
      {
        path: '/kaur-keuangan/buku-pajak',
        element: <ProtectedRoute allowedRole="kaur-keuangan"><KaurKeuanganTaxBook /></ProtectedRoute>,
      },
      {
        path: '/kaur-keuangan/penutupan-buku',
        element: <ProtectedRoute allowedRole="kaur-keuangan"><KaurKeuanganMonthlyClosing /></ProtectedRoute>,
      },
      {
        path: '/kaur-keuangan/laporan',
        element: <ProtectedRoute allowedRole="kaur-keuangan"><KaurKeuanganRealizationReport /></ProtectedRoute>,
      },
      {
        path: '/kaur-keuangan/laporan-apbdes',
        element: <ProtectedRoute allowedRole="kaur-keuangan"><KaurKeuanganLaporanKeuangan /></ProtectedRoute>,
      },
      {
        path: '/kaur-keuangan/laporan-lpj',
        element: <ProtectedRoute allowedRole="kaur-keuangan"><KaurKeuanganLaporanLpj /></ProtectedRoute>,
      },
      {
        path: '/kaur-keuangan/kumpul-lpj',
        element: <ProtectedRoute allowedRole="kaur-keuangan"><KaurKeuanganUploadLpj /></ProtectedRoute>,
      },
      {
        path: '/kaur-keuangan/arsip',
        element: <ProtectedRoute allowedRole="kaur-keuangan"><KaurKeuanganLockedArchive /></ProtectedRoute>,
      },
      {
        path: '/kaur-keuangan/pengaturan',
        element: <ProtectedRoute allowedRole="kaur-keuangan"><KaurKeuanganSettings /></ProtectedRoute>,
      },
      {
        path: '/kaur-keuangan/bantuan',
        element: <ProtectedRoute allowedRole="kaur-keuangan"><KaurKeuanganHelp /></ProtectedRoute>,
      },
    ]
  }
]);