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

const app = express();
app.use(cors());
app.use(express.json());

import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'KohaLock API jalan' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});