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
import { Transaction, CreditCard } from '../../types';
import { FirestoreService } from '../../services/firestoreService';
import { CreditCardFirestoreService } from '../../services/creditCardFirestoreService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import styles from './styles';

// Calcula a qual fatura uma transação pertence baseado no dia de vencimento
const getInvoicePeriod = (transactionDate: string, dueDay: number): string => {
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

    return `${invoiceYear}-${String(invoiceMonth + 1).padStart(2, '0')}`;
};

export default function CardMonthDetailsScreen({ route, navigation }: any) {
    const { cardId, cardName, month, displayMonth } = route.params;
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [card, setCard] = useState<CreditCard | null>(null);

    const loadTransactions = async () => {
        try {
            // Buscar informações do cartão
            const cards = await CreditCardFirestoreService.getCreditCards();
            const foundCard = cards.find(c => c.id === cardId);
            if (!foundCard) {
                Alert.alert('Erro', 'Cartão não encontrado');
                navigation.goBack();
                return;
            }
            setCard(foundCard);

            const allTransactions = await FirestoreService.getTransactions();
            
            // Filtrar transações do cartão que pertencem a este período de fatura
            const filtered = allTransactions.filter(t => {
                if (t.cardId !== cardId) return false;
                
                // Para cartões de crédito, usar período de fatura
                if (foundCard.cardType === 'credit') {
                    const invoicePeriod = getInvoicePeriod(t.date, foundCard.dueDay);
                    return invoicePeriod === month;
                }
                
                // Para cartões de débito, usar mês da transação
                const transactionMonth = new Date(t.date).toISOString().substring(0, 7);
                return transactionMonth === month;
            });

            // Ordenar por data (mais recente primeiro)
            filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setTransactions(filtered);

            // Calcular total
            const total = filtered.reduce((sum, t) => sum + t.amount, 0);
            setTotalAmount(total);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar as transações');
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadTransactions();
        }, [cardId, month])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTransactions();
        setRefreshing(false);
    };

    const handleAddPurchase = () => {
        // Converter mês "YYYY-MM" para Date
        const [year, monthNum] = month.split('-').map(Number);
        const purchaseDate = new Date(year, monthNum - 1, 1).toISOString();

        navigation.navigate('AddTransaction', {
            initialType: 'expense',
            lockType: true,
            preSelectedCardId: cardId,
            preSelectedDate: purchaseDate,
        });
    };

    const handleEditTransaction = (transaction: Transaction) => {
        navigation.navigate('EditTransaction', { transaction });
    };

    const getCategoryIcon = (category: string) => {
        const iconMap: { [key: string]: string } = {
            moradia: 'home',
            aluguel: 'home-outline',
            condominio: 'business',
            agua: 'water',
            energia: 'flash',
            gas: 'flame',
            internet: 'wifi',
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
            outros: 'ellipsis-horizontal',
        };
        return iconMap[category] || 'ellipsis-horizontal';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    const renderTransaction = ({ item }: { item: Transaction }) => {
        const categoryColor = theme.colors.categories[item.category as keyof typeof theme.colors.categories] || theme.colors.primary;

        return (
            <TouchableOpacity
                style={styles.transactionCard}
                onPress={() => handleEditTransaction(item)}
            >
                <View style={[styles.categoryIcon, { backgroundColor: categoryColor + '20' }]}>
                    <Ionicons name={getCategoryIcon(item.category) as any} size={24} color={categoryColor} />
                </View>

                <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription} numberOfLines={1}>
                        {item.description}
                        {item.installmentNumber && item.installments && (
                            <Text style={styles.installmentText}> ({item.installmentNumber}/{item.installments})</Text>
                        )}
                    </Text>
                    <View style={styles.transactionMeta}>
                        <Ionicons name="calendar-outline" size={12} color={theme.colors.textMuted} />
                        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
                        {item.isPaid && (
                            <>
                                <Ionicons name="checkmark-circle" size={12} color={theme.colors.success} style={{ marginLeft: 8 }} />
                                <Text style={styles.paidText}>Pago</Text>
                            </>
                        )}
                    </View>
                </View>

                <Text style={styles.transactionAmount}>
                    R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.title}>{cardName}</Text>
                    <Text style={styles.subtitle}>{displayMonth}</Text>
                </View>
            </View>

            <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total de compras</Text>
                    <Text style={styles.summaryValue}>
                        R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Número de compras</Text>
                    <Text style={styles.summaryCount}>{transactions.length}</Text>
                </View>
            </View>

            <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="cart-outline" size={64} color={theme.colors.textMuted} />
                        <Text style={styles.emptyStateText}>Nenhuma compra neste mês</Text>
                        <Text style={styles.emptyStateSubtext}>
                            Adicione uma compra usando o botão abaixo
                        </Text>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={handleAddPurchase}>
                <Ionicons name="add" size={32} color={theme.colors.white} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
