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
    { id: 'cartao', label: 'Cartão', icon: 'card-outline', group: 'Financeiro' },
    { id: 'impostos', label: 'Impostos', icon: 'document-text', group: 'Financeiro' },
    { id: 'manutencao', label: 'Manutenção', icon: 'construct', group: 'Financeiro' },
    { id: 'outros', label: 'Outros', icon: 'ellipsis-horizontal', group: 'Outros' },
];

const INCOME_CATEGORIES = [
    { id: 'salario', label: 'Salário', icon: 'cash', group: 'Principais' },
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
    const [receivedDate, setReceivedDate] = useState(''); // Data de recebimento para receitas (DD/MM/AAAA)

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
            setIsRecurring(false);
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
        if (!description.trim()) {
            Alert.alert('Erro', 'Por favor, insira uma descrição');
            return;
        }

        const numericAmount = parseFloat(amount) / 100;

        if (!amount || numericAmount <= 0) {
            Alert.alert('Erro', 'Por favor, insira um valor válido');
            return;
        }

        if (type === 'expense' && dueDay) {
            const day = parseInt(dueDay);
            if (isNaN(day) || day < 1 || day > 31) {
                Alert.alert('Erro', 'Dia de vencimento deve ser entre 1 e 31');
                return;
            }
        }

        try {
            const currentDate = purchaseDate ? new Date(purchaseDate) : new Date();
            let dueDateISO: string | undefined;
            let receivedDateISO: string | undefined;

            if (type === 'expense' && dueDay) {
                const day = parseInt(dueDay);
                const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                if (dueDate < currentDate) {
                    dueDate.setMonth(dueDate.getMonth() + 1);
                }
                dueDateISO = dueDate.toISOString();
            }

            // Parse da data de recebimento para receitas
            if (type === 'income' && receivedDate) {
                const parts = receivedDate.split('/');
                if (parts.length === 3) {
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    const year = parseInt(parts[2]);
                    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                        receivedDateISO = new Date(year, month, day).toISOString();
                    }
                }
            }

            const transaction: Transaction = {
                id: `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                description: description.trim(),
                amount: numericAmount,
                category,
                isRecurring,
                isPaid: type === 'expense' ? !isRecurring : false, // Despesas não recorrentes são pagas por padrão
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
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível adicionar a transação');
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
                    <Text style={styles.label}>Descrição</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Conta de luz"
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

                {type === 'income' && (
                    <View style={styles.section}>
                        <Text style={styles.label}>Data do Recebimento (opcional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor={theme.colors.textMuted}
                            value={receivedDate}
                            onChangeText={(text) => {
                                // Formatar como DD/MM/AAAA
                                let v = text.replace(/\D/g, '');
                                if (v.length > 8) v = v.substring(0, 8);
                                if (v.length >= 5) {
                                    v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
                                } else if (v.length >= 3) {
                                    v = v.slice(0, 2) + '/' + v.slice(2);
                                }
                                setReceivedDate(v);
                            }}
                            keyboardType="number-pad"
                            maxLength={10}
                        />
                        <Text style={styles.helperText}>
                            Se não informada, será usada a data de hoje
                        </Text>
                    </View>
                )}

                {type === 'expense' && (
                    <View style={styles.section}>
                        <Text style={styles.label}>Dia do Vencimento (opcional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: 10 (para dia 10 de cada mês)"
                            placeholderTextColor={theme.colors.textMuted}
                            value={dueDay}
                            onChangeText={setDueDay}
                            keyboardType="number-pad"
                            maxLength={2}
                        />
                        <Text style={styles.helperText}>
                            Digite o dia do mês (1-31) em que a despesa vence
                        </Text>
                    </View>
                )}

                {type === 'expense' && (
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

                {type === 'expense' && (
                    <View style={styles.section}>
                        <View style={styles.switchContainer}>
                            <View style={styles.switchLabel}>
                                <Ionicons name="repeat" size={24} color={theme.colors.primary} />
                                <View style={styles.switchLabelText}>
                                    <Text style={styles.label}>Despesa Recorrente</Text>
                                    <Text style={styles.switchDescription}>
                                        Será duplicada automaticamente no próximo mês
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
                        <Text style={styles.saveButtonText}>Salvar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {type === 'expense' && (
                <TouchableOpacity
                    style={styles.qrFab}
                    onPress={() => navigation.navigate('QRScanner')}
                >
                    <Ionicons name="qr-code-outline" size={28} color={theme.colors.white} />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}
