import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { FirestoreService } from '../services/firestoreService';
import { Transaction } from '../types';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }: any) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [refreshing, setRefreshing] = useState(false);
    const [monthlyData, setMonthlyData] = useState({
        totalExpenses: 0,
        totalIncome: 0,
        balance: 0,
    });
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

    const loadTransactions = async () => {
        try {
            const data = await FirestoreService.getMonthlyData(currentMonth, currentYear);
            setTransactions(data.transactions);
            setMonthlyData({
                totalExpenses: data.totalExpenses,
                totalIncome: data.totalIncome,
                balance: data.balance,
            });
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar as transações');
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadTransactions();
        }, [currentMonth, currentYear])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTransactions();
        setRefreshing(false);
    };

    const togglePaid = async (transaction: Transaction) => {
        try {
            await FirestoreService.updateTransaction(transaction.id, {
                isPaid: !transaction.isPaid,
            });
            loadTransactions();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar a transação');
        }
    };

    const deleteTransaction = async (id: string) => {
        Alert.alert(
            'Confirmar Exclusão',
            'Deseja realmente excluir esta transação?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await FirestoreService.deleteTransaction(id);
                            loadTransactions();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir a transação');
                        }
                    },
                },
            ]
        );
    };

    const changeMonth = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        }
    };

    const renderTransaction = ({ item }: { item: Transaction }) => {
        const isExpense = item.type === 'expense';
        const categoryColor = theme.colors.categories[item.category as keyof typeof theme.colors.categories] || theme.colors.categories.outros;

        return (
            <TouchableOpacity
                style={styles.transactionCard}
                onPress={() => navigation.navigate('EditTransaction', { transaction: item })}
                activeOpacity={0.7}
            >
                <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />

                <View style={styles.transactionContent}>
                    <View style={styles.transactionHeader}>
                        <View style={styles.transactionInfo}>
                            <Text style={styles.transactionDescription}>{item.description}</Text>
                            <View style={styles.transactionMeta}>
                                {item.category && <Text style={styles.transactionCategory}>{item.category}</Text>}
                                {item.isRecurring && (
                                    <View style={styles.recurringBadge}>
                                        <Ionicons name="repeat" size={12} color={theme.colors.primary} />
                                        <Text style={styles.recurringText}>Recorrente</Text>
                                    </View>
                                )}
                                {item.type === 'expense' && (
                                    <View style={[
                                        styles.dueDateBadge,
                                        !item.isPaid && new Date(item.dueDate || item.date) < new Date() && styles.dueDateOverdue
                                    ]}>
                                        <Ionicons
                                            name="calendar-outline"
                                            size={12}
                                            color={!item.isPaid && new Date(item.dueDate || item.date) < new Date() ? theme.colors.danger : theme.colors.textSecondary}
                                        />
                                        <Text style={[
                                            styles.dueDateText,
                                            { color: theme.colors.textSecondary },
                                            !item.isPaid && new Date(item.dueDate || item.date) < new Date() && styles.dueDateOverdueText
                                        ]}>
                                            {new Date(item.dueDate || item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.amountAndPaidBadge}>
                            {item.originalAmount !== undefined && item.amount !== item.originalAmount ? (
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={[styles.transactionAmount, { color: theme.colors.textMuted, fontSize: 12, textDecorationLine: 'line-through' }]}>
                                        R$ {item.originalAmount.toFixed(2)}
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {item.amount > item.originalAmount && (
                                            <Text style={{
                                                color: theme.colors.success,
                                                fontWeight: 'bold',
                                                marginRight: 2
                                            }}>+</Text>
                                        )}
                                        <Text
                                            style={[
                                                styles.transactionAmount,
                                                {
                                                    color: item.amount < item.originalAmount ? theme.colors.danger : theme.colors.success,
                                                    fontWeight: 'bold'
                                                }
                                            ]}
                                        >
                                            R$ {item.amount.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            ) : (
                                <Text
                                    style={[
                                        styles.transactionAmount,
                                        item.type === 'expense' ? styles.expenseAmount : styles.incomeAmount,
                                    ]}
                                >
                                    {item.type === 'expense' ? '- ' : '+ '}
                                    R$ {item.amount.toFixed(2)}
                                </Text>
                            )}

                            {item.isPaid && (
                                <View style={styles.paidBadge}>
                                    <Ionicons name="checkmark-circle" size={10} color={theme.colors.success} />
                                    <Text style={styles.paidBadgeText}>Pago</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.transactionActions}>
                        {item.type === 'expense' && (
                            <TouchableOpacity
                                style={[styles.paidButton, item.isPaid && styles.paidButtonActive]}
                                onPress={() => togglePaid(item)}
                            >
                                <Ionicons
                                    name={item.isPaid ? 'checkmark-circle' : 'checkmark-circle-outline'}
                                    size={20}
                                    color={item.isPaid ? theme.colors.success : theme.colors.textSecondary}
                                />
                                <Text style={[styles.paidButtonText, item.isPaid && styles.paidButtonTextActive]}>
                                    {item.isPaid ? 'Pago' : 'Pagar'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => deleteTransaction(item.id)}
                        >
                            <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const monthName = new Date(currentYear, currentMonth).toLocaleString('pt-BR', { month: 'long' });

    const filteredTransactions = transactions
        .filter(t => {
            if (filter === 'all') return true;
            return t.type === filter;
        })
        .sort((a, b) => {
            const dateA = new Date(a.dueDate || a.date).getTime();
            const dateB = new Date(b.dueDate || b.date).getTime();
            return dateA - dateB;
        });

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header com saldo */}
            <View style={styles.header}>
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Saldo do Mês</Text>
                    <Text style={[styles.balanceAmount, monthlyData.balance >= 0 ? styles.positiveBalance : styles.negativeBalance]}>
                        R$ {monthlyData.balance.toFixed(2)}
                    </Text>

                    <View style={styles.balanceDetails}>
                        <View style={styles.balanceItem}>
                            <Ionicons name="arrow-down-circle" size={20} color={theme.colors.success} />
                            <View style={styles.balanceItemText}>
                                <Text style={styles.balanceItemLabel}>Receitas</Text>
                                <Text style={styles.balanceItemValue}>R$ {monthlyData.totalIncome.toFixed(2)}</Text>
                            </View>
                        </View>

                        <View style={styles.balanceItem}>
                            <Ionicons name="arrow-up-circle" size={20} color={theme.colors.danger} />
                            <View style={styles.balanceItemText}>
                                <Text style={styles.balanceItemLabel}>Despesas</Text>
                                <Text style={styles.balanceItemValue}>R$ {monthlyData.totalExpenses.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

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

            {/* Filtros */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Todos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'income' && styles.filterButtonActive]}
                    onPress={() => setFilter('income')}
                >
                    <Ionicons name="arrow-down-circle" size={16} color={filter === 'income' ? theme.colors.white : theme.colors.success} />
                    <Text style={[styles.filterText, filter === 'income' && styles.filterTextActive]}>Receitas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'expense' && styles.filterButtonActive]}
                    onPress={() => setFilter('expense')}
                >
                    <Ionicons name="arrow-up-circle" size={16} color={filter === 'expense' ? theme.colors.white : theme.colors.danger} />
                    <Text style={[styles.filterText, filter === 'expense' && styles.filterTextActive]}>Despesas</Text>
                </TouchableOpacity>
            </View>

            {/* Lista de transações */}
            <FlatList
                data={filteredTransactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="wallet-outline" size={64} color={theme.colors.textMuted} />
                        <Text style={styles.emptyStateText}>Nenhuma transação neste mês</Text>
                        <Text style={styles.emptyStateSubtext}>Adicione uma nova transação para começar</Text>
                    </View>
                }
            />

            {/* Botão flutuante para adicionar */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddTransaction')}
            >
                <Ionicons name="add" size={32} color={theme.colors.white} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.md,
        paddingTop: theme.spacing.xl,
    },
    balanceCard: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        ...theme.shadows.md,
    },
    balanceLabel: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    balanceAmount: {
        fontSize: theme.fontSize.xxxl,
        fontWeight: theme.fontWeight.bold,
        marginBottom: theme.spacing.md,
    },
    positiveBalance: {
        color: theme.colors.success,
    },
    negativeBalance: {
        color: theme.colors.danger,
    },
    balanceDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.md,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    balanceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    balanceItemText: {
        gap: 2,
    },
    balanceItemLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
    },
    balanceItemValue: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        fontWeight: theme.fontWeight.semibold,
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
    },
    monthButton: {
        padding: theme.spacing.sm,
    },
    monthText: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    listContent: {
        padding: theme.spacing.md,
        paddingBottom: 100,
    },
    transactionCard: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.md,
        overflow: 'hidden',
        ...theme.shadows.sm,
        flexDirection: 'row',
    },
    categoryIndicator: {
        width: 4,
    },
    transactionContent: {
        flex: 1,
        padding: theme.spacing.md,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.sm,
    },
    transactionInfo: {
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    transactionDescription: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    transactionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginTop: 6,
    },
    transactionCategory: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        textTransform: 'capitalize',
    },
    recurringBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.sm,
    },
    recurringText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.medium,
    },
    dueDateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.sm,
    },
    dueDateOverdue: {
        backgroundColor: `${theme.colors.danger}20`,
    },
    dueDateText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.warning,
        fontWeight: theme.fontWeight.medium,
    },
    dueDateOverdueText: {
        color: theme.colors.danger,
    },
    transactionAmount: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
    },
    expenseAmount: {
        color: theme.colors.danger,
    },
    incomeAmount: {
        color: theme.colors.success,
    },
    transactionActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start', // Mudado para start para agrupar melhor
        gap: theme.spacing.sm, // Gap entre botões
        marginTop: theme.spacing.sm,
        paddingTop: theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: theme.borderRadius.sm,
        gap: 6,
    },
    editButtonText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
        fontWeight: 'medium',
    },
    paidButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: theme.colors.surface,
    },
    paidButtonActive: {
        backgroundColor: theme.colors.surface,
    },
    paidButtonText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    paidButtonTextActive: {
        color: theme.colors.success,
        fontWeight: theme.fontWeight.medium,
    },
    deleteButton: {
        padding: 8,
        marginLeft: 'auto',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xxl,
    },
    emptyStateText: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.md,
    },
    emptyStateSubtext: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
    amountAndPaidBadge: {
        alignItems: 'flex-end',
        gap: 4,
    },
    paidBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: theme.colors.successLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
    },
    paidBadgeText: {
        fontSize: 10,
        color: theme.colors.success,
        fontWeight: 'bold',
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.backgroundCard,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    filterButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.medium,
    },
    filterTextActive: {
        color: theme.colors.white,
        fontWeight: theme.fontWeight.bold,
    },
    fab: {
        position: 'absolute',
        right: theme.spacing.md,
        bottom: theme.spacing.md,
        width: 64,
        height: 64,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.lg,
    },
});
