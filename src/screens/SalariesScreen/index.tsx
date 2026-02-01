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
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SalaryFirestoreService } from '../../services/salaryFirestoreService';
import { Salary } from '../../types';
import { theme } from '../../theme';
import styles from './styles';

export default function SalariesScreen() {
    const [salaries, setSalaries] = useState<Salary[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSalary, setEditingSalary] = useState<Salary | null>(null);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentDay, setPaymentDay] = useState(''); // Dia do mês (01-31)
    const [totalSalaries, setTotalSalaries] = useState(0);
    const [isSaving, setIsSaving] = useState(false); // Estado de loading ao salvar

    const loadSalaries = async () => {
        try {
            const data = await SalaryFirestoreService.getSalaries();
            setSalaries(data);
            const total = await SalaryFirestoreService.getTotalActiveSalaries();
            setTotalSalaries(total);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os salários');
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadSalaries();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadSalaries();
        setRefreshing(false);
    };

    const openAddModal = () => {
        setEditingSalary(null);
        setDescription('');
        setAmount('');
        setPaymentDay('');
        setModalVisible(true);
    };

    const openEditModal = (salary: Salary) => {
        setEditingSalary(salary);
        setDescription(salary.description);
        setAmount(salary.amount.toString());
        // Extrair apenas o dia do paymentDate (formato DD/MM/AAAA)
        setPaymentDay(salary.paymentDate ? salary.paymentDate.substring(0, 2) : '');
        setModalVisible(true);
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
        
        if (!description.trim()) {
            Alert.alert('Erro', 'Por favor, insira uma descrição');
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Erro', 'Por favor, insira um valor válido');
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

        // Formatar dia como DD/MM/AAAA usando formato padrão
        const formattedPaymentDate = paymentDay.trim() 
            ? `${paymentDay.padStart(2, '0')}/01/2000`
            : undefined;

        setIsSaving(true);
        try {
            if (editingSalary) {
                const numericAmount = parseFloat(amount);
                const originalAmount = editingSalary.originalAmount ?? editingSalary.amount;
                await SalaryFirestoreService.updateSalary(editingSalary.id, {
                    description: description.trim(),
                    company: description.trim(),
                    amount: numericAmount,
                    ...(numericAmount !== originalAmount && { originalAmount }),
                    paymentDate: formattedPaymentDate || null,
                });
            } else {
                const newSalary: Omit<Salary, 'userId' | 'groupId'> = {
                    id: `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                    description: description.trim(),
                    company: description.trim(),
                    amount: parseFloat(amount),
                    originalAmount: parseFloat(amount),
                    salaryType: 'salary',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    ...(formattedPaymentDate && { paymentDate: formattedPaymentDate }),
                };
                await SalaryFirestoreService.addSalary(newSalary as Salary);
            }

            loadSalaries();
            Alert.alert('Sucesso', editingSalary ? 'Salário atualizado!' : 'Salário adicionado!', [
                { text: 'OK', onPress: () => setModalVisible(false) }
            ]);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar o salário');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleActive = async (salary: Salary) => {
        try {
            await SalaryFirestoreService.updateSalary(salary.id, {
                isActive: !salary.isActive,
            });
            loadSalaries();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar o salário');
        }
    };

    const deleteSalary = async (id: string) => {
        Alert.alert(
            'Confirmar Exclusão',
            'Deseja realmente excluir este salário?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await SalaryFirestoreService.deleteSalary(id);
                            setModalVisible(false);
                            loadSalaries();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir o salário');
                        }
                    },
                },
            ]
        );
    };

    const renderSalary = ({ item }: { item: Salary }) => (
        <View style={[styles.salaryCard, !item.isActive && styles.salaryCardInactive]}>
            <View style={styles.salaryContent}>
                <View style={styles.salaryHeader}>
                    <View style={styles.salaryInfo}>
                        <Text style={[styles.salaryDescription, !item.isActive && styles.inactiveText]}>
                            {item.company || item.description}
                        </Text>
                        <Text style={[styles.salaryType, !item.isActive && styles.inactiveText]}>
                            {item.salaryType === 'thirteenth'
                                ? '13º'
                                : item.salaryType === 'vacation'
                                    ? 'Férias'
                                    : item.salaryType === 'bonus'
                                        ? 'Bonificação'
                                        : 'Salário'}
                        </Text>
                        {item.paymentDate && (
                            <Text style={[styles.salaryPaymentDate, !item.isActive && styles.inactiveText]}>
                                Pagamento: dia {item.paymentDate.substring(0, 2)}
                            </Text>
                        )}
                        <Text style={[styles.salaryAmount, !item.isActive && styles.inactiveText]}>
                            R$ {item.amount.toFixed(2)}
                        </Text>
                    </View>
                </View>

                <View style={styles.salaryActions}>
                    <TouchableOpacity
                        style={[styles.activeButton, item.isActive && styles.activeButtonActive]}
                        onPress={() => toggleActive(item)}
                    >
                        <Ionicons
                            name={item.isActive ? 'checkmark-circle' : 'close-circle-outline'}
                            size={20}
                            color={item.isActive ? theme.colors.success : theme.colors.textSecondary}
                        />
                        <Text style={[styles.activeButtonText, item.isActive && styles.activeButtonTextActive]}>
                            {item.isActive ? 'Ativo' : 'Inativo'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => openEditModal(item)}
                        >
                            <Ionicons name="pencil" size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Total de Salários Ativos</Text>
                    <Text style={styles.totalAmount}>R$ {totalSalaries.toFixed(2)}</Text>
                    <Text style={styles.totalSubtext}>Receita mensal recorrente</Text>
                </View>
            </View>

            <FlatList
                data={salaries}
                renderItem={renderSalary}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="cash-outline" size={64} color={theme.colors.textMuted} />
                        <Text style={styles.emptyStateText}>Nenhum salário cadastrado</Text>
                        <Text style={styles.emptyStateSubtext}>Adicione seus salários fixos mensais</Text>
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
                                {editingSalary ? 'Editar Salário' : 'Novo Salário'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Descrição</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: Salário Principal, Freelance, etc."
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={description}
                                    onChangeText={setDescription}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Valor (R$)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0,00"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            <View style={styles.inputGroup}>
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
                                    Dia do mês em que o salário é recebido (01-31)
                                </Text>
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                    disabled={isSaving}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton, isSaving && { opacity: 0.7 }]}
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

                            {editingSalary && (
                                <TouchableOpacity
                                    style={styles.deleteButtonModal}
                                    onPress={() => deleteSalary(editingSalary.id)}
                                >
                                    <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                                    <Text style={styles.deleteButtonModalText}>Excluir Salário</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
