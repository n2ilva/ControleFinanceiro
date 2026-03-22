import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';

type FilterType = 'income' | 'expense';

interface TransactionFiltersProps {
    filter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

export function TransactionFilters({
    filter,
    onFilterChange,
}: TransactionFiltersProps) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.filterButton, filter === 'expense' && styles.filterButtonActive]}
                onPress={() => onFilterChange('expense')}
            >
                <Ionicons name="arrow-up-circle" size={16} color={filter === 'expense' ? theme.colors.white : theme.colors.danger} />
                <Text style={[styles.filterText, filter === 'expense' && styles.filterTextActive]}>Despesas</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.filterButton, filter === 'income' && styles.filterButtonActive]}
                onPress={() => onFilterChange('income')}
            >
                <Ionicons name="arrow-down-circle" size={16} color={filter === 'income' ? theme.colors.white : theme.colors.success} />
                <Text style={[styles.filterText, filter === 'income' && styles.filterTextActive]}>Receitas</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 5,
        paddingVertical: 5,
        gap: theme.spacing.sm,
        marginBottom: 5,
    },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.xs,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.backgroundCard,
        gap: theme.spacing.xs,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    filterButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.text,
        fontWeight: theme.fontWeight.medium,
    },
    filterTextActive: {
        color: theme.colors.white,
    },
});
