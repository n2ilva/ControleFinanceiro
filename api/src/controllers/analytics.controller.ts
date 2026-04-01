import { Request, Response } from 'express';
import { db } from '../config/firebase';

// ─── Tipos auxiliares ───────────────────────────────────────────────
interface TransactionDoc {
  userId?: string;
  groupId?: string;
  description?: string;
  amount?: number;
  type?: 'income' | 'expense';
  category?: string;
  isRecurring?: boolean;
  date?: FirebaseFirestore.Timestamp;
  dueDate?: FirebaseFirestore.Timestamp;
  receivedDate?: FirebaseFirestore.Timestamp;
  cardId?: string | null;
  cardName?: string | null;
  cardType?: 'debit' | 'credit' | null;
  installments?: number;
  installmentNumber?: number;
  tags?: string[];
  isSalary?: boolean;
}

interface CreditCardDoc {
  name?: string;
  dueDay?: number;
  cardType?: 'debit' | 'credit';
  creditLimit?: number;
  color?: string;
  userId?: string;
  groupId?: string;
  paidMonths?: string[];
}

interface SalaryDoc {
  description?: string;
  company?: string;
  amount?: number;
  salaryType?: string;
  isActive?: boolean;
  paymentDate?: string;
  userId?: string;
  groupId?: string;
}

interface BudgetDoc {
  category?: string;
  limit?: number;
  month?: number;
  year?: number;
  userId?: string;
  groupId?: string;
}

interface GoalDoc {
  title?: string;
  description?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: FirebaseFirestore.Timestamp;
  icon?: string;
  color?: string;
  isCompleted?: boolean;
  userId?: string;
  groupId?: string;
}

interface GroupDoc {
  name?: string;
  code?: string;
  ownerId?: string;
  members?: string[];
}

interface UserDoc {
  email?: string;
  displayName?: string;
  groupIds?: string[];
  activeGroupId?: string;
}

// ─── Helper: timestamp → ISO string ─────────────────────────────────
function tsToISO(ts: FirebaseFirestore.Timestamp | undefined): string | null {
  if (!ts || typeof ts.toDate !== 'function') return null;
  return ts.toDate().toISOString();
}

