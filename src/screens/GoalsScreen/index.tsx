import React, { useState, useCallback, useRef } from 'react';
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
import { GoalService } from '../../services/goalService';
import { FinancialGoal } from '../../types';
import { theme } from '../../theme';
import { formatCurrency } from '../../utils';
import styles from './styles';

const DateTimePicker = Platform.OS !== 'web'
  ? require('@react-native-community/datetimepicker').default
  : null;

const GOAL_COLORS = [
  '#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6',
  '#8B5CF6', '#EF4444', '#06B6D4', '#F97316', '#22C55E',
];

const formatBRL = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const number = parseInt(digits, 10) / 100;
  return number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseBRL = (value: string): number => {
  return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
};

const formatDateMask = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const GOAL_ICONS = [
  'flag', 'home', 'car', 'airplane', 'school', 'laptop',
  'heart', 'diamond', 'trophy', 'gift', 'cash', 'briefcase',
];

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [amountModalVisible, setAmountModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [selectedGoalForAmount, setSelectedGoalForAmount] = useState<FinancialGoal | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(GOAL_ICONS[0]);
  const [addAmountValue, setAddAmountValue] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  const webDateInputRef = useRef<any>(null);

  const loadGoals = async () => {
    try {
      const data = await GoalService.getGoals();
      setGoals(data);
    } catch (error) {
      crossAlert('Erro', 'Não foi possível carregar as metas');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGoals();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
    setSelectedColor(GOAL_COLORS[0]);
    setSelectedIcon(GOAL_ICONS[0]);
    setModalVisible(true);
  };

  const openEditModal = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setTargetAmount(formatBRL(String(Math.round(goal.targetAmount * 100))));
    setCurrentAmount(formatBRL(String(Math.round(goal.currentAmount * 100))));
    if (goal.deadline) {
      const d = new Date(goal.deadline);
      setDeadline(d.toLocaleDateString('pt-BR'));
      setDatePickerDate(d);
    } else {
      setDeadline('');
    }
    setSelectedColor(goal.color || GOAL_COLORS[0]);
    setSelectedIcon(goal.icon || GOAL_ICONS[0]);
    setModalVisible(true);
  };

  const openDatePicker = () => {
    if (Platform.OS === 'web') {
      webDateInputRef.current?.click();
    } else {
      if (deadline) {
        const parts = deadline.split('/');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          if (!isNaN(d.getTime())) setDatePickerDate(d);
        }
      }
      setShowDatePicker(true);
    }
  };

  const onDatePickerChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'dismissed') { setShowDatePicker(false); return; }
    if (selectedDate) {
      setDatePickerDate(selectedDate);
      const d = selectedDate;
      const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      setDeadline(formatted);
    }
  };

  const onWebDateChange = (e: any) => {
    const val: string = e.target.value; // YYYY-MM-DD
    if (val) {
      const [year, month, day] = val.split('-');
      setDeadline(`${day}/${month}/${year}`);
    }
  };

  const openAmountModal = (goal: FinancialGoal) => {
    setSelectedGoalForAmount(goal);
    setAddAmountValue('');
    setAmountModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      crossAlert('Erro', 'Insira um título');
      return;
    }

    const target = parseBRL(targetAmount);
    if (isNaN(target) || target <= 0) {
      crossAlert('Erro', 'Insira um valor alvo válido');
      return;
    }

    const current = parseBRL(currentAmount);

    let deadlineISO: string | undefined;
    if (deadline) {
      const parts = deadline.split('/');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        if (!isNaN(d.getTime())) deadlineISO = d.toISOString();
      }
    }

    try {
      if (editingGoal) {
        await GoalService.updateGoal(editingGoal.id, {
          title: title.trim(),
          description: description.trim(),
          targetAmount: target,
          currentAmount: current,
          deadline: deadlineISO,
          color: selectedColor,
          icon: selectedIcon,
          isCompleted: current >= target,
        });
      } else {
        await GoalService.addGoal({
          title: title.trim(),
          description: description.trim(),
          targetAmount: target,
          currentAmount: current,
          deadline: deadlineISO,
          color: selectedColor,
          icon: selectedIcon,
          isCompleted: current >= target,
        });
      }

      setModalVisible(false);
      loadGoals();
    } catch (error) {
      crossAlert('Erro', 'Não foi possível salvar a meta');
    }
  };

  const handleDelete = async () => {
    if (!editingGoal) return;

    crossAlert('Confirmar Exclusão', 'Deseja realmente excluir esta meta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await GoalService.deleteGoal(editingGoal.id);
            setModalVisible(false);
            loadGoals();
          } catch (error) {
            crossAlert('Erro', 'Não foi possível excluir');
          }
        },
      },
    ]);
  };

  const handleAddAmount = async () => {
    if (!selectedGoalForAmount) return;

    const amount = parseBRL(addAmountValue);
    if (isNaN(amount) || amount <= 0) {
      crossAlert('Erro', 'Insira um valor válido');
      return;
    }

    try {
      await GoalService.addAmountToGoal(selectedGoalForAmount.id, amount);
      setAmountModalVisible(false);
      loadGoals();

      const newAmount = selectedGoalForAmount.currentAmount + amount;
      if (newAmount >= selectedGoalForAmount.targetAmount) {
        crossAlert('Parabéns! 🎉', `Você atingiu a meta "${selectedGoalForAmount.title}"!`);
      }
    } catch (error) {
      crossAlert('Erro', 'Não foi possível adicionar o valor');
    }
  };

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  const renderGoalItem = ({ item }: { item: FinancialGoal }) => {
    const percentage = item.targetAmount > 0 ? (item.currentAmount / item.targetAmount) * 100 : 0;
    const remaining = Math.max(0, item.targetAmount - item.currentAmount);

    return (
      <TouchableOpacity
        style={[styles.goalItem, item.isCompleted && styles.goalCompleted]}
        onPress={() => openEditModal(item)}
        activeOpacity={0.7}
      >
        <View style={styles.goalHeader}>
          <View style={[styles.goalIconContainer, { backgroundColor: (item.color || '#6366F1') + '20' }]}>
            <Ionicons name={(item.icon || 'flag') as any} size={22} color={item.color || '#6366F1'} />
          </View>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>{item.title}</Text>
            {item.description ? <Text style={styles.goalDescription}>{item.description}</Text> : null}
            {item.deadline && (
              <Text style={styles.goalDeadline}>
                Prazo: {new Date(item.deadline).toLocaleDateString('pt-BR')}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={[styles.progressPercent, { color: item.color || theme.colors.primary }]}>
            {percentage.toFixed(0)}%
          </Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: item.color || theme.colors.primary,
                },
              ]}
            />
          </View>
          <View style={styles.progressValues}>
            <Text style={styles.progressCurrent}>{formatCurrency(item.currentAmount)}</Text>
            <Text style={styles.progressTarget}>{formatCurrency(item.targetAmount)}</Text>
          </View>
        </View>

        {item.isCompleted ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
            <Text style={styles.completedText}>Meta atingida!</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addAmountButton}
            onPress={() => openAmountModal(item)}
          >
            <Ionicons name="add-circle-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.addAmountText}>
              Adicionar valor (faltam {formatCurrency(remaining)})
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      <View style={styles.content}>
        {/* Resumo */}
        {goals.length > 0 && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Ativas</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>{activeGoals.length}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Concluídas</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>{completedGoals.length}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total acumulado</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {formatCurrency(goals.reduce((s, g) => s + g.currentAmount, 0))}
              </Text>
            </View>
          </View>
        )}

        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={renderGoalItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="flag-outline" size={64} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>Nenhuma meta definida</Text>
              <Text style={styles.emptySubtext}>Crie metas para acompanhar seus objetivos financeiros</Text>
            </View>
          }
          contentContainerStyle={goals.length === 0 ? { flex: 1 } : { paddingBottom: 80 }}
        />
      </View>

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 20 }]} onPress={openAddModal}>
        <Ionicons name="add" size={28} color={theme.colors.white} />
      </TouchableOpacity>

      {/* Modal Nova/Editar Meta */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <TouchableOpacity style={styles.modalContent} activeOpacity={1} onPress={() => {}}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
                <Text style={[styles.modalTitle, { marginBottom: 0 }]}>
                  {editingGoal ? 'Editar Meta' : 'Nova Meta'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={28} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Viagem para Europa"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={styles.label}>Descrição (opcional)</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Detalhes da meta..."
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={styles.label}>Valor alvo (R$)</Text>
              <TextInput
                style={styles.input}
                value={targetAmount}
                onChangeText={(text) => setTargetAmount(formatBRL(text))}
                placeholder="Ex: 10.000,00"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Valor atual (R$)</Text>
              <TextInput
                style={styles.input}
                value={currentAmount}
                onChangeText={(text) => setCurrentAmount(formatBRL(text))}
                placeholder="Ex: 2.500,00"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Prazo (opcional)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={deadline}
                  onChangeText={(text) => setDeadline(formatDateMask(text))}
                  placeholder="dd/mm/aaaa"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={10}
                />
                {Platform.OS === 'web' ? (
                  <View
                    style={{
                      padding: 12,
                      backgroundColor: theme.colors.card,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      position: 'relative',
                      overflow: 'hidden',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} />
                    <input
                      ref={webDateInputRef}
                      type="date"
                      onChange={onWebDateChange}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                        fontSize: 16,
                      } as any}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={openDatePicker}
                    style={{
                      padding: 12,
                      backgroundColor: theme.colors.card,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} />
                  </TouchableOpacity>
                )}
              </View>

              {showDatePicker && Platform.OS !== 'web' && DateTimePicker && (
                <DateTimePicker
                  value={datePickerDate}
                  mode="date"
                  display={Platform.OS === 'android' ? 'default' : 'spinner'}
                  onChange={onDatePickerChange}
                  locale="pt-BR"
                />
              )}

              <Text style={styles.label}>Cor</Text>
              <View style={styles.colorGrid}>
                {GOAL_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={18} color="#FFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Ícone</Text>
              <View style={styles.iconGrid}>
                {GOAL_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      selectedIcon === icon && styles.iconOptionSelected,
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Ionicons
                      name={icon as any}
                      size={20}
                      color={selectedIcon === icon ? theme.colors.primary : theme.colors.textMuted}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editingGoal ? 'Atualizar' : 'Criar Meta'}
                </Text>
              </TouchableOpacity>

              {editingGoal && (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                  <Text style={styles.deleteButtonText}>Excluir Meta</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Adicionar Valor */}
      <Modal visible={amountModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAmountModalVisible(false)}>
          <TouchableOpacity style={styles.modalContent} activeOpacity={1} onPress={() => {}}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
              <Text style={[styles.modalTitle, { marginBottom: 0 }]}>Adicionar Valor</Text>
              <TouchableOpacity onPress={() => setAmountModalVisible(false)}>
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            {selectedGoalForAmount && (
              <Text style={[styles.label, { textAlign: 'center', marginBottom: theme.spacing.md }]}>
                {selectedGoalForAmount.title} — {formatCurrency(selectedGoalForAmount.currentAmount)} de {formatCurrency(selectedGoalForAmount.targetAmount)}
              </Text>
            )}

            <Text style={styles.label}>Valor a adicionar (R$)</Text>
            <TextInput
              style={styles.input}
              value={addAmountValue}
              onChangeText={(text) => setAddAmountValue(formatBRL(text))}
              placeholder="Ex: 500,00"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              autoFocus
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleAddAmount}>
              <Text style={styles.saveButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
