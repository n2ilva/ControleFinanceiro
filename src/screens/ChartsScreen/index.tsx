import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { FirestoreService } from '../../services/firestoreService';
import { CreditCardFirestoreService } from '../../services/creditCardFirestoreService';
import { SalaryFirestoreService } from '../../services/salaryFirestoreService';
import { CategoryData, Transaction, CreditCard, Salary } from '../../types';
import { theme } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles';
import { additionalStyles } from './additionalStyles';

const allStyles = { ...styles, ...additionalStyles };

const screenWidth = Dimensions.get('window').width;
const isCompactTabs = screenWidth <= 430;

const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

interface Insight {
    type: 'success' | 'warning' | 'danger' | 'info';
    title: string;
    message: string;
    icon: any;
    actionableType?: 'subscriptions' | 'impulse' | 'overdue' | 'dueSoon' | 'credit';
}

interface InsightDetailItem {
    id: string;
    title: string;
    subtitle: string;
    amount: number;
}

interface InsightDetailState {
    title: string;
    subtitle: string;
    items: InsightDetailItem[];
}

interface CardExpense {
    cardId: string;
    cardName: string;
    cardType: 'credit' | 'debit';
    total: number;
    count: number;
}

interface DueItem {
    id: string;
    description: string;
    amount: number;
    dueDate: string;
    isPaid: boolean;
    isOverdue: boolean;
    daysUntilDue: number;
}

interface MonthSummary {
    month: number;
    year: number;
    monthName: string;
    totalExpenses: number;
    totalIncome: number;
    balance: number;
    paidExpenses: number;
    pendingExpenses: number;
    categories: CategoryData[];
    transactions: Transaction[];
    cardExpenses: CardExpense[];
    upcomingDues: DueItem[];
    overdueDues: DueItem[];
    savingsRate: number;
    transactionCount: number;
    averageExpensePerDay: number;
}

interface MonthComparison {
    expenseChange: number;
    expenseChangePercent: number;
    incomeChange: number;
    incomeChangePercent: number;
    balanceChange: number;
    trend: 'improving' | 'worsening' | 'stable';
}

interface FinancialScore {
    score: number;
    savingsScore: number;
    paymentScore: number;
    diversificationScore: number;
    creditUsageScore: number;
    recommendations: string[];
}

interface TopExpense {
    description: string;
    amount: number;
    category: string;
    date: string;
}

interface PeriodStats {
    dayOfWeekStats: { day: string; total: number; count: number }[];
    categoryGrowth: { category: string; growth: number; growthPercent: number }[];
    topExpenses: TopExpense[];
}

const CATEGORY_ICONS: { [key: string]: string } = {
    moradia: 'home',
    aluguel: 'home-outline',
    condominio: 'business',
    agua: 'water',
    energia: 'flash',
    internet: 'wifi',
    gas: 'flame',
    telefone: 'call',
    mercado: 'cart',
    alimentacao: 'restaurant',
    transporte: 'car',
    combustivel: 'speedometer',
    saude: 'medical',
    educacao: 'school',
    vestuario: 'shirt',
    pets: 'paw',
    academia: 'barbell',
    lazer: 'game-controller',
    viagem: 'airplane',
    presentes: 'gift',
    assinaturas: 'card',
    cartao: 'card-outline',
    impostos: 'document-text',
    manutencao: 'construct',
    salario: 'cash',
    deposito: 'card',
    freelance: 'briefcase',
    bonus: 'sparkles',
    rendimentos: 'trending-up',
    investimentos: 'stats-chart',
    aluguelRecebido: 'home',
    reembolso: 'refresh',
    vendas: 'pricetag',
    extra: 'gift',
    outros: 'ellipsis-horizontal',
};