function tsToMonthKey(ts: FirebaseFirestore.Timestamp | undefined): string | null {
  if (!ts || typeof ts.toDate !== 'function') return null;
  const d = ts.toDate();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ═══════════════════════════════════════════════════════════════════
// GET /api/analytics  —  Análise completa e agregada de todos os usuários
// ═══════════════════════════════════════════════════════════════════
export const getAnalytics = async (_req: Request, res: Response) => {
  try {
    // Buscar todas as coleções em paralelo
    const [
      transactionsSnap,
      creditCardsSnap,
      salariesSnap,
      budgetsSnap,
      goalsSnap,
      groupsSnap,
      usersSnap,
    ] = await Promise.all([
      db.collection('transactions').get(),
      db.collection('creditCards').get(),
      db.collection('salaries').get(),
      db.collection('budgets').get(),
      db.collection('goals').get(),
      db.collection('groups').get(),
      db.collection('users').get(),
    ]);

    // ── Usuários ──────────────────────────────────────────────────
    const userIds = new Set<string>();
    const usersData: Record<string, UserDoc> = {};
    usersSnap.forEach((doc) => {
      const d = doc.data() as UserDoc;
      usersData[doc.id] = d;
      userIds.add(doc.id);
    });

    // ── Transações ────────────────────────────────────────────────
    let totalTransactions = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;
    let recurringCount = 0;
    let installmentCount = 0;

    const categoryCount: Record<string, number> = {};
    const categoryIncomeValues: Record<string, number> = {};
    const categoryExpenseValues: Record<string, number> = {};
    const incomeDescriptions: Record<string, { count: number; total: number }> = {};
    const expenseDescriptions: Record<string, { count: number; total: number }> = {};
    const creditCardExpenses: Record<string, number> = {};
    const creditCardTransactionCount: Record<string, number> = {};
    const monthlyTotals: Record<string, { income: number; expense: number; count: number }> = {};
    const tagsUsage: Record<string, number> = {};
    const userExpenses: Record<string, number> = {};
    const userIncomes: Record<string, number> = {};
    const transactionsByType: Record<string, number> = { income: 0, expense: 0 };

    transactionsSnap.forEach((doc) => {
      const data = doc.data() as TransactionDoc;
      totalTransactions++;

      const userId = data.userId || '';
      if (userId) userIds.add(userId);

      const amount = data.amount || 0;
      const type = data.type || 'expense';
      const category = data.category || 'sem categoria';
      const description = data.description || 'sem descrição';

      // Contagem de categorias
      categoryCount[category] = (categoryCount[category] || 0) + 1;

      // Recorrência
      if (data.isRecurring) recurringCount++;
      if (data.installments && data.installments > 1) installmentCount++;

      // Tags
      if (data.tags && Array.isArray(data.tags)) {
        data.tags.forEach((tag) => {
          tagsUsage[tag] = (tagsUsage[tag] || 0) + 1;
        });
      }

      // Mensal
      const monthKey = tsToMonthKey(data.date);
      if (monthKey) {
        if (!monthlyTotals[monthKey]) {
          monthlyTotals[monthKey] = { income: 0, expense: 0, count: 0 };
        }
        monthlyTotals[monthKey]!.count++;
      }

      if (type === 'income') {
        totalIncome += amount;
        incomeCount++;
        transactionsByType['income']!++;
        categoryIncomeValues[category] = (categoryIncomeValues[category] || 0) + amount;

        if (!incomeDescriptions[description]) {
          incomeDescriptions[description] = { count: 0, total: 0 };
        }
        incomeDescriptions[description]!.count++;
        incomeDescriptions[description]!.total += amount;

        if (userId) userIncomes[userId] = (userIncomes[userId] || 0) + amount;

        if (monthKey) monthlyTotals[monthKey]!.income += amount;
      } else {
        totalExpense += amount;
        expenseCount++;
        transactionsByType['expense']!++;
        categoryExpenseValues[category] = (categoryExpenseValues[category] || 0) + amount;

        if (!expenseDescriptions[description]) {
          expenseDescriptions[description] = { count: 0, total: 0 };
        }
        expenseDescriptions[description]!.count++;
        expenseDescriptions[description]!.total += amount;

        if (userId) userExpenses[userId] = (userExpenses[userId] || 0) + amount;

        if (monthKey) monthlyTotals[monthKey]!.expense += amount;

        // Uso de cartão de crédito
        if (data.cardId) {
          creditCardExpenses[data.cardId] = (creditCardExpenses[data.cardId] || 0) + amount;
          creditCardTransactionCount[data.cardId] = (creditCardTransactionCount[data.cardId] || 0) + 1;
        }
      }
    });

    // ── Salários ──────────────────────────────────────────────────
    let totalSalaryAmount = 0;
    let activeSalaryCount = 0;
    let inactiveSalaryCount = 0;
    const salaryTypes: Record<string, number> = {};

    salariesSnap.forEach((doc) => {
      const data = doc.data() as SalaryDoc;
      const amount = data.amount || 0;
      const userId = data.userId || '';
      if (userId) userIds.add(userId);

      if (data.isActive) {
        activeSalaryCount++;
        totalSalaryAmount += amount;
      } else {
        inactiveSalaryCount++;
      }

      const salType = data.salaryType || 'salary';
      salaryTypes[salType] = (salaryTypes[salType] || 0) + 1;
    });

    // ── Cartões de crédito ────────────────────────────────────────
    let totalCreditLimit = 0;
    let totalDebitCards = 0;
    let totalCreditCards = 0;
    const creditCardDetails: Array<{
      id: string;
      name: string;
      type: string;
      limit: number;
      dueDay: number;
      color: string;
      totalGasto: number;
      totalTransacoes: number;
      porcentagemDoLimite: number | null;
    }> = [];

    creditCardsSnap.forEach((doc) => {
      const data = doc.data() as CreditCardDoc;
      const limit = data.creditLimit || 0;
      const cardType = data.cardType || 'credit';

      if (cardType === 'credit') {
        totalCreditCards++;
        totalCreditLimit += limit;
      } else {
        totalDebitCards++;
      }

      const totalGasto = creditCardExpenses[doc.id] || 0;
      const totalTransacoes = creditCardTransactionCount[doc.id] || 0;

      creditCardDetails.push({
        id: doc.id,
        name: data.name || 'Cartão sem nome',
        type: cardType,
        limit,
        dueDay: data.dueDay || 0,
        color: data.color || '#6366F1',
        totalGasto,
        totalTransacoes,
        porcentagemDoLimite: limit > 0 ? Math.round((totalGasto / limit) * 10000) / 100 : null,
      });
    });

    // ── Orçamentos (budgets) ──────────────────────────────────────
    let totalBudgets = 0;
    const budgetCategories: Record<string, { count: number; totalLimit: number }> = {};

    budgetsSnap.forEach((doc) => {
      const data = doc.data() as BudgetDoc;
      totalBudgets++;
      const cat = data.category || 'sem categoria';
      if (!budgetCategories[cat]) {
        budgetCategories[cat] = { count: 0, totalLimit: 0 };
      }
      budgetCategories[cat]!.count++;
      budgetCategories[cat]!.totalLimit += data.limit || 0;
    });

    // ── Metas financeiras (goals) ─────────────────────────────────
    let totalGoals = 0;
    let completedGoals = 0;
    let totalTargetAmount = 0;
    let totalCurrentAmount = 0;

    goalsSnap.forEach((doc) => {
      const data = doc.data() as GoalDoc;
      totalGoals++;
      if (data.isCompleted) completedGoals++;
      totalTargetAmount += data.targetAmount || 0;
      totalCurrentAmount += data.currentAmount || 0;
    });

    // ── Grupos ────────────────────────────────────────────────────
    let totalGroups = 0;
    let totalMembersInGroups = 0;

    groupsSnap.forEach((doc) => {
      const data = doc.data() as GroupDoc;
      totalGroups++;
      totalMembersInGroups += (data.members || []).length;
    });

    // ── Cálculos de médias ────────────────────────────────────────
    const totalUsers = Math.max(userIds.size, 1);
    const avgExpensePerUser = Math.round((totalExpense / totalUsers) * 100) / 100;
    const avgIncomePerUser = Math.round((totalIncome / totalUsers) * 100) / 100;
    const avgBalancePerUser = Math.round((avgIncomePerUser - avgExpensePerUser) * 100) / 100;
    const avgSalaryPerUser = Math.round((totalSalaryAmount / totalUsers) * 100) / 100;

    // Média mensal de saldo final
    const monthKeys = Object.keys(monthlyTotals).sort();
    const monthlyBalances = monthKeys.map((k) => {
      const m = monthlyTotals[k]!;
      return { month: k, income: m.income, expense: m.expense, balance: m.income - m.expense };
    });
    const avgMonthlyBalance =
      monthlyBalances.length > 0
        ? Math.round(
            (monthlyBalances.reduce((sum, m) => sum + m.balance, 0) / monthlyBalances.length) * 100,
          ) / 100
        : 0;

    // ── Montar resposta ───────────────────────────────────────────
    const response = {
      geradoEm: new Date().toISOString(),
      resumoGeral: {
        totalUsuarios: userIds.size,
        totalTransacoes: totalTransactions,
        totalReceitaBruta: Math.round(totalIncome * 100) / 100,
        totalDespesaBruta: Math.round(totalExpense * 100) / 100,
        saldoGlobal: Math.round((totalIncome - totalExpense) * 100) / 100,
        totalTransacoesRecorrentes: recurringCount,
        totalParcelamentos: installmentCount,
      },

      mediasPorUsuario: {
        mediaReceitaPorUsuario: avgIncomePerUser,
        mediaDespesaPorUsuario: avgExpensePerUser,
        mediaSaldoFinalPorUsuario: avgBalancePerUser,
        mediaSalarioAtivoPorUsuario: avgSalaryPerUser,
        mediaSaldoMensal: avgMonthlyBalance,
      },

      categorias: {
        todasCategorias: Object.entries(categoryCount)
          .sort((a, b) => b[1] - a[1])
          .map(([category, count]) => ({
            categoria: category,
            quantidadeUso: count,
            totalReceitas: Math.round((categoryIncomeValues[category] || 0) * 100) / 100,
            totalDespesas: Math.round((categoryExpenseValues[category] || 0) * 100) / 100,
          })),
        top10MaisUsadas: Object.entries(categoryCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([category, count]) => ({ categoria: category, quantidade: count })),
        top10MaiorValorDespesa: Object.entries(categoryExpenseValues)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([category, value]) => ({
            categoria: category,
            totalDespesa: Math.round(value * 100) / 100,
          })),
        top10MaiorValorReceita: Object.entries(categoryIncomeValues)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([category, value]) => ({
            categoria: category,
            totalReceita: Math.round(value * 100) / 100,
          })),
      },

      rankings: {
        receitasMaisAdicionadas: Object.entries(incomeDescriptions)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 15)
          .map(([name, data]) => ({
            descricao: name,
            quantidade: data.count,
            valorTotal: Math.round(data.total * 100) / 100,
          })),
        despesasMaisAdicionadas: Object.entries(expenseDescriptions)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 15)
          .map(([name, data]) => ({
            descricao: name,
            quantidade: data.count,
            valorTotal: Math.round(data.total * 100) / 100,
          })),
        despesasMaisCaras: Object.entries(expenseDescriptions)
          .sort((a, b) => b[1].total - a[1].total)
          .slice(0, 15)
          .map(([name, data]) => ({
            descricao: name,
            quantidade: data.count,
            valorTotal: Math.round(data.total * 100) / 100,
          })),
      },

      tags: {
        totalTagsDistintas: Object.keys(tagsUsage).length,
        maisUsadas: Object.entries(tagsUsage)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([tag, count]) => ({ tag, quantidade: count })),
      },

      cartoesDeCredito: {
        totalCartoesCadastrados: creditCardsSnap.size,
        totalCartoesCredito: totalCreditCards,
        totalCartoesDebito: totalDebitCards,
        limiteTotalCadastrado: Math.round(totalCreditLimit * 100) / 100,
        totalGastoEmCartoes: Math.round(
          Object.values(creditCardExpenses).reduce((sum, v) => sum + v, 0) * 100,
        ) / 100,
        detalhes: creditCardDetails.sort((a, b) => b.totalGasto - a.totalGasto),
      },

      salarios: {
        totalSalariosAtivos: activeSalaryCount,
        totalSalariosInativos: inactiveSalaryCount,
        somaSalariosAtivos: Math.round(totalSalaryAmount * 100) / 100,
        tiposDeSalario: Object.entries(salaryTypes).map(([tipo, count]) => ({
          tipo,
          quantidade: count,
        })),
      },

      orcamentos: {
        totalOrcamentosCriados: totalBudgets,
        categorias: Object.entries(budgetCategories)
          .sort((a, b) => b[1].count - a[1].count)
          .map(([cat, data]) => ({
            categoria: cat,
            quantidadeOrçamentos: data.count,
            somaLimites: Math.round(data.totalLimit * 100) / 100,
          })),
      },

      metas: {
        totalMetas: totalGoals,
        metasConcluidas: completedGoals,
        metasEmAndamento: totalGoals - completedGoals,
        taxaConclusao: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 10000) / 100 : 0,
        valorTotalAlvo: Math.round(totalTargetAmount * 100) / 100,
        valorTotalAcumulado: Math.round(totalCurrentAmount * 100) / 100,
        progressoGeral:
          totalTargetAmount > 0
            ? Math.round((totalCurrentAmount / totalTargetAmount) * 10000) / 100
            : 0,
      },

      grupos: {
        totalGrupos: totalGroups,
        totalMembrosEmGrupos: totalMembersInGroups,
        mediaMembrosPorGrupo:
          totalGroups > 0 ? Math.round((totalMembersInGroups / totalGroups) * 100) / 100 : 0,
      },

      evolucaoMensal: monthlyBalances,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Erro ao processar analytics:', error);
    res.status(500).json({
      error: 'Erro interno no servidor ao processar os dados',
      message: error.message || '',
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
// GET /api/analytics/users  —  Lista de usuários com métricas individuais
// ═══════════════════════════════════════════════════════════════════
export const getUsersAnalytics = async (_req: Request, res: Response) => {
  try {
    const [usersSnap, transactionsSnap, salariesSnap, creditCardsSnap, goalsSnap] =
      await Promise.all([
        db.collection('users').get(),
        db.collection('transactions').get(),
        db.collection('salaries').get(),
        db.collection('creditCards').get(),
        db.collection('goals').get(),
      ]);

    // Agregar transações por usuário
    const userMetrics: Record<
      string,
      {
        totalIncome: number;
        totalExpense: number;
        transactionCount: number;
        categories: Set<string>;
        creditCardUsage: number;
      }
    > = {};

    transactionsSnap.forEach((doc) => {
      const data = doc.data() as TransactionDoc;
      const uid = data.userId || '';
      if (!uid) return;

      if (!userMetrics[uid]) {
        userMetrics[uid] = {
          totalIncome: 0,
          totalExpense: 0,
          transactionCount: 0,
          categories: new Set(),
          creditCardUsage: 0,
        };
      }
      const m = userMetrics[uid]!;
      m.transactionCount++;
      m.categories.add(data.category || 'sem categoria');

      if (data.type === 'income') {
        m.totalIncome += data.amount || 0;
      } else {
        m.totalExpense += data.amount || 0;
        if (data.cardId) m.creditCardUsage += data.amount || 0;
      }
    });

    // Salários por usuário
    const userSalaries: Record<string, number> = {};
    salariesSnap.forEach((doc) => {
      const data = doc.data() as SalaryDoc;
      if (data.isActive && data.userId) {
        userSalaries[data.userId] = (userSalaries[data.userId] || 0) + (data.amount || 0);
      }
    });

    // Cartões por usuário
    const userCardCount: Record<string, number> = {};
    const userCardLimit: Record<string, number> = {};
    creditCardsSnap.forEach((doc) => {
      const data = doc.data() as CreditCardDoc;
      const uid = data.userId || '';
      if (!uid) return;
      userCardCount[uid] = (userCardCount[uid] || 0) + 1;
      if (data.cardType === 'credit') {
        userCardLimit[uid] = (userCardLimit[uid] || 0) + (data.creditLimit || 0);
      }
    });

    // Metas por usuário
    const userGoals: Record<string, { total: number; completed: number }> = {};
    goalsSnap.forEach((doc) => {
      const data = doc.data() as GoalDoc;
      const uid = data.userId || '';
      if (!uid) return;
      if (!userGoals[uid]) userGoals[uid] = { total: 0, completed: 0 };
      userGoals[uid]!.total++;
      if (data.isCompleted) userGoals[uid]!.completed++;
    });

    // Montar lista de usuários
    const users = usersSnap.docs.map((doc) => {
      const data = doc.data() as UserDoc;
      const uid = doc.id;
      const m = userMetrics[uid];

      return {
        id: uid,
        email: data.email || '',
        displayName: data.displayName || '',
        gruposAtivos: (data.groupIds || []).length,
        transacoes: {
          total: m?.transactionCount || 0,
          totalReceita: Math.round((m?.totalIncome || 0) * 100) / 100,
          totalDespesa: Math.round((m?.totalExpense || 0) * 100) / 100,
          saldo: Math.round(((m?.totalIncome || 0) - (m?.totalExpense || 0)) * 100) / 100,
          categoriasUsadas: m?.categories.size || 0,
        },
        salarioAtivoTotal: Math.round((userSalaries[uid] || 0) * 100) / 100,
        cartoes: {
          total: userCardCount[uid] || 0,
          limiteTotalCredito: Math.round((userCardLimit[uid] || 0) * 100) / 100,
          gastoNoCartao: Math.round((m?.creditCardUsage || 0) * 100) / 100,
        },
        metas: {
          total: userGoals[uid]?.total || 0,
          concluidas: userGoals[uid]?.completed || 0,
        },
      };
    });

    res.status(200).json({
      totalUsuarios: users.length,
      usuarios: users,
    });
  } catch (error: any) {
    console.error('Erro ao buscar analytics de usuários:', error);
    res.status(500).json({ error: 'Erro interno', message: error.message || '' });
  }
};

// ═══════════════════════════════════════════════════════════════════
// GET /api/analytics/transactions  —  Todas as transações (paginadas)
// ═══════════════════════════════════════════════════════════════════
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const limitParam = parseInt(req.query['limit'] as string) || 100;
    const offsetParam = parseInt(req.query['offset'] as string) || 0;
    const typeFilter = req.query['type'] as string | undefined;
    const categoryFilter = req.query['category'] as string | undefined;

    let queryRef: FirebaseFirestore.Query = db.collection('transactions');

    if (typeFilter) {
      queryRef = queryRef.where('type', '==', typeFilter);
    }
    if (categoryFilter) {
      queryRef = queryRef.where('category', '==', categoryFilter);
    }

    const snap = await queryRef.get();

    const allDocs = snap.docs
      .map((doc) => {
        const data = doc.data() as TransactionDoc;
        return {
          id: doc.id,
          userId: data.userId || '',
          description: data.description || '',
          amount: data.amount || 0,
          type: data.type || 'expense',
          category: data.category || '',
          isRecurring: data.isRecurring || false,
          date: tsToISO(data.date),
          dueDate: tsToISO(data.dueDate),
          receivedDate: tsToISO(data.receivedDate),
          cardId: data.cardId || null,
          cardName: data.cardName || null,
          cardType: data.cardType || null,
          installments: data.installments || null,
          installmentNumber: data.installmentNumber || null,
          tags: data.tags || [],
          groupId: data.groupId || null,
        };
      })
      .sort((a, b) => {
        const dA = a.date ? new Date(a.date).getTime() : 0;
        const dB = b.date ? new Date(b.date).getTime() : 0;
        return dB - dA;
      });

    const paginated = allDocs.slice(offsetParam, offsetParam + limitParam);

    res.status(200).json({
      total: allDocs.length,
      limit: limitParam,
      offset: offsetParam,
      transacoes: paginated,
    });
  } catch (error: any) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro interno', message: error.message || '' });
  }
};

