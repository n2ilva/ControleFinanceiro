import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { crossAlert } from '../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BudgetService } from '../../services/budgetService';
import { FirestoreService } from '../../services/firestoreService';
import { Budget, Transaction } from '../../types';
import { theme } from '../../theme';
import { formatCurrency } from '../../utils';
import { EXPENSE_CATEGORIES, CATEGORY_ICONS, getCategoryLabel } from '../../constants';
import styles from './styles';

interface BudgetWithSpent extends Budget {
  spent: number;
  percentage: number;
}

export default function BudgetsScreen() {
  const insets = useSafeAreaInsets();
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limitValue, setLimitValue] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const loadBudgets = async () => {
    try {
      const [budgetData, transactions] = await Promise.all([
        BudgetService.getBudgets(currentMonth, currentYear),
        FirestoreService.getTransactions(),
      ]);

      const monthExpenses = transactions.filter((t: Transaction) => {
        if (t.type !== 'expense') return false;
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const budgetsWithSpent: BudgetWithSpent[] = budgetData.map((budget) => {
        const spent = monthExpenses
          .filter((t: Transaction) => t.category === budget.category)
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

        return { ...budget, spent, percentage };
      });

      setBudgets(budgetsWithSpent);
    } catch (error) {
      crossAlert('Erro', 'Não foi possível carregar os orçamentos');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [currentMonth, currentYear])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBudgets();
    setRefreshing(false);
  };

  const formatBRL = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const number = parseInt(digits, 10) / 100;
    return number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const parseBRL = (value: string): number => {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const openAddModal = () => {
    setEditingBudget(null);
    setSelectedCategory('');
    setLimitValue('');
    setModalVisible(true);
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setSelectedCategory(budget.category);
    setLimitValue(formatBRL(String(Math.round(budget.limit * 100))));
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedCategory) {
      crossAlert('Erro', 'Selecione uma categoria');
      return;
    }

    const limit = parseBRL(limitValue);
    if (isNaN(limit) || limit <= 0) {
      crossAlert('Erro', 'Insira um valor válido para o limite');
      return;
    }

    try {
      if (editingBudget) {
        await BudgetService.updateBudget(editingBudget.id, {
          category: selectedCategory,
          limit,
        });
      } else {
        await BudgetService.addBudget({
          category: selectedCategory,
          limit,
          month: currentMonth,
          year: currentYear,
        });
      }

      setModalVisible(false);
      loadBudgets();
    } catch (error) {
      crossAlert('Erro', 'Não foi possível salvar o orçamento');
    }
  };

  const handleDelete = async () => {
    if (!editingBudget) return;

    crossAlert('Confirmar Exclusão', 'Deseja realmente excluir este orçamento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await BudgetService.deleteBudget(editingBudget.id);
            setModalVisible(false);
            loadBudgets();
          } catch (error) {
            crossAlert('Erro', 'Não foi possível excluir');
          }
        },
      },
    ]);
  };

  const handleCopyPrevious = async () => {
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear--;
    }

    try {
      const count = await BudgetService.copyBudgetsToMonth(prevMonth, prevYear, currentMonth, currentYear);
      if (count > 0) {
        crossAlert('Sucesso', `${count} orçamento(s) copiado(s) do mês anterior`);
        loadBudgets();
      } else {
        crossAlert('Info', 'Nenhum orçamento para copiar ou já existem orçamentos neste mês');
      }
    } catch (error) {
      crossAlert('Erro', 'Não foi possível copiar');
    }
  };

  const changeMonth = (delta: number) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    if (newMonth < 0) { newMonth = 11; newYear--; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return theme.colors.danger;
    if (percentage >= 85) return theme.colors.warning;
    if (percentage >= 70) return theme.colors.warningLight;
    return theme.colors.success;
  };

  const getAlertInfo = (percentage: number) => {
    if (percentage >= 100) return { text: 'Limite ultrapassado!', color: theme.colors.danger, icon: 'alert-circle' as const };
    if (percentage >= 85) return { text: 'Quase no limite', color: theme.colors.warning, icon: 'warning' as const };
    if (percentage >= 70) return { text: 'Atenção', color: theme.colors.warningLight, icon: 'information-circle' as const };
    return null;
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const usedCategories = budgets.map((b) => b.category);
  const availableCategories = EXPENSE_CATEGORIES.filter(
    (c) => !usedCategories.includes(c.id) || editingBudget?.category === c.id
  );

  const renderBudgetItem = ({ item }: { item: BudgetWithSpent }) => {
    const alertInfo = getAlertInfo(item.percentage);
    const progressColor = getProgressColor(item.percentage);
    const iconName = CATEGORY_ICONS[item.category] || 'ellipsis-horizontal';
    const catColor = (theme.colors.categories as any)[item.category] || theme.colors.textMuted;

    return (
      <TouchableOpacity style={styles.budgetItem} onPress={() => openEditModal(item)} activeOpacity={0.7}>
        <View style={styles.budgetHeader}>
          <View style={styles.budgetCategory}>
            <View style={[styles.categoryIcon, { backgroundColor: catColor + '20' }]}>
              <Ionicons name={iconName as any} size={20} color={catColor} />
            </View>
            <Text style={styles.categoryName}>{getCategoryLabel(item.category)}</Text>
          </View>
          <View style={styles.budgetValues}>
            <Text style={styles.budgetSpent}>{formatCurrency(item.spent)}</Text>
            <Text style={styles.budgetLimit}>de {formatCurrency(item.limit)}</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(item.percentage, 100)}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.percentageText, { color: progressColor }]}>
          {item.percentage.toFixed(0)}%
        </Text>

        {alertInfo && (
          <View style={[styles.alertBadge, { backgroundColor: alertInfo.color + '15' }]}>
            <Ionicons name={alertInfo.icon} size={14} color={alertInfo.color} />
            <Text style={[styles.alertText, { color: alertInfo.color }]}>{alertInfo.text}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Seletor de mês */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{monthNames[currentMonth]} {currentYear}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Resumo */}
        {budgets.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Orçado</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                {formatCurrency(totalBudget)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Gasto</Text>
              <Text style={[styles.summaryValue, { color: totalSpent > totalBudget ? theme.colors.danger : theme.colors.success }]}>
                {formatCurrency(totalSpent)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Disponível</Text>
              <Text style={[styles.summaryValue, { color: totalBudget - totalSpent >= 0 ? theme.colors.success : theme.colors.danger }]}>
                {formatCurrency(Math.max(0, totalBudget - totalSpent))}
              </Text>
            </View>
          </View>
        )}

        {budgets.length === 0 && (
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyPrevious}>
            <Ionicons name="copy-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.copyButtonText}>Copiar orçamentos do mês anterior</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={budgets}
          keyExtractor={(item) => item.id}
          renderItem={renderBudgetItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="pie-chart-outline" size={64} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>Nenhum orçamento definido</Text>
              <Text style={styles.emptySubtext}>Defina limites por categoria para controlar seus gastos</Text>
            </View>
          }
          contentContainerStyle={budgets.length === 0 ? { flex: 1 } : { paddingBottom: 80 }}
        />
      </View>

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 20 }]} onPress={openAddModal}>
        <Ionicons name="add" size={28} color={theme.colors.white} />
      </TouchableOpacity>

      {/* Modal de adicionar/editar */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <TouchableOpacity style={styles.modalContent} activeOpacity={1} onPress={() => {}}>
            <Text style={styles.modalTitle}>
              {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
            </Text>

            <Text style={styles.label}>Categoria</Text>
            <ScrollView horizontal={false} style={{ maxHeight: 160, marginBottom: theme.spacing.md }}>
              <View style={styles.categoryGrid}>
                {availableCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat.id && styles.categoryChipSelected,
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={14}
                      color={selectedCategory === cat.id ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === cat.id && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.label}>Limite mensal (R$)</Text>
            <TextInput
              style={styles.input}
              value={limitValue}
              onChangeText={(text) => setLimitValue(formatBRL(text))}
              placeholder="0,00"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingBudget ? 'Atualizar' : 'Salvar'}
              </Text>
            </TouchableOpacity>

            {editingBudget && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Excluir Orçamento</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
