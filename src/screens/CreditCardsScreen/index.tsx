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
import { theme } from '../../theme';
import styles from './styles';

export default function CreditCardsScreen() {
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
    const [name, setName] = useState('');
    const [dueDay, setDueDay] = useState('');
    const [cardType, setCardType] = useState<'debit' | 'credit'>('credit');

    const loadCards = async () => {
        try {
            const data = await CreditCardFirestoreService.getCreditCards();
            setCards(data);
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

        const parsedDay = parseInt(dueDay, 10);
        if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) {
            Alert.alert('Erro', 'Dia de vencimento deve ser entre 1 e 31');
            return;
        }

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

    const renderCard = ({ item }: { item: CreditCard }) => (
        <View style={styles.cardItem}>
            <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <View style={styles.cardMeta}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.cardMetaText}>Vencimento: dia {item.dueDay}</Text>
                </View>
                <View style={styles.cardMeta}>
                    <Ionicons name="card-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.cardMetaText}>{item.cardType === 'credit' ? 'Crédito' : 'Débito'}</Text>
                </View>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
                    <Ionicons name="pencil" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={cards}
                renderItem={renderCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="card-outline" size={64} color={theme.colors.textMuted} />
                        <Text style={styles.emptyStateText}>Nenhum cartão cadastrado</Text>
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
