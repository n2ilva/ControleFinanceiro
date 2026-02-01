import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Salary } from '../../types';
import { SalaryFirestoreService } from '../../services/salaryFirestoreService';
import { theme } from '../../theme';
import { auth } from '../../config/firebase';
import styles from './styles';

const SALARY_TYPES: Array<{ id: Salary['salaryType']; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { id: 'salary', label: 'Salário', icon: 'cash' },
    { id: 'thirteenth', label: '13º', icon: 'gift' },
    { id: 'vacation', label: 'Férias', icon: 'airplane' },
    { id: 'bonus', label: 'Bonificação', icon: 'sparkles' },
];

export default function AddSalaryScreen({ navigation }: any) {
    const [company, setCompany] = useState('');
    const [amount, setAmount] = useState('');
    const [salaryType, setSalaryType] = useState<Salary['salaryType']>('salary');
    const [paymentDay, setPaymentDay] = useState(''); // Dia do mês (01-31)
    const [isSaving, setIsSaving] = useState(false); // Estado de loading ao salvar

    const formatCurrency = (value: string) => {
        const cleanValue = value.replace(/\D/g, '');
        if (!cleanValue) return '';
        const amountFloat = parseFloat(cleanValue) / 100;
        return amountFloat.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    const handleAmountChange = (text: string) => {
        const cleanText = text.replace(/\D/g, '');
        setAmount(cleanText);
    };

    const handleDayChange = (text: string) => {
        // Aceitar apenas números e limitar a 2 dígitos
        let v = text.replace(/\D/g, '');
        if (v.length > 2) v = v.substring(0, 2);
        // Validar se é um dia válido (1-31)
        const day = parseInt(v);
        if (v.length === 2 && (day < 1 || day > 31)) {
            return; // Não aceitar dias inválidos
        }
        setPaymentDay(v);
    };

    const handleSave = async () => {
        // Evitar múltiplos cliques
        if (isSaving) return;
        
        if (!company.trim()) {
            Alert.alert('Erro', 'Por favor, informe a empresa');
            return;
        }

        const numericAmount = parseFloat(amount) / 100;
        if (!amount || isNaN(numericAmount) || numericAmount < 0) {
            Alert.alert('Erro', 'Por favor, informe um valor válido');
            return;
        }

        // Validar dia de pagamento se informado
        if (paymentDay.trim()) {
            const day = parseInt(paymentDay);
            if (isNaN(day) || day < 1 || day > 31) {
                Alert.alert('Erro', 'Dia de pagamento deve ser entre 01 e 31');
                return;
            }
        }

        setIsSaving(true);
        try {
            // Formatar dia como DD/MM/AAAA usando formato padrão
            // O sistema vai usar apenas o dia para calcular quando mostrar o salário
            const formattedPaymentDate = paymentDay.trim() 
                ? `${paymentDay.padStart(2, '0')}/01/2000`  // Formato padrão para extrair o dia
                : undefined;

            const newSalary: Salary = {
                id: `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                description: company.trim(),
                company: company.trim(),
                amount: numericAmount,
                originalAmount: numericAmount,
                salaryType,
                isActive: true,
                createdAt: new Date().toISOString(),
                ...(formattedPaymentDate && { paymentDate: formattedPaymentDate }),
                userId: auth.currentUser?.uid || '',
            };

            await SalaryFirestoreService.addSalary(newSalary);
            Alert.alert('Sucesso', 'Informação de salário salva!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar o salário');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Nova Informação de Salário</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Tipo</Text>
                <View style={styles.typeSelector}>
                    {SALARY_TYPES.map((t) => {
                        const isSelected = salaryType === t.id;
                        return (
                            <TouchableOpacity
                                key={t.id}
                                style={[styles.typeButton, isSelected && styles.typeButtonActive]}
                                onPress={() => setSalaryType(t.id)}
                            >
                                <Ionicons
                                    name={t.icon}
                                    size={20}
                                    color={isSelected ? theme.colors.white : theme.colors.primary}
                                />
                                <Text style={[styles.typeButtonText, isSelected && styles.typeButtonTextActive]}>
                                    {t.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Empresa</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Empresa XYZ"
                    placeholderTextColor={theme.colors.textMuted}
                    value={company}
                    onChangeText={setCompany}
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

            <View style={styles.section}>
                <Text style={styles.label}>Dia de pagamento</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: 28"
                    placeholderTextColor={theme.colors.textMuted}
                    value={paymentDay}
                    onChangeText={handleDayChange}
                    keyboardType="numeric"
                    maxLength={2}
                />
                <Text style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 4 }}>
                    Informe o dia do mês em que o salário é recebido (01-31)
                </Text>
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
        </SafeAreaView>
    );
}
