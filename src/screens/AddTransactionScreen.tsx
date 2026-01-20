import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Switch,
    Alert,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FirestoreService } from '../services/firestoreService';
import { Transaction } from '../types';
import { theme } from '../theme';
import { auth } from '../config/firebase';

const EXPENSE_CATEGORIES = [
    { id: 'agua', label: 'Água', icon: 'water' },
    { id: 'energia', label: 'Energia', icon: 'flash' },
    { id: 'internet', label: 'Internet', icon: 'wifi' },
    { id: 'alimentacao', label: 'Alimentação', icon: 'restaurant' },
    { id: 'transporte', label: 'Transporte', icon: 'car' },
    { id: 'saude', label: 'Saúde', icon: 'medical' },
    { id: 'educacao', label: 'Educação', icon: 'school' },
    { id: 'lazer', label: 'Lazer', icon: 'game-controller' },
    { id: 'outros', label: 'Outros', icon: 'ellipsis-horizontal' },
];

const INCOME_CATEGORIES = [
    { id: 'salario', label: 'Salário', icon: 'cash' },
    { id: 'deposito', label: 'Depósito', icon: 'card' },
    { id: 'extra', label: 'Extra', icon: 'gift' },
    { id: 'outros', label: 'Outros', icon: 'ellipsis-horizontal' },
];

export default function AddTransactionScreen({ navigation, route }: any) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('outros');
    const [isRecurring, setIsRecurring] = useState(false);
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [dueDay, setDueDay] = useState(''); // Dia do vencimento (1-31)

    // Preencher dados ao receber retorno do Scanner
    useEffect(() => {
        if (route.params?.nfData) {
            const { url, amount: nfAmount, date, store } = route.params.nfData;

            // Preenchimento inteligente
            let desc = 'Compra NFC-e';
            if (store) desc = store;
            else if (url) desc = `NF: ${url.split('?')[0].substring(0, 20)}...`;

            setDescription(desc);

            if (nfAmount) {
                setAmount((nfAmount * 100).toFixed(0));
            }

            // Força tipo despesa
            setType('expense');

            Alert.alert('Sucesso', `Dados carregados da nota! Valor: R$ ${nfAmount || '?'}`);
        }
    }, [route.params?.nfData]);

    // Resetar categoria para 'outros' quando mudar o tipo
    useEffect(() => {
        setCategory('outros');
    }, [type]);

    // Função para formatar moeda
    const formatCurrency = (value: string) => {
        // Remove tudo que não for número
        const cleanValue = value.replace(/\D/g, '');

        // Se vazio, retorna vazio
        if (!cleanValue) return '';

        // Converte para centavos e formata
        const amount = parseFloat(cleanValue) / 100;
        return amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    const handleAmountChange = (text: string) => {
        // Manter apenas números para o estado
        const cleanText = text.replace(/\D/g, '');
        setAmount(cleanText);
    };

    const handleSave = async () => {
        if (!description.trim()) {
            Alert.alert('Erro', 'Por favor, insira uma descrição');
            return;
        }

        // Converter valor de centavos para reais (float)
        const numericAmount = parseFloat(amount) / 100;

        if (!amount || numericAmount <= 0) {
            Alert.alert('Erro', 'Por favor, insira um valor válido');
            return;
        }

        // Validar dia de vencimento se for despesa e foi preenchido
        if (type === 'expense' && dueDay) {
            const day = parseInt(dueDay);
            if (isNaN(day) || day < 1 || day > 31) {
                Alert.alert('Erro', 'Dia de vencimento deve ser entre 1 e 31');
                return;
            }
        }

        try {
            const currentDate = new Date();
            let dueDateISO: string | undefined;

            // Calcular data de vencimento se for despesa e dia foi informado
            if (type === 'expense' && dueDay) {
                const day = parseInt(dueDay);
                const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

                // Se o dia já passou neste mês, usar o próximo mês
                if (dueDate < currentDate) {
                    dueDate.setMonth(dueDate.getMonth() + 1);
                }

                dueDateISO = dueDate.toISOString();
            }

            const transaction: Transaction = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                description: description.trim(),
                amount: numericAmount,
                category,
                isRecurring,
                isPaid: false,
                type,
                date: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                userId: auth.currentUser?.uid || '',
                ...(dueDateISO && { dueDate: dueDateISO }),
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
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Tipo de transação */}
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

                {/* Botão QR Code */}
                <TouchableOpacity
                    style={styles.qrButton}
                    onPress={() => navigation.navigate('QRScanner')}
                >
                    <Ionicons name="qr-code-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.qrButtonText}>Ler Nota Fiscal (QR Code)</Text>
                </TouchableOpacity>
            </View>

            {/* Descrição */}
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

            {/* Valor */}
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

            {/* Dia de Vencimento (apenas para despesas) */}
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

            {/* Categoria */}
            <View style={styles.section}>
                <Text style={styles.label}>Categoria</Text>
                <View style={styles.categoryGrid}>
                    {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => {
                        const isSelected = category === cat.id;
                        const categoryColor = theme.colors.categories[cat.id as keyof typeof theme.colors.categories];

                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryButton,
                                    isSelected && { backgroundColor: categoryColor },
                                ]}
                                onPress={() => setCategory(cat.id)}
                            >
                                <Ionicons
                                    name={cat.icon as any}
                                    size={24}
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
                </View>
            </View>

            {/* Recorrente */}
            <View style={styles.section}>
                <View style={styles.switchContainer}>
                    <View style={styles.switchLabel}>
                        <Ionicons name="repeat" size={24} color={theme.colors.primary} />
                        <View style={styles.switchLabelText}>
                            <Text style={styles.label}>Transação Recorrente</Text>
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

            {/* Botões */}
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.md,
    },
    section: {
        marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    label: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    input: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    helperText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.xs,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.backgroundCard,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    typeButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    typeButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    typeButtonTextActive: {
        color: theme.colors.white,
    },
    qrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: theme.spacing.md,
        padding: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
    },
    qrButtonText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: theme.spacing.xs,
        alignSelf: 'flex-start',
    },
    linkButtonText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.primary,
        textDecorationLine: 'underline',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    categoryButton: {
        width: '31%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.xs,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.backgroundCard,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    categoryButtonText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.text,
        textAlign: 'center',
    },
    categoryButtonTextActive: {
        color: theme.colors.white,
        fontWeight: theme.fontWeight.semibold,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
    },
    switchLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        flex: 1,
    },
    switchLabelText: {
        flex: 1,
    },
    switchDescription: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
    },
    button: {
        flex: 1,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: theme.colors.surface,
    },
    cancelButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        ...theme.shadows.md,
    },
    saveButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.white,
    },
});