// ═══════════════════════════════════════════════════════════════════
// GET /api/analytics/credit-cards  —  Todos os cartões com uso
// ═══════════════════════════════════════════════════════════════════
export const getCreditCards = async (_req: Request, res: Response) => {
  try {
    const [cardsSnap, transactionsSnap] = await Promise.all([
      db.collection('creditCards').get(),
      db.collection('transactions').get(),
    ]);

    // Somar gastos por cartão
    const cardExpenses: Record<string, number> = {};
    const cardTxCount: Record<string, number> = {};

    transactionsSnap.forEach((doc) => {
      const data = doc.data() as TransactionDoc;
      if (data.cardId && data.type === 'expense') {
        cardExpenses[data.cardId] = (cardExpenses[data.cardId] || 0) + (data.amount || 0);
        cardTxCount[data.cardId] = (cardTxCount[data.cardId] || 0) + 1;
      }
    });

    const cards = cardsSnap.docs.map((doc) => {
      const data = doc.data() as CreditCardDoc;
      const limit = data.creditLimit || 0;
      const gasto = cardExpenses[doc.id] || 0;

      return {
        id: doc.id,
        nome: data.name || '',
        tipo: data.cardType || 'credit',
        limite: limit,
        diaVencimento: data.dueDay || 0,
        cor: data.color || '#6366F1',
        userId: data.userId || '',
        groupId: data.groupId || null,
        totalGasto: Math.round(gasto * 100) / 100,
        totalTransacoes: cardTxCount[doc.id] || 0,
        porcentagemDoLimite: limit > 0 ? Math.round((gasto / limit) * 10000) / 100 : null,
        mesesPagos: data.paidMonths || [],
      };
    });

    res.status(200).json({ total: cards.length, cartoes: cards });
  } catch (error: any) {
    console.error('Erro ao buscar cartões:', error);
    res.status(500).json({ error: 'Erro interno', message: error.message || '' });
  }
};

