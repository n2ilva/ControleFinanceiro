import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Modal,
    Pressable,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { FirestoreService } from '../../services/firestoreService';
import { Transaction } from '../../types';
import { theme } from '../../theme';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCurrency } from '../../utils';
import { CATEGORY_ICONS } from '../../constants';
import styles from './styles';

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
    });
    const [filter, setFilter] = useState<'income' | 'expense' | 'unpaid'>('expense');
    const [addMenuVisible, setAddMenuVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

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
                                {item.type === 'income' && !item.isSalary && item.receivedDate && (
                                    <View style={styles.salaryDateBadge}>
                                        <Ionicons name="calendar-outline" size={12} color={theme.colors.success} />
                                        <Text style={[styles.salaryDateText, { color: theme.colors.success }]}>
                                            Recebido: {new Date(item.receivedDate).toLocaleDateString('pt-BR')}
                                        </Text>
                                    </View>
                                )}
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

                            {/* Botão Pagar/Pago para despesas */}
                            {item.type === 'expense' && (
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

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Saldo do Mês</Text>
                    <Text style={[styles.balanceAmount, monthlyData.balance >= 0 ? styles.positiveBalance : styles.negativeBalance]}>
                        R$ {formatCurrency(monthlyData.balance)}
                    </Text>

                    <View style={styles.balanceDetails}>
                        <View style={styles.balanceItem}>
                            <Ionicons name="arrow-down-circle" size={20} color={theme.colors.success} />
                            <View style={styles.balanceItemText}>
                                <Text style={styles.balanceItemLabel}>Receitas</Text>
                                <Text style={styles.balanceItemValue}>R$ {formatCurrency(monthlyData.totalIncome)}</Text>
                            </View>
                        </View>

                        <View style={styles.balanceItem}>
                            <Ionicons name="arrow-up-circle" size={20} color={theme.colors.danger} />
                            <View style={styles.balanceItemText}>
                                <Text style={styles.balanceItemLabel}>Despesas</Text>
                                <Text style={styles.balanceItemValue}>R$ {formatCurrency(monthlyData.totalExpenses)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.monthSelector}>
                <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.monthButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>

                <Text style={styles.monthText}>
                    {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {currentYear}
                </Text>

                <View style={styles.monthActions}>
                    <TouchableOpacity 
                        onPress={() => setShowSearch(!showSearch)} 
                        style={styles.searchToggleButton}
                    >
                        <Ionicons 
                            name={showSearch ? "close" : "search"} 
                            size={20} 
                            color={showSearch ? theme.colors.danger : theme.colors.primary} 
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => changeMonth('next')} style={styles.monthButton}>
                        <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {showSearch && (
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={18} color={theme.colors.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar por descrição, categoria, cartão..."
                            placeholderTextColor={theme.colors.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                    {searchQuery.trim() && (
                        <Text style={styles.searchResultCount}>
                            {filteredTransactions.length} resultado(s) encontrado(s)
                        </Text>
                    )}
                </View>
            )}

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'expense' && styles.filterButtonActive]}
                    onPress={() => setFilter('expense')}
                >
                    <Ionicons name="arrow-up-circle" size={16} color={filter === 'expense' ? theme.colors.white : theme.colors.danger} />
                    <Text style={[styles.filterText, filter === 'expense' && styles.filterTextActive]}>Despesas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'unpaid' && styles.filterButtonActive, unpaidCount > 0 && styles.filterButtonWarning]}
                    onPress={() => setFilter('unpaid')}
                >
                    <Ionicons name="alert-circle" size={16} color={filter === 'unpaid' ? theme.colors.white : theme.colors.warning} />
                    <Text style={[styles.filterText, filter === 'unpaid' && styles.filterTextActive]}>
                        Não Pagas {unpaidCount > 0 && `(${unpaidCount})`}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'income' && styles.filterButtonActive]}
                    onPress={() => setFilter('income')}
                >
                    <Ionicons name="arrow-down-circle" size={16} color={filter === 'income' ? theme.colors.white : theme.colors.success} />
                    <Text style={[styles.filterText, filter === 'income' && styles.filterTextActive]}>Receitas</Text>
                </TouchableOpacity>
            </View>

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

            <TouchableOpacity
                style={[styles.fab, { bottom: insets.bottom }]}
                onPress={() => setAddMenuVisible(true)}
            >
                <Ionicons name="add" size={32} color={theme.colors.white} />
            </TouchableOpacity>

            <Modal
                visible={addMenuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setAddMenuVisible(false)}
            >
                <Pressable style={styles.menuOverlay} onPress={() => setAddMenuVisible(false)}>
                    <View style={[styles.menuContainer, { paddingBottom: 20 + insets.bottom }]}>
                        <Text style={styles.menuTitle}>Adicionar</Text>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setAddMenuVisible(false);
                                navigation.navigate('AddExpense');
                            }}
                        >
                            <Ionicons name="arrow-up-circle" size={20} color={theme.colors.danger} />
                            <Text style={styles.menuItemText}>Despesas</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setAddMenuVisible(false);
                                navigation.navigate('AddIncome');
                            }}
                        >
                            <Ionicons name="arrow-down-circle" size={20} color={theme.colors.success} />
                            <Text style={styles.menuItemText}>Receitas</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setAddMenuVisible(false);
                                navigation.navigate('AddSalary');
                            }}
                        >
                            <Ionicons name="cash" size={20} color={theme.colors.primary} />
                            <Text style={styles.menuItemText}>Salário</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setAddMenuVisible(false);
                                navigation.navigate('MainTabs', { screen: 'CreditCards' });
                            }}
                        >
                            <Ionicons name="card" size={20} color={theme.colors.primary} />
                            <Text style={styles.menuItemText}>Cartões</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}
