import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';

interface SearchBarProps {
    searchQuery: string;
    resultCount: number;
    onSearchChange: (query: string) => void;
    onClear: () => void;
}

export function SearchBar({
    searchQuery,
    resultCount,
    onSearchChange,
    onClear,
}: SearchBarProps) {
    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Ionicons name="search" size={18} color={theme.colors.textMuted} />
                <TextInput
                    style={styles.input}
                    placeholder="Buscar por descrição, categoria, cartão..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    autoFocus
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={onClear}>
                        <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>
            {searchQuery.trim() && (
                <Text style={styles.resultCount}>
                    {resultCount} resultado(s) encontrado(s)
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 5,
        paddingVertical: 5,
        marginBottom: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        gap: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    input: {
        flex: 1,
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
        paddingVertical: theme.spacing.xs,
    },
    resultCount: {
        marginTop: theme.spacing.xs,
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});
