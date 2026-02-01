import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
    TextInput,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { CreditCardFirestoreService } from '../../services/creditCardFirestoreService';
import { CreditCard } from '../../types';
import { FirestoreService } from '../../services/firestoreService';
import { theme } from '../../theme';
import styles from './styles';

interface CardWithAmount extends CreditCard {
    currentMonthAmount: number;
    invoiceMonth?: string; // Nome do mês da fatura (ex: "Fevereiro")
}

export default function CreditCardsScreen({ navigation }: any) {
    const [cards, setCards] = useState<CardWithAmount[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
    const [name, setName] = useState('');
    const [dueDay, setDueDay] = useState('');
    const [cardType, setCardType] = useState<'debit' | 'credit'>('credit');
    const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

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
            Alert.alert('Erro', 'Não foi possível carregar os cartões');
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
        setModalVisible(true);
    };

    const openEditModal = (card: CreditCard) => {
        setEditingCard(card);
        setName(card.name);
        setDueDay(card.dueDay.toString());
        setCardType(card.cardType);
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Erro', 'Por favor, insira o nome do cartão');
            return;
        }

        // Validar vencimento apenas para cartões de crédito
        if (cardType === 'credit') {
            const parsedDay = parseInt(dueDay, 10);
            if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) {
                Alert.alert('Erro', 'Dia de vencimento deve ser entre 1 e 31');
                return;
            }
        }

        const parsedDay = cardType === 'credit' ? parseInt(dueDay, 10) : 1;

        try {
            if (editingCard) {
                await CreditCardFirestoreService.updateCreditCard(editingCard.id, {
                    name: name.trim(),
                    dueDay: parsedDay,
                    cardType,
                });
            } else {
                await CreditCardFirestoreService.addCreditCard({
                    name: name.trim(),
                    dueDay: parsedDay,
                    cardType,
                    createdAt: new Date().toISOString(),
                });
            }

            setModalVisible(false);
            loadCards();
            Alert.alert('Sucesso', editingCard ? 'Cartão atualizado!' : 'Cartão adicionado!');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar o cartão');
        }
    };

    const deleteCard = async (id: string) => {
        Alert.alert(
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
                            loadCards();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir o cartão');
                        }
                    },
                },
            ]
        );
    };

    const renderCard = ({ item }: { item: CardWithAmount }) => {
        return (
            <TouchableOpacity
                style={styles.cardItem}
                onPress={() => navigation.navigate('CardDetails', { cardId: item.id })}
                activeOpacity={0.7}
            >
                <TouchableOpacity 
                    style={styles.editButton} 
                    onPress={(e) => {
                        e.stopPropagation();
                        openEditModal(item);
                    }}
                >
                    <Ionicons name="pencil" size={20} color={theme.colors.primary} />
                </TouchableOpacity>

                <View style={styles.cardInfo}>
                    <View style={styles.cardNameRow}>
                        <Text style={styles.cardName}>{item.name}</Text>
                    </View>
                    {item.cardType === 'credit' && (
                        <View style={styles.cardMeta}>
                            <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                            <Text style={styles.cardMetaText}>Vencimento: dia {item.dueDay}</Text>
                        </View>
                    )}
                    <View style={styles.cardMeta}>
                        <Ionicons name="card-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.cardMetaText}>{item.cardType === 'credit' ? 'Crédito' : 'Débito'}</Text>
                    </View>
                    
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountLabel}>
                            {item.cardType === 'credit' 
                                ? `Fatura ${item.invoiceMonth}:` 
                                : 'Gastos do mês:'}
                        </Text>
                        <Text style={[
                            styles.amountValue,
                            item.currentMonthAmount === 0 && styles.amountValueZero
                        ]}>
                            R$ {(item.currentMonthAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Filtrar cartões baseado no filtro selecionado
    const filteredCards = cards.filter(card => {
        if (filter === 'all') return true;
        return card.cardType === filter;
    });

    return (
        <View style={styles.container}>
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
                data={filteredCards}
                renderItem={renderCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
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

            <TouchableOpacity style={styles.fab} onPress={openAddModal}>
                <Ionicons name="add" size={32} color={theme.colors.white} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
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

                            {cardType === 'credit' && (
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
                            )}

                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>Salvar</Text>
                            </TouchableOpacity>
                        </View>

                        {editingCard && (
                            <TouchableOpacity
                                style={styles.deleteButtonModal}
                                onPress={() => deleteCard(editingCard.id)}
                            >
                                <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                                <Text style={styles.deleteButtonText}>Excluir Cartão</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
