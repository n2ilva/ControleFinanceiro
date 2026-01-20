import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
    TextInput,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SalaryFirestoreService } from '../services/salaryFirestoreService';
import { Salary } from '../types';
import { theme } from '../theme';

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
                // Atualizar salário existente
                await SalaryFirestoreService.updateSalary(editingSalary.id, {
                    description: description.trim(),
                    amount: parseFloat(amount),
                });
            } else {
                // Adicionar novo salário
                const newSalary: Salary = {
                    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    description: description.trim(),
                    amount: parseFloat(amount),
                    isActive: true,
                    createdAt: new Date().toISOString(),
                };
                await SalaryFirestoreService.addSalary(newSalary);
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
                            {item.description}
                        </Text>
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

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => deleteSalary(item.id)}
                        >
                            <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header com total */}
            <View style={styles.header}>
                <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Total de Salários Ativos</Text>
                    <Text style={styles.totalAmount}>R$ {totalSalaries.toFixed(2)}</Text>
                    <Text style={styles.totalSubtext}>Receita mensal recorrente</Text>
                </View>
            </View>

            {/* Lista de salários */}
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

            {/* Botão flutuante para adicionar */}
            <TouchableOpacity style={styles.fab} onPress={openAddModal}>
                <Ionicons name="add" size={32} color={theme.colors.white} />
            </TouchableOpacity>

            {/* Modal de adicionar/editar */}
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
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.md,
        paddingTop: theme.spacing.xl,
    },
    totalCard: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        alignItems: 'center',
        ...theme.shadows.md,
    },
    totalLabel: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    totalAmount: {
        fontSize: theme.fontSize.xxxl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.success,
        marginBottom: theme.spacing.xs,
    },
    totalSubtext: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
    },
    listContent: {
        padding: theme.spacing.md,
        paddingBottom: 100,
    },
    salaryCard: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.md,
        overflow: 'hidden',
        ...theme.shadows.sm,
    },
    salaryCardInactive: {
        opacity: 0.6,
    },
    salaryContent: {
        padding: theme.spacing.md,
    },
    salaryHeader: {
        marginBottom: theme.spacing.sm,
    },
    salaryInfo: {
        gap: theme.spacing.xs,
    },
    salaryDescription: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    salaryAmount: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.success,
    },
    inactiveText: {
        color: theme.colors.textMuted,
    },
    salaryActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.sm,
        paddingTop: theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    activeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
    },
    activeButtonActive: {
        backgroundColor: theme.colors.surface,
    },
    activeButtonText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    activeButtonTextActive: {
        color: theme.colors.success,
        fontWeight: theme.fontWeight.medium,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    editButton: {
        padding: theme.spacing.sm,
    },
    deleteButton: {
        padding: theme.spacing.sm,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xxl,
    },
    emptyStateText: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.md,
    },
    emptyStateSubtext: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.xs,
    },
    fab: {
        position: 'absolute',
        right: theme.spacing.md,
        bottom: theme.spacing.md,
        width: 64,
        height: 64,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.lg,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.backgroundCard,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        paddingBottom: theme.spacing.xl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    modalBody: {
        padding: theme.spacing.lg,
    },
    inputGroup: {
        marginBottom: theme.spacing.md,
    },
    label: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginTop: theme.spacing.lg,
    },
    modalButton: {
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
