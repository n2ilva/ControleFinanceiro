import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';

interface MonthSelectorProps {
    monthName: string;
    year: number;
    showSearch: boolean;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToggleSearch: () => void;
}

export function MonthSelector({
    monthName,
    year,
    showSearch,
    onPrevMonth,
    onNextMonth,
    onToggleSearch,
}: MonthSelectorProps) {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onPrevMonth} style={styles.monthButton}>
                <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            <Text style={styles.monthText}>
                {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
            </Text>

            <View style={styles.monthActions}>
                <TouchableOpacity 
                    onPress={onToggleSearch} 
                    style={styles.searchToggleButton}
                >
                    <Ionicons 
                        name={showSearch ? "close" : "search"} 
                        size={20} 
                        color={showSearch ? theme.colors.danger : theme.colors.primary} 
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={onNextMonth} style={styles.monthButton}>
                    <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        paddingVertical: 5,
        marginBottom: 5,
    },
    monthButton: {
        padding: theme.spacing.sm,
    },
    monthText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    monthActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchToggleButton: {
        padding: theme.spacing.sm,
    },
});
