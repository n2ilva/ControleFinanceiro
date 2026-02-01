import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';
import { formatCurrency } from '../../../utils';

interface BalanceCardProps {
    totalBalance: number;
    previousBalance: number;
    totalIncome: number;
    totalExpenses: number;
}

export function BalanceCard({
    totalBalance,
    previousBalance,
    totalIncome,
    totalExpenses,
}: BalanceCardProps) {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.balanceLabel}>Saldo Total</Text>
                <Text style={[styles.balanceAmount, totalBalance >= 0 ? styles.positiveBalance : styles.negativeBalance]}>
                    R$ {formatCurrency(totalBalance)}
                </Text>

                <View style={styles.balanceDetails}>
                    {previousBalance !== 0 && (
                        <View style={styles.balanceItem}>
                            <Ionicons 
                                name={previousBalance >= 0 ? "wallet" : "wallet-outline"} 
                                size={16} 
                                color={previousBalance >= 0 ? theme.colors.success : theme.colors.danger} 
                            />
                            <View style={styles.balanceItemText}>
                                <Text style={styles.balanceItemLabel}>Mês Anterior</Text>
                                <Text style={[styles.balanceItemValue, { color: previousBalance >= 0 ? theme.colors.success : theme.colors.danger }]}>
                                    {previousBalance >= 0 ? '+' : ''}R$ {formatCurrency(previousBalance)}
                                </Text>
                            </View>
                        </View>
                    )}
                    <View style={styles.balanceItem}>
                        <Ionicons name="arrow-down-circle" size={16} color={theme.colors.success} />
                        <View style={styles.balanceItemText}>
                            <Text style={styles.balanceItemLabel}>Receitas</Text>
                            <Text style={styles.balanceItemValue}>R$ {formatCurrency(totalIncome)}</Text>
                        </View>
                    </View>

                    <View style={styles.balanceItem}>
                        <Ionicons name="arrow-up-circle" size={16} color={theme.colors.danger} />
                        <View style={styles.balanceItemText}>
                            <Text style={styles.balanceItemLabel}>Despesas</Text>
                            <Text style={styles.balanceItemValue}>R$ {formatCurrency(totalExpenses)}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 5,
        paddingVertical: 5,
        marginBottom: 5,
    },
    card: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.sm,
        ...theme.shadows.md,
    },
    balanceLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
        marginBottom: 2,
    },
    balanceAmount: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        marginBottom: theme.spacing.xs,
    },
    positiveBalance: {
        color: theme.colors.success,
    },
    negativeBalance: {
        color: theme.colors.danger,
    },
    balanceDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginTop: theme.spacing.xs,
        paddingTop: theme.spacing.xs,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        gap: theme.spacing.xs,
    },
    balanceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        minWidth: '30%',
    },
    balanceItemText: {
        gap: 2,
    },
    balanceItemLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
    },
    balanceItemValue: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
        fontWeight: theme.fontWeight.semibold,
    },
});
