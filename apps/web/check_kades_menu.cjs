const fs = require('fs');
const files = [
  "SettingsPage.tsx",
  "PublicClarificationCenterPage.tsx",
  "ProfilePage.tsx",
  "NotificationsPage.tsx",
  "IntegrityShieldPage.tsx",
  "HelpPage.tsx",
  "DisbursementDetailPage.tsx",
  "DisbursementApprovalPage.tsx",
  "DashboardPage.tsx",
  "ClarificationAnalyticsPage.tsx",
  "AuthorizationHistoryPage.tsx"
];

for (const file of files) {
  const content = fs.readFileSync('src/features/kades/' + file, 'utf8');
  const match = content.match(/const KADES_MENU = \[([\s\S]*?)\];/);
  if (match) {
    console.log(`\n--- ${file} ---`);
    console.log(match[0].trim());
  }
}
