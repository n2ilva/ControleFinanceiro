import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';
import { formatCurrency } from '../../../utils';

interface BalanceCardProps {
    totalBalance: number;
    futureExpensesTotal: number;
    futureIncomeTotal: number;
    totalIncome: number;
    totalExpenses: number;
}

export function BalanceCard({
    totalBalance,
    futureExpensesTotal,
    futureIncomeTotal,
    totalIncome,
    totalExpenses,
}: BalanceCardProps) {
    const saldoReal = (totalIncome + futureIncomeTotal) - (totalExpenses + futureExpensesTotal);
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {/* Linha 1: Saldo Atual + Despesas */}
                <View style={styles.row}>
                    <View style={styles.rowItem}>
                        <View style={styles.balanceItemText}>
                            <Text style={styles.balanceItemLabel}>Saldo Atual</Text>
                            <Text style={[styles.balanceAmount, totalBalance >= 0 ? styles.positiveBalance : styles.negativeBalance]}>
                                R$ {formatCurrency(totalBalance)}
                            </Text>
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

                {/* Linha 2: Saldo Final + Receitas */}
                <View style={[styles.row, styles.rowBorderTop]}>
                    <View style={styles.rowItem}>
                        <Ionicons name="wallet-outline" size={16} color={saldoReal >= 0 ? theme.colors.success : theme.colors.danger} />
                        <View style={styles.balanceItemText}>
                            <Text style={styles.balanceItemLabel}>Saldo Final</Text>
                            <Text style={[styles.balanceItemValue, { color: saldoReal >= 0 ? theme.colors.success : theme.colors.danger }]}>R$ {formatCurrency(saldoReal)}</Text>
                        </View>
                    </View>
                    <View style={styles.rowItem}>
                        <Ionicons name="time-outline" size={16} color={theme.colors.warning} />
                        <View style={styles.balanceItemText}>
                            <Text style={styles.balanceItemLabel}>Desp. Futuras</Text>
                            <Text style={[styles.balanceItemValue, { color: theme.colors.warning }]}>R$ {formatCurrency(futureExpensesTotal)}</Text>
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.xs,
    },
    rowBorderTop: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
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
    balanceAmount: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
    },

    positiveBalance: {
        color: theme.colors.success,
    },
    negativeBalance: {
        color: theme.colors.danger,
    },
});
