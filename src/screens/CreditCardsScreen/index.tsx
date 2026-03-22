import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { crossAlert } from '../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCardFirestoreService } from '../../services/creditCardFirestoreService';
import { CreditCard } from '../../types';
import { FirestoreService } from '../../services/firestoreService';
import { theme } from '../../theme';
import styles from './styles';

const formatCurrencyBRL = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const numericValue = parseInt(digits, 10) / 100;
    return numericValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const parseCurrencyBRL = (formatted: string): number | undefined => {
    const cleaned = formatted.replace(/\./g, '').replace(',', '.');
    const value = parseFloat(cleaned);
    return isNaN(value) ? undefined : value;
};
import { useResponsive } from '../../hooks/useResponsive';

const CARD_COLORS = [
    '#1A1A2E',  // Azul escuro
    '#2D1B69',  // Roxo
    '#0F3460',  // Azul royal
    '#1B1B2F',  // Escuro
    '#200122',  // Vinho
    '#134E5E',  // Verde escuro
    '#373B44',  // Cinza chumbo
    '#0B486B',  // Oceano
    '#4A0E4E',  // Roxo profundo
    '#1C3A13',  // Verde floresta
    '#2C3E50',  // Azul petróleo
    '#8B0000',  // Vermelho escuro
    '#000000',  // Preto
    '#1F1F1F',  // Grafite
    '#2E2E2E',  // Cinza escuro
    '#191970',  // Azul meia-noite
    '#003153',  // Azul prussiano
    '#1B4D3E',  // Verde esmeralda escuro
    '#3C1361',  // Roxo beringela
    '#4B0082',  // Índigo
    '#800020',  // Borgonha
    '#36013F',  // Roxo império
    '#023020',  // Verde escuro rico
    '#0D0D0D',  // Quase preto
    '#483D8B',  // Azul ardósia escuro
    '#2F4F4F',  // Cinza ardósia
    '#556B2F',  // Verde oliva escuro
    '#8B4513',  // Marrom sela
    '#5B2C6F',  // Roxo ametista
    '#1B2631',  // Azul carvão
    '#641E16',  // Vermelho grena
    '#0E6655',  // Verde jade
    '#784212',  // Marrom bronze
    '#1A5276',  // Azul aço
    '#6C3483',  // Roxa lavanda escuro
    '#B7950B',  // Dourado escuro
];

interface CardWithAmount extends CreditCard {
    currentMonthAmount: number;
    invoiceMonth?: string; // Nome do mês da fatura (ex: "Fevereiro")
}

