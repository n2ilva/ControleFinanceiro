import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Switch,
    Alert,
    Linking,
    ActivityIndicator,
} from 'react-native';
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

const EXPENSE_CATEGORIES = [
    { id: 'moradia', label: 'Moradia', icon: 'home', group: 'Essenciais' },
    { id: 'aluguel', label: 'Aluguel', icon: 'home-outline', group: 'Essenciais' },
    { id: 'condominio', label: 'Condomínio', icon: 'business', group: 'Essenciais' },
    { id: 'agua', label: 'Água', icon: 'water', group: 'Essenciais' },
    { id: 'energia', label: 'Energia', icon: 'flash', group: 'Essenciais' },
    { id: 'gas', label: 'Gás', icon: 'flame', group: 'Essenciais' },
    { id: 'internet', label: 'Internet', icon: 'wifi', group: 'Essenciais' },
    { id: 'telefone', label: 'Telefone', icon: 'call', group: 'Essenciais' },
    { id: 'mercado', label: 'Mercado', icon: 'cart', group: 'Essenciais' },
    { id: 'alimentacao', label: 'Alimentação', icon: 'restaurant', group: 'Essenciais' },
    { id: 'transporte', label: 'Transporte', icon: 'car', group: 'Essenciais' },
    { id: 'combustivel', label: 'Combustível', icon: 'speedometer', group: 'Essenciais' },
    { id: 'saude', label: 'Saúde', icon: 'medical', group: 'Pessoais' },
    { id: 'educacao', label: 'Educação', icon: 'school', group: 'Pessoais' },
    { id: 'vestuario', label: 'Vestuário', icon: 'shirt', group: 'Pessoais' },
    { id: 'pets', label: 'Pets', icon: 'paw', group: 'Pessoais' },
    { id: 'academia', label: 'Academia', icon: 'barbell', group: 'Pessoais' },
    { id: 'lazer', label: 'Lazer', icon: 'game-controller', group: 'Pessoais' },
    { id: 'viagem', label: 'Viagem', icon: 'airplane', group: 'Pessoais' },
    { id: 'presentes', label: 'Presentes', icon: 'gift', group: 'Pessoais' },
    { id: 'assinaturas', label: 'Assinaturas', icon: 'card', group: 'Financeiro' },
    { id: 'impostos', label: 'Impostos', icon: 'document-text', group: 'Financeiro' },
    { id: 'manutencao', label: 'Manutenção', icon: 'construct', group: 'Financeiro' },
    { id: 'outros', label: 'Outros', icon: 'ellipsis-horizontal', group: 'Outros' },
];

