import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRouter from './routes/auth.route';
import proposalRouter from './routes/proposal.route';
import disbursementRouter from './routes/disbursement.route';
import cashBookRouter from './routes/cashbook.route';
import ledgerRouter from './routes/ledger.route';
import clarificationRouter from './routes/clarification.route';
import whistleblowerRouter from './routes/whistleblower.route';
import notificationRouter from './routes/notification.route';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/proposals', proposalRouter);
app.use('/api/disbursements', disbursementRouter);
app.use('/api/cash-book', cashBookRouter);
app.use('/api/ledger', ledgerRouter);
app.use('/api/clarifications', clarificationRouter);
app.use('/api/whistleblower', whistleblowerRouter);
app.use('/api/notifications', notificationRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'KohaLock API jalan' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});