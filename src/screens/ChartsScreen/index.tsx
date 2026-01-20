import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { FirestoreService } from '../../services/firestoreService';
import { CreditCardFirestoreService } from '../../services/creditCardFirestoreService';
import { SalaryFirestoreService } from '../../services/salaryFirestoreService';
import { CategoryData, Transaction, CreditCard, Salary } from '../../types';
import { theme } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles';

const screenWidth = Dimensions.get('window').width;

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

export default function ChartsScreen() {
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
    const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'cards' | 'dues'>('overview');

    const processMonthData = (transactions: Transaction[], month: number, year: number, creditCards: CreditCard[], salaries: Salary[] = []): MonthSummary => {
        const today = new Date();
        
        const monthTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });

        const expenses = monthTransactions.filter(t => t.type === 'expense');
        const incomes = monthTransactions.filter(t => t.type === 'income');

        // Calcular salários do mês (salários ativos que têm paymentDate no mês ou são recorrentes)
        const monthlySalaries = salaries.filter(s => {
            if (!s.isActive) return false;
            if (s.paymentDate) {
                const d = new Date(s.paymentDate);
                return d.getMonth() === month && d.getFullYear() === year;
            }
            // Salários sem data específica são considerados mensais
            return true;
        });
        const totalSalaries = monthlySalaries.reduce((sum, s) => sum + s.amount, 0);

        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0) + totalSalaries;
        
        // Status de pagamento baseado no campo isPaid
        const paidExpenses = expenses.filter(t => t.isPaid).reduce((sum, t) => sum + t.amount, 0);
        const pendingExpenses = expenses.filter(t => !t.isPaid).reduce((sum, t) => sum + t.amount, 0);

        // Categorias
        const categoryMap = new Map<string, number>();
        expenses.forEach(t => {
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

        return {
            month,
            year,
            monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            totalExpenses,
            totalIncome,
            balance: totalIncome - totalExpenses,
            paidExpenses,
            pendingExpenses,
            categories,
            transactions: monthTransactions,
            cardExpenses,
            upcomingDues,
            overdueDues,
        };
    };

    const generateInsights = (data: MonthSummary) => {
        const newInsights: Insight[] = [];

        // 1. Saldo do mês (primeira posição)
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

        // Dica: Assinaturas e serviços recorrentes
        const subscriptionCategories = ['assinatura', 'streaming', 'netflix', 'spotify', 'academia', 'mensalidade'];
        const subscriptions = data.categories.filter(c => 
            subscriptionCategories.some(sc => c.category.toLowerCase().includes(sc))
        );
        if (subscriptions.length > 0) {
            const totalSubs = subscriptions.reduce((sum, c) => sum + c.amount, 0);
            newInsights.push({
                type: 'info',
                title: '💡 Revise Assinaturas',
                message: `R$ ${formatCurrency(totalSubs)} em assinaturas. Cancele as que não usa frequentemente.`,
                icon: 'refresh'
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
                icon: 'cart'
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
                icon: 'warning'
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
                icon: 'time'
            });
        }

        // Gastos no cartão de crédito
        if (creditCardExpenses.length > 0) {
            newInsights.push({
                type: 'info',
                title: 'Gastos no Crédito',
                message: `R$ ${formatCurrency(creditTotal)} no cartão de crédito.`,
                icon: 'card'
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

    const [allSalaries, setAllSalaries] = useState<Salary[]>([]);

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

            // Selecionar mês atual
            const currentData = processMonthData(transactions, currentMonth, currentYear, creditCards, salaries);
            setSelectedData(currentData);
            generateInsights(currentData);

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

    const changeMonth = (direction: 'prev' | 'next') => {
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
        
        const newData = processMonthData(allTransactions, newMonth, newYear, cards, allSalaries);
        setSelectedData(newData);
        generateInsights(newData);
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

        return (
            <View key={index} style={[styles.insightCard, { borderLeftColor: iconColor }]}>
                <View style={styles.insightHeader}>
                    <Ionicons name={insight.icon} size={24} color={iconColor} />
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                </View>
                <Text style={styles.insightMessage}>{insight.message}</Text>
            </View>
        );
    };

    const renderOverviewTab = () => {
        if (!selectedData) return null;

        return (
            <View>
                {/* Resumo */}
                <View style={styles.summaryGrid}>
                    <View style={styles.summaryCardSmall}>
                        <Ionicons name="arrow-down-circle" size={20} color={theme.colors.success} />
                        <Text style={styles.summaryLabelSmall}>Receitas</Text>
                        <Text style={[styles.summaryValueSmall, { color: theme.colors.success }]}>
                            R$ {formatCurrency(selectedData.totalIncome)}
                        </Text>
                    </View>
                    <View style={styles.summaryCardSmall}>
                        <Ionicons name="arrow-up-circle" size={20} color={theme.colors.danger} />
                        <Text style={styles.summaryLabelSmall}>Despesas</Text>
                        <Text style={[styles.summaryValueSmall, { color: theme.colors.danger }]}>
                            R$ {formatCurrency(selectedData.totalExpenses)}
                        </Text>
                    </View>
                    <View style={styles.summaryCardSmall}>
                        <Ionicons name="wallet" size={20} color={selectedData.balance >= 0 ? theme.colors.primary : theme.colors.danger} />
                        <Text style={styles.summaryLabelSmall}>Saldo</Text>
                        <Text style={[styles.summaryValueSmall, { color: selectedData.balance >= 0 ? theme.colors.primary : theme.colors.danger }]}>
                            R$ {formatCurrency(selectedData.balance)}
                        </Text>
                    </View>
                </View>

                {/* Barra de progresso de despesas pagas */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Status das Despesas</Text>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressLabels}>
                            <Text style={styles.progressLabelText}>
                                <Text style={{ color: theme.colors.success }}>Pagas: </Text>
                                R$ {formatCurrency(selectedData.paidExpenses)}
                            </Text>
                            <Text style={styles.progressLabelText}>
                                <Text style={{ color: theme.colors.warning }}>Pendentes: </Text>
                                R$ {formatCurrency(selectedData.pendingExpenses)}
                            </Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View 
                                style={[
                                    styles.progressBarFill, 
                                    { 
                                        width: `${selectedData.totalExpenses > 0 ? (selectedData.paidExpenses / selectedData.totalExpenses) * 100 : 0}%`,
                                        backgroundColor: theme.colors.success 
                                    }
                                ]} 
                            />
                        </View>
                        <Text style={styles.progressPercentage}>
                            {selectedData.totalExpenses > 0 ? ((selectedData.paidExpenses / selectedData.totalExpenses) * 100).toFixed(0) : 0}% pago
                        </Text>
                    </View>
                </View>

                {/* Gráfico de tendência */}
                <View style={styles.card}>
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
                            width={screenWidth - 64}
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
                {/* Gráfico de pizza */}
                <View style={styles.card}>
                    <PieChart
                        data={selectedData.categories.slice(0, 5).map(cat => ({
                            name: cat.category,
                            population: cat.amount,
                            color: cat.color,
                            legendFontColor: theme.colors.textSecondary,
                            legendFontSize: 11,
                        }))}
                        width={screenWidth - 64}
                        height={180}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                    />
                </View>

                {/* Lista de categorias */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Detalhamento por Categoria</Text>
                    {selectedData.categories.map((cat, index) => (
                        <View key={index} style={styles.categoryItem}>
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
                        </View>
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

                {/* Lista de cartões */}
                {selectedData.cardExpenses.map((card, index) => (
                    <View key={index} style={styles.cardExpenseItem}>
                        <View style={styles.cardExpenseHeader}>
                            <View style={styles.cardExpenseInfo}>
                                <Ionicons 
                                    name={card.cardType === 'credit' ? 'card' : 'card-outline'} 
                                    size={24} 
                                    color={card.cardType === 'credit' ? theme.colors.primary : theme.colors.success} 
                                />
                                <View>
                                    <Text style={styles.cardExpenseName}>{card.cardName}</Text>
                                    <Text style={styles.cardExpenseType}>
                                        {card.cardType === 'credit' ? 'Crédito' : 'Débito'} • {card.count} compra(s)
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
                                        backgroundColor: card.cardType === 'credit' ? theme.colors.primary : theme.colors.success 
                                    }
                                ]} 
                            />
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    const renderDuesTab = () => {
        if (!selectedData) return null;

        const hasOverdue = selectedData.overdueDues.length > 0;
        const hasUpcoming = selectedData.upcomingDues.length > 0;

        if (!hasOverdue && !hasUpcoming) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="checkmark-circle-outline" size={64} color={theme.colors.success} />
                    <Text style={styles.emptyText}>Todas as contas estão pagas!</Text>
                </View>
            );
        }

        return (
            <View>
                {/* Contas atrasadas */}
                {hasOverdue && (
                    <View style={styles.dueSection}>
                        <View style={styles.dueSectionHeader}>
                            <Ionicons name="alert-circle" size={20} color={theme.colors.danger} />
                            <Text style={[styles.dueSectionTitle, { color: theme.colors.danger }]}>
                                Contas Atrasadas ({selectedData.overdueDues.length})
                            </Text>
                        </View>
                        {selectedData.overdueDues.map((due, index) => (
                            <View key={index} style={[styles.dueItem, styles.dueItemOverdue]}>
                                <View style={styles.dueItemInfo}>
                                    <Text style={styles.dueItemDescription}>{due.description}</Text>
                                    <Text style={styles.dueItemDate}>
                                        Venceu há {Math.abs(due.daysUntilDue)} dia(s) - {new Date(due.dueDate).toLocaleDateString('pt-BR')}
                                    </Text>
                                </View>
                                <Text style={[styles.dueItemAmount, { color: theme.colors.danger }]}>
                                    R$ {formatCurrency(due.amount)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Próximos vencimentos */}
                {hasUpcoming && (
                    <View style={styles.dueSection}>
                        <View style={styles.dueSectionHeader}>
                            <Ionicons name="time" size={20} color={theme.colors.warning} />
                            <Text style={[styles.dueSectionTitle, { color: theme.colors.warning }]}>
                                Próximos Vencimentos ({selectedData.upcomingDues.length})
                            </Text>
                        </View>
                        {selectedData.upcomingDues.map((due, index) => (
                            <View key={index} style={[styles.dueItem, due.daysUntilDue <= 3 && styles.dueItemUrgent]}>
                                <View style={styles.dueItemInfo}>
                                    <Text style={styles.dueItemDescription}>{due.description}</Text>
                                    <Text style={styles.dueItemDate}>
                                        {due.daysUntilDue === 0 
                                            ? 'Vence hoje!' 
                                            : due.daysUntilDue === 1 
                                                ? 'Vence amanhã' 
                                                : `Vence em ${due.daysUntilDue} dias`} - {new Date(due.dueDate).toLocaleDateString('pt-BR')}
                                    </Text>
                                </View>
                                <Text style={[styles.dueItemAmount, due.daysUntilDue <= 3 && { color: theme.colors.warning }]}>
                                    R$ {formatCurrency(due.amount)}
                                </Text>
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
                    <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.monthButton}>
                        <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>

                    <Text style={styles.monthText}>
                        {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {currentYear}
                    </Text>

                    <TouchableOpacity onPress={() => changeMonth('next')} style={styles.monthButton}>
                        <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
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
                        style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
                        onPress={() => setActiveTab('overview')}
                    >
                        <Ionicons name="stats-chart" size={18} color={activeTab === 'overview' ? theme.colors.primary : theme.colors.textMuted} />
                        <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>Resumo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'categories' && styles.tabActive]}
                        onPress={() => setActiveTab('categories')}
                    >
                        <Ionicons name="pie-chart" size={18} color={activeTab === 'categories' ? theme.colors.primary : theme.colors.textMuted} />
                        <Text style={[styles.tabText, activeTab === 'categories' && styles.tabTextActive]}>Categorias</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'cards' && styles.tabActive]}
                        onPress={() => setActiveTab('cards')}
                    >
                        <Ionicons name="card" size={18} color={activeTab === 'cards' ? theme.colors.primary : theme.colors.textMuted} />
                        <Text style={[styles.tabText, activeTab === 'cards' && styles.tabTextActive]}>Cartões</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'dues' && styles.tabActive]}
                        onPress={() => setActiveTab('dues')}
                    >
                        <Ionicons name="calendar" size={18} color={activeTab === 'dues' ? theme.colors.primary : theme.colors.textMuted} />
                        <Text style={[styles.tabText, activeTab === 'dues' && styles.tabTextActive]}>Vencimentos</Text>
                    </TouchableOpacity>
                </View>

                {/* Conteúdo da tab ativa */}
                <View style={styles.tabContent}>
                    {activeTab === 'overview' && renderOverviewTab()}
                    {activeTab === 'categories' && renderCategoriesTab()}
                    {activeTab === 'cards' && renderCardsTab()}
                    {activeTab === 'dues' && renderDuesTab()}
                </View>
            </ScrollView>
        </View>
    );
}
