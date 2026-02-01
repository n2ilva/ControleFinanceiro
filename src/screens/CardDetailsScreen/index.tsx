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
import { CreditCard, Transaction } from '../../types';
import { FirestoreService } from '../../services/firestoreService';
import { CreditCardFirestoreService } from '../../services/creditCardFirestoreService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import styles from './styles';

interface MonthData {
    period: string; // "YYYY-MM" da fatura (mês de vencimento)
    displayMonth: string; // Janeiro 2026
    dueDate: Date; // Data exata de vencimento
    totalAmount: number;
    transactionCount: number;
    isPaid: boolean;
    transactions: Transaction[]; // Transações desta fatura
}

// Calcula a qual fatura uma transação pertence baseado no dia de vencimento
const getInvoicePeriod = (transactionDate: string, dueDay: number): { period: string; dueDate: Date } => {
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

    // Data de vencimento da fatura
    const dueDate = new Date(invoiceYear, invoiceMonth, dueDay);
    
    return {
        period: `${invoiceYear}-${String(invoiceMonth + 1).padStart(2, '0')}`,
        dueDate,
    };
};

export default function CardDetailsScreen({ route, navigation }: any) {
    const { cardId } = route.params;
    const [card, setCard] = useState<CreditCard | null>(null);
    const [monthsData, setMonthsData] = useState<MonthData[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadCardDetails = async () => {
        try {
            const cards = await CreditCardFirestoreService.getCreditCards();
            const foundCard = cards.find(c => c.id === cardId);
            if (!foundCard) {
                Alert.alert('Erro', 'Cartão não encontrado');
                navigation.goBack();
                return;
            }
            setCard(foundCard);

            // Buscar todas as transações deste cartão
            const allTransactions = await FirestoreService.getTransactions();
            const cardTransactions = allTransactions.filter(t => t.cardId === cardId);

            // Agrupar por período de fatura
            const invoicesMap = new Map<string, MonthData>();
            
            cardTransactions.forEach(transaction => {
                let period: string;
                let dueDate: Date;
                
                if (foundCard.cardType === 'credit') {
                    // Para cartões de crédito, usar período de fatura
                    const invoicePeriod = getInvoicePeriod(transaction.date, foundCard.dueDay);
                    period = invoicePeriod.period;
                    dueDate = invoicePeriod.dueDate;
                } else {
                    // Para cartões de débito, usar mês da transação
                    const txDate = new Date(transaction.date);
                    const txMonth = txDate.getMonth();
                    const txYear = txDate.getFullYear();
                    period = `${txYear}-${String(txMonth + 1).padStart(2, '0')}`;
                    dueDate = new Date(txYear, txMonth, 1); // Primeiro dia do mês
                }
                
                if (!invoicesMap.has(period)) {
                    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                    const displayMonth = `${monthNames[dueDate.getMonth()]} ${dueDate.getFullYear()}`;
                    
                    invoicesMap.set(period, {
                        period,
                        displayMonth,
                        dueDate,
                        totalAmount: 0,
                        transactionCount: 0,
                        isPaid: foundCard.paidMonths?.includes(period) || false,
                        transactions: [],
                    });
                }

                const invoiceData = invoicesMap.get(period)!;
                invoiceData.totalAmount += transaction.amount;
                invoiceData.transactionCount += 1;
                invoiceData.transactions.push(transaction);
            });

            // Converter para array e ordenar por data de vencimento (mais recente primeiro)
            const invoicesArray = Array.from(invoicesMap.values()).sort((a, b) => 
                b.dueDate.getTime() - a.dueDate.getTime()
            );

            setMonthsData(invoicesArray);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os detalhes do cartão');
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadCardDetails();
        }, [cardId])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadCardDetails();
        setRefreshing(false);
    };

    const togglePaidStatus = async (period: string) => {
        if (!card) return;

        try {
            const paidMonths = card.paidMonths || [];
            const isPaid = paidMonths.includes(period);

            let updatedPaidMonths: string[];
            if (isPaid) {
                updatedPaidMonths = paidMonths.filter(m => m !== period);
            } else {
                updatedPaidMonths = [...paidMonths, period];
            }

            await CreditCardFirestoreService.updateCreditCard(card.id, {
                paidMonths: updatedPaidMonths,
            });

            loadCardDetails();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar o status de pagamento');
        }
    };

    const isOverdue = (dueDate: Date, isPaid: boolean) => {
        if (isPaid) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    const renderMonth = ({ item }: { item: MonthData }) => {
        const overdue = isOverdue(item.dueDate, item.isPaid);

        return (
            <TouchableOpacity
                style={[
                    styles.monthCard,
                    item.isPaid && styles.monthCardPaid,
                    overdue && styles.monthCardOverdue,
                ]}
                onPress={() => navigation.navigate('CardMonthDetails', {
                    cardId: card?.id,
                    cardName: card?.name,
                    month: item.period,
                    displayMonth: item.displayMonth,
                })}
            >
                <View style={styles.monthHeader}>
                    <View style={styles.monthInfo}>
                        <Text style={styles.monthTitle}>Fatura {item.displayMonth}</Text>
                        {item.isPaid && (
                            <View style={styles.paidBadge}>
                                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                                <Text style={styles.paidBadgeText}>Pago</Text>
                            </View>
                        )}
                    </View>
                    {card?.cardType === 'credit' && (
                        <TouchableOpacity
                            style={[styles.payButton, item.isPaid && styles.payButtonPaid]}
                            onPress={(e) => {
                                e.stopPropagation();
                                togglePaidStatus(item.period);
                            }}
                        >
                            <Ionicons
                                name={item.isPaid ? "checkmark-circle" : "checkmark-circle-outline"}
                                size={24}
                                color={item.isPaid ? theme.colors.success : theme.colors.textMuted}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Informações de vencimento abaixo do título - apenas para crédito */}
                {card?.cardType === 'credit' && (
                    <Text style={[
                        styles.dueDateText,
                        overdue && styles.dueDateTextOverdue,
                    ]}>
                        {overdue ? '⚠️ Vencida ' : 'Vence '}
                        em {item.dueDate.toLocaleDateString('pt-BR')} • Período: dia {card?.dueDay} anterior até dia {card?.dueDay}
                    </Text>
                )}

                <View style={styles.monthStats}>
                    <View style={styles.statItem}>
                        <Ionicons name="cart-outline" size={18} color={theme.colors.textSecondary} />
                        <Text style={styles.statText}>{item.transactionCount} compras</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="cash-outline" size={18} color={theme.colors.danger} />
                        <Text style={styles.statValue}>
                            R$ {item.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>

                <View style={styles.monthFooter}>
                    <Text style={styles.viewDetailsText}>Ver compras desta fatura</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
                </View>
            </TouchableOpacity>
        );
    };

    if (!card) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    const totalUnpaid = monthsData
        .filter(inv => !inv.isPaid && inv.totalAmount > 0)
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.cardName}>{card.name}</Text>
                    <Text style={styles.cardMeta}>
                        {card.cardType === 'credit' ? 'Crédito' : 'Débito'} • Vence dia {card.dueDay}
                    </Text>
                    {card.cardType === 'credit' && totalUnpaid > 0 && (
                        <Text style={styles.totalUnpaidText}>
                            Total em aberto: R$ {totalUnpaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                    )}
                </View>
            </View>

            <FlatList
                data={monthsData}
                renderItem={renderMonth}
                keyExtractor={(item) => item.period}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={64} color={theme.colors.textMuted} />
                        <Text style={styles.emptyStateText}>Nenhuma compra registrada</Text>
                        <Text style={styles.emptyStateSubtext}>
                            As compras feitas com este cartão aparecerão aqui
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
