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
                <Text style={styles.balanceLabel}>Saldo Atual</Text>
                <View style={styles.topRow}>
                    <Text style={[styles.balanceAmount, totalBalance >= 0 ? styles.positiveBalance : styles.negativeBalance]}>
                        R$ {formatCurrency(totalBalance)}
                    </Text>

                    {previousBalance !== 0 && (
                        <View style={styles.previousContainerInline}>
                            <View style={styles.previousInner}>
                                <Ionicons name={previousBalance >= 0 ? "wallet" : "wallet-outline"} size={14} color={theme.colors.textSecondary} />
                                <View style={styles.previousText}>
                                    <Text style={styles.previousLabel}>Saldo Anterior</Text>
                                    <Text style={styles.previousValue}>{previousBalance >= 0 ? '+' : ''}R$ {formatCurrency(previousBalance)}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.incomeExpenseRow}>
                    <View style={styles.rowItem}>
                        <Ionicons name="arrow-down-circle" size={16} color={theme.colors.success} />
                        <View style={styles.balanceItemText}>
                            <Text style={styles.balanceItemLabel}>Receitas</Text>
                            <Text style={[styles.balanceItemValue, { color: theme.colors.success }]}>R$ {formatCurrency(totalIncome)}</Text>
                        </View>
                    </View>

                    <View style={styles.rowItem}>
                        <Ionicons name="arrow-up-circle" size={16} color={theme.colors.danger} />
                        <View style={styles.balanceItemText}>
                            <Text style={styles.balanceItemLabel}>Despesas</Text>
                            <Text style={[styles.balanceItemValue, { color: theme.colors.danger }]}>R$ {formatCurrency(totalExpenses)}</Text>
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
        alignItems: 'center',
    },
    card: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.sm,
        width: '100%',
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
        alignItems: 'center',
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
        minWidth: 120,
        flexShrink: 0,
    },
    balanceItemText: {
        gap: 2,
        alignItems: 'flex-start',
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
    futureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    futureText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.warning,
        fontWeight: theme.fontWeight.semibold,
    },
    mobileRows: {
        marginTop: theme.spacing.xs,
        paddingTop: theme.spacing.xs,
    },
    mobileRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
    },
    incomeExpenseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.xs,
        paddingTop: theme.spacing.xs,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        minWidth: 0,
        justifyContent: 'flex-start',
    },
    rightGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        justifyContent: 'flex-end',
    },
    previousContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
    },
    previousText: {
        marginLeft: theme.spacing.xs,
    },
    previousLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
    },
    previousValue: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.semibold,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    previousContainerInline: {
        marginLeft: theme.spacing.sm,
    },
    previousInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    incomeExpenseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.xs,
        paddingTop: theme.spacing.xs,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
});
