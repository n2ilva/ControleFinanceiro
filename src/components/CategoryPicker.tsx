import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import {
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    EXPENSE_CATEGORY_GROUPS,
    INCOME_CATEGORY_GROUPS,
} from '../constants';
import { fuzzySearch } from '../utils/fuzzySearch';
import { CustomCategory } from '../services/customCategoryService';

interface CategoryPickerProps {
    type: 'expense' | 'income';
    selectedCategory: string;
    onSelectCategory: (categoryId: string) => void;
    customCategories?: CustomCategory[];
    /** If provided, only these category IDs are shown (e.g. for budgets) */
    filterIds?: string[];
    /** Show the "Nova" (add) button */
    showAddButton?: boolean;
    onAddPress?: () => void;
}

interface CategoryItem {
    id: string;
    label: string;
    icon: string;
    group?: string;
}

export function CategoryPicker({
    type,
    selectedCategory,
    onSelectCategory,
    customCategories = [],
    filterIds,
    showAddButton = false,
    onAddPress,
}: CategoryPickerProps) {
    const [search, setSearch] = useState('');

    const baseCategories: CategoryItem[] = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const groups = type === 'expense' ? EXPENSE_CATEGORY_GROUPS : INCOME_CATEGORY_GROUPS;

    // Build the grouped + filtered category list
    const groupedCategories = useMemo(() => {
        // All available categories (base + custom)
        let allCategories = [...baseCategories];
        if (filterIds) {
            allCategories = allCategories.filter(c => filterIds.includes(c.id));
        }

        // Filter by fuzzy search
        if (search.trim()) {
            allCategories = allCategories.filter(cat =>
                fuzzySearch(search, [cat.label, cat.group || '', cat.id])
            );
        }

        // Process custom categories first
        let customFiltered = customCategories.map(c => ({ ...c, group: c.group || 'Personalizadas' }));
        if (filterIds) {
            customFiltered = customFiltered.filter(c => filterIds.includes(c.id));
        }
        if (search.trim()) {
            customFiltered = customFiltered.filter(cat =>
                fuzzySearch(search, [cat.label, cat.group || 'personalizadas', cat.id])
            );
        }

        // Group base and custom categories
        const result: { title: string; items: CategoryItem[] }[] = [];

        const predefinedTitles = new Set(groups.map(g => g.title));

        for (const group of groups) {
            const baseItems = allCategories.filter(c => group.categories.includes(c.id));
            const customItems = customFiltered.filter(c => c.group === group.title);
            const items = [...baseItems, ...customItems];
            if (items.length > 0) {
                result.push({ title: group.title, items });
            }
        }

        // Custom categories that fall into "Personalizadas" or unknown groups
        const orphanCustoms = customFiltered.filter(c => !predefinedTitles.has(c.group || ''));
        if (orphanCustoms.length > 0) {
            result.push({ title: 'Personalizadas', items: orphanCustoms });
        }

        // Ungrouped base categories (in base but not in any defined group)
        const groupedIds = new Set(groups.flatMap(g => g.categories));
        const ungrouped = allCategories.filter(c => !groupedIds.has(c.id));
        if (ungrouped.length > 0) {
            result.push({ title: 'Outros', items: ungrouped });
        }

        return result;
    }, [baseCategories, groups, customCategories, filterIds, search]);

    const hasResults = groupedCategories.some(g => g.items.length > 0);

    return (
        <View>
            {/* Search input */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={16} color={theme.colors.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Pesquisar categoria..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Grouped categories */}
            {hasResults ? (
                groupedCategories.map((group, groupIndex) => (
                    <View key={group.title}>
                        {/* Group header with line */}
                        <View style={styles.groupHeader}>
                            <View style={styles.groupLine} />
                            <Text style={styles.groupTitle}>{group.title}</Text>
                            <View style={styles.groupLine} />
                        </View>

                        {/* Category chips */}
                        <View style={styles.chipGrid}>
                            {group.items.map(cat => {
                                const isSelected = selectedCategory === cat.id;
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.chip,
                                            isSelected && styles.chipSelected,
                                        ]}
                                        onPress={() => onSelectCategory(cat.id)}
                                    >
                                        <Ionicons
                                            name={cat.icon as any}
                                            size={14}
                                            color={isSelected ? theme.colors.white : theme.colors.textSecondary}
                                        />
                                        <Text
                                            style={[
                                                styles.chipText,
                                                isSelected && styles.chipTextSelected,
                                            ]}
                                        >
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}

                            {/* Add button only on last group when not searching */}
                            {showAddButton && groupIndex === groupedCategories.length - 1 && !search.trim() && (
                                <TouchableOpacity
                                    style={[styles.chip, styles.addChip]}
                                    onPress={onAddPress}
                                >
                                    <Ionicons name="add-circle-outline" size={14} color={theme.colors.primary} />
                                    <Text style={[styles.chipText, { color: theme.colors.primary }]}>Nova</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))
            ) : (
                <View style={styles.noResults}>
                    <Ionicons name="search-outline" size={24} color={theme.colors.textMuted} />
                    <Text style={styles.noResultsText}>Nenhuma categoria encontrada</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        height: 38,
    },
    searchIcon: {
        marginRight: theme.spacing.xs,
    },
    searchInput: {
        flex: 1,
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
        paddingVertical: 0,
        height: 36,
    },
    clearButton: {
        padding: 4,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
        gap: theme.spacing.sm,
    },
    groupLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.colors.border,
    },
    groupTitle: {
        fontSize: 11,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        flexShrink: 0,
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 5,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.surface,
        gap: 4,
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
    addChip: {
        borderStyle: 'dashed' as any,
        borderColor: theme.colors.primary,
    },
    noResults: {
        alignItems: 'center',
        paddingVertical: theme.spacing.lg,
        gap: theme.spacing.xs,
    },
    noResultsText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
    },
});
