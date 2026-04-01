import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Switch,
    Linking,
    ActivityIndicator,
} from 'react-native';
import { crossAlert } from '../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { FirestoreService } from '../../services/firestoreService';
import { CreditCard, Transaction } from '../../types';
import { theme } from '../../theme';
import { auth } from '../../config/firebase';
import { CreditCardFirestoreService } from '../../services/creditCardFirestoreService';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './styles';
import AddCardBottomSheet from '../../components/AddCardBottomSheet';
import { getCustomCategories, addCustomCategory, AVAILABLE_ICONS, CustomCategory } from '../../services/customCategoryService';
import { CategoryPicker } from '../../components/CategoryPicker';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, EXPENSE_CATEGORY_GROUPS, INCOME_CATEGORY_GROUPS } from '../../constants';

export default function AddTransactionScreen({ navigation, route }: any) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('outros');
    const [isRecurring, setIsRecurring] = useState(false);
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [dueDay, setDueDay] = useState('');
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [selectedCardName, setSelectedCardName] = useState<string | null>(null);
    const [selectedCardType, setSelectedCardType] = useState<'debit' | 'credit' | null>(null);
    const [purchaseDate, setPurchaseDate] = useState<string | null>(null);
    const [receivedDate, setReceivedDate] = useState(''); // Data de recebimento para receitas (somente dia - DD)
    const [showAddCardSheet, setShowAddCardSheet] = useState(false);
    const [installments, setInstallments] = useState('1'); // Número de parcelas
    const [isInstallment, setIsInstallment] = useState(false); // Se é parcelado
    const [isSaving, setIsSaving] = useState(false); // Estado de loading ao salvar
    const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('bookmark');
    const [newCategoryGroup, setNewCategoryGroup] = useState('');

    const groups = type === 'expense' ? EXPENSE_CATEGORY_GROUPS : INCOME_CATEGORY_GROUPS;

    // Aplicar parâmetros pré-selecionados
    useEffect(() => {
        if (route.params?.preSelectedCardId) {
            setSelectedCardId(route.params.preSelectedCardId);
        }
        if (route.params?.preSelectedDate) {
            setPurchaseDate(route.params.preSelectedDate);
        }
        // Não definir purchaseDate aqui - será definida quando o usuário digitar dueDay
        // ou será usada a data atual no momento de salvar
    }, [route.params?.preSelectedCardId, route.params?.preSelectedDate]);

    useEffect(() => {
        if (route.params?.nfData) {
            const { amount: nfAmount, date, store, productName } = route.params.nfData;

            let desc = 'Compra NFC-e';
            if (productName) desc = productName;
            else if (store) desc = store;

            setDescription(desc);

            if (nfAmount) {
                setAmount((nfAmount * 100).toFixed(0));
            }

            if (date) {
                setPurchaseDate(date);
            }

            setType('expense');

            crossAlert('Sucesso', `Dados carregados da nota! Valor: R$ ${nfAmount || '?'}`);
        }
    }, [route.params?.nfData]);

    useEffect(() => {
        if (route.params?.initialType) {
            setType(route.params.initialType);
        }
    }, [route.params?.initialType]);

    const lockType = route.params?.lockType === true;

    useEffect(() => {
        setCategory('outros');
        if (type !== 'expense') {
            setSelectedCardId(null);
            setSelectedCardName(null);
            setSelectedCardType(null);
            setIsInstallment(false);
            setInstallments('1');
        }
        loadCustomCategories();
    }, [type]);

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
        const allCategories = [...(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES), ...customCategories];
        const id = 'custom_' + name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        if (allCategories.some(c => c.id === id)) {
            crossAlert('Erro', 'J\u00e1 existe uma categoria com esse nome');
            return;
        }
        const newCat: CustomCategory = { id, label: name, icon: newCategoryIcon, group: newCategoryGroup || 'Personalizadas' };
        await addCustomCategory(type, newCat);
        setCustomCategories(prev => [...prev, newCat]);
        setCategory(id);
        setShowNewCategory(false);
        setNewCategoryName('');
        setNewCategoryIcon('bookmark');
        setNewCategoryGroup('');
    };

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
            crossAlert('Erro', 'Não foi possível carregar os cartões');
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
        const amount = parseFloat(cleanValue) / 100;
        return amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    const handleAmountChange = (text: string) => {
        const cleanText = text.replace(/\D/g, '');
        setAmount(cleanText);
    };

    const handleSave = async () => {
        // Evitar múltiplos cliques
        if (isSaving) return;
        
        // Se não tiver descrição, usar o nome da categoria
        const finalDescription = description.trim() || (
            type === 'expense' 
                ? EXPENSE_CATEGORIES.find(c => c.id === category)?.label || 'Outros'
                : INCOME_CATEGORIES.find(c => c.id === category)?.label || 'Outros'
        );

        const numericAmount = parseFloat(amount) / 100;

        if (!amount || numericAmount <= 0) {
            crossAlert('Erro', 'Por favor, insira um valor válido');
            return;
        }

        // Validação de dia de recebimento para receitas
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

        // Validação de parcelas
        if (isInstallment && selectedCardId) {
            const numInstallments = parseInt(installments);
            if (isNaN(numInstallments) || numInstallments < 2 || numInstallments > 36) {
                crossAlert('Erro', 'Número de parcelas deve ser entre 2 e 36');
                return;
            }
        }

        setIsSaving(true);
        try {
            // Determinar data base da transação
            // Prioridade: purchaseDate (pré-selecionada) > data de hoje
            let baseDate: Date;
            
            if (purchaseDate) {
                baseDate = new Date(purchaseDate);
            } else {
                // Padrão: data de hoje
                baseDate = new Date();
            }

            // Se veio mês/ano via params e não tem purchaseDate, usar mês/ano dos params com dia de hoje
            if (!purchaseDate && route.params?.month !== undefined && route.params?.year !== undefined) {
                const today = new Date();
                baseDate = new Date(route.params.year, route.params.month, today.getDate());
            }
            
            let baseYear = baseDate.getFullYear();
            let baseMonth = baseDate.getMonth();
            
            let currentDate: Date;
            
            // Se tiver dia de vencimento digitado para despesa, usar esse dia mantendo mês/ano base
            if (type === 'expense' && dueDay) {
                const day = parseInt(dueDay);
                const lastDayOfMonth = new Date(baseYear, baseMonth + 1, 0).getDate();
                const safeDay = Math.min(day, lastDayOfMonth);
                currentDate = new Date(baseYear, baseMonth, safeDay);
            } else if (type === 'income' && receivedDate) {
                // Para receita com dia informado, usar esse dia mantendo mês/ano base
                const day = parseInt(receivedDate);
                const lastDayOfMonth = new Date(baseYear, baseMonth + 1, 0).getDate();
                const safeDay = Math.min(day, lastDayOfMonth);
                currentDate = new Date(baseYear, baseMonth, safeDay);
            } else {
                // Usar a data base (hoje ou pré-selecionada)
                currentDate = baseDate;
            }
            
            let dueDateISO: string | undefined;
            let receivedDateISO: string | undefined;

            if (type === 'expense' && dueDay) {
                const day = parseInt(dueDay);
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
                const safeDay = Math.min(day, lastDayOfMonth);
                const dueDate = new Date(year, month, safeDay);
                dueDateISO = dueDate.toISOString();
            }

            // Parse da data de recebimento para receitas
            if (type === 'income' && receivedDate) {
                const day = parseInt(receivedDate);
                if (!isNaN(day) && day >= 1 && day <= 31) {
                    const lastDayOfMonth = new Date(baseYear, baseMonth + 1, 0).getDate();
                    const safeDay = Math.min(day, lastDayOfMonth);
                    receivedDateISO = new Date(baseYear, baseMonth, safeDay).toISOString();
                }
            }

            // Se for parcelado, criar múltiplas transações (automaticamente recorrente)
            if (isInstallment && selectedCardId && type === 'expense') {
                const numInstallments = parseInt(installments);
                const installmentAmount = numericAmount / numInstallments;
                const recurrenceId = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

                for (let i = 0; i < numInstallments; i++) {
                    // Calcular data de forma segura
                    const targetMonth = currentDate.getMonth() + i;
                    const targetYear = currentDate.getFullYear() + Math.floor(targetMonth / 12);
                    const actualMonth = targetMonth % 12;
                    
                    const installmentDate = new Date(targetYear, actualMonth, 1);
                    const lastDayOfMonth = new Date(targetYear, actualMonth + 1, 0).getDate();
                    const targetDay = Math.min(currentDate.getDate(), lastDayOfMonth);
                    installmentDate.setDate(targetDay);

                    const transaction: Transaction = {
                        id: `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 11)}`,
                        description: finalDescription,
                        amount: installmentAmount,
                        category,
                        isRecurring: true, // Parcelado é automaticamente recorrente
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
                        recurrenceId, // Usar recurrenceId para permitir cancelamento de recorrência
                        originalAmount: numericAmount, // Valor total original
                    };

                    await FirestoreService.addTransaction(transaction);
                }

                crossAlert('Sucesso', `Compra parcelada em ${numInstallments}x adicionada com sucesso!`, [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else if (isRecurring && type === 'expense') {
                // Despesa recorrente não parcelada - criar até o final do ano atual
                const currentMonth = currentDate.getMonth(); // 0-11
                const numMonths = 12 - currentMonth; // Meses restantes até dezembro
                const recurrenceId = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

                for (let i = 0; i < numMonths; i++) {
                    const targetMonth = currentDate.getMonth() + i;
                    const targetYear = currentDate.getFullYear() + Math.floor(targetMonth / 12);
                    const actualMonth = targetMonth % 12;
                    
                    const recurringDate = new Date(targetYear, actualMonth, 1);
                    const lastDayOfMonth = new Date(targetYear, actualMonth + 1, 0).getDate();
                    const targetDay = Math.min(currentDate.getDate(), lastDayOfMonth);
                    recurringDate.setDate(targetDay);

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
                        ...(dueDateISO && { dueDate: dueDateISO }),
                        ...(selectedCardId && {
                            cardId: selectedCardId,
                            cardName: selectedCardName,
                            cardType: selectedCardType,
                        }),
                    };

                    await FirestoreService.addTransaction(transaction);
                }

                crossAlert('Sucesso', `Despesa recorrente criada para os próximos ${numMonths} meses!`, [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else if (isRecurring && type === 'income') {
                // Receita recorrente - criar até o final do ano atual
                const currentMonth = currentDate.getMonth(); // 0-11
                const numMonths = 12 - currentMonth; // Meses restantes até dezembro
                const recurrenceId = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

                // Usar o dia de recebimento informado pelo usuário
                const receivedDay = parseInt(receivedDate);

                for (let i = 0; i < numMonths; i++) {
                    const targetMonth = currentDate.getMonth() + i;
                    const targetYear = currentDate.getFullYear() + Math.floor(targetMonth / 12);
                    const actualMonth = targetMonth % 12;
                    
                    const recurringDate = new Date(targetYear, actualMonth, 1);
                    const lastDayOfMonth = new Date(targetYear, actualMonth + 1, 0).getDate();
                    // Usar o dia de recebimento (não a data atual)
                    const targetDay = Math.min(receivedDay, lastDayOfMonth);
                    recurringDate.setDate(targetDay);

                    // Criar receivedDateISO para cada mês
                    const monthReceivedDateISO = recurringDate.toISOString();

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
                        receivedDate: monthReceivedDateISO,
                    };

                    await FirestoreService.addTransaction(transaction);
                }

                crossAlert('Sucesso', `Receita recorrente criada para os próximos ${numMonths} meses!`, [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                // Transação única normal
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
                crossAlert('Sucesso', 'Transação adicionada com sucesso!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        } catch (error) {
            crossAlert('Erro', 'Não foi possível adicionar a transação');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.content}>
                {!lockType && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tipo de Transação</Text>
                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
                                onPress={() => setType('expense')}
                            >
                                <Ionicons
                                    name="arrow-up-circle"
                                    size={24}
                                    color={type === 'expense' ? theme.colors.white : theme.colors.danger}
                                />
                                <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
                                    Despesa
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
                                onPress={() => setType('income')}
                            >
                                <Ionicons
                                    name="arrow-down-circle"
                                    size={24}
                                    color={type === 'income' ? theme.colors.white : theme.colors.success}
                                />
                                <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>
                                    Receita
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.label}>Descrição (opcional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Deixe vazio para usar o nome da categoria"
                        placeholderTextColor={theme.colors.textMuted}
                        value={description}
                        onChangeText={setDescription}
                    />
                    {description.startsWith('http') && (
                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => Linking.openURL(description)}
                        >
                            <Text style={styles.linkButtonText}>Ver Nota no Navegador 🔗</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Valor e Dia na mesma linha */}
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

                    {type === 'income' && (
                        <View style={styles.flex1}>
                            <Text style={styles.label}>Dia</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="DD"
                                placeholderTextColor={theme.colors.textMuted}
                                value={receivedDate}
                                onChangeText={(text) => {
                                    const v = text.replace(/\D/g, '');
                                    if (v.length <= 2) {
                                        setReceivedDate(v);
                                    }
                                }}
                                keyboardType="number-pad"
                                maxLength={2}
                            />
                        </View>
                    )}

                    {type === 'expense' && (
                        <View style={styles.flex1}>
                            <Text style={styles.label}>Venc.</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="DD"
                                placeholderTextColor={theme.colors.textMuted}
                                value={dueDay}
                                onChangeText={(text) => {
                                    const cleaned = text.replace(/\D/g, '');
                                    if (cleaned.length <= 2) {
                                        setDueDay(cleaned);
                                    }
                                }}
                                keyboardType="number-pad"
                                maxLength={2}
                            />
                        </View>
                    )}
                </View>

                {type === 'income' && (
                    <Text style={[styles.helperText, { marginTop: -theme.spacing.md, marginBottom: theme.spacing.lg }]}>
                        Dia do recebimento no mês atual ({['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][
                            route.params?.month !== undefined ? route.params.month : new Date().getMonth()
                        ]})
                    </Text>
                )}

                {type === 'expense' && (
                    <Text style={[styles.helperText, { marginTop: -theme.spacing.md, marginBottom: theme.spacing.lg }]}>
                        Dia do vencimento (2 dígitos: 01, 15, 31)
                    </Text>
                )}

                {type === 'expense' && (
                    <View style={styles.section}>
                        <Text style={styles.label}>Cartão (opcional)</Text>
                        {cards.length === 0 ? (
                            <View style={styles.emptyCardContainer}>
                                <Text style={styles.helperText}>Nenhum cartão cadastrado</Text>
                                <TouchableOpacity
                                    style={styles.addCardButton}
                                    onPress={() => setShowAddCardSheet(true)}
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
                                    onPress={() => setShowAddCardSheet(true)}
                                >
                                    <Ionicons name="add" size={18} color={theme.colors.primary} />
                                    <Text style={styles.addCardButtonText}>Novo cartão</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Seção de Parcelamento */}
                {type === 'expense' && selectedCardId && selectedCardType === 'credit' && (
                    <View style={styles.section}>
                        <View style={styles.toggleContainer}>
                            <Text style={styles.label}>Compra parcelada?</Text>
                            <Switch
                                value={isInstallment}
                                onValueChange={(value) => {
                                    setIsInstallment(value);
                                    if (!value) {
                                        setInstallments('1');
                                    } else {
                                        setInstallments('2');
                                    }
                                }}
                                trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                                thumbColor={isInstallment ? theme.colors.primary : theme.colors.textMuted}
                            />
                        </View>
                        {isInstallment && (
                            <View style={styles.installmentInputContainer}>
                                <Text style={styles.helperText}>Número de parcelas:</Text>
                                <TextInput
                                    style={styles.installmentInput}
                                    placeholder="Ex: 3"
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

                <View style={styles.section}>
                    <Text style={styles.label}>Categoria</Text>
                    <CategoryPicker
                        type={type}
                        selectedCategory={category}
                        onSelectCategory={setCategory}
                        customCategories={customCategories}
                        showAddButton={true}
                        onAddPress={() => setShowNewCategory(!showNewCategory)}
                    />
                    {showNewCategory && (
                        <View style={styles.newCategoryForm}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nome da categoria"
                                placeholderTextColor={theme.colors.textMuted}
                                value={newCategoryName}
                                onChangeText={setNewCategoryName}
                                maxLength={30}
                            />
                            <Text style={[styles.helperText, { marginBottom: 4 }]}>Grupo:</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.sm }}>
                                {groups.map((g) => (
                                    <TouchableOpacity
                                        key={g.title}
                                        style={[
                                            styles.groupChip,
                                            newCategoryGroup === g.title && styles.groupChipSelected,
                                        ]}
                                        onPress={() => setNewCategoryGroup(g.title)}
                                    >
                                        <Text style={[styles.categoryChipText, newCategoryGroup === g.title && { color: theme.colors.primary, fontWeight: 'bold' }]}>
                                          {g.title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={[
                                        styles.groupChip,
                                        newCategoryGroup === '' && styles.groupChipSelected,
                                    ]}
                                    onPress={() => setNewCategoryGroup('')}
                                >
                                    <Text style={[styles.categoryChipText, newCategoryGroup === '' && { color: theme.colors.primary, fontWeight: 'bold' }]}>
                                      Outros
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
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
                </View>

                {/* Switch de Recorrência - para todas as despesas e receitas */}
                <View style={styles.section}>
                    <View style={styles.switchContainer}>
                        <View style={styles.switchLabel}>
                            <Ionicons name="repeat" size={24} color={theme.colors.primary} />
                            <View style={styles.switchLabelText}>
                                <Text style={styles.label}>
                                    {type === 'expense' ? 'Despesa Recorrente' : 'Receita Recorrente'}
                                </Text>
                                <Text style={styles.switchDescription}>
                                    Será duplicada automaticamente nos próximos meses
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={isRecurring}
                                onValueChange={setIsRecurring}
                                trackColor={{ false: theme.colors.surface, true: theme.colors.primaryLight }}
                                thumbColor={isRecurring ? theme.colors.primary : theme.colors.textMuted}
                            />
                        </View>
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
                            <Text style={styles.saveButtonText}>Salvar</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <AddCardBottomSheet
                visible={showAddCardSheet}
                onClose={() => setShowAddCardSheet(false)}
                onCardAdded={loadCards}
            />
        </SafeAreaView>
    );
}
