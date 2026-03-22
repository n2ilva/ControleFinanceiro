import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Switch,
    Modal,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { crossAlert } from '../../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { FirestoreService } from '../../../services/firestoreService';
import { CreditCard, Transaction } from '../../../types';
import { theme } from '../../../theme';
import { auth } from '../../../config/firebase';
import { CreditCardFirestoreService } from '../../../services/creditCardFirestoreService';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../../constants';
import AddCardBottomSheet from '../../../components/AddCardBottomSheet';
import { getCustomCategories, addCustomCategory, AVAILABLE_ICONS, CustomCategory } from '../../../services/customCategoryService';

interface AddTransactionModalProps {
    visible: boolean;
    type: 'expense' | 'income';
    month: number;
    year: number;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddTransactionModal({ visible, type, month, year, onClose, onSuccess }: AddTransactionModalProps) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('outros');
    const [isRecurring, setIsRecurring] = useState(false);
    const [dueDay, setDueDay] = useState('');
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [selectedCardName, setSelectedCardName] = useState<string | null>(null);
    const [selectedCardType, setSelectedCardType] = useState<'debit' | 'credit' | null>(null);
    const [receivedDate, setReceivedDate] = useState('');
    const [showAddCardSheet, setShowAddCardSheet] = useState(false);
    const [installments, setInstallments] = useState('1');
    const [isInstallment, setIsInstallment] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('bookmark');