export default function CreditCardsScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { isDesktop } = useResponsive();
    const [cards, setCards] = useState<CardWithAmount[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
    const [name, setName] = useState('');
    const [dueDay, setDueDay] = useState('');
    const [cardType, setCardType] = useState<'debit' | 'credit'>('credit');
    const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
    const [creditLimit, setCreditLimit] = useState('');
    const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0]);

    // FAB bottom: insets.bottom + 60 (altura do tab bar) + 2 (gap)
    const fabBottom = insets.bottom + 20;
    const loadCards = async () => {
        try {
            const data = await CreditCardFirestoreService.getCreditCards();
            const allTransactions = await FirestoreService.getTransactions();
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

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

            // Calcular o valor da fatura atual para cada cartão
            const cardsWithAmount: CardWithAmount[] = data.map(card => {
                let invoiceMonthName = '';
                
                // Para cartões de crédito, calcular qual é o mês da fatura atual
                if (card.cardType === 'credit') {
                    // Verificar qual fatura está aberta hoje
                    const today = new Date();
                    const todayDay = today.getUTCDate();
                    
                    let invoiceMonth: number;
                    let invoiceYear: number;
                    
                    if (todayDay >= card.dueDay) {
                        // Já passou do vencimento, fatura é do próximo mês
                        if (currentMonth === 11) {
                            invoiceMonth = 0;
                            invoiceYear = currentYear + 1;
                        } else {
                            invoiceMonth = currentMonth + 1;
                            invoiceYear = currentYear;
                        }
                    } else {
                        // Ainda não passou do vencimento, fatura é do mês atual
                        invoiceMonth = currentMonth;
                        invoiceYear = currentYear;
                    }
                    
                    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                    invoiceMonthName = monthNames[invoiceMonth];
                }
                
                const cardTransactions = allTransactions.filter(t => {
                    if (t.cardId !== card.id) return false;
                    
                    // Para cartões de crédito, usar período de fatura
                    if (card.cardType === 'credit') {
                        const invoicePeriod = getInvoicePeriod(t.date, card.dueDay);
                        return invoicePeriod.month === currentMonth && invoicePeriod.year === currentYear;
                    }
                    
                    // Para cartões de débito, usar mês da transação
                    const txDate = new Date(t.date);
                    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
                });

                const currentMonthAmount = cardTransactions.reduce((sum, t) => sum + t.amount, 0);

                return {
                    ...card,
                    currentMonthAmount,
                    invoiceMonth: invoiceMonthName,
                };
            });

            setCards(cardsWithAmount);
        } catch (error) {
            crossAlert('Erro', 'Não foi possível carregar os cartões');
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadCards();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadCards();
        setRefreshing(false);
    };

    const openAddModal = () => {
        setEditingCard(null);
        setName('');
        setDueDay('');
        setCardType('credit');
        setCreditLimit('');
        setSelectedColor(CARD_COLORS[0]);
        setModalVisible(true);
    };

    const openEditModal = (card: CreditCard) => {
        setEditingCard(card);
        setName(card.name);
        setDueDay(card.dueDay.toString());
        setCardType(card.cardType);
        setCreditLimit(card.creditLimit ? card.creditLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');
        setSelectedColor(card.color || CARD_COLORS[0]);
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            crossAlert('Erro', 'Por favor, insira o nome do cartão');
            return;
        }

        // Validar vencimento apenas para cartões de crédito
        if (cardType === 'credit') {
            const parsedDay = parseInt(dueDay, 10);
            if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) {
                crossAlert('Erro', 'Dia de vencimento deve ser entre 1 e 31');
                return;
            }
        }

        const parsedDay = cardType === 'credit' ? parseInt(dueDay, 10) : 1;
        const parsedLimit = creditLimit ? parseCurrencyBRL(creditLimit) : undefined;

        try {
            if (editingCard) {
                await CreditCardFirestoreService.updateCreditCard(editingCard.id, {
                    name: name.trim(),
                    dueDay: parsedDay,
                    cardType,
                    color: selectedColor,
                    ...(parsedLimit !== undefined && { creditLimit: parsedLimit }),
                });
            } else {
                await CreditCardFirestoreService.addCreditCard({
                    name: name.trim(),
                    dueDay: parsedDay,
                    cardType,
                    color: selectedColor,
                    ...(parsedLimit !== undefined && { creditLimit: parsedLimit }),
                    createdAt: new Date().toISOString(),
                });
            }

            setModalVisible(false);
            await loadCards();
            crossAlert('Sucesso', editingCard ? 'Cartão atualizado!' : 'Cartão adicionado!');
        } catch (error) {
            crossAlert('Erro', 'Não foi possível salvar o cartão');
        }
    };

    const deleteCard = async (id: string) => {
        crossAlert(
            'Confirmar Exclusão',
            'Deseja realmente excluir este cartão?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await CreditCardFirestoreService.deleteCreditCard(id);
                            setModalVisible(false);
                            await loadCards();
                        } catch (error) {
                            crossAlert('Erro', 'Não foi possível excluir o cartão');
                        }
                    },
                },
            ]
        );
    };

    const renderCard = ({ item }: { item: CardWithAmount }) => {
        const bgColor = item.color || CARD_COLORS[0];
        const usagePercent = (item.creditLimit && item.creditLimit > 0)
            ? Math.min((item.currentMonthAmount / item.creditLimit) * 100, 100)
            : 0;

        return (
            <TouchableOpacity
                style={[
                    styles.creditCard,
                    { backgroundColor: bgColor },
                    isDesktop && styles.cardItemColumn,
                ]}
                onPress={() => navigation.navigate('CardDetails', { cardId: item.id })}
                activeOpacity={0.85}
            >
                {/* Círculos decorativos */}
                <View style={[styles.cardCircle, styles.cardCircle1, { backgroundColor: 'rgba(255,255,255,0.06)' }]} />
                <View style={[styles.cardCircle, styles.cardCircle2, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />

                {/* Header: tipo + editar */}
                <View style={styles.cardHeader}>
                    <View style={styles.cardTypeBadge}>
                        <Ionicons
                            name={item.cardType === 'credit' ? 'card' : 'card-outline'}
                            size={14}
                            color="rgba(255,255,255,0.9)"
                        />
                        <Text style={styles.cardTypeText}>
                            {item.cardType === 'credit' ? 'Crédito' : 'Débito'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.cardEditBtn}
                        onPress={(e) => {
                            e.stopPropagation();
                            openEditModal(item);
                        }}
                    >
                        <Ionicons name="pencil" size={16} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                </View>

                {/* Chip do cartão */}
                <View style={styles.cardChip}>
                    <View style={styles.cardChipLine} />
                    <View style={styles.cardChipLine} />
                    <View style={styles.cardChipLine} />
                </View>

                {/* Nome do cartão */}
                <Text style={styles.cardTitle}>{item.name}</Text>

                {/* Info: vencimento */}
                {item.cardType === 'credit' && (
                    <Text style={styles.cardDueDate}>
                        Vencimento dia {item.dueDay}
                    </Text>
                )}

                {/* Valor da fatura / gastos */}
                <View style={styles.cardAmountRow}>
                    <View>
                        <Text style={styles.cardAmountLabel}>
                            {item.cardType === 'credit'
                                ? `Fatura ${item.invoiceMonth}`
                                : 'Gastos do mês'}
                        </Text>
                        <Text style={styles.cardAmountValue}>
                            R$ {(item.currentMonthAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                    {item.cardType === 'credit' && item.creditLimit && item.creditLimit > 0 && (
                        <View style={styles.cardLimitInfo}>
                            <Text style={styles.cardLimitText}>
                                Limite: R$ {item.creditLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Barra de utilização do limite */}
                {item.cardType === 'credit' && item.creditLimit && item.creditLimit > 0 && (
                    <View style={styles.cardUsageContainer}>
                        <View style={styles.cardUsageBar}>
                            <View
                                style={[
                                    styles.cardUsageFill,
                                    {
                                        width: `${usagePercent}%`,
                                        backgroundColor:
                                            usagePercent >= 90 ? '#EF4444'
                                            : usagePercent >= 70 ? '#F59E0B'
                                            : '#10B981',
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.cardUsageText}>{usagePercent.toFixed(0)}% utilizado</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    // Filtrar cartões baseado no filtro selecionado
    const filteredCards = cards.filter(card => {
        if (filter === 'all') return true;
        return card.cardType === filter;
    });

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Filtros */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
                        Todos ({cards.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'credit' && styles.filterButtonActive]}
                    onPress={() => setFilter('credit')}
                >
                    <Ionicons 
                        name="card" 
                        size={16} 
                        color={filter === 'credit' ? theme.colors.white : theme.colors.primary} 
                    />
                    <Text style={[styles.filterButtonText, filter === 'credit' && styles.filterButtonTextActive]}>
                        Crédito ({cards.filter(c => c.cardType === 'credit').length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'debit' && styles.filterButtonActive]}
                    onPress={() => setFilter('debit')}
                >
                    <Ionicons 
                        name="card-outline" 
                        size={16} 
                        color={filter === 'debit' ? theme.colors.white : theme.colors.success} 
                    />
                    <Text style={[styles.filterButtonText, filter === 'debit' && styles.filterButtonTextActive]}>
                        Débito ({cards.filter(c => c.cardType === 'debit').length})
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                key={isDesktop ? 'two-col' : 'one-col'}
                numColumns={isDesktop ? 2 : 1}
                data={filteredCards}
                renderItem={renderCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={isDesktop ? { gap: theme.spacing.md } : undefined}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="card-outline" size={64} color={theme.colors.textMuted} />
                        <Text style={styles.emptyStateText}>Nenhum cartão {filter === 'credit' ? 'de crédito' : filter === 'debit' ? 'de débito' : 'cadastrado'}</Text>
                        <Text style={styles.emptyStateSubtext}>Adicione seus cartões para vincular às despesas</Text>
                    </View>
                }
            />

            <TouchableOpacity style={[styles.fab, { bottom: fabBottom }]} onPress={openAddModal}>
                <Ionicons name="add" size={28} color={theme.colors.white} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingCard ? 'Editar Cartão' : 'Novo Cartão'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nome do Cartão</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: Nubank"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tipo</Text>
                                <View style={styles.typeSelector}>
                                    <TouchableOpacity
                                        style={[styles.typeButton, cardType === 'credit' && styles.typeButtonActive]}
                                        onPress={() => setCardType('credit')}
                                    >
                                        <Ionicons
                                            name="card"
                                            size={20}
                                            color={cardType === 'credit' ? theme.colors.white : theme.colors.primary}
                                        />
                                        <Text style={[styles.typeButtonText, cardType === 'credit' && styles.typeButtonTextActive]}>
                                            Crédito
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.typeButton, cardType === 'debit' && styles.typeButtonActive]}
                                        onPress={() => setCardType('debit')}
                                    >
                                        <Ionicons
                                            name="card-outline"
                                            size={20}
                                            color={cardType === 'debit' ? theme.colors.white : theme.colors.primary}
                                        />
                                        <Text style={[styles.typeButtonText, cardType === 'debit' && styles.typeButtonTextActive]}>
                                            Débito
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Cor do Cartão</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.colorGrid}>
                                        {CARD_COLORS.map((color) => (
                                            <TouchableOpacity
                                                key={color}
                                                style={[
                                                    styles.colorOption,
                                                    { backgroundColor: color },
                                                    selectedColor === color && styles.colorOptionSelected,
                                                ]}
                                                onPress={() => setSelectedColor(color)}
                                            >
                                                {selectedColor === color && (
                                                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            {cardType === 'credit' && (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Dia de Vencimento</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Ex: 10"
                                            placeholderTextColor={theme.colors.textMuted}
                                            value={dueDay}
                                            onChangeText={setDueDay}
                                            keyboardType="number-pad"
                                            maxLength={2}
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Limite de Crédito (R$)</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="R$ 0,00"
                                            placeholderTextColor={theme.colors.textMuted}
                                            value={creditLimit ? `R$ ${creditLimit}` : ''}
                                            onChangeText={(text) => setCreditLimit(formatCurrencyBRL(text))}
                                            keyboardType="number-pad"
                                        />
                                    </View>
                                </>
                            )}

                        </View>

                        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Salvar</Text>
                        </TouchableOpacity>

                        {editingCard && (
                            <TouchableOpacity
                                style={styles.deleteButtonModal}
                                onPress={() => deleteCard(editingCard.id)}
                            >
                                <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                                <Text style={styles.deleteButtonText}>Excluir Cartão</Text>
                            </TouchableOpacity>
                        )}
                      </ScrollView>
                    </View>
                </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
