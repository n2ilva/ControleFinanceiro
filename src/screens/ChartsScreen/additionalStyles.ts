import { StyleSheet } from 'react-native';
import { theme } from '../../theme';

// Estilos adicionais para as novas funcionalidades
export const additionalStyles = StyleSheet.create({
    // Tabs Scroll
    tabsScrollContainer: {
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },

    // Comparison
    comparisonGrid: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    comparisonItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
    },
    comparisonLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
        marginBottom: 4,
    },
    comparisonValue: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        marginBottom: 2,
    },
    comparisonPercent: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
    },
    categoryGrowthItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    categoryGrowthInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: theme.spacing.md,
    },
    categoryGrowthName: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text,
        textTransform: 'capitalize',
    },
    categoryGrowthPercent: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.bold,
    },
    categoryGrowthValue: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
    },
    savingsRateContainer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    savingsRateItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
    },
    savingsRateLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
        marginBottom: 4,
    },
    savingsRateValue: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.bold,
        marginBottom: 4,
    },
    savingsRateAmount: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
    },
    categoryComparisonItem: {
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    categoryComparisonName: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
        textTransform: 'capitalize',
    },
    categoryComparisonValues: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    categoryComparisonColumn: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
    },
    categoryComparisonLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
        marginBottom: 2,
    },
    categoryComparisonAmount: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    rankingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    rankingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    rankingBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankingPosition: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.primary,
    },
    rankingInfo: {
        flex: 1,
    },
    rankingDescription: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text,
        marginBottom: 2,
    },
    rankingCategory: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
    },
    rankingAmount: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    dayStatItem: {
        marginBottom: theme.spacing.md,
    },
    dayStatName: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text,
        marginBottom: 4,
    },
    dayStatBar: {
        height: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: 4,
        marginBottom: 4,
        overflow: 'hidden',
    },
    dayStatFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 4,
    },
    dayStatValues: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayStatAmount: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    dayStatCount: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    statItem: {
        width: '48%',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    statValue: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginTop: theme.spacing.xs,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
    scoreCard: {
        alignItems: 'center',
    },
    scoreCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: theme.spacing.lg,
    },
    scoreValue: {
        fontSize: 64,
        fontWeight: theme.fontWeight.bold,
    },
    scoreMax: {
        fontSize: theme.fontSize.lg,
        color: theme.colors.textMuted,
        marginTop: -12,
    },
    scoreLabel: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.semibold,
        marginBottom: theme.spacing.md,
    },
    scoreComponentItem: {
        marginBottom: theme.spacing.md,
    },
    scoreComponentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    scoreComponentName: {
        flex: 1,
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text,
    },
    scoreComponentValue: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.xs,
    },
    recommendationsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        paddingLeft: theme.spacing.sm,
    },
    recommendationText: {
        flex: 1,
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
        lineHeight: 20,
    },
});