// ═══════════════════════════════════════════════════════════════════
// GET /api/analytics/salaries  —  Todos os salários
// ═══════════════════════════════════════════════════════════════════
export const getSalaries = async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection('salaries').get();

    const salarios = snap.docs.map((doc) => {
      const data = doc.data() as SalaryDoc;
      return {
        id: doc.id,
        descricao: data.description || '',
        empresa: data.company || '',
        valor: data.amount || 0,
        tipo: data.salaryType || 'salary',
        ativo: data.isActive || false,
        dataPagamento: data.paymentDate || null,
        userId: data.userId || '',
        groupId: data.groupId || null,
      };
    });

    res.status(200).json({ total: salarios.length, salarios });
  } catch (error: any) {
    console.error('Erro ao buscar salários:', error);
    res.status(500).json({ error: 'Erro interno', message: error.message || '' });
  }
};

// ═══════════════════════════════════════════════════════════════════
// GET /api/analytics/goals  —  Todas as metas financeiras
// ═══════════════════════════════════════════════════════════════════
export const getGoals = async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection('goals').get();

    const metas = snap.docs.map((doc) => {
      const data = doc.data() as GoalDoc;
      const target = data.targetAmount || 0;
      const current = data.currentAmount || 0;

      return {
        id: doc.id,
        titulo: data.title || '',
        descricao: data.description || '',
        valorAlvo: target,
        valorAtual: current,
        progresso: target > 0 ? Math.round((current / target) * 10000) / 100 : 0,
        concluida: data.isCompleted || false,
        deadline: tsToISO(data.deadline),
        icone: data.icon || 'flag',
        cor: data.color || '#6366F1',
        userId: data.userId || '',
        groupId: data.groupId || null,
      };
    });

    res.status(200).json({ total: metas.length, metas });
  } catch (error: any) {
    console.error('Erro ao buscar metas:', error);
    res.status(500).json({ error: 'Erro interno', message: error.message || '' });
  }
};

