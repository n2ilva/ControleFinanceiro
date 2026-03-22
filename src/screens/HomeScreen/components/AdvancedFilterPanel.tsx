import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../../constants';
import { CreditCard } from '../../../types';

export interface AdvancedFilters {
  categories: string[];
  cardIds: string[];
  minAmount?: number;
  maxAmount?: number;
}

interface AdvancedFilterPanelProps {
  visible: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onApply: (filters: AdvancedFilters) => void;
  filterType: 'income' | 'expense';
  cards: CreditCard[];
}

export function AdvancedFilterPanel({
  visible,
  onClose,
  filters,
  onApply,
  filterType,
  cards,
}: AdvancedFilterPanelProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filters.categories);
  const [selectedCards, setSelectedCards] = useState<string[]>(filters.cardIds);
  const [minAmount, setMinAmount] = useState(filters.minAmount?.toString() || '');
  const [maxAmount, setMaxAmount] = useState(filters.maxAmount?.toString() || '');

  const categories = filterType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleCard = (id: string) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    onApply({
      categories: selectedCategories,
      cardIds: selectedCards,
      minAmount: minAmount ? parseFloat(minAmount.replace(',', '.')) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount.replace(',', '.')) : undefined,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedCategories([]);
    setSelectedCards([]);
    setMinAmount('');
    setMaxAmount('');
    onApply({ categories: [], cardIds: [] });
    onClose();
  };

  const activeCount =
    selectedCategories.length +
    selectedCards.length +
    (minAmount ? 1 : 0) +
    (maxAmount ? 1 : 0);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.content} activeOpacity={1} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>Filtros Avançados</Text>
            {activeCount > 0 && (
              <TouchableOpacity onPress={handleClear}>
                <Text style={styles.clearText}>Limpar ({activeCount})</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {/* Categorias */}
            <Text style={styles.sectionTitle}>Categorias</Text>
            <View style={styles.chipGrid}>
              {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleCategory(cat.id)}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={14}
                      color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Cartões */}
            {filterType === 'expense' && cards.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Cartão</Text>
                <View style={styles.chipGrid}>
                  {cards.map((card) => {
                    const isSelected = selectedCards.includes(card.id);
                    return (
                      <TouchableOpacity
                        key={card.id}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => toggleCard(card.id)}
                      >
                        <Ionicons
                          name="card-outline"
                          size={14}
                          color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                        />
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                          {card.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* Faixa de valor */}
            <Text style={styles.sectionTitle}>Faixa de Valor (R$)</Text>
            <View style={styles.rangeRow}>
              <TextInput
                style={styles.rangeInput}
                value={minAmount}
                onChangeText={setMinAmount}
                placeholder="Mínimo"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="decimal-pad"
              />
              <Text style={styles.rangeSeparator}>até</Text>
              <TextInput
                style={styles.rangeInput}
                value={maxAmount}
                onChangeText={setMaxAmount}
                placeholder="Máximo"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="decimal-pad"
              />
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Ionicons name="checkmark" size={20} color={theme.colors.white} />
            <Text style={styles.applyText}>Aplicar Filtros</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: theme.colors.backgroundCard,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  clearText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.danger,
    fontWeight: theme.fontWeight.semibold,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  chipTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rangeInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rangeSeparator: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
  },
  applyText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
});
