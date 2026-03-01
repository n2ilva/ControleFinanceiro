import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
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
    const [dueDate, setDueDate] = useState<string>(() => {
        if (transaction.dueDate) {
            const date = new Date(transaction.dueDate);
            const day = date.getDate();
            return day.toString().padStart(2, '0');
        }
        return '';
    });
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(transaction.cardId ?? null);
    const [selectedCardName, setSelectedCardName] = useState<string | null>(transaction.cardName ?? null);
    const [selectedCardType, setSelectedCardType] = useState<'debit' | 'credit' | null>(transaction.cardType ?? null);
    const [receivedDate, setReceivedDate] = useState<string>(() => {
        if (transaction.receivedDate) {
            const date = new Date(transaction.receivedDate);
            const day = date.getDate();
            return day.toString().padStart(2, '0');
        }
        return '';
    });
    const [isSaving, setIsSaving] = useState(false); // Estado de loading ao salvar

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
        const v = text.replace(/\D/g, '');
        if (v.length <= 2) {
            setDueDate(v);
        }
    };

    const handleReceivedDateChange = (text: string) => {
        // Aceitar apenas números e limitar a 2 dígitos (dia do mês)
        const v = text.replace(/\D/g, '');
        if (v.length <= 2) {
            setReceivedDate(v);
        }
    };

    const handleSave = async () => {
        // Evitar múltiplos cliques
        if (isSaving) return;
        
        if (!description.trim()) {
            Alert.alert('Erro', 'Por favor, insira uma descrição');
            return;
        }

        const numericAmount = parseFloat(amount) / 100;

        if (!amount || numericAmount < 0) {
            Alert.alert('Erro', 'Por favor, insira um valor válido');
            return;
        }

        setIsSaving(true);
        try {
            let dueDateISO = undefined;
            let receivedDateISO = undefined;
            
            if (transaction.type === 'expense' && dueDate) {
                const day = parseInt(dueDate);
                if (isNaN(day) || day < 1 || day > 31 || dueDate.length !== 2) {
                    setIsSaving(false);
                    Alert.alert('Erro', 'Dia de vencimento deve ter 2 dígitos (Ex: 01, 15, 30)');
                    return;
                }
                
                // Usar mês e ano da transação original
                const originalDate = new Date(transaction.date);
                const year = originalDate.getFullYear();
                const month = originalDate.getMonth();
                const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
                const safeDay = Math.min(day, lastDayOfMonth);
                
                const dateObj = new Date(year, month, safeDay);
                dateObj.setHours(12, 0, 0, 0);
                dueDateISO = dateObj.toISOString();
            }

            // Parse da data de recebimento para receitas (apenas dia)
            if (transaction.type === 'income' && receivedDate) {
                const day = parseInt(receivedDate);
                if (isNaN(day) || day < 1 || day > 31 || receivedDate.length !== 2) {
                    setIsSaving(false);
                    Alert.alert('Erro', 'Dia de recebimento deve ter 2 dígitos (Ex: 01, 15, 28)');
                    return;
                }
                
                // Usar mês e ano da transação original
                const originalDate = new Date(transaction.date);
                const year = originalDate.getFullYear();
                const month = originalDate.getMonth();
                const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
                const safeDay = Math.min(day, lastDayOfMonth);
                
                const dateObj = new Date(year, month, safeDay);
                dateObj.setHours(12, 0, 0, 0);
                receivedDateISO = dateObj.toISOString();
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
                    ...(transaction.type === 'expense' && { dueDate: dueDateISO || undefined }),
                    ...(transaction.type === 'expense'
                        ? selectedCardId
                            ? { cardId: selectedCardId, cardName: selectedCardName, cardType: selectedCardType }
                            : { cardId: undefined, cardName: undefined, cardType: undefined }
                        : { cardId: undefined, cardName: undefined, cardType: undefined }
                    ),
                    ...(transaction.type === 'income' && { receivedDate: receivedDateISO || undefined }),
                });
            }

            Alert.alert('Sucesso', 'Transação atualizada com sucesso!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error('Error updating transaction:', error);
            Alert.alert('Erro', 'Não foi possível atualizar a transação');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        const isSalary = transaction.isSalary && transaction.id.startsWith('salary_');
        const isRecurringWithId = transaction.isRecurring && transaction.recurrenceId;
        
        if (isSalary) {
            Alert.alert(
                'Excluir',
                'Deseja excluir este salário permanentemente? Isso removerá o salário de todos os meses.',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Excluir',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                const parts = transaction.id.split('_');
                                const salaryId = parts[1];
                                await SalaryFirestoreService.deleteSalary(salaryId);
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
        } else if (isRecurringWithId) {
            // Transação recorrente - dar opções
            Alert.alert(
                'Excluir Transação Recorrente',
                'Como deseja excluir esta transação?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Apenas esta',
                        onPress: async () => {
                            try {
                                await FirestoreService.deleteTransaction(transaction.id);
                                Alert.alert('Sucesso', 'Transação excluída!', [
                                    { text: 'OK', onPress: () => navigation.goBack() },
                                ]);
                            } catch (error) {
                                console.error('Error deleting:', error);
                                Alert.alert('Erro', 'Não foi possível excluir');
                            }
                        },
                    },
                    {
                        text: 'Esta e próximas',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                const deletedCount = await FirestoreService.deleteRecurrenceFromDate(
                                    transaction.recurrenceId!,
                                    transaction.date
                                );
                                Alert.alert(
                                    'Sucesso',
                                    `${deletedCount} transação(ões) excluída(s)!`,
                                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                                );
                            } catch (error) {
                                console.error('Error deleting recurrence:', error);
                                Alert.alert('Erro', 'Não foi possível excluir');
                            }
                        },
                    },
                ]
            );
        } else {
            // Transação não recorrente - comportamento padrão
            Alert.alert(
                'Excluir',
                'Tem certeza que deseja excluir esta transação?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Excluir',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await FirestoreService.deleteTransaction(transaction.id);
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
        }
    };

    const handleCancelRecurrence = () => {
        if (!transaction.recurrenceId) {
            Alert.alert('Aviso', 'Esta transação não possui recorrência vinculada.');
            return;
        }

        Alert.alert(
            'Cancelar Recorrência',
            'Deseja cancelar a recorrência desta despesa? Isso irá:\n\n• Manter esta transação\n• Remover todas as transações dos meses seguintes\n• Desativar a recorrência',
            [
                { text: 'Não', style: 'cancel' },
                {
                    text: 'Sim, cancelar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const deletedCount = await FirestoreService.cancelRecurrence(
                                transaction.id,
                                transaction.recurrenceId!,
                                transaction.date
                            );
                            Alert.alert(
                                'Sucesso',
                                `Recorrência cancelada!\n${deletedCount} transação(ões) futura(s) removida(s).`,
                                [{ text: 'OK', onPress: () => navigation.goBack() }]
                            );
                        } catch (error) {
                            console.error('Error canceling recurrence:', error);
                            Alert.alert('Erro', 'Não foi possível cancelar a recorrência');
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

                {/* Valor e Data na mesma linha */}
                <View style={styles.row}>
                    <View style={styles.flex2}>
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
                        <View style={styles.flex1}>
                            <Text style={styles.label}>Dia Receb.</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 28"
                                placeholderTextColor={theme.colors.textMuted}
                                value={receivedDate}
                                onChangeText={handleReceivedDateChange}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                        </View>
                    )}

                    {transaction.type === 'expense' && (
                        <View style={styles.flex1}>
                            <Text style={styles.label}>Venc.</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="DD"
                                placeholderTextColor={theme.colors.textMuted}
                                value={dueDate}
                                onChangeText={handleDateChange}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                        </View>
                    )}
                </View>

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

                <View style={styles.actionsRow}>
                    {transaction.isRecurring && transaction.recurrenceId && (
                        <TouchableOpacity
                            style={styles.cancelRecurrenceButton}
                            onPress={handleCancelRecurrence}
                        >
                            <Ionicons name="close-circle-outline" size={18} color={theme.colors.white} />
                            <Text style={styles.cancelRecurrenceButtonText} numberOfLines={1} ellipsizeMode="tail">Cancelar Recorrência</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.deleteButton,
                            !(transaction.isRecurring && transaction.recurrenceId) && styles.deleteButtonFullWidth
                        ]}
                        onPress={handleDelete}
                    >
                        <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                        <Text style={styles.deleteButtonText} numberOfLines={1} ellipsizeMode="tail">Excluir {transaction.isSalary ? 'Salário' : 'Transação'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => navigation.goBack()}
                        disabled={isSaving}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.saveButton, isSaving && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color={theme.colors.white} />
                        ) : (
                            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