    const baseCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const categories = [...baseCategories, ...customCategories];

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            setDescription('');
            setAmount('');
            setCategory('outros');
            setIsRecurring(false);
            setDueDay('');
            setSelectedCardId(null);
            setSelectedCardName(null);
            setSelectedCardType(null);
            setReceivedDate('');
            setInstallments('1');
            setIsInstallment(false);
            setShowNewCategory(false);
            setNewCategoryName('');
            setNewCategoryIcon('bookmark');
            loadCards();
            loadCustomCategories();
        }
    }, [visible]);

    const loadCustomCategories = async () => {
        try {
            const custom = await getCustomCategories(type);
            setCustomCategories(custom);
        } catch (_error) {
            // silently fail
        }
    };

    const handleAddCustomCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) {
            crossAlert('Erro', 'Digite o nome da categoria');
            return;
        }
        const id = 'custom_' + name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        if (categories.some(c => c.id === id)) {
            crossAlert('Erro', 'Já existe uma categoria com esse nome');
            return;
        }
        const newCat: CustomCategory = { id, label: name, icon: newCategoryIcon };
        await addCustomCategory(type, newCat);
        setCustomCategories(prev => [...prev, newCat]);
        setCategory(id);
        setShowNewCategory(false);
        setNewCategoryName('');
        setNewCategoryIcon('bookmark');
    };

    const loadCards = async () => {
        try {
            const data = await CreditCardFirestoreService.getCreditCards();
            setCards(data);
        } catch (_error) {
            // silently fail
        }
    };

    const formatCurrency = (value: string) => {
        const cleanValue = value.replace(/\D/g, '');
        if (!cleanValue) return '';
        const amt = parseFloat(cleanValue) / 100;
        return amt.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleAmountChange = (text: string) => {
        setAmount(text.replace(/\D/g, ''));
    };

    const handleSave = async () => {
        if (isSaving) return;

        const finalDescription = description.trim() || (
            categories.find(c => c.id === category)?.label || 'Outros'
        );

        const numericAmount = parseFloat(amount) / 100;

        if (!amount || numericAmount <= 0) {
            crossAlert('Erro', 'Por favor, insira um valor válido');
            return;
        }

        if (type === 'income' && !receivedDate) {
            crossAlert('Erro', 'Por favor, insira o dia de recebimento');
            return;
        }

        if (type === 'income' && receivedDate) {
            const day = parseInt(receivedDate);
            if (isNaN(day) || day < 1 || day > 31 || receivedDate.length !== 2) {
                crossAlert('Erro', 'Dia de recebimento deve ter 2 dígitos (Ex: 01, 15, 30)');
                return;
            }
        }

        if (type === 'expense' && dueDay) {
            if (dueDay.length !== 2) {
                crossAlert('Erro', 'Dia de vencimento deve ter 2 dígitos (Ex: 01, 05, 15, 31)');
                return;
            }
            const day = parseInt(dueDay);
            if (isNaN(day) || day < 1 || day > 31) {
                crossAlert('Erro', 'Dia de vencimento deve ser entre 01 e 31');
                return;
            }
        }

        if (isInstallment && selectedCardId) {
            const numInstallments = parseInt(installments);
            if (isNaN(numInstallments) || numInstallments < 2 || numInstallments > 36) {
                crossAlert('Erro', 'Número de parcelas deve ser entre 2 e 36');
                return;
            }
        }

        setIsSaving(true);
        try {
            const today = new Date();
            const baseDate = new Date(year, month, today.getDate());
            const baseYear = baseDate.getFullYear();
            const baseMonth = baseDate.getMonth();

            let currentDate: Date;

            if (type === 'expense' && dueDay) {
                const day = parseInt(dueDay);
                const lastDayOfMonth = new Date(baseYear, baseMonth + 1, 0).getDate();
                currentDate = new Date(baseYear, baseMonth, Math.min(day, lastDayOfMonth));
            } else if (type === 'income' && receivedDate) {
                const day = parseInt(receivedDate);
                const lastDayOfMonth = new Date(baseYear, baseMonth + 1, 0).getDate();
                currentDate = new Date(baseYear, baseMonth, Math.min(day, lastDayOfMonth));
            } else {
                currentDate = baseDate;
            }

            let dueDateISO: string | undefined;
            let receivedDateISO: string | undefined;

            if (type === 'expense' && dueDay) {
                const day = parseInt(dueDay);
                const yr = currentDate.getFullYear();
                const mo = currentDate.getMonth();
                const lastDay = new Date(yr, mo + 1, 0).getDate();
                dueDateISO = new Date(yr, mo, Math.min(day, lastDay)).toISOString();
            }

            if (type === 'income' && receivedDate) {
                const day = parseInt(receivedDate);
                if (!isNaN(day) && day >= 1 && day <= 31) {
                    const lastDay = new Date(baseYear, baseMonth + 1, 0).getDate();
                    receivedDateISO = new Date(baseYear, baseMonth, Math.min(day, lastDay)).toISOString();
                }
            }

            if (isInstallment && selectedCardId && type === 'expense') {
                const numInstallments = parseInt(installments);
                const installmentAmount = numericAmount / numInstallments;
                const recurrenceId = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

                for (let i = 0; i < numInstallments; i++) {
                    const targetMonth = currentDate.getMonth() + i;
                    const targetYear = currentDate.getFullYear() + Math.floor(targetMonth / 12);
                    const actualMonth = targetMonth % 12;
                    const installmentDate = new Date(targetYear, actualMonth, 1);
                    const lastDay = new Date(targetYear, actualMonth + 1, 0).getDate();
                    installmentDate.setDate(Math.min(currentDate.getDate(), lastDay));

                    const transaction: Transaction = {
                        id: `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 11)}`,
                        description: finalDescription,
                        amount: installmentAmount,
                        category,
                        isRecurring: true,
                        isPaid: true,
                        type,
                        date: installmentDate.toISOString(),
                        createdAt: new Date().toISOString(),
                        userId: auth.currentUser?.uid || '',
                        cardId: selectedCardId,
                        cardName: selectedCardName,
                        cardType: selectedCardType,
                        installments: numInstallments,
                        installmentNumber: i + 1,
                        recurrenceId,
                        originalAmount: numericAmount,
                    };
                    await FirestoreService.addTransaction(transaction);
                }

                crossAlert('Sucesso', `Compra parcelada em ${numInstallments}x adicionada!`);
                onSuccess();
                onClose();
            } else if (isRecurring) {
                const curMonth = currentDate.getMonth();
                const numMonths = 12 - curMonth;
                const recurrenceId = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

                for (let i = 0; i < numMonths; i++) {
                    const targetMonth = currentDate.getMonth() + i;
                    const targetYear = currentDate.getFullYear() + Math.floor(targetMonth / 12);
                    const actualMonth = targetMonth % 12;
                    const recurringDate = new Date(targetYear, actualMonth, 1);
                    const lastDay = new Date(targetYear, actualMonth + 1, 0).getDate();

                    if (type === 'income' && receivedDate) {
                        recurringDate.setDate(Math.min(parseInt(receivedDate), lastDay));
                    } else {
                        recurringDate.setDate(Math.min(currentDate.getDate(), lastDay));
                    }

                    const transaction: Transaction = {
                        id: `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 11)}`,
                        description: finalDescription,
                        amount: numericAmount,
                        category,
                        isRecurring: true,
                        isPaid: true,
                        type,
                        date: recurringDate.toISOString(),
                        createdAt: new Date().toISOString(),
                        userId: auth.currentUser?.uid || '',
                        recurrenceId,
                        originalAmount: numericAmount,
                        ...(type === 'income' && { receivedDate: recurringDate.toISOString() }),
                        ...(dueDateISO && { dueDate: dueDateISO }),
                        ...(type === 'expense' && selectedCardId && {
                            cardId: selectedCardId,
                            cardName: selectedCardName,
                            cardType: selectedCardType,
                        }),
                    };
                    await FirestoreService.addTransaction(transaction);
                }

                const label = type === 'expense' ? 'Despesa' : 'Receita';
                crossAlert('Sucesso', `${label} recorrente criada para os próximos ${numMonths} meses!`);
                onSuccess();
                onClose();
            } else {
                const transaction: Transaction = {
                    id: `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                    description: finalDescription,
                    amount: numericAmount,
                    category,
                    isRecurring,
                    isPaid: true,
                    type,
                    date: currentDate.toISOString(),
                    createdAt: new Date().toISOString(),
                    userId: auth.currentUser?.uid || '',
                    ...(dueDateISO && { dueDate: dueDateISO }),
                    ...(type === 'expense' && selectedCardId && {
                        cardId: selectedCardId,
                        cardName: selectedCardName,
                        cardType: selectedCardType,
                    }),
                    ...(type === 'income' && receivedDateISO && { receivedDate: receivedDateISO }),
                };

                await FirestoreService.addTransaction(transaction);
                crossAlert('Sucesso', 'Transação adicionada com sucesso!');
                onSuccess();
                onClose();
            }
        } catch (_error) {
            crossAlert('Erro', 'Não foi possível adicionar a transação');
        } finally {
            setIsSaving(false);
        }
    };

    const title = type === 'expense' ? 'Nova Despesa' : 'Nova Receita';
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    return (
        <>
            <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.keyboardView}
                    >
                        <TouchableOpacity style={styles.modalContent} activeOpacity={1} onPress={() => {}}>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={styles.modalTitle}>{title}</Text>

                                {/* Descrição */}
                                <Text style={styles.label}>Descrição (opcional)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Deixe vazio para usar a categoria"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={description}
                                    onChangeText={setDescription}
                                />

                                {/* Valor + Dia */}
                                <View style={styles.row}>
                                    <View style={{ flex: 2 }}>
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
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>{type === 'income' ? 'Dia' : 'Venc.'}</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="DD"
                                            placeholderTextColor={theme.colors.textMuted}
                                            value={type === 'income' ? receivedDate : dueDay}
                                            onChangeText={(text) => {
                                                const v = text.replace(/\D/g, '');
                                                if (v.length <= 2) {
                                                    type === 'income' ? setReceivedDate(v) : setDueDay(v);
                                                }
                                            }}
                                            keyboardType="number-pad"
                                            maxLength={2}
                                        />
                                    </View>
                                </View>
                                <Text style={styles.helperText}>
                                    {type === 'income'
                                        ? `Dia do recebimento no mês atual (${monthNames[month]})`
                                        : 'Dia do vencimento (2 dígitos: 01, 15, 31)'
                                    }
                                </Text>

                                {/* Cartão (despesas) */}
                                {type === 'expense' && cards.length > 0 && (
                                    <>
                                        <Text style={[styles.label, { marginTop: theme.spacing.md }]}>Cartão (opcional)</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.sm }}>
                                            <TouchableOpacity
                                                style={[styles.cardChip, selectedCardId === null && styles.cardChipActive]}
                                                onPress={() => { setSelectedCardId(null); setSelectedCardName(null); setSelectedCardType(null); }}
                                            >
                                                <Text style={[styles.cardChipText, selectedCardId === null && styles.cardChipTextActive]}>Sem cartão</Text>
                                            </TouchableOpacity>
                                            {cards.map((card) => (
                                                <TouchableOpacity
                                                    key={card.id}
                                                    style={[styles.cardChip, selectedCardId === card.id && styles.cardChipActive]}
                                                    onPress={() => { setSelectedCardId(card.id); setSelectedCardName(card.name); setSelectedCardType(card.cardType); }}
                                                >
                                                    <Text style={[styles.cardChipText, selectedCardId === card.id && styles.cardChipTextActive]}>{card.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </>
                                )}

                                {type === 'expense' && cards.length === 0 && (
                                    <TouchableOpacity
                                        style={styles.addCardBtn}
                                        onPress={() => setShowAddCardSheet(true)}
                                    >
                                        <Ionicons name="add-circle-outline" size={16} color={theme.colors.primary} />
                                        <Text style={styles.addCardBtnText}>Adicionar cartão</Text>
                                    </TouchableOpacity>
                                )}

                                {/* Parcelamento */}
                                {type === 'expense' && selectedCardId && selectedCardType === 'credit' && (
                                    <View style={{ marginBottom: theme.spacing.md }}>
                                        <View style={styles.toggleRow}>
                                            <Text style={styles.label}>Compra parcelada?</Text>
                                            <Switch
                                                value={isInstallment}
                                                onValueChange={(v) => { setIsInstallment(v); setInstallments(v ? '2' : '1'); }}
                                                trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                                                thumbColor={isInstallment ? theme.colors.primary : theme.colors.textMuted}
                                            />
                                        </View>
                                        {isInstallment && (
                                            <View style={{ marginTop: theme.spacing.xs }}>
                                                <TextInput
                                                    style={[styles.input, { textAlign: 'center' }]}
                                                    placeholder="Nº parcelas"
                                                    placeholderTextColor={theme.colors.textMuted}
                                                    value={installments}
                                                    onChangeText={setInstallments}
                                                    keyboardType="number-pad"
                                                    maxLength={2}
                                                />
                                                <Text style={styles.helperText}>
                                                    {installments && parseInt(installments) > 1
                                                        ? `${parseInt(installments)}x de R$ ${(parseFloat(amount || '0') / 100 / parseInt(installments)).toFixed(2)}`
                                                        : '2 a 36 parcelas'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* Categorias - Grid de chips */}
                                <Text style={[styles.label, { marginTop: theme.spacing.sm }]}>Categoria</Text>
                                <ScrollView horizontal={false} style={{ maxHeight: 200, marginBottom: theme.spacing.md }}>
                                    <View style={styles.categoryGrid}>
                                        {categories.map((cat) => (
                                            <TouchableOpacity
                                                key={cat.id}
                                                style={[
                                                    styles.categoryChip,
                                                    category === cat.id && styles.categoryChipSelected,
                                                ]}
                                                onPress={() => setCategory(cat.id)}
                                            >
                                                <Ionicons
                                                    name={cat.icon as any}
                                                    size={14}
                                                    color={category === cat.id ? theme.colors.primary : theme.colors.textMuted}
                                                />
                                                <Text
                                                    style={[
                                                        styles.categoryChipText,
                                                        category === cat.id && styles.categoryChipTextSelected,
                                                    ]}
                                                >
                                                    {cat.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                        <TouchableOpacity
                                            style={[styles.categoryChip, styles.newCategoryChip]}
                                            onPress={() => setShowNewCategory(!showNewCategory)}
                                        >
                                            <Ionicons name="add-circle-outline" size={14} color={theme.colors.primary} />
                                            <Text style={[styles.categoryChipText, { color: theme.colors.primary }]}>Nova</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>

                                {/* Nova Categoria */}
                                {showNewCategory && (
                                    <View style={styles.newCategoryForm}>
                                        <TextInput
                                            style={[styles.input, { marginBottom: theme.spacing.xs }]}
                                            placeholder="Nome da categoria"
                                            placeholderTextColor={theme.colors.textMuted}
                                            value={newCategoryName}
                                            onChangeText={setNewCategoryName}
                                            maxLength={30}
                                        />
                                        <Text style={[styles.helperText, { marginBottom: 4 }]}>Ícone:</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.sm }}>
                                            {AVAILABLE_ICONS.map((icon) => (
                                                <TouchableOpacity
                                                    key={icon}
                                                    style={[
                                                        styles.iconChip,
                                                        newCategoryIcon === icon && styles.iconChipSelected,
                                                    ]}
                                                    onPress={() => setNewCategoryIcon(icon)}
                                                >
                                                    <Ionicons name={icon as any} size={18} color={newCategoryIcon === icon ? theme.colors.primary : theme.colors.textMuted} />
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                        <TouchableOpacity style={styles.newCategoryBtn} onPress={handleAddCustomCategory}>
                                            <Text style={styles.newCategoryBtnText}>Criar Categoria</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Recorrência */}
                                <View style={[styles.toggleRow, { marginBottom: theme.spacing.md }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>
                                            {type === 'expense' ? 'Despesa Recorrente' : 'Receita Recorrente'}
                                        </Text>
                                        <Text style={styles.helperText}>Duplicada nos próximos meses</Text>
                                    </View>
                                    <Switch
                                        value={isRecurring}
                                        onValueChange={setIsRecurring}
                                        trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                                        thumbColor={isRecurring ? theme.colors.primary : theme.colors.textMuted}
                                    />
                                </View>

                                {/* Botão Salvar */}
                                <TouchableOpacity
                                    style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
                                    onPress={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator size="small" color={theme.colors.white} />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Salvar</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={isSaving}>
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </TouchableOpacity>
            </Modal>

            <AddCardBottomSheet
                visible={showAddCardSheet}
                onClose={() => setShowAddCardSheet(false)}
                onCardAdded={loadCards}
            />
        </>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.backgroundCard,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
        textAlign: 'center',
    },
    label: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        color: theme.colors.text,
        fontSize: theme.fontSize.md,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    helperText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.sm,
    },
    row: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    // Category grid (same pattern as BudgetsScreen)
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.surface,
        gap: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    categoryChipSelected: {
        backgroundColor: theme.colors.primary + '20',
        borderColor: theme.colors.primary,
    },
    categoryChipText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
    },
    categoryChipTextSelected: {
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.semibold,
    },
    // Cards
    cardChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginRight: theme.spacing.sm,
    },
    cardChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    cardChipText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
    },
    cardChipTextActive: {
        color: theme.colors.white,
        fontWeight: theme.fontWeight.bold,
    },
    addCardBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: theme.spacing.md,
    },
    addCardBtnText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.primary,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    // New category
    newCategoryChip: {
        borderStyle: 'dashed' as any,
        borderColor: theme.colors.primary,
    },
    newCategoryForm: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    iconChip: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginRight: 6,
    },
    iconChipSelected: {
        backgroundColor: theme.colors.primary + '20',
        borderColor: theme.colors.primary,
    },
    newCategoryBtn: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
        alignItems: 'center' as const,
    },
    newCategoryBtnText: {
        color: theme.colors.white,
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.bold,
    },
    // Buttons
    saveButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        alignItems: 'center',
        marginTop: theme.spacing.sm,
    },
    saveButtonText: {
        color: theme.colors.white,
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
    },
    cancelButton: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        alignItems: 'center',
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
    },
    cancelButtonText: {
        color: theme.colors.text,
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
    },
});