const INCOME_CATEGORIES = [
    { id: 'salario', label: 'Salário', icon: 'cash', group: 'Principais' },
    { id: 'decimoTerceiro', label: '13º Salário', icon: 'cash-outline', group: 'Principais' },
    { id: 'ferias', label: 'Férias', icon: 'sunny', group: 'Principais' },
    { id: 'deposito', label: 'Depósito', icon: 'card', group: 'Principais' },
    { id: 'freelance', label: 'Freelance', icon: 'briefcase', group: 'Principais' },
    { id: 'bonus', label: 'Bonificação', icon: 'sparkles', group: 'Principais' },
    { id: 'rendimentos', label: 'Rendimentos', icon: 'trending-up', group: 'Investimentos' },
    { id: 'investimentos', label: 'Investimentos', icon: 'stats-chart', group: 'Investimentos' },
    { id: 'aluguelRecebido', label: 'Aluguel', icon: 'home', group: 'Outros' },
    { id: 'reembolso', label: 'Reembolso', icon: 'refresh', group: 'Outros' },
    { id: 'vendas', label: 'Vendas', icon: 'pricetag', group: 'Outros' },
    { id: 'extra', label: 'Extra', icon: 'gift', group: 'Outros' },
    { id: 'outros', label: 'Outros', icon: 'ellipsis-horizontal', group: 'Outros' },
];

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

            Alert.alert('Sucesso', `Dados carregados da nota! Valor: R$ ${nfAmount || '?'}`);
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
    }, [type]);

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
            Alert.alert('Erro', 'Por favor, insira um valor válido');
            return;
        }

        // Validação de dia de recebimento para receitas
        if (type === 'income' && !receivedDate) {
            Alert.alert('Erro', 'Por favor, insira o dia de recebimento');
            return;
        }

        if (type === 'income' && receivedDate) {
            const day = parseInt(receivedDate);
            if (isNaN(day) || day < 1 || day > 31 || receivedDate.length !== 2) {
                Alert.alert('Erro', 'Dia de recebimento deve ter 2 dígitos (Ex: 01, 15, 30)');
                return;
            }
        }

        if (type === 'expense' && dueDay) {
            if (dueDay.length !== 2) {
                Alert.alert('Erro', 'Dia de vencimento deve ter 2 dígitos (Ex: 01, 05, 15, 31)');
                return;
            }
            const day = parseInt(dueDay);
            if (isNaN(day) || day < 1 || day > 31) {
                Alert.alert('Erro', 'Dia de vencimento deve ser entre 01 e 31');
                return;
            }
        }

        // Validação de parcelas
        if (isInstallment && selectedCardId) {
            const numInstallments = parseInt(installments);
            if (isNaN(numInstallments) || numInstallments < 2 || numInstallments > 36) {
                Alert.alert('Erro', 'Número de parcelas deve ser entre 2 e 36');
                return;
            }
        }

        setIsSaving(true);
        try {
            // Determinar mês e ano base
            let baseYear: number;
            let baseMonth: number;
            
            if (purchaseDate) {
                const pd = new Date(purchaseDate);
                baseYear = pd.getFullYear();
                baseMonth = pd.getMonth();
            } else if (route.params?.month !== undefined && route.params?.year !== undefined) {
                baseYear = route.params.year;
                baseMonth = route.params.month;
            } else {
                const now = new Date();
                baseYear = now.getFullYear();
                baseMonth = now.getMonth();
            }
            
            let currentDate: Date;
            
            // Se tiver dia de vencimento digitado, usar esse dia
            if (type === 'expense' && dueDay) {
                const day = parseInt(dueDay);
                const lastDayOfMonth = new Date(baseYear, baseMonth + 1, 0).getDate();
                const safeDay = Math.min(day, lastDayOfMonth);
                currentDate = new Date(baseYear, baseMonth, safeDay);
            } else {
                // Usar data completa se disponível, ou dia 1 do mês base
                currentDate = purchaseDate ? new Date(purchaseDate) : new Date(baseYear, baseMonth, 1);
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
                        isPaid: false,
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

                Alert.alert('Sucesso', `Compra parcelada em ${numInstallments}x adicionada com sucesso!`, [
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
                        isPaid: false,
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

                Alert.alert('Sucesso', `Despesa recorrente criada para os próximos ${numMonths} meses!`, [
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
                        isPaid: false,
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

                Alert.alert('Sucesso', `Receita recorrente criada para os próximos ${numMonths} meses!`, [
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
                    isPaid: type === 'expense' ? !isRecurring : false,
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
                Alert.alert('Sucesso', 'Transação adicionada com sucesso!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível adicionar a transação');
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
                    {(() => {
                        const list = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
                        const grouped = list.reduce((acc: Record<string, typeof list>, cat) => {
                            const group = cat.group || 'Outros';
                            if (!acc[group]) acc[group] = [] as typeof list;
                            acc[group].push(cat);
                            return acc;
                        }, {} as Record<string, typeof list>);

                        return Object.entries(grouped).map(([group, cats]) => (
                            <View key={group} style={styles.categoryGroup}>
                                <Text style={styles.categoryGroupTitle}>{group}</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.categoryRow}
                                >
                                    {cats.map((cat) => {
                                        const isSelected = category === cat.id;
                                        const categoryColor =
                                            theme.colors.categories[cat.id as keyof typeof theme.colors.categories] ||
                                            theme.colors.primary;

                                        return (
                                            <TouchableOpacity
                                                key={cat.id}
                                                style={[
                                                    styles.categoryButton,
                                                    isSelected && { backgroundColor: categoryColor, borderColor: categoryColor },
                                                ]}
                                                onPress={() => setCategory(cat.id)}
                                            >
                                                <Ionicons
                                                    name={cat.icon as any}
                                                    size={22}
                                                    color={isSelected ? theme.colors.white : categoryColor}
                                                />
                                                <Text
                                                    style={[
                                                        styles.categoryButtonText,
                                                        isSelected && styles.categoryButtonTextActive,
                                                    ]}
                                                >
                                                    {cat.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        ));
                    })()}
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