// ═══════════════════════════════════════════════════════════════════
// GET /api/analytics/budgets  —  Todos os orçamentos
// ═══════════════════════════════════════════════════════════════════
export const getBudgets = async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection('budgets').get();

    const orcamentos = snap.docs.map((doc) => {
      const data = doc.data() as BudgetDoc;
      return {
        id: doc.id,
        categoria: data.category || '',
        limite: data.limit || 0,
        mes: data.month,
        ano: data.year,
        userId: data.userId || '',
        groupId: data.groupId || null,
      };
    });

    res.status(200).json({ total: orcamentos.length, orcamentos });
  } catch (error: any) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({ error: 'Erro interno', message: error.message || '' });
  }
};

// ═══════════════════════════════════════════════════════════════════
// GET /api/analytics/groups  —  Todos os grupos
// ═══════════════════════════════════════════════════════════════════
export const getGroups = async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection('groups').get();

    const grupos = snap.docs.map((doc) => {
      const data = doc.data() as GroupDoc;
      return {
        id: doc.id,
        nome: data.name || '',
        codigo: data.code || '',
        donoId: data.ownerId || '',
        membros: data.members || [],
        totalMembros: (data.members || []).length,
      };
    });

    res.status(200).json({ total: grupos.length, grupos });
  } catch (error: any) {
    console.error('Erro ao buscar grupos:', error);
    res.status(500).json({ error: 'Erro interno', message: error.message || '' });
  }
};
