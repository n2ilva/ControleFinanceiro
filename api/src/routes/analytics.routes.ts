import { Router } from 'express';
import {
  getAnalytics,
  getUsersAnalytics,
  getTransactions,
  getCreditCards,
  getSalaries,
  getGoals,
  getBudgets,
  getGroups,
} from '../controllers/analytics.controller';

const router = Router();

// Dashboard geral — visão completa agregada
router.get('/', getAnalytics);

// Dados individuais por usuário
router.get('/users', getUsersAnalytics);

// Transações (paginadas, filtráveis por ?type=income|expense&category=xxx&limit=100&offset=0)
router.get('/transactions', getTransactions);

// Cartões de crédito com uso
router.get('/credit-cards', getCreditCards);

// Salários cadastrados
router.get('/salaries', getSalaries);

// Metas financeiras
router.get('/goals', getGoals);

// Orçamentos
router.get('/budgets', getBudgets);

// Grupos
router.get('/groups', getGroups);

export default router;
