import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiKeyAuth } from './middleware/auth';
import analyticsRoutes from './routes/analytics.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Health check (sem autenticação)
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    message: 'API Controle Financeiro - Analytics',
  });
});

// Rotas protegidas por API Key
app.use('/api/analytics', apiKeyAuth, analyticsRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
  console.log(`📊 Dashboard: GET http://localhost:${PORT}/api/analytics`);
  console.log(`👥 Usuários:  GET http://localhost:${PORT}/api/analytics/users`);
  console.log(`💳 Cartões:   GET http://localhost:${PORT}/api/analytics/credit-cards`);
  console.log(`💰 Salários:  GET http://localhost:${PORT}/api/analytics/salaries`);
  console.log(`🎯 Metas:     GET http://localhost:${PORT}/api/analytics/goals`);
  console.log(`📋 Orçamentos:GET http://localhost:${PORT}/api/analytics/budgets`);
  console.log(`👨‍👩‍👧‍👦 Grupos:   GET http://localhost:${PORT}/api/analytics/groups`);
  console.log(`📦 Transações:GET http://localhost:${PORT}/api/analytics/transactions`);
});
