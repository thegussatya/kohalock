import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRouter from './routes/auth.route';
import proposalRouter from './routes/proposal.route';
import disbursementRouter from './routes/disbursement.route';
import cashBookRouter from './routes/cashbook.route';
import bankBookRouter from './routes/bankbook.route';
import ledgerRouter from './routes/ledger.route';
import clarificationRouter from './routes/clarification.route';
import whistleblowerRouter from './routes/whistleblower.route';
import notificationRouter from './routes/notification.route';
import dashboardRouter from './routes/dashboard.route';
import monthlyClosingRouter from './routes/monthlyclosing.route';
import taxBookRouter from './routes/taxbook.route';
import publicRouter from './routes/public.route';
import reportRouter from './routes/report.route';
import exportRouter from './routes/export.route';
import adatRouter from './routes/adat.route';
import supervisionRouter from './routes/supervision.route';
import interventionRouter from './routes/intervention.route';
import villageIncomeRouter from './routes/village-income.route';
import lpjRouter from './routes/lpj.route';
import auditNoteRouter from './routes/audit-note.route';
const app = express();
app.use(cors());
app.use(express.json());

import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', (req, res) => {
  res.status(404).send(`
    <html>
      <body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;font-family:sans-serif;background:#f8fafc;color:#64748b;">
        <div style="text-align:center;">
          <svg style="width:48px;height:48px;margin:0 auto 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <h2 style="margin:0 0 8px;font-size:18px;color:#334155;">Dokumen Tidak Ditemukan (404)</h2>
          <p style="margin:0;font-size:14px;">File fisik tidak tersedia di server development.</p>
        </div>
      </body>
    </html>
  `);
});

app.use('/api/public', publicRouter);
app.use('/api/auth', authRouter);
app.use('/api/proposals', proposalRouter);
app.use('/api/disbursements', disbursementRouter);
app.use('/api/cash-book', cashBookRouter);
app.use('/api/bank-book', bankBookRouter);
app.use('/api/ledger', ledgerRouter);
app.use('/api/clarifications', clarificationRouter);
app.use('/api/whistleblower', whistleblowerRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/monthly-closing', monthlyClosingRouter);
app.use('/api/tax-book', taxBookRouter);
app.use('/api/reports', reportRouter);
app.use('/api/export', exportRouter);
app.use('/api/adat-cases', adatRouter);
app.use('/api/supervision-notes', supervisionRouter);
app.use('/api/interventions', interventionRouter);
app.use('/api/village-income', villageIncomeRouter);
app.use('/api/lpj', lpjRouter);
app.use('/api/audit-notes', auditNoteRouter);
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'KOHALOCK API jalan' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});