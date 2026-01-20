import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { FirestoreService } from '../services/firestoreService';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditTransactionScreen({ route, navigation }: any) {
    const { transaction } = route.params;

    const [description, setDescription] = useState(transaction.description);
    const [amount, setAmount] = useState((transaction.amount * 100).toFixed(0)); // Convertendo para centavos string
    const [dueDate, setDueDate] = useState<string>(
        transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString('pt-BR') : ''
    );

    // Função para formatar moeda
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
        if (v.length > 8) v = v.substr(0, 8);
        if (v.length > 4) {
            v = v.replace(/^(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
        } else if (v.length > 2) {
            v = v.replace(/^(\d{2})(\d{0,2})/, '$1/$2');
        }
        setDueDate(v);
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

        try {
            let dueDateISO = undefined;
            if (transaction.type === 'expense' && dueDate) {
                const parts = dueDate.split('/');
                if (parts.length === 3) {
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    const year = parseInt(parts[2]);
                    if (year > 2000 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
                        const dateObj = new Date(year, month, day);
                        dateObj.setHours(12, 0, 0, 0); // Meio-dia para segurança
                        dueDateISO = dateObj.toISOString();
                    } else {
                        Alert.alert('Erro', 'Data de vencimento inválida');
                        return;
                    }
                }
            }

            await FirestoreService.updateTransaction(transaction.id, {
                description: description.trim(),
                amount: numericAmount,
                dueDate: dueDateISO,
            });

            Alert.alert('Sucesso', 'Transação atualizada com sucesso!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar a transação');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Editar Transação</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>

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

                {/* Data de Vencimento (Apenas Despesas) */}
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
                        <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
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
    sectionHeader: {
        padding: theme.spacing.md,
        paddingBottom: theme.spacing.xs,
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
    buttonContainer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginTop: theme.spacing.lg,
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
