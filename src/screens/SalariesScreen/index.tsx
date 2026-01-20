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
    const [totalSalaries, setTotalSalaries] = useState(0);

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
        setModalVisible(true);
    };

    const openEditModal = (salary: Salary) => {
        setEditingSalary(salary);
        setDescription(salary.description);
        setAmount(salary.amount.toString());
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!description.trim()) {
            Alert.alert('Erro', 'Por favor, insira uma descrição');
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Erro', 'Por favor, insira um valor válido');
            return;
        }

        try {
            if (editingSalary) {
                const numericAmount = parseFloat(amount);
                const originalAmount = editingSalary.originalAmount ?? editingSalary.amount;
                await SalaryFirestoreService.updateSalary(editingSalary.id, {
                    description: description.trim(),
                    company: description.trim(),
                    amount: numericAmount,
                    ...(numericAmount !== originalAmount && { originalAmount }),
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
                };
                await SalaryFirestoreService.addSalary(newSalary as Salary);
            }

            setModalVisible(false);
            loadSalaries();
            Alert.alert('Sucesso', editingSalary ? 'Salário atualizado!' : 'Salário adicionado!');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar o salário');
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
                                Pagamento: {item.paymentDate}
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

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleSave}
                                >
                                    <Text style={styles.saveButtonText}>Salvar</Text>
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
