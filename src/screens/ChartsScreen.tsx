import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { FirestoreService } from '../services/firestoreService';
import { CategoryData, Transaction } from '../types';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

interface Insight {
    type: 'success' | 'warning' | 'danger' | 'info';
    title: string;
    message: string;
    icon: any;
}

interface MonthSummary {
    monthName: string;
    year: number;
    totalExpenses: number;
    totalIncome: number;
    balance: number;
    categories: CategoryData[];
}

export default function ChartsScreen() {
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    // Dados para o gráfico e interação
    const [historyData, setHistoryData] = useState<MonthSummary[]>([]);
    const [selectedData, setSelectedData] = useState<MonthSummary | null>(null);
    const [chartData, setChartData] = useState({
        labels: [] as string[],
        expenses: [] as number[],
        income: [] as number[],
    });

    const [insights, setInsights] = useState<Insight[]>([]);

    const processMonthData = (transactions: Transaction[], month: number, year: number, useOnlyPaid: boolean = false): MonthSummary => {
        const monthTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            const isSameMonth = d.getMonth() === month && d.getFullYear() === year;
            if (!isSameMonth) return false;
            if (useOnlyPaid) return t.isPaid;
            return true;
        });

        const totalExpenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        // Categorias
        const categoryMap = new Map<string, number>();
        monthTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
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

        const monthName = new Date(year, month).toLocaleString('pt-BR', { month: 'long' });

        return {
            monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            year,
            totalExpenses,
            totalIncome,
            balance: totalIncome - totalExpenses,
            categories,
        };
    };

    const generateInsights = (nextData: MonthSummary, currentData: MonthSummary, realBalance: number) => {
        const newInsights: Insight[] = [];

        if (realBalance < 0) {
            newInsights.push({
                type: 'danger',
                title: 'Saldo Negativo!',
                message: `Seu saldo em conta está negativo em R$ ${Math.abs(realBalance).toFixed(2)}. Priorize quitar dívidas.`,
                icon: 'alert-circle'
            });
        }

        if (nextData.balance < 0) {
            newInsights.push({
                type: 'warning',
                title: 'Risco Futuro',
                message: `Previsão de fechar o próximo mês (${nextData.monthName}) no vermelho.`,
                icon: 'trending-down'
            });
        }

        if (nextData.categories.length > 0) {
            const topCategory = nextData.categories[0];
            if (topCategory.percentage > 30) {
                newInsights.push({
                    type: 'info',
                    title: `Maior Gasto: ${topCategory.category}`,
                    message: `${topCategory.category} consome ${topCategory.percentage.toFixed(0)}% do orçamento previsto.`,
                    icon: 'pie-chart'
                });
            }
        }

        setInsights(newInsights);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const allTransactions = await FirestoreService.getTransactions();

            // Saldo Real (apenas para insights)
            const calculatedRealBalance = allTransactions
                .filter(t => t.isPaid)
                .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);

            // Gerar histórico do Ano Atual (Janeiro -> Mês Atual + 1 (Previsão))
            // O pedido menciona "previsao do mes seguinte". Podemos incluir o mês seguinte no gráfico?
            // "abaixo da previsao do mes seguinte tem 3 cards...". Parece que ele quer ver o mês seguinte também.
            // O pedido anterior restringiu ao "ano atual".
            // Vamos fazer Janeiro até Mês Atual (para gráfico de tendência "realizado").
            // E adicionar o Mês Seguinte como opção clicável? ChartKit não mistura bem tipos.
            // Vamos manter o gráfico até o mês ATUAL, como definido antes.

            const history: MonthSummary[] = [];
            const labels: string[] = [];
            const expenses: number[] = [];
            const income: number[] = [];

            for (let m = 0; m <= currentMonth; m++) {
                const isPast = m < currentMonth;
                // Passado: Só Pagos. Atual: Tudo.
                const monthSummary = processMonthData(allTransactions, m, currentYear, isPast);

                history.push(monthSummary);
                labels.push(monthSummary.monthName.substr(0, 3).toUpperCase());
                expenses.push(monthSummary.totalExpenses);
                income.push(monthSummary.totalIncome);
            }

            setHistoryData(history);
            setChartData({ labels, expenses, income });

            // Selecionar o mês atual por padrão
            setSelectedData(history[history.length - 1]);

            // Dados para Insights (Atual vs Próximo)
            // Próximo mês
            const nextDate = new Date();
            nextDate.setMonth(nextDate.getMonth() + 1);
            const nextMonthSummary = processMonthData(allTransactions, nextDate.getMonth(), nextDate.getFullYear(), false);

            generateInsights(nextMonthSummary, history[history.length - 1], calculatedRealBalance);

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

    const chartConfig = {
        backgroundColor: theme.colors.backgroundCard,
        backgroundGradientFrom: theme.colors.backgroundCard,
        backgroundGradientTo: theme.colors.backgroundCard,
        decimalPlaces: 0,
        color: (opacity = 1) => theme.colors.primary,
        labelColor: (opacity = 1) => theme.colors.textSecondary,
        style: {
            borderRadius: theme.borderRadius.md,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: theme.colors.primary,
        },
        getDotProps: (value: any, index: number) => {
            const isSelected = historyData[index] && selectedData && historyData[index].monthName === selectedData.monthName;
            return {
                r: isSelected ? "8" : "4",
                strokeWidth: isSelected ? "3" : "2",
                stroke: theme.colors.primary,
                fill: theme.colors.backgroundCard
            };
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

    const renderCategoryList = (categories: CategoryData[]) => (
        <View style={styles.categoryList}>
            {categories.map((cat, index) => (
                <View key={index} style={styles.categoryItem}>
                    <View style={styles.categoryInfo}>
                        <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                        <Text style={styles.categoryName} numberOfLines={1}>{cat.category}</Text>
                    </View>
                    <View style={styles.categoryValues}>
                        <Text style={styles.categoryAmount}>R$ {cat.amount.toFixed(2)}</Text>
                        <Text style={styles.categoryPercentage}>{cat.percentage.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${cat.percentage}%`, backgroundColor: cat.color }]} />
                    </View>
                </View>
            ))}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* Insights */}
                <Text style={styles.sectionTitle}>Insights Inteligentes</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.insightsScroll}>
                    {insights.map((insight, index) => renderInsightCard(insight, index))}
                </ScrollView>

                {/* Tendência Interativa */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tendência ({currentYear})</Text>
                    <Text style={styles.sectionSubtitle}>Toque nos pontos para ver detalhes</Text>
                    {chartData.labels.length > 0 && (
                        <LineChart
                            data={{
                                labels: chartData.labels,
                                datasets: [
                                    {
                                        data: chartData.income,
                                        color: (opacity = 1) => theme.colors.success,
                                        strokeWidth: 2,
                                    },
                                    {
                                        data: chartData.expenses,
                                        color: (opacity = 1) => theme.colors.danger,
                                        strokeWidth: 2,
                                    },
                                ],
                                legend: ['Receitas', 'Despesas']
                            }}
                            width={screenWidth - 32}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                            onDataPointClick={({ index }) => {
                                if (historyData[index]) {
                                    setSelectedData(historyData[index]);
                                }
                            }}
                        />
                    )}
                </View>

                {/* Detalhes do Mês Selecionado */}
                {selectedData && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                Resumo de {selectedData.monthName}
                            </Text>
                        </View>

                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryCardSmall}>
                                <Text style={styles.summaryLabelSmall}>Receitas</Text>
                                <Text style={[styles.summaryValueSmall, { color: theme.colors.success }]}>
                                    R$ {selectedData.totalIncome.toFixed(0)}
                                </Text>
                            </View>
                            <View style={styles.summaryCardSmall}>
                                <Text style={styles.summaryLabelSmall}>Despesas</Text>
                                <Text style={[styles.summaryValueSmall, { color: theme.colors.danger }]}>
                                    R$ {selectedData.totalExpenses.toFixed(0)}
                                </Text>
                            </View>
                            <View style={styles.summaryCardSmall}>
                                <Text style={styles.summaryLabelSmall}>Saldo do Mês</Text>
                                <Text style={[styles.summaryValueSmall, { color: selectedData.balance >= 0 ? theme.colors.primary : theme.colors.danger }]}>
                                    R$ {selectedData.balance.toFixed(0)}
                                </Text>
                            </View>
                        </View>

                        {selectedData.categories.length > 0 ? (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Detalhamento por Categoria</Text>
                                <PieChart
                                    data={selectedData.categories.map(cat => ({
                                        name: cat.category,
                                        population: cat.amount,
                                        color: cat.color,
                                        legendFontColor: theme.colors.textSecondary,
                                        legendFontSize: 12,
                                    }))}
                                    width={screenWidth - 64}
                                    height={200}
                                    chartConfig={chartConfig}
                                    accessor="population"
                                    backgroundColor="transparent"
                                    paddingLeft="15"
                                    absolute
                                />
                                {renderCategoryList(selectedData.categories)}
                            </View>
                        ) : (
                            <Text style={styles.emptyText}>Sem despesas neste mês.</Text>
                        )}
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.md,
        paddingBottom: theme.spacing.xxl,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    sectionSubtitle: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    insightsScroll: {
        paddingRight: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        gap: theme.spacing.md,
    },
    insightCard: {
        width: 280,
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        borderLeftWidth: 4,
        ...theme.shadows.sm,
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    insightTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    insightMessage: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
    chart: {
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.sm,
        paddingVertical: 8,
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    summaryCardSmall: {
        flex: 1,
        backgroundColor: theme.colors.backgroundCard,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    summaryLabelSmall: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    summaryValueSmall: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
    },
    card: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        ...theme.shadows.sm,
    },
    cardTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    categoryList: {
        marginTop: theme.spacing.md,
    },
    categoryItem: {
        marginBottom: theme.spacing.md,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    categoryName: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
        flex: 1,
        fontWeight: theme.fontWeight.medium,
        textTransform: 'capitalize',
    },
    categoryValues: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    categoryAmount: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.text,
        fontWeight: 'bold',
    },
    categoryPercentage: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: theme.colors.surface,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    emptyText: {
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: theme.spacing.md,
    },
});