export default function ChartsScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [selectedData, setSelectedData] = useState<MonthSummary | null>(null);
    const [chartData, setChartData] = useState({
        labels: [] as string[],
        expenses: [] as number[],
        income: [] as number[],
    });
    const [insights, setInsights] = useState<Insight[]>([]);
    const [insightDetail, setInsightDetail] = useState<InsightDetailState | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<{ category: string; color: string; transactions: Transaction[] } | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'cards' | 'dues' | 'comparison'>('overview');
    const [previousMonthData, setPreviousMonthData] = useState<MonthSummary | null>(null);
    const [monthComparison, setMonthComparison] = useState<MonthComparison | null>(null);
    const [financialScore, setFinancialScore] = useState<FinancialScore | null>(null);
    const [periodStats, setPeriodStats] = useState<PeriodStats | null>(null);
    const [allSalaries, setAllSalaries] = useState<Salary[]>([]);
    const [trendChartWidth, setTrendChartWidth] = useState(screenWidth - 64);

    const processMonthData = (transactions: Transaction[], month: number, year: number, creditCards: CreditCard[], salaries: Salary[] = []): MonthSummary => {
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Função para calcular o período de fatura de uma transação
        const getInvoicePeriod = (transactionDate: string, dueDay: number): { month: number; year: number } => {
            const txDate = new Date(transactionDate);
            const txDay = txDate.getUTCDate(); // Usar UTC para evitar problemas de timezone
            const txMonth = txDate.getUTCMonth();
            const txYear = txDate.getUTCFullYear();

            let invoiceMonth: number;
            let invoiceYear: number;

            // Período: do dia de vencimento (exclusive) do mês anterior até o dia anterior ao vencimento (inclusive)
            // Exemplo: vencimento dia 20 → compras de 21/Dez a 19/Jan entram na fatura que vence 20/Jan
            //          compras do dia 20/Jan em diante entram na fatura que vence 20/Fev
            if (txDay >= dueDay) {
                // Compra no dia de vencimento ou depois → vai para a fatura do próximo mês
                if (txMonth === 11) {
                    invoiceMonth = 0;
                    invoiceYear = txYear + 1;
                } else {
                    invoiceMonth = txMonth + 1;
                    invoiceYear = txYear;
                }
            } else {
                // Compra antes do dia de vencimento → fatura do mês atual
                invoiceMonth = txMonth;
                invoiceYear = txYear;
            }

            return { month: invoiceMonth, year: invoiceYear };
        };

        const monthTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            const txMonth = d.getMonth();
            const txYear = d.getFullYear();
            
            // Para transações de cartão de crédito, usar período de fatura
            if (t.cardId && t.cardType === 'credit') {
                const card = creditCards.find(c => c.id === t.cardId);
                if (card) {
                    const invoicePeriod = getInvoicePeriod(t.date, card.dueDay);
                    return invoicePeriod.month === month && invoicePeriod.year === year;
                }
            }
            
            // Para outras transações, usar mês da transação
            return txMonth === month && txYear === year;
        });

        const expenses = monthTransactions.filter(t => t.type === 'expense');
        const incomes = monthTransactions.filter((transaction) => {
            if (transaction.type !== 'income') return false;

            if (transaction.receivedDate) {
                const receivedDateObj = new Date(transaction.receivedDate);
                const receivedDay = receivedDateObj.getDate();

                const isCurrentMonth = month === currentMonth && year === currentYear;
                const isPastMonth = year < currentYear || (year === currentYear && month < currentMonth);
                const isFutureMonth = year > currentYear || (year === currentYear && month > currentMonth);

                if (isFutureMonth) return false;
                if (isPastMonth) return true;

                return isCurrentMonth && currentDay >= receivedDay;
            }

            return true;
        });

        // Calcular salários do mês (salários ativos que têm paymentDate no mês ou são recorrentes)
        const monthlySalaries = salaries.filter(s => {
            if (!s.isActive) return false;

            const isCurrentMonth = month === currentMonth && year === currentYear;
            const isPastMonth = year < currentYear || (year === currentYear && month < currentMonth);
            const isFutureMonth = year > currentYear || (year === currentYear && month > currentMonth);

            if (s.paymentDate) {
                const d = new Date(s.paymentDate);
                if (d.getMonth() !== month || d.getFullYear() !== year) return false;

                const paymentDay = d.getDate();
                if (isFutureMonth) return false;
                if (isPastMonth) return true;
                return isCurrentMonth && currentDay >= paymentDay;
            }

            if (isFutureMonth) return false;
            if (isPastMonth) return true;
            return isCurrentMonth;
        });
        const totalSalaries = monthlySalaries.reduce((sum, s) => sum + s.amount, 0);

        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0) + totalSalaries;
        
        // Status de pagamento baseado no campo isPaid
        const paidExpenses = expenses.filter(t => t.isPaid).reduce((sum, t) => sum + t.amount, 0);
        const pendingExpenses = expenses.filter(t => !t.isPaid).reduce((sum, t) => sum + t.amount, 0);

        // Categorias (somente despesas — receitas recorrentes/parceladas mantêm sua categoria original)
        const categoryMap = new Map<string, number>();
        expenses.forEach(t => {
            // Ignorar categoria "cartao" - usar a categoria real da compra
            if (t.category === 'cartao') return;
            
            const current = categoryMap.get(t.category) || 0;
            categoryMap.set(t.category, current + t.amount);
        });

        const categories = Array.from(categoryMap.entries())
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
                color: theme.colors.categories[category as keyof typeof theme.colors.categories] || theme.colors.categories.outros,
            }))
            .sort((a, b) => b.amount - a.amount);

        // Gastos por cartão
        const cardMap = new Map<string, { total: number; count: number; cardName: string; cardType: 'credit' | 'debit' }>();
        expenses.forEach(t => {
            if (t.cardId && t.cardName) {
                const current = cardMap.get(t.cardId) || { total: 0, count: 0, cardName: t.cardName, cardType: t.cardType || 'credit' };
                cardMap.set(t.cardId, {
                    ...current,
                    total: current.total + t.amount,
                    count: current.count + 1,
                });
            }
        });

        const cardExpenses: CardExpense[] = Array.from(cardMap.entries())
            .map(([cardId, data]) => ({
                cardId,
                cardName: data.cardName,
                cardType: data.cardType,
                total: data.total,
                count: data.count,
            }))
            .sort((a, b) => b.total - a.total);

        // Vencimentos - despesas não pagas com data de vencimento
        const dueItems: DueItem[] = expenses
            .filter(t => t.dueDate) // Todas com data de vencimento
            .map(t => {
                const dueDate = new Date(t.dueDate!);
                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return {
                    id: t.id,
                    description: t.description,
                    amount: t.amount,
                    dueDate: t.dueDate!,
                    isPaid: t.isPaid,
                    isOverdue: !t.isPaid && diffDays < 0,
                    daysUntilDue: diffDays,
                };
            })
            .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

        // Vencimentos pendentes (não pagos e ainda não vencidos)
        const upcomingDues = dueItems.filter(d => !d.isPaid && !d.isOverdue);
        // Vencimentos atrasados (não pagos e já vencidos)
        const overdueDues = dueItems.filter(d => !d.isPaid && d.isOverdue);

        const monthName = new Date(year, month).toLocaleString('pt-BR', { month: 'long' });

        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
        const transactionCount = monthTransactions.length;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const averageExpensePerDay = totalExpenses / daysInMonth;

        return {
            month,
            year,
            monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            totalExpenses,
            totalIncome,
            balance,
            paidExpenses,
            pendingExpenses,
            categories,
            transactions: monthTransactions,
            cardExpenses,
            upcomingDues,
            overdueDues,
            savingsRate,
            transactionCount,
            averageExpensePerDay,
        };
    };

    const calculateMonthComparison = (current: MonthSummary, previous: MonthSummary): MonthComparison => {
        const expenseChange = current.totalExpenses - previous.totalExpenses;
        const expenseChangePercent = previous.totalExpenses > 0 ? (expenseChange / previous.totalExpenses) * 100 : 0;
        
        const incomeChange = current.totalIncome - previous.totalIncome;
        const incomeChangePercent = previous.totalIncome > 0 ? (incomeChange / previous.totalIncome) * 100 : 0;
        
        const balanceChange = current.balance - previous.balance;
        
        let trend: 'improving' | 'worsening' | 'stable' = 'stable';
        if (balanceChange > previous.balance * 0.1) trend = 'improving';
        else if (balanceChange < -previous.balance * 0.1) trend = 'worsening';
        
        return {
            expenseChange,
            expenseChangePercent,
            incomeChange,
            incomeChangePercent,
            balanceChange,
            trend,
        };
    };

    const calculateFinancialScore = (data: MonthSummary, comparison: MonthComparison | null): FinancialScore => {
        const recommendations: string[] = [];
        
        // 1. Savings Score (0-30 pontos)
        let savingsScore = 0;
        if (data.savingsRate >= 30) savingsScore = 30;
        else if (data.savingsRate >= 20) savingsScore = 25;
        else if (data.savingsRate >= 10) savingsScore = 15;
        else if (data.savingsRate >= 5) savingsScore = 10;
        else if (data.savingsRate > 0) savingsScore = 5;
        
        if (data.savingsRate < 20) {
            recommendations.push('Tente poupar pelo menos 20% da sua renda mensal');
        }
        
        // 2. Payment Score (0-30 pontos)
        const paymentRate = data.totalExpenses > 0 ? (data.paidExpenses / data.totalExpenses) * 100 : 100;
        let paymentScore = 0;
        if (paymentRate >= 95) paymentScore = 30;
        else if (paymentRate >= 80) paymentScore = 20;
        else if (paymentRate >= 60) paymentScore = 10;
        else paymentScore = 5;
        
        if (data.overdueDues.length > 0) {
            paymentScore = Math.max(0, paymentScore - 10);
            recommendations.push(`Pague as ${data.overdueDues.length} conta(s) atrasada(s)`);
        }
        
        // 3. Diversification Score (0-20 pontos)
        const categoriesCount = data.categories.length;
        const topCategoryPercent = data.categories.length > 0 ? data.categories[0].percentage : 0;
        let diversificationScore = 0;
        
        if (topCategoryPercent < 30 && categoriesCount >= 5) diversificationScore = 20;
        else if (topCategoryPercent < 40 && categoriesCount >= 4) diversificationScore = 15;
        else if (topCategoryPercent < 50) diversificationScore = 10;
        else diversificationScore = 5;
        
        if (topCategoryPercent > 50) {
            recommendations.push('Seus gastos estão muito concentrados em uma categoria');
        }
        
        // 4. Credit Usage Score (0-20 pontos)
        const creditTotal = data.cardExpenses.filter(c => c.cardType === 'credit').reduce((sum, c) => sum + c.total, 0);
        const creditUsageRate = data.totalExpenses > 0 ? (creditTotal / data.totalExpenses) * 100 : 0;
        let creditUsageScore = 0;
        
        if (creditUsageRate < 30) creditUsageScore = 20;
        else if (creditUsageRate < 50) creditUsageScore = 15;
        else if (creditUsageRate < 70) creditUsageScore = 10;
        else creditUsageScore = 5;
        
        if (creditUsageRate > 60) {
            recommendations.push('Use mais o débito para ter melhor controle dos gastos');
        }
        
        const score = savingsScore + paymentScore + diversificationScore + creditUsageScore;
        
        // Adicionar recomendações baseadas na comparação
        if (comparison && comparison.expenseChangePercent > 15) {
            recommendations.push('Suas despesas aumentaram significativamente. Revise seus gastos');
        }
        
        if (data.savingsRate > 25) {
            recommendations.push('Excelente! Considere investir parte das suas economias');
        }
        
        return {
            score,
            savingsScore,
            paymentScore,
            diversificationScore,
            creditUsageScore,
            recommendations,
        };
    };

    const calculatePeriodStats = (data: MonthSummary, previousData: MonthSummary | null): PeriodStats => {
        // Estatísticas por dia da semana
        const dayMap = new Map<number, { total: number; count: number }>();
        data.transactions.filter(t => t.type === 'expense').forEach(t => {
            const day = new Date(t.date).getDay();
            const current = dayMap.get(day) || { total: 0, count: 0 };
            dayMap.set(day, {
                total: current.total + t.amount,
                count: current.count + 1,
            });
        });
        
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const dayOfWeekStats = Array.from(dayMap.entries())
            .map(([day, stats]) => ({
                day: dayNames[day],
                total: stats.total,
                count: stats.count,
            }))
            .sort((a, b) => b.total - a.total);
        
        // Crescimento por categoria (comparado com mês anterior)
        const categoryGrowth: { category: string; growth: number; growthPercent: number }[] = [];
        if (previousData) {
            const prevCategoryMap = new Map(previousData.categories.map(c => [c.category, c.amount]));
            data.categories.forEach(cat => {
                const prevAmount = prevCategoryMap.get(cat.category) || 0;
                const growth = cat.amount - prevAmount;
                const growthPercent = prevAmount > 0 ? (growth / prevAmount) * 100 : 100;
                if (Math.abs(growthPercent) > 10) {
                    categoryGrowth.push({
                        category: cat.category,
                        growth,
                        growthPercent,
                    });
                }
            });
            categoryGrowth.sort((a, b) => Math.abs(b.growthPercent) - Math.abs(a.growthPercent));
        }
        
        // Top 5 maiores gastos (ignorar categoria "cartao")
        const topExpenses: TopExpense[] = data.transactions
            .filter(t => t.type === 'expense' && t.category !== 'cartao')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map(t => ({
                description: t.description,
                amount: t.amount,
                category: t.category,
                date: new Date(t.date).toLocaleDateString('pt-BR'),
            }));
        
        return {
            dayOfWeekStats,
            categoryGrowth,
            topExpenses,
        };
    };

    const generateInsights = (data: MonthSummary, comparison: MonthComparison | null) => {
        const newInsights: Insight[] = [];

        // 1. Comparação com mês anterior (primeira posição se houver)
        if (comparison) {
            if (comparison.trend === 'improving') {
                newInsights.push({
                    type: 'success',
                    title: '📈 Situação Melhorando',
                    message: `Saldo aumentou R$ ${formatCurrency(Math.abs(comparison.balanceChange))} vs mês anterior.`,
                    icon: 'trending-up'
                });
            } else if (comparison.trend === 'worsening') {
                newInsights.push({
                    type: 'warning',
                    title: '📉 Atenção aos Gastos',
                    message: `Saldo reduziu R$ ${formatCurrency(Math.abs(comparison.balanceChange))} vs mês anterior.`,
                    icon: 'trending-down'
                });
            }
            
            if (Math.abs(comparison.expenseChangePercent) > 10) {
                const verb = comparison.expenseChange > 0 ? 'aumentaram' : 'diminuíram';
                newInsights.push({
                    type: comparison.expenseChange > 0 ? 'warning' : 'success',
                    title: `Despesas ${verb}`,
                    message: `${Math.abs(comparison.expenseChangePercent).toFixed(0)}% (R$ ${formatCurrency(Math.abs(comparison.expenseChange))}) vs mês anterior.`,
                    icon: comparison.expenseChange > 0 ? 'arrow-up' : 'arrow-down'
                });
            }
        }

        // 2. Saldo do mês
        if (data.balance < 0) {
            newInsights.push({
                type: 'danger',
                title: 'Saldo Negativo',
                message: `Despesas superam receitas em R$ ${formatCurrency(Math.abs(data.balance))} neste mês.`,
                icon: 'alert-circle'
            });
        } else if (data.balance > 0) {
            newInsights.push({
                type: 'success',
                title: 'Saldo Positivo',
                message: `Você está economizando R$ ${formatCurrency(data.balance)} este mês!`,
                icon: 'checkmark-circle'
            });
        }

        // ====== 2. DICAS DE ECONOMIA (segunda posição) ======
        
        // Dica: Alimentação fora de casa (Lanches, Restaurantes, Delivery)
        const foodOutCategories = ['lanche', 'lanches', 'restaurante', 'restaurantes', 'delivery', 'fast food', 'ifood'];
        const foodOutExpenses = data.categories.filter(c => 
            foodOutCategories.some(fc => c.category.toLowerCase().includes(fc))
        );
        const totalFoodOut = foodOutExpenses.reduce((sum, c) => sum + c.amount, 0);
        const foodOutPercentage = data.totalIncome > 0 ? (totalFoodOut / data.totalIncome) * 100 : 0;
        
        if (foodOutPercentage > 15) {
            newInsights.push({
                type: 'warning',
                title: '💡 Dica: Alimentação',
                message: `${foodOutPercentage.toFixed(0)}% da renda em alimentação fora. Cozinhar em casa pode economizar até 70%!`,
                icon: 'restaurant'
            });
        }

        // Dica: Regra 50/30/20
        const savingsPercentage = data.totalIncome > 0 ? (data.balance / data.totalIncome) * 100 : 0;
        if (savingsPercentage < 20 && savingsPercentage >= 0 && data.totalIncome > 0) {
            newInsights.push({
                type: 'info',
                title: '💡 Regra 50/30/20',
                message: `Você está poupando ${savingsPercentage.toFixed(0)}%. Tente guardar 20% da renda para emergências e investimentos.`,
                icon: 'bulb'
            });
        }

        // Dica: Assinaturas e serviços recorrentes (somente despesas, nunca receitas)
        const subscriptionCategories = ['assinatura', 'streaming', 'netflix', 'spotify', 'academia', 'mensalidade'];
        // Filtrar diretamente das transações para garantir que apenas despesas sejam consideradas
        const subscriptionExpenses = data.transactions.filter(t => {
            if (t.type !== 'expense') return false;
            const cat = t.category.toLowerCase();
            return subscriptionCategories.some(sc => cat.includes(sc));
        });
        if (subscriptionExpenses.length > 0) {
            const totalSubs = subscriptionExpenses.reduce((sum, t) => sum + t.amount, 0);
            newInsights.push({
                type: 'info',
                title: '💡 Revise Assinaturas',
                message: `R$ ${formatCurrency(totalSubs)} em assinaturas. Cancele as que não usa frequentemente.`,
                icon: 'refresh',
                actionableType: 'subscriptions',
            });
        }

        // Dica: Lazer e entretenimento alto
        const leisureCategories = ['lazer', 'entretenimento', 'diversão', 'cinema', 'shows', 'jogos', 'games'];
        const leisureExpenses = data.categories.filter(c => 
            leisureCategories.some(lc => c.category.toLowerCase().includes(lc))
        );
        const totalLeisure = leisureExpenses.reduce((sum, c) => sum + c.amount, 0);
        const leisurePercentage = data.totalIncome > 0 ? (totalLeisure / data.totalIncome) * 100 : 0;
        
        if (leisurePercentage > 10) {
            newInsights.push({
                type: 'warning',
                title: '💡 Lazer Consciente',
                message: `${leisurePercentage.toFixed(0)}% em lazer. Busque alternativas gratuitas como parques e eventos públicos.`,
                icon: 'game-controller'
            });
        }

        // Dica: Muitas compras pequenas (compras por impulso)
        const smallPurchases = data.transactions.filter(t => 
            t.type === 'expense' && t.amount < 50
        );
        if (smallPurchases.length > 15) {
            const totalSmall = smallPurchases.reduce((sum, t) => sum + t.amount, 0);
            newInsights.push({
                type: 'warning',
                title: '💡 Compras por Impulso',
                message: `${smallPurchases.length} compras abaixo de R$50 totalizaram R$ ${formatCurrency(totalSmall)}. Pequenos gastos somam!`,
                icon: 'cart',
                actionableType: 'impulse',
            });
        }

        // Dica: Uso excessivo de crédito vs débito
        const creditCardExpenses = data.cardExpenses.filter(c => c.cardType === 'credit');
        const debitTotal = data.cardExpenses.filter(c => c.cardType === 'debit').reduce((sum, c) => sum + c.total, 0);
        const creditTotal = creditCardExpenses.reduce((sum, c) => sum + c.total, 0);
        
        if (creditTotal > debitTotal * 2 && creditTotal > 500) {
            newInsights.push({
                type: 'warning',
                title: '💡 Prefira o Débito',
                message: `Crédito é ${(creditTotal / (debitTotal || 1)).toFixed(1)}x maior que débito. Use débito para ter mais controle dos gastos.`,
                icon: 'swap-horizontal'
            });
        }

        // Dica: Transporte
        const transportCategories = ['transporte', 'uber', '99', 'combustível', 'gasolina', 'estacionamento'];
        const transportExpenses = data.categories.filter(c => 
            transportCategories.some(tc => c.category.toLowerCase().includes(tc))
        );
        const totalTransport = transportExpenses.reduce((sum, c) => sum + c.amount, 0);
        const transportPercentage = data.totalIncome > 0 ? (totalTransport / data.totalIncome) * 100 : 0;
        
        if (transportPercentage > 15) {
            newInsights.push({
                type: 'info',
                title: '💡 Economize no Transporte',
                message: `${transportPercentage.toFixed(0)}% em transporte. Considere caronas, transporte público ou bicicleta.`,
                icon: 'car'
            });
        }

        // Dica: Sem renda registrada
        if (data.totalIncome === 0 && data.totalExpenses > 0) {
            newInsights.push({
                type: 'warning',
                title: '💡 Registre suas Receitas',
                message: 'Cadastre seus salários e rendas para ter uma visão completa das finanças.',
                icon: 'cash'
            });
        }

        // Dica positiva: Parabéns por economizar
        if (savingsPercentage >= 30) {
            newInsights.push({
                type: 'success',
                title: '🎉 Excelente!',
                message: `Você está guardando ${savingsPercentage.toFixed(0)}% da renda. Continue assim e considere investir!`,
                icon: 'trophy'
            });
        }

        // ====== 3. OUTROS INSIGHTS ======

        // Contas atrasadas
        if (data.overdueDues.length > 0) {
            const totalOverdue = data.overdueDues.reduce((sum, d) => sum + d.amount, 0);
            newInsights.push({
                type: 'danger',
                title: `${data.overdueDues.length} Conta(s) Atrasada(s)`,
                message: `Total de R$ ${formatCurrency(totalOverdue)} em atraso.`,
                icon: 'warning',
                actionableType: 'overdue',
            });
        }

        // Contas a vencer em 7 dias
        const dueSoon = data.upcomingDues.filter(d => d.daysUntilDue <= 7 && d.daysUntilDue >= 0);
        if (dueSoon.length > 0) {
            const totalDueSoon = dueSoon.reduce((sum, d) => sum + d.amount, 0);
            newInsights.push({
                type: 'warning',
                title: `${dueSoon.length} Conta(s) Vencendo`,
                message: `R$ ${formatCurrency(totalDueSoon)} vencem em 7 dias.`,
                icon: 'time',
                actionableType: 'dueSoon',
            });
        }

        // Gastos no cartão de crédito
        if (creditCardExpenses.length > 0) {
            newInsights.push({
                type: 'info',
                title: 'Gastos no Crédito',
                message: `R$ ${formatCurrency(creditTotal)} no cartão de crédito.`,
                icon: 'card',
                actionableType: 'credit',
            });
        }

        // ====== 4. MAIOR GASTO (última posição) ======
        if (data.categories.length > 0) {
            const topCategory = data.categories[0];
            if (topCategory.percentage > 25) {
                newInsights.push({
                    type: 'info',
                    title: `Maior Gasto: ${topCategory.category}`,
                    message: `${topCategory.percentage.toFixed(0)}% das despesas.`,
                    icon: 'pie-chart'
                });
            }
        }

        setInsights(newInsights);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [transactions, creditCards, salaries] = await Promise.all([
                FirestoreService.getTransactions(),
                CreditCardFirestoreService.getCreditCards(),
                SalaryFirestoreService.getSalaries(),
            ]);

            setAllTransactions(transactions);
            setCards(creditCards);
            setAllSalaries(salaries);

            // Processar histórico
            const labels: string[] = [];
            const expenses: number[] = [];
            const income: number[] = [];

            for (let m = 0; m <= currentMonth; m++) {
                const monthData = processMonthData(transactions, m, currentYear, creditCards, salaries);
                const shortName = monthData.monthName.substring(0, 3).toUpperCase();
                labels.push(shortName);
                expenses.push(monthData.totalExpenses);
                income.push(monthData.totalIncome);
            }

            setChartData({ labels, expenses, income });

            // Selecionar mês atual com regra de carry-over (igual à Home)
            const currentRaw = processMonthData(transactions, currentMonth, currentYear, creditCards, salaries);

            let prevMonth = currentMonth - 1;
            let prevYear = currentYear;
            if (prevMonth < 0) {
                prevMonth = 11;
                prevYear = currentYear - 1;
            }
            const prevRaw = processMonthData(transactions, prevMonth, prevYear, creditCards, salaries);

            const { current: homeCurrent, previous: homePrevious } = await FirestoreService.getMonthlyDataWithPrevious(currentMonth, currentYear);

            const currentData: MonthSummary = {
                ...currentRaw,
                transactions: homeCurrent.transactions,
                totalIncome: homeCurrent.totalIncome,
                totalExpenses: homeCurrent.totalExpenses,
                balance: homeCurrent.balance,
            };

            const prevData: MonthSummary = {
                ...prevRaw,
                transactions: homePrevious.transactions,
                totalIncome: homePrevious.totalIncome,
                totalExpenses: homePrevious.totalExpenses,
                balance: homePrevious.balance,
            };

            setSelectedData(currentData);
            setPreviousMonthData(prevData);
            
            // Calcular comparação
            const comparison = calculateMonthComparison(currentData, prevData);
            setMonthComparison(comparison);
            
            // Calcular score financeiro
            const score = calculateFinancialScore(currentData, comparison);
            setFinancialScore(score);
            
            // Calcular estatísticas do período
            const stats = calculatePeriodStats(currentData, prevData);
            setPeriodStats(stats);
            
            generateInsights(currentData, comparison);

        } catch (error) {
            console.error('Error loading chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [currentMonth, currentYear])
    );

    const changeMonth = async (direction: 'prev' | 'next') => {
        let newMonth = currentMonth;
        let newYear = currentYear;

        if (direction === 'prev') {
            if (currentMonth === 0) {
                newMonth = 11;
                newYear = currentYear - 1;
            } else {
                newMonth = currentMonth - 1;
            }
        } else {
            if (currentMonth === 11) {
                newMonth = 0;
                newYear = currentYear + 1;
            } else {
                newMonth = currentMonth + 1;
            }
        }

        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
        
        const newRaw = processMonthData(allTransactions, newMonth, newYear, cards, allSalaries);

        let prevMonth = newMonth - 1;
        let prevYear = newYear;
        if (prevMonth < 0) {
            prevMonth = 11;
            prevYear = newYear - 1;
        }
        const prevRaw = processMonthData(allTransactions, prevMonth, prevYear, cards, allSalaries);

        const { current: homeCurrent, previous: homePrevious } = await FirestoreService.getMonthlyDataWithPrevious(newMonth, newYear);

        const newData: MonthSummary = {
            ...newRaw,
            transactions: homeCurrent.transactions,
            totalIncome: homeCurrent.totalIncome,
            totalExpenses: homeCurrent.totalExpenses,
            balance: homeCurrent.balance,
        };

        const prevData: MonthSummary = {
            ...prevRaw,
            transactions: homePrevious.transactions,
            totalIncome: homePrevious.totalIncome,
            totalExpenses: homePrevious.totalExpenses,
            balance: homePrevious.balance,
        };

        setSelectedData(newData);
        setPreviousMonthData(prevData);
        
        const comparison = calculateMonthComparison(newData, prevData);
        setMonthComparison(comparison);
        
        const score = calculateFinancialScore(newData, comparison);
        setFinancialScore(score);
        
        const stats = calculatePeriodStats(newData, prevData);
        setPeriodStats(stats);
        
        generateInsights(newData, comparison);
    };

    const chartConfig = {
        backgroundColor: theme.colors.backgroundCard,
        backgroundGradientFrom: theme.colors.backgroundCard,
        backgroundGradientTo: theme.colors.backgroundCard,
        decimalPlaces: 0,
        color: () => theme.colors.primary,
        labelColor: () => theme.colors.textSecondary,
        style: {
            borderRadius: theme.borderRadius.md,
        },
        propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: theme.colors.primary,
        },
    };

    const renderInsightCard = (insight: Insight, index: number) => {
        let iconColor = theme.colors.text;

        switch (insight.type) {
            case 'success': iconColor = theme.colors.success; break;
            case 'warning': iconColor = theme.colors.warning; break;
            case 'danger': iconColor = theme.colors.danger; break;
            case 'info': iconColor = theme.colors.primary; break;
        }

        const openInsightDetail = (selectedInsight: Insight) => {
            if (!selectedData || !selectedInsight.actionableType) {
                return;
            }

            if (selectedInsight.actionableType === 'subscriptions') {
                const subscriptionKeywords = ['assinatura', 'streaming', 'netflix', 'spotify', 'academia', 'mensalidade'];
                // Apenas despesas — receitas recorrentes/parceladas mantêm sua categoria original
                const subscriptionTransactions = selectedData.transactions.filter((transaction) => {
                    if (transaction.type !== 'expense') return false;
                    const normalizedCategory = transaction.category.toLowerCase();
                    return subscriptionKeywords.some((keyword) =>
                        normalizedCategory.includes(keyword)
                    );
                });

                const grouped = new Map<string, InsightDetailItem>();
                subscriptionTransactions.forEach((transaction) => {
                    const key = (transaction.description || transaction.category).trim().toLowerCase();
                    const existing = grouped.get(key);
                    if (existing) {
                        existing.amount += transaction.amount;
                    } else {
                        grouped.set(key, {
                            id: transaction.id,
                            title: transaction.description || transaction.category,
                            subtitle: transaction.category,
                            amount: transaction.amount,
                        });
                    }
                });

                const items = Array.from(grouped.values()).sort((a, b) => b.amount - a.amount);
                const total = items.reduce((sum, item) => sum + item.amount, 0);

                setInsightDetail({
                    title: 'Assinaturas para revisar',
                    subtitle: `Total identificado: R$ ${formatCurrency(total)} (${items.length} item(ns))`,
                    items,
                });
                return;
            }

            if (selectedInsight.actionableType === 'impulse') {
                const impulseTransactions = selectedData.transactions
                    .filter((transaction) => transaction.type === 'expense' && transaction.amount < 50)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction) => ({
                        id: transaction.id,
                        title: transaction.description,
                        subtitle: `${new Date(transaction.date).toLocaleDateString('pt-BR')} • ${transaction.category}`,
                        amount: transaction.amount,
                    }));

                const total = impulseTransactions.reduce((sum, item) => sum + item.amount, 0);

                setInsightDetail({
                    title: 'Compras por impulso',
                    subtitle: `Total identificado: R$ ${formatCurrency(total)} (${impulseTransactions.length} compra(s))`,
                    items: impulseTransactions,
                });
                return;
            }

            if (selectedInsight.actionableType === 'overdue') {
                const overdueItems = selectedData.overdueDues
                    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
                    .map((dueItem) => ({
                        id: dueItem.id,
                        title: dueItem.description,
                        subtitle: `Venceu em ${new Date(dueItem.dueDate).toLocaleDateString('pt-BR')}`,
                        amount: dueItem.amount,
                    }));

                const total = overdueItems.reduce((sum, item) => sum + item.amount, 0);

                setInsightDetail({
                    title: 'Contas atrasadas',
                    subtitle: `Total em atraso: R$ ${formatCurrency(total)} (${overdueItems.length} conta(s))`,
                    items: overdueItems,
                });
                return;
            }

            if (selectedInsight.actionableType === 'dueSoon') {
                const dueSoonItems = selectedData.upcomingDues
                    .filter((dueItem) => dueItem.daysUntilDue <= 7 && dueItem.daysUntilDue >= 0)
                    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
                    .map((dueItem) => ({
                        id: dueItem.id,
                        title: dueItem.description,
                        subtitle: `Vence em ${new Date(dueItem.dueDate).toLocaleDateString('pt-BR')} (${dueItem.daysUntilDue} dia(s))`,
                        amount: dueItem.amount,
                    }));

                const total = dueSoonItems.reduce((sum, item) => sum + item.amount, 0);

                setInsightDetail({
                    title: 'Contas vencendo em breve',
                    subtitle: `Total a vencer: R$ ${formatCurrency(total)} (${dueSoonItems.length} conta(s))`,
                    items: dueSoonItems,
                });
                return;
            }

            if (selectedInsight.actionableType === 'credit') {
                const creditItems = selectedData.cardExpenses
                    .filter((cardExpense) => cardExpense.cardType === 'credit')
                    .sort((a, b) => b.total - a.total)
                    .map((cardExpense) => ({
                        id: cardExpense.cardId,
                        title: cardExpense.cardName,
                        subtitle: `${cardExpense.count} compra(s) no crédito`,
                        amount: cardExpense.total,
                    }));

                const total = creditItems.reduce((sum, item) => sum + item.amount, 0);

                setInsightDetail({
                    title: 'Gastos no cartão de crédito',
                    subtitle: `Total no crédito: R$ ${formatCurrency(total)} (${creditItems.length} cartão(ões))`,
                    items: creditItems,
                });
            }
        };

        return (
            <TouchableOpacity
                key={index}
                style={[styles.insightCard, insight.actionableType && styles.insightCardActionable, { borderLeftColor: iconColor }]}
                activeOpacity={insight.actionableType ? 0.8 : 1}
                onPress={() => openInsightDetail(insight)}
                disabled={!insight.actionableType}
            >
                <View style={styles.insightHeader}>
                    <Ionicons name={insight.icon} size={24} color={iconColor} />
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                </View>
                <Text style={styles.insightMessage} numberOfLines={3}>{insight.message}</Text>
                {insight.actionableType && (
                    <View style={styles.insightActionHint}>
                        <Text style={styles.insightActionHintText}>Toque para ver detalhes</Text>
                        <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderOverviewTab = () => {
        if (!selectedData) return null;

        return (
            <View>
                {/* Comparação com mês anterior */}
                {previousMonthData && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Comparação com Mês Anterior</Text>
                        <View style={styles.monthComparisonContainer}>
                            <View style={styles.monthComparisonBlock}>
                                <Text style={styles.monthComparisonTitle}>
                                    {`${previousMonthData.monthName}/${previousMonthData.year}`}
                                </Text>
                                <View style={styles.monthComparisonRow}>
                                    <Text style={styles.monthComparisonLabel}>Receitas</Text>
                                    <Text style={[styles.monthComparisonValue, { color: theme.colors.success }]}>
                                        R$ {formatCurrency(previousMonthData.totalIncome)}
                                    </Text>
                                </View>
                                <View style={styles.monthComparisonRow}>
                                    <Text style={styles.monthComparisonLabel}>Despesas</Text>
                                    <Text style={[styles.monthComparisonValue, { color: theme.colors.danger }]}>
                                        R$ {formatCurrency(previousMonthData.totalExpenses)}
                                    </Text>
                                </View>
                                <View style={styles.monthComparisonRow}>
                                    <Text style={styles.monthComparisonLabel}>Saldo Final</Text>
                                    <Text
                                        style={[
                                            styles.monthComparisonValue,
                                            { color: previousMonthData.balance >= 0 ? theme.colors.success : theme.colors.danger },
                                        ]}
                                    >
                                        R$ {formatCurrency(previousMonthData.balance)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.monthComparisonDivider} />

                            <View style={styles.monthComparisonBlock}>
                                <Text style={styles.monthComparisonTitle}>
                                    {`${selectedData.monthName}/${selectedData.year}`}
                                </Text>
                                <View style={styles.monthComparisonRow}>
                                    <Text style={styles.monthComparisonLabel}>Receitas</Text>
                                    <Text style={[styles.monthComparisonValue, { color: theme.colors.success }]}>
                                        R$ {formatCurrency(selectedData.totalIncome)}
                                    </Text>
                                </View>
                                <View style={styles.monthComparisonRow}>
                                    <Text style={styles.monthComparisonLabel}>Despesas</Text>
                                    <Text style={[styles.monthComparisonValue, { color: theme.colors.danger }]}>
                                        R$ {formatCurrency(selectedData.totalExpenses)}
                                    </Text>
                                </View>
                                <View style={styles.monthComparisonRow}>
                                    <Text style={styles.monthComparisonLabel}>Saldo Final</Text>
                                    <Text
                                        style={[
                                            styles.monthComparisonValue,
                                            { color: selectedData.balance >= 0 ? theme.colors.success : theme.colors.danger },
                                        ]}
                                    >
                                        R$ {formatCurrency(selectedData.balance)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Gráfico de tendência */}
                <View
                    style={styles.card}
                    onLayout={(event) => {
                        const cardWidth = event.nativeEvent.layout.width;
                        const horizontalPadding = theme.spacing.md * 2;
                        const availableWidth = Math.max(220, cardWidth - horizontalPadding);

                        if (Math.abs(availableWidth - trendChartWidth) > 1) {
                            setTrendChartWidth(availableWidth);
                        }
                    }}
                >
                    <Text style={styles.cardTitle}>Tendência do Ano</Text>
                    {chartData.labels.length > 0 && (
                        <LineChart
                            data={{
                                labels: chartData.labels,
                                datasets: [
                                    {
                                        data: chartData.income.length > 0 ? chartData.income : [0],
                                        color: () => theme.colors.success,
                                        strokeWidth: 2,
                                    },
                                    {
                                        data: chartData.expenses.length > 0 ? chartData.expenses : [0],
                                        color: () => theme.colors.danger,
                                        strokeWidth: 2,
                                    },
                                ],
                                legend: ['Receitas', 'Despesas']
                            }}
                            width={trendChartWidth}
                            height={180}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    )}
                </View>
            </View>
        );
    };

    const renderCategoriesTab = () => {
        if (!selectedData || selectedData.categories.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="pie-chart-outline" size={64} color={theme.colors.textMuted} />
                    <Text style={styles.emptyText}>Nenhuma despesa neste mês</Text>
                </View>
            );
        }

        return (
            <View>
                {/* Lista de categorias */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Detalhamento por Categoria</Text>
                    {selectedData.categories.map((cat, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.categoryItem}
                            activeOpacity={0.7}
                            onPress={() => {
                                const catTransactions = selectedData.transactions
                                    .filter(t => t.type === 'expense' && t.category === cat.category)
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                                setSelectedCategory({ category: cat.category, color: cat.color, transactions: catTransactions });
                            }}
                        >
                            <View style={styles.categoryInfo}>
                                <View style={[styles.categoryIconContainer, { backgroundColor: cat.color + '20' }]}>
                                    <Ionicons 
                                        name={(CATEGORY_ICONS[cat.category] || 'ellipsis-horizontal') as any} 
                                        size={16} 
                                        color={cat.color} 
                                    />
                                </View>
                                <Text style={styles.categoryName}>{cat.category}</Text>
                            </View>
                            <View style={styles.categoryValues}>
                                <Text style={styles.categoryAmount}>R$ {formatCurrency(cat.amount)}</Text>
                                <Text style={styles.categoryPercentage}>{cat.percentage.toFixed(1)}%</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${cat.percentage}%`, backgroundColor: cat.color }]} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    const renderCardsTab = () => {
        if (!selectedData || selectedData.cardExpenses.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="card-outline" size={64} color={theme.colors.textMuted} />
                    <Text style={styles.emptyText}>Nenhum gasto com cartão neste mês</Text>
                </View>
            );
        }

        const totalCardExpenses = selectedData.cardExpenses.reduce((sum, c) => sum + c.total, 0);
        
        // Separar cartões por tipo
        const creditCards = selectedData.cardExpenses.filter(c => c.cardType === 'credit');
        const debitCards = selectedData.cardExpenses.filter(c => c.cardType === 'debit');
        
        const totalCredit = creditCards.reduce((sum, c) => sum + c.total, 0);
        const totalDebit = debitCards.reduce((sum, c) => sum + c.total, 0);

        return (
            <View>
                {/* Total gasto em cartões */}
                <View style={[styles.card, { backgroundColor: theme.colors.primary + '15' }]}>
                    <View style={styles.cardTotalRow}>
                        <Ionicons name="card" size={28} color={theme.colors.primary} />
                        <View style={styles.cardTotalInfo}>
                            <Text style={styles.cardTotalLabel}>Total em Cartões</Text>
                            <Text style={styles.cardTotalValue}>R$ {formatCurrency(totalCardExpenses)}</Text>
                        </View>
                    </View>
                </View>

                {/* Cartões de Crédito */}
                {creditCards.length > 0 && (
                    <View style={styles.cardSection}>
                        <View style={styles.cardSectionHeader}>
                            <Ionicons name="card" size={20} color={theme.colors.primary} />
                            <Text style={styles.cardSectionTitle}>Cartões de Crédito</Text>
                            <Text style={styles.cardSectionTotal}>R$ {formatCurrency(totalCredit)}</Text>
                        </View>
                        {creditCards.map((card, index) => (
                            <View key={index} style={styles.cardExpenseItem}>
                                <View style={styles.cardExpenseHeader}>
                                    <View style={styles.cardExpenseInfo}>
                                        <Ionicons 
                                            name="card" 
                                            size={24} 
                                            color={theme.colors.primary} 
                                        />
                                        <View>
                                            <Text style={styles.cardExpenseName}>{card.cardName}</Text>
                                            <Text style={styles.cardExpenseType}>
                                                {card.count} compra(s)
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.cardExpenseTotal}>R$ {formatCurrency(card.total)}</Text>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View 
                                        style={[
                                            styles.progressBarFill, 
                                            { 
                                                width: `${(card.total / totalCardExpenses) * 100}%`,
                                                backgroundColor: theme.colors.primary
                                            }
                                        ]} 
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Cartões de Débito */}
                {debitCards.length > 0 && (
                    <View style={styles.cardSection}>
                        <View style={styles.cardSectionHeader}>
                            <Ionicons name="card-outline" size={20} color={theme.colors.success} />
                            <Text style={styles.cardSectionTitle}>Cartões de Débito</Text>
                            <Text style={styles.cardSectionTotal}>R$ {formatCurrency(totalDebit)}</Text>
                        </View>
                        {debitCards.map((card, index) => (
                            <View key={index} style={styles.cardExpenseItem}>
                                <View style={styles.cardExpenseHeader}>
                                    <View style={styles.cardExpenseInfo}>
                                        <Ionicons 
                                            name="card-outline" 
                                            size={24} 
                                            color={theme.colors.success} 
                                        />
                                        <View>
                                            <Text style={styles.cardExpenseName}>{card.cardName}</Text>
                                            <Text style={styles.cardExpenseType}>
                                                {card.count} compra(s)
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.cardExpenseTotal}>R$ {formatCurrency(card.total)}</Text>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View 
                                        style={[
                                            styles.progressBarFill, 
                                            { 
                                                width: `${(card.total / totalCardExpenses) * 100}%`,
                                                backgroundColor: theme.colors.success
                                            }
                                        ]} 
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    const renderComparisonTab = () => {
        if (!selectedData || !previousMonthData) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="git-compare-outline" size={64} color={theme.colors.textMuted} />
                    <Text style={styles.emptyText}>Dados insuficientes para comparação</Text>
                </View>
            );
        }

        const currentSavingsRate = selectedData.totalIncome > 0
            ? (selectedData.balance / selectedData.totalIncome) * 100
            : 0;
        const previousSavingsRate = previousMonthData.totalIncome > 0
            ? (previousMonthData.balance / previousMonthData.totalIncome) * 100
            : 0;
        const savingsRateDiff = currentSavingsRate - previousSavingsRate;
        const savingsRateDiffColor = savingsRateDiff > 0 ? theme.colors.success : savingsRateDiff < 0 ? theme.colors.danger : theme.colors.textMuted;
        const savingsRateDiffSignal = savingsRateDiff > 0 ? '+' : savingsRateDiff < 0 ? '-' : '';
        const savingsRateDiffStatus = savingsRateDiff > 0 ? 'positivo' : savingsRateDiff < 0 ? 'negativo' : 'estável';
        const currentCategoriesMap = new Map(selectedData.categories.map((category) => [category.category, category.amount]));
        const previousCategoriesMap = new Map(previousMonthData.categories.map((category) => [category.category, category.amount]));
        const categoriesToCompare = Array.from(
            new Set([...currentCategoriesMap.keys(), ...previousCategoriesMap.keys()])
        ).sort((categoryA, categoryB) => {
            const totalA = (currentCategoriesMap.get(categoryA) || 0) + (previousCategoriesMap.get(categoryA) || 0);
            const totalB = (currentCategoriesMap.get(categoryB) || 0) + (previousCategoriesMap.get(categoryB) || 0);
            return totalB - totalA;
        });

        return (
            <View>
                {/* Taxa de economia mensal */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Taxa de Economia</Text>
                    <View style={allStyles.savingsRateContainer}>
                        <View style={allStyles.savingsRateItem}>
                            <Text style={allStyles.savingsRateLabel}>Variação vs mês anterior</Text>
                            <Text style={[allStyles.savingsRateValue, { color: savingsRateDiffColor }]}> 
                                {savingsRateDiffSignal}{Math.abs(savingsRateDiff).toFixed(1)}%
                            </Text>
                            <Text style={[allStyles.savingsRateAmount, { color: savingsRateDiffColor }]}>
                                {savingsRateDiffStatus}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Comparação de categorias lado a lado */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Comparação por Categoria</Text>
                    {categoriesToCompare.length === 0 ? (
                        <Text style={styles.emptyText}>Sem categorias para comparação</Text>
                    ) : categoriesToCompare.map((categoryName) => {
                        const prevAmount = previousCategoriesMap.get(categoryName) || 0;
                        const currentAmount = currentCategoriesMap.get(categoryName) || 0;
                        const diff = prevAmount - currentAmount;
                        const hasPreviousSpend = prevAmount > 0;
                        const diffPercent = prevAmount > 0
                            ? (diff / prevAmount) * 100
                            : (currentAmount > 0 ? -100 : 0);
                        const diffColor = diff > 0 ? theme.colors.success : diff < 0 ? theme.colors.danger : theme.colors.textMuted;
                        const diffSignal = diff > 0 ? '+' : diff < 0 ? '-' : '';
                        const diffTypeLabel = diff > 0 ? 'Positivo' : diff < 0 ? 'Negativo' : 'Estável';
                        
                        return (
                            <View key={categoryName} style={allStyles.categoryComparisonItem}>
                                <Text style={allStyles.categoryComparisonName}>{categoryName}</Text>
                                <View style={allStyles.categoryComparisonValues}>
                                    <View style={allStyles.categoryComparisonColumn}>
                                        <Text style={allStyles.categoryComparisonLabel}>Anterior</Text>
                                        <Text style={allStyles.categoryComparisonAmount}>R$ {formatCurrency(prevAmount)}</Text>
                                    </View>
                                    <View style={allStyles.categoryComparisonColumn}>
                                        <Text style={allStyles.categoryComparisonLabel}>Atual</Text>
                                        <Text style={allStyles.categoryComparisonAmount}>R$ {formatCurrency(currentAmount)}</Text>
                                    </View>
                                    <View style={allStyles.categoryComparisonColumn}>
                                        <Text style={allStyles.categoryComparisonLabel}>Diferença</Text>
                                        <Text style={[
                                            allStyles.categoryComparisonAmount,
                                            { color: diffColor }
                                        ]}>
                                            {diffSignal}R$ {formatCurrency(Math.abs(diff))}
                                        </Text>
                                        {hasPreviousSpend ? (
                                            <Text style={[allStyles.categoryComparisonPercentage, { color: diffColor }]}> 
                                                {Math.abs(diffPercent).toFixed(1)}% {diffTypeLabel}
                                            </Text>
                                        ) : (
                                            <Text style={[allStyles.categoryComparisonPercentage, { color: theme.colors.textMuted }]}> 
                                                Sem gasto no mês anterior
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    const renderRankingTab = () => {
        if (!selectedData || !periodStats) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="podium-outline" size={64} color={theme.colors.textMuted} />
                    <Text style={styles.emptyText}>Sem dados para ranking</Text>
                </View>
            );
        }

        return (
            <View>
                {/* Top 5 maiores gastos */}
                <View style={styles.card}>
                    <View style={allStyles.rankingHeader}>
                        <Ionicons name="trophy" size={24} color={theme.colors.warning} />
                        <Text style={styles.cardTitle}>Top 5 Maiores Gastos</Text>
                    </View>
                    {periodStats.topExpenses.map((expense, index) => (
                        <View key={index} style={allStyles.rankingItem}>
                            <View style={allStyles.rankingBadge}>
                                <Text style={allStyles.rankingPosition}>#{index + 1}</Text>
                            </View>
                            <View style={allStyles.rankingInfo}>
                                <Text style={allStyles.rankingDescription}>{expense.description}</Text>
                                <Text style={allStyles.rankingCategory}>{expense.category} • {expense.date}</Text>
                            </View>
                            <Text style={allStyles.rankingAmount}>R$ {formatCurrency(expense.amount)}</Text>
                        </View>
                    ))}
                </View>

                {/* Gastos por dia da semana */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Gastos por Dia da Semana</Text>
                    {periodStats.dayOfWeekStats.length > 0 ? (
                        periodStats.dayOfWeekStats.map((day, index) => {
                            const maxTotal = periodStats.dayOfWeekStats[0].total;
                            const percentage = (day.total / maxTotal) * 100;
                            
                            return (
                                <View key={index} style={allStyles.dayStatItem}>
                                    <Text style={allStyles.dayStatName}>{day.day}</Text>
                                    <View style={allStyles.dayStatBar}>
                                        <View style={[allStyles.dayStatFill, { width: `${percentage}%` }]} />
                                    </View>
                                    <View style={allStyles.dayStatValues}>
                                        <Text style={allStyles.dayStatAmount}>R$ {formatCurrency(day.total)}</Text>
                                        <Text style={allStyles.dayStatCount}>{day.count} compra(s)</Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={styles.emptyText}>Sem transações registradas</Text>
                    )}
                </View>

                {/* Estatísticas gerais */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Estatísticas do Mês</Text>
                    <View style={allStyles.statsGrid}>
                        <View style={allStyles.statItem}>
                            <Ionicons name="receipt-outline" size={24} color={theme.colors.primary} />
                            <Text style={allStyles.statValue}>{selectedData.transactionCount}</Text>
                            <Text style={allStyles.statLabel}>Transações</Text>
                        </View>
                        <View style={allStyles.statItem}>
                            <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
                            <Text style={allStyles.statValue}>R$ {formatCurrency(selectedData.averageExpensePerDay)}</Text>
                            <Text style={allStyles.statLabel}>Média/Dia</Text>
                        </View>
                        <View style={allStyles.statItem}>
                            <Ionicons name="pricetags-outline" size={24} color={theme.colors.primary} />
                            <Text style={allStyles.statValue}>{selectedData.categories.length}</Text>
                            <Text style={allStyles.statLabel}>Categorias</Text>
                        </View>
                        <View style={allStyles.statItem}>
                            <Ionicons name="card-outline" size={24} color={theme.colors.primary} />
                            <Text style={allStyles.statValue}>{selectedData.cardExpenses.length}</Text>
                            <Text style={allStyles.statLabel}>Cartões Usados</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const renderScoreTab = () => {
        if (!financialScore) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            );
        }

        const getScoreColor = (score: number) => {
            if (score >= 80) return theme.colors.success;
            if (score >= 60) return theme.colors.warning;
            return theme.colors.danger;
        };

        const getScoreLabel = (score: number) => {
            if (score >= 90) return 'Excelente';
            if (score >= 80) return 'Muito Bom';
            if (score >= 70) return 'Bom';
            if (score >= 60) return 'Regular';
            if (score >= 50) return 'Precisa Melhorar';
            return 'Crítico';
        };

        return (
            <View>
                {/* Score principal */}
                <View style={[styles.card, allStyles.scoreCard]}>
                    <Text style={styles.cardTitle}>Saúde Financeira</Text>
                    <View style={allStyles.scoreCircle}>
                        <Text style={[allStyles.scoreValue, { color: getScoreColor(financialScore.score) }]}>
                            {financialScore.score}
                        </Text>
                        <Text style={allStyles.scoreMax}>/100</Text>
                    </View>
                    <Text style={[allStyles.scoreLabel, { color: getScoreColor(financialScore.score) }]}>
                        {getScoreLabel(financialScore.score)}
                    </Text>
                    <View style={styles.progressBarBg}>
                        <View 
                            style={[
                                styles.progressBarFill, 
                                { width: `${financialScore.score}%`, backgroundColor: getScoreColor(financialScore.score) }
                            ]} 
                        />
                    </View>
                </View>

                {/* Breakdown do score */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Componentes do Score</Text>
                    
                    <View style={allStyles.scoreComponentItem}>
                        <View style={allStyles.scoreComponentHeader}>
                            <Ionicons name="wallet" size={20} color={theme.colors.primary} />
                            <Text style={allStyles.scoreComponentName}>Economia</Text>
                        </View>
                        <Text style={allStyles.scoreComponentValue}>{financialScore.savingsScore}/30</Text>
                        <View style={styles.progressBarBg}>
                            <View 
                                style={[
                                    styles.progressBarFill, 
                                    { width: `${(financialScore.savingsScore / 30) * 100}%`, backgroundColor: theme.colors.success }
                                ]} 
                            />
                        </View>
                    </View>

                    <View style={allStyles.scoreComponentItem}>
                        <View style={allStyles.scoreComponentHeader}>
                            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                            <Text style={allStyles.scoreComponentName}>Pagamentos em Dia</Text>
                        </View>
                        <Text style={allStyles.scoreComponentValue}>{financialScore.paymentScore}/30</Text>
                        <View style={styles.progressBarBg}>
                            <View 
                                style={[
                                    styles.progressBarFill, 
                                    { width: `${(financialScore.paymentScore / 30) * 100}%`, backgroundColor: theme.colors.success }
                                ]} 
                            />
                        </View>
                    </View>

                    <View style={allStyles.scoreComponentItem}>
                        <View style={allStyles.scoreComponentHeader}>
                            <Ionicons name="pie-chart" size={20} color={theme.colors.primary} />
                            <Text style={allStyles.scoreComponentName}>Diversificação</Text>
                        </View>
                        <Text style={allStyles.scoreComponentValue}>{financialScore.diversificationScore}/20</Text>
                        <View style={styles.progressBarBg}>
                            <View 
                                style={[
                                    styles.progressBarFill, 
                                    { width: `${(financialScore.diversificationScore / 20) * 100}%`, backgroundColor: theme.colors.success }
                                ]} 
                            />
                        </View>
                    </View>

                    <View style={allStyles.scoreComponentItem}>
                        <View style={allStyles.scoreComponentHeader}>
                            <Ionicons name="card" size={20} color={theme.colors.primary} />
                            <Text style={allStyles.scoreComponentName}>Uso de Crédito</Text>
                        </View>
                        <Text style={allStyles.scoreComponentValue}>{financialScore.creditUsageScore}/20</Text>
                        <View style={styles.progressBarBg}>
                            <View 
                                style={[
                                    styles.progressBarFill, 
                                    { width: `${(financialScore.creditUsageScore / 20) * 100}%`, backgroundColor: theme.colors.success }
                                ]} 
                            />
                        </View>
                    </View>
                </View>

                {/* Recomendações */}
                {financialScore.recommendations.length > 0 && (
                    <View style={styles.card}>
                        <View style={allStyles.recommendationsHeader}>
                            <Ionicons name="bulb" size={24} color={theme.colors.warning} />
                            <Text style={styles.cardTitle}>Recomendações</Text>
                        </View>
                        {financialScore.recommendations.map((rec, index) => (
                            <View key={index} style={allStyles.recommendationItem}>
                                <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                                <Text style={allStyles.recommendationText}>{rec}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const monthName = new Date(currentYear, currentMonth).toLocaleString('pt-BR', { month: 'long' });

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>

            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 80 + insets.bottom }]}>
                {/* Seletor de mês */}
                <View style={styles.monthSelector}>
                    <TouchableOpacity onPress={() => changeMonth('prev')}>
                        <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>

                    <Text style={styles.monthText}>
                        {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {currentYear}
                    </Text>

                    <TouchableOpacity onPress={() => changeMonth('next')}>
                        <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
                {/* Insights */}
                {insights.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Insights</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.insightsScroll}>
                            {insights.map((insight, index) => renderInsightCard(insight, index))}
                        </ScrollView>
                    </View>
                )}

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, isCompactTabs && styles.tabCompact, activeTab === 'overview' && styles.tabActive]}
                        onPress={() => setActiveTab('overview')}
                    >
                        <Ionicons name="stats-chart" size={isCompactTabs ? 14 : 16} color={activeTab === 'overview' ? theme.colors.primary : theme.colors.textMuted} />
                        <Text numberOfLines={1} style={[styles.tabText, isCompactTabs && styles.tabTextCompact, activeTab === 'overview' && styles.tabTextActive]}>Resumo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, isCompactTabs && styles.tabCompact, activeTab === 'comparison' && styles.tabActive]}
                        onPress={() => setActiveTab('comparison')}
                    >
                        <Ionicons name="git-compare" size={isCompactTabs ? 14 : 16} color={activeTab === 'comparison' ? theme.colors.primary : theme.colors.textMuted} />
                        <Text numberOfLines={1} style={[styles.tabText, isCompactTabs && styles.tabTextCompact, activeTab === 'comparison' && styles.tabTextActive]}>Comparar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, isCompactTabs && styles.tabCompact, activeTab === 'categories' && styles.tabActive]}
                        onPress={() => setActiveTab('categories')}
                    >
                        <Ionicons name="pie-chart" size={isCompactTabs ? 14 : 16} color={activeTab === 'categories' ? theme.colors.primary : theme.colors.textMuted} />
                        <Text numberOfLines={1} style={[styles.tabText, isCompactTabs && styles.tabTextCompact, activeTab === 'categories' && styles.tabTextActive]}>Categorias</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, isCompactTabs && styles.tabCompact, activeTab === 'cards' && styles.tabActive]}
                        onPress={() => setActiveTab('cards')}
                    >
                        <Ionicons name="card" size={isCompactTabs ? 14 : 16} color={activeTab === 'cards' ? theme.colors.primary : theme.colors.textMuted} />
                        <Text numberOfLines={1} style={[styles.tabText, isCompactTabs && styles.tabTextCompact, activeTab === 'cards' && styles.tabTextActive]}>Cartões</Text>
                    </TouchableOpacity>
                </View>

                {/* Conteúdo da tab ativa */}
                <View style={styles.tabContent}>
                    {activeTab === 'overview' && renderOverviewTab()}
                    {activeTab === 'comparison' && renderComparisonTab()}
                    {activeTab === 'categories' && renderCategoriesTab()}
                    {activeTab === 'cards' && renderCardsTab()}
                </View>
            </ScrollView>

            <Modal
                visible={!!insightDetail}
                transparent
                animationType="fade"
                onRequestClose={() => setInsightDetail(null)}
            >
                <View style={styles.insightModalOverlay}>
                    <View style={styles.insightModalContent}>
                        <View style={styles.insightModalHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.insightModalTitle}>{insightDetail?.title}</Text>
                                <Text style={styles.insightModalSubtitle}>{insightDetail?.subtitle}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setInsightDetail(null)} style={styles.insightModalCloseButton}>
                                <Ionicons name="close" size={22} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.insightModalList} showsVerticalScrollIndicator={false}>
                            {(insightDetail?.items || []).map((item) => (
                                <View key={item.id} style={styles.insightModalItem}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.insightModalItemTitle}>{item.title}</Text>
                                        <Text style={styles.insightModalItemSubtitle}>{item.subtitle}</Text>
                                    </View>
                                    <Text style={styles.insightModalItemAmount}>R$ {formatCurrency(item.amount)}</Text>
                                </View>
                            ))}
                            {insightDetail && insightDetail.items.length === 0 && (
                                <Text style={styles.emptyText}>Nenhum item encontrado para este insight.</Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Category Detail Modal */}
            <Modal
                visible={!!selectedCategory}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedCategory(null)}
            >
                <View style={styles.insightModalOverlay}>
                    <View style={styles.insightModalContent}>
                        <View style={styles.insightModalHeader}>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={[styles.categoryIconContainer, { backgroundColor: (selectedCategory?.color || '#666') + '20' }]}>
                                    <Ionicons
                                        name={(CATEGORY_ICONS[selectedCategory?.category || ''] || 'ellipsis-horizontal') as any}
                                        size={16}
                                        color={selectedCategory?.color || '#666'}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.insightModalTitle, { textTransform: 'capitalize' }]}>{selectedCategory?.category}</Text>
                                    <Text style={styles.insightModalSubtitle}>
                                        {selectedCategory?.transactions.length} transação(ões) — Total: R$ {formatCurrency(selectedCategory?.transactions.reduce((sum, t) => sum + t.amount, 0) || 0)}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.insightModalCloseButton}>
                                <Ionicons name="close" size={22} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.insightModalList} showsVerticalScrollIndicator={false}>
                            {(selectedCategory?.transactions || []).map((t) => (
                                <View key={t.id} style={styles.insightModalItem}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.insightModalItemTitle}>{t.description || t.category}</Text>
                                        <Text style={styles.insightModalItemSubtitle}>
                                            {new Date(t.date).toLocaleDateString('pt-BR')}
                                            {t.cardName ? ` • ${t.cardName}` : ''}
                                            {t.installments ? ` • ${t.installmentNumber}/${t.installments}` : ''}
                                        </Text>
                                    </View>
                                    <Text style={[styles.insightModalItemAmount, { color: theme.colors.danger }]}>R$ {formatCurrency(t.amount)}</Text>
                                </View>
                            ))}
                            {selectedCategory && selectedCategory.transactions.length === 0 && (
                                <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
