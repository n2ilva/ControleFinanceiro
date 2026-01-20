import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CreditCard, Transaction } from '../../types';
import { FirestoreService } from '../../services/firestoreService';
import { SalaryFirestoreService } from '../../services/salaryFirestoreService';
import { theme } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCardFirestoreService } from '../../services/creditCardFirestoreService';
import { useFocusEffect } from '@react-navigation/native';
import styles from './styles';

export default function EditTransactionScreen({ route, navigation }: any) {
    const { transaction } = route.params;

    const [description, setDescription] = useState(transaction.description);
    const [amount, setAmount] = useState((transaction.amount * 100).toFixed(0));
    const [dueDate, setDueDate] = useState<string>(
        transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString('pt-BR') : ''
    );
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(transaction.cardId ?? null);
    const [selectedCardName, setSelectedCardName] = useState<string | null>(transaction.cardName ?? null);
    const [selectedCardType, setSelectedCardType] = useState<'debit' | 'credit' | null>(transaction.cardType ?? null);
    const [receivedDate, setReceivedDate] = useState<string>(
        transaction.receivedDate ? new Date(transaction.receivedDate).toLocaleDateString('pt-BR') : ''
    );

    const loadCards = async () => {
        try {
            const data = await CreditCardFirestoreService.getCreditCards();
            setCards(data);
            if (selectedCardId && !selectedCardName) {
                const selected = data.find((c) => c.id === selectedCardId);
                if (selected) {
                    setSelectedCardName(selected.name);
                    setSelectedCardType(selected.cardType);
                }
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os cartões');
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadCards();
        }, [])
    );

    const formatCurrency = (value: string) => {
        const cleanValue = value.replace(/\D/g, '');
        if (!cleanValue) return '';
        const amountFloat = parseFloat(cleanValue) / 100;
        return amountFloat.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    const handleAmountChange = (text: string) => {
        const cleanText = text.replace(/\D/g, '');
        setAmount(cleanText);
    };

    const handleDateChange = (text: string) => {
        let v = text.replace(/\D/g, '');
        if (v.length > 8) v = v.substring(0, 8);
        if (v.length > 4) {
            v = v.replace(/^(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
        } else if (v.length > 2) {
            v = v.replace(/^(\d{2})(\d{0,2})/, '$1/$2');
        }
        setDueDate(v);
    };

    const handleReceivedDateChange = (text: string) => {
        let v = text.replace(/\D/g, '');
        if (v.length > 8) v = v.substring(0, 8);
        if (v.length > 4) {
            v = v.replace(/^(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
        } else if (v.length > 2) {
            v = v.replace(/^(\d{2})(\d{0,2})/, '$1/$2');
        }
        setReceivedDate(v);
    };

    const handleSave = async () => {
        if (!description.trim()) {
            Alert.alert('Erro', 'Por favor, insira uma descrição');
            return;
        }

        const numericAmount = parseFloat(amount) / 100;

        if (!amount || numericAmount < 0) {
            Alert.alert('Erro', 'Por favor, insira um valor válido');
            return;
        }

        try {
            let dueDateISO = undefined;
            let receivedDateISO = undefined;
            
            if (transaction.type === 'expense' && dueDate) {
                const parts = dueDate.split('/');
                if (parts.length === 3) {
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    const year = parseInt(parts[2]);
                    if (year > 2000 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
                        const dateObj = new Date(year, month, day);
                        dateObj.setHours(12, 0, 0, 0);
                        dueDateISO = dateObj.toISOString();
                    } else {
                        Alert.alert('Erro', 'Data de vencimento inválida');
                        return;
                    }
                }
            }

            // Parse da data de recebimento para receitas
            if (transaction.type === 'income' && receivedDate) {
                const parts = receivedDate.split('/');
                if (parts.length === 3) {
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    const year = parseInt(parts[2]);
                    if (year > 2000 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
                        const dateObj = new Date(year, month, day);
                        dateObj.setHours(12, 0, 0, 0);
                        receivedDateISO = dateObj.toISOString();
                    }
                }
            }

            // Verificar se é um salário (ID começa com 'salary_')
            if (transaction.isSalary && transaction.id.startsWith('salary_')) {
                // Extrair dados do ID: salary_{salaryId}_{year}_{month}
                const parts = transaction.id.split('_');
                const salaryId = parts[1]; // O ID real do salário no Firestore
                const year = parseInt(parts[2]);
                const month = parseInt(parts[3]);
                
                // Salvar como ajuste mensal (não altera o salário base)
                await SalaryFirestoreService.saveSalaryAdjustment(
                    salaryId,
                    year,
                    month,
                    numericAmount,
                    description.trim()
                );
            } else {
                await FirestoreService.updateTransaction(transaction.id, {
                    description: description.trim(),
                    amount: numericAmount,
                    ...(transaction.type === 'expense' && { dueDate: dueDateISO || null }),
                    ...(transaction.type === 'expense'
                        ? selectedCardId
                            ? { cardId: selectedCardId, cardName: selectedCardName, cardType: selectedCardType }
                            : { cardId: null, cardName: null, cardType: null }
                        : { cardId: null, cardName: null, cardType: null }
                    ),
                    ...(transaction.type === 'income' && { receivedDate: receivedDateISO || null }),
                });
            }

            Alert.alert('Sucesso', 'Transação atualizada com sucesso!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error('Error updating transaction:', error);
            Alert.alert('Erro', 'Não foi possível atualizar a transação');
        }
    };

    const handleDelete = () => {
        const isSalary = transaction.isSalary && transaction.id.startsWith('salary_');
        
        Alert.alert(
            'Excluir',
            isSalary 
                ? 'Deseja excluir este salário permanentemente? Isso removerá o salário de todos os meses.'
                : 'Tem certeza que deseja excluir esta transação?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (isSalary) {
                                // Extrair o ID real do salário: salary_{salaryId}_{year}_{month}
                                const parts = transaction.id.split('_');
                                const salaryId = parts[1];
                                await SalaryFirestoreService.deleteSalary(salaryId);
                            } else {
                                await FirestoreService.deleteTransaction(transaction.id);
                            }
                            Alert.alert('Sucesso', 'Excluído com sucesso!', [
                                { text: 'OK', onPress: () => navigation.goBack() },
                            ]);
                        } catch (error) {
                            console.error('Error deleting:', error);
                            Alert.alert('Erro', 'Não foi possível excluir');
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Editar Transação</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.label}>Descrição</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Conta de luz"
                        placeholderTextColor={theme.colors.textMuted}
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Valor</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="R$ 0,00"
                        placeholderTextColor={theme.colors.textMuted}
                        value={formatCurrency(amount)}
                        onChangeText={handleAmountChange}
                        keyboardType="numeric"
                    />
                </View>

                {transaction.type === 'income' && (
                    <View style={styles.section}>
                        <Text style={styles.label}>Data do Recebimento (opcional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor={theme.colors.textMuted}
                            value={receivedDate}
                            onChangeText={handleReceivedDateChange}
                            keyboardType="numeric"
                            maxLength={10}
                        />
                    </View>
                )}

                {transaction.type === 'expense' && (
                    <View style={styles.section}>
                        <Text style={styles.label}>Data de Vencimento</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor={theme.colors.textMuted}
                            value={dueDate}
                            onChangeText={handleDateChange}
                            keyboardType="numeric"
                            maxLength={10}
                        />
                    </View>
                )}

                {transaction.type === 'expense' && (
                    <View style={styles.section}>
                        <Text style={styles.label}>Cartão (opcional)</Text>
                        {cards.length === 0 ? (
                            <View style={styles.emptyCardContainer}>
                                <Text style={styles.helperText}>Nenhum cartão cadastrado</Text>
                                <TouchableOpacity
                                    style={styles.addCardButton}
                                    onPress={() => navigation.navigate('MainTabs', { screen: 'CreditCards' })}
                                >
                                    <Ionicons name="add-circle-outline" size={18} color={theme.colors.primary} />
                                    <Text style={styles.addCardButtonText}>Adicionar cartão</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.cardListContainer}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <TouchableOpacity
                                        style={[
                                            styles.cardChip,
                                            selectedCardId === null && styles.cardChipActive,
                                        ]}
                                        onPress={() => {
                                            setSelectedCardId(null);
                                            setSelectedCardName(null);
                                            setSelectedCardType(null);
                                        }}
                                    >
                                        <Text style={[styles.cardChipText, selectedCardId === null && styles.cardChipTextActive]}>
                                            Sem cartão
                                        </Text>
                                    </TouchableOpacity>
                                    {cards.map((card) => {
                                        const isSelected = selectedCardId === card.id;
                                        return (
                                            <TouchableOpacity
                                                key={card.id}
                                                style={[styles.cardChip, isSelected && styles.cardChipActive]}
                                                onPress={() => {
                                                    setSelectedCardId(card.id);
                                                    setSelectedCardName(card.name);
                                                    setSelectedCardType(card.cardType);
                                                }}
                                            >
                                                <Text style={[styles.cardChipText, isSelected && styles.cardChipTextActive]}>
                                                    {card.name}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                                <TouchableOpacity
                                    style={styles.addCardButtonInline}
                                    onPress={() => navigation.navigate('MainTabs', { screen: 'CreditCards' })}
                                >
                                    <Ionicons name="add" size={18} color={theme.colors.primary} />
                                    <Text style={styles.addCardButtonText}>Novo cartão</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.saveButton]}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                >
                    <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                    <Text style={styles.deleteButtonText}>Excluir {transaction.isSalary ? 'Salário' : 'Transação'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
