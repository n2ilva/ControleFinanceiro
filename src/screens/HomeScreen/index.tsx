import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { FirestoreService } from '../../services/firestoreService';
import { Transaction } from '../../types';
import { theme } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCurrency } from '../../utils';
import { CATEGORY_ICONS } from '../../constants';
import styles from './styles';
import { MonthSelector, BalanceCard, TransactionFilters, SearchBar, AddMenu } from './components';
import { PageHeader } from '../../components';

export default function HomeScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [refreshing, setRefreshing] = useState(false);
    const [monthlyData, setMonthlyData] = useState({
        totalExpenses: 0,
        totalIncome: 0,
        balance: 0,
        previousBalance: 0, // Saldo do mês anterior
    });
    const [filter, setFilter] = useState<'income' | 'expense' | 'unpaid'>('expense');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    const loadTransactions = async () => {
        try {
            const data = await FirestoreService.getMonthlyData(currentMonth, currentYear);
            
            // Calcular saldo do mês anterior
            let prevMonth = currentMonth - 1;
            let prevYear = currentYear;
            if (prevMonth < 0) {
                prevMonth = 11;
                prevYear = currentYear - 1;
            }
            const prevData = await FirestoreService.getMonthlyData(prevMonth, prevYear);
            
            setTransactions(data.transactions);
            setMonthlyData({
                totalExpenses: data.totalExpenses,
                totalIncome: data.totalIncome,
                balance: data.balance,
                previousBalance: prevData.balance,
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
        const categoryColor = theme.colors.categories[item.category as keyof typeof theme.colors.categories] || theme.colors.categories.outros;
        const categoryIcon = CATEGORY_ICONS[item.category] || CATEGORY_ICONS.outros;

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
                                {item.category && (
                                    <View style={styles.categoryBadge}>
                                        <Ionicons
                                            name={categoryIcon as any}
                                            size={14}
                                            color={categoryColor}
                                        />
                                    </View>
                                )}
                                {/* Badge de parcelas - prioridade sobre recorrente */}
                                {item.installmentNumber && item.installments && (
                                    <View style={styles.installmentBadge}>
                                        <Ionicons name="layers-outline" size={12} color={theme.colors.warning} />
                                        <Text style={styles.installmentText}>
                                            {item.installmentNumber}/{item.installments}
                                        </Text>
                                    </View>
                                )}
                                {/* Badge de recorrente - só mostra se não for parcelado */}
                                {item.isRecurring && !item.installmentNumber && (
                                    <View style={styles.recurringBadge}>
                                        <Ionicons name="repeat" size={12} color={theme.colors.primary} />
                                        <Text style={styles.recurringText}>Recorrente</Text>
                                    </View>
                                )}
                                {item.type === 'expense' && (
                                    <View style={[
                                        styles.dueDateBadge,
                                        !item.isPaid && !item.cardId && new Date(item.dueDate || item.date) < new Date() && styles.dueDateOverdue
                                    ]}>
                                        <Ionicons
                                            name="calendar-outline"
                                            size={12}
                                            color={!item.isPaid && !item.cardId && new Date(item.dueDate || item.date) < new Date() ? theme.colors.danger : theme.colors.textSecondary}
                                        />
                                        <Text style={[
                                            styles.dueDateText,
                                            { color: theme.colors.textSecondary },
                                            !item.isPaid && !item.cardId && new Date(item.dueDate || item.date) < new Date() && styles.dueDateOverdueText
                                        ]}>
                                            {/* Para transações de cartão, mostrar a data da compra (item.date), não o vencimento */}
                                            {item.cardId 
                                                ? new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                                                : new Date(item.dueDate || item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                                            }
                                        </Text>
                                    </View>
                                )}
                                {item.cardName && (
                                    <View style={styles.cardBadge}>
                                        <Ionicons name="card" size={12} color={theme.colors.textSecondary} />
                                        <Text style={styles.cardText}>
                                            {item.cardName}
                                            {item.cardType ? ` • ${item.cardType === 'credit' ? 'Crédito' : 'Débito'}` : ''}
                                        </Text>
                                    </View>
                                )}
                                {item.isSalary && (
                                    <View style={styles.salaryDateBadge}>
                                        <Ionicons name="calendar-outline" size={12} color={theme.colors.textSecondary} />
                                        <Text style={styles.salaryDateText}>
                                            Recebimento: {new Date(item.date).toLocaleDateString('pt-BR')}
                                        </Text>
                                    </View>
                                )}
                                {item.type === 'income' && !item.isSalary && item.receivedDate && (() => {
                                    const receivedDateObj = new Date(item.receivedDate);
                                    const receivedDay = receivedDateObj.getDate();
                                    const today = new Date();
                                    const currentDay = today.getDate();
                                    const currentMonthNow = today.getMonth();
                                    const currentYearNow = today.getFullYear();
                                    
                                    const transactionDate = new Date(item.date);
                                    const transactionMonth = transactionDate.getMonth();
                                    const transactionYear = transactionDate.getFullYear();
                                    
                                    const isCurrentMonth = transactionMonth === currentMonthNow && transactionYear === currentYearNow;
                                    const isPastMonth = transactionYear < currentYearNow || (transactionYear === currentYearNow && transactionMonth < currentMonthNow);
                                    
                                    // Já recebeu se é mês passado ou se o dia já passou/é hoje
                                    const isReceived = isPastMonth || (isCurrentMonth && currentDay >= receivedDay);
                                    
                                    return (
                                        <View style={[styles.salaryDateBadge, !isReceived && { backgroundColor: theme.colors.warning + '20' }]}>
                                            <Ionicons 
                                                name={isReceived ? "checkmark-circle-outline" : "time-outline"} 
                                                size={12} 
                                                color={isReceived ? theme.colors.success : theme.colors.warning} 
                                            />
                                            <Text style={[
                                                styles.salaryDateText, 
                                                { color: isReceived ? theme.colors.success : theme.colors.warning }
                                            ]}>
                                                {isReceived 
                                                    ? `Recebido: ${receivedDateObj.toLocaleDateString('pt-BR')}`
                                                    : `Pendente: dia ${receivedDay.toString().padStart(2, '0')}`
                                                }
                                            </Text>
                                        </View>
                                    );
                                })()}
                            </View>
                        </View>

                        <View style={styles.amountAndPaidBadge}>
                            {item.originalAmount !== undefined && item.amount !== item.originalAmount ? (
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={[styles.transactionAmount, { color: theme.colors.textMuted, fontSize: 12, textDecorationLine: 'line-through' }]}>
                                        R$ {formatCurrency(item.originalAmount)}
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {!item.isSalary && item.amount > item.originalAmount && (
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
                                                    color: item.isSalary
                                                        ? theme.colors.danger
                                                        : item.amount < item.originalAmount
                                                            ? theme.colors.danger
                                                            : theme.colors.success,
                                                    fontWeight: 'bold'
                                                }
                                            ]}
                                        >
                                            R$ {formatCurrency(item.amount)}
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
                                    R$ {formatCurrency(item.amount)}
                                </Text>
                            )}

                            {/* Botão Pagar/Pago para despesas (não exibir para compras em cartão de crédito) */}
                            {item.type === 'expense' && !(item.cardId && item.cardType === 'credit') && (
                                <TouchableOpacity
                                    style={[styles.paidBadgeButton, item.isPaid && styles.paidBadgeButtonActive]}
                                    onPress={() => togglePaid(item)}
                                >
                                    <Ionicons
                                        name={item.isPaid ? 'checkmark-circle' : 'checkmark-circle-outline'}
                                        size={12}
                                        color={item.isPaid ? theme.colors.white : theme.colors.textSecondary}
                                    />
                                    <Text style={[styles.paidBadgeButtonText, item.isPaid && styles.paidBadgeButtonTextActive]}>
                                        {item.isPaid ? 'Pago' : 'Pagar'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const monthName = new Date(currentYear, currentMonth).toLocaleString('pt-BR', { month: 'long' });

    const filteredTransactions = transactions
        .filter(t => {
            // Filtro por tipo
            if (filter === 'unpaid') {
                return t.type === 'expense' && !t.isPaid;
            }
            if (t.type !== filter) return false;
            
            // Filtro por busca
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const matchDescription = t.description.toLowerCase().includes(query);
                const matchCategory = t.category.toLowerCase().includes(query);
                const matchCard = t.cardName?.toLowerCase().includes(query);
                const matchAmount = formatCurrency(t.amount).includes(query);
                return matchDescription || matchCategory || matchCard || matchAmount;
            }
            
            return true;
        })
        .sort((a, b) => {
            const dateA = new Date(a.dueDate || a.date).getTime();
            const dateB = new Date(b.dueDate || b.date).getTime();
            return dateA - dateB;
        });

    // Contar despesas não pagas
    const unpaidCount = transactions.filter(t => t.type === 'expense' && !t.isPaid).length;
    const unpaidTotal = transactions.filter(t => t.type === 'expense' && !t.isPaid).reduce((sum, t) => sum + t.amount, 0);

    // Saldo total considerando o mês anterior
    const totalBalance = monthlyData.balance + monthlyData.previousBalance;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Título da página */}
            <PageHeader
                title="Transações"
                onGroupPress={() => navigation.navigate('Group')}
            />

            {/* Seletor de mês */}
            <MonthSelector
                monthName={monthName}
                year={currentYear}
                showSearch={showSearch}
                onPrevMonth={() => changeMonth('prev')}
                onNextMonth={() => changeMonth('next')}
                onToggleSearch={() => setShowSearch(!showSearch)}
            />

            {/* Barra de pesquisa */}
            {showSearch && (
                <SearchBar
                    searchQuery={searchQuery}
                    resultCount={filteredTransactions.length}
                    onSearchChange={setSearchQuery}
                    onClear={() => setSearchQuery('')}
                />
            )}

            {/* Card de saldo */}
            <BalanceCard
                totalBalance={totalBalance}
                previousBalance={monthlyData.previousBalance}
                totalIncome={monthlyData.totalIncome}
                totalExpenses={monthlyData.totalExpenses}
            />

            {/* Filtros de transação */}
            <TransactionFilters
                filter={filter}
                unpaidCount={unpaidCount}
                onFilterChange={setFilter}
            />

            <FlatList
                data={filteredTransactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.listContent, { paddingBottom: 100 + 60 + insets.bottom }]}
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

            {/* Menu de adicionar */}
            <AddMenu
                bottomInset={insets.bottom}
                onAddExpense={() => navigation.navigate('AddExpense', { month: currentMonth, year: currentYear })}
                onAddIncome={() => navigation.navigate('AddIncome', { month: currentMonth, year: currentYear })}
            />
        </View>
    );
}
