import { StyleSheet } from 'react-native';
import { theme } from '../../theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.md,
        paddingBottom: theme.spacing.xxl,
    },
    
    // Month Selector
    monthSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    monthButton: {
        padding: theme.spacing.sm,
    },
    monthText: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    
    section: {
        marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    sectionSubtitle: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    
    // Insights
    insightsScroll: {
        paddingRight: theme.spacing.md,
        gap: theme.spacing.md,
    },
    insightCard: {
        width: 260,
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        borderLeftWidth: 4,
        ...theme.shadows.sm,
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    insightTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    insightMessage: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
    
    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.xs,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
        gap: 4,
    },
    tabActive: {
        backgroundColor: theme.colors.primary + '15',
    },
    tabText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
        fontWeight: theme.fontWeight.medium,
    },
    tabTextActive: {
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.bold,
    },
    tabContent: {
        minHeight: 200,
    },
    
    // Summary Grid
    summaryGrid: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    summaryCardSmall: {
        flex: 1,
        backgroundColor: theme.colors.backgroundCard,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        gap: 4,
        ...theme.shadows.sm,
    },
    summaryLabelSmall: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
    },
    summaryValueSmall: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.bold,
    },
    
    // Card
    card: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    cardTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    
    // Chart
    chart: {
        borderRadius: theme.borderRadius.md,
        marginVertical: theme.spacing.sm,
    },
    
    // Progress
    progressContainer: {
        gap: theme.spacing.sm,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressLabelText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressPercentage: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
        textAlign: 'right',
    },
    
    // Category
    categoryItem: {
        marginBottom: theme.spacing.md,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    categoryIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm,
    },
    categoryName: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
        flex: 1,
        fontWeight: theme.fontWeight.medium,
        textTransform: 'capitalize',
    },
    categoryValues: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    categoryAmount: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
        fontWeight: theme.fontWeight.bold,
    },
    categoryPercentage: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
    },
    
    // Card Expenses
    cardTotalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    cardTotalInfo: {
        flex: 1,
    },
    cardTotalLabel: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    cardTotalValue: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    cardExpenseItem: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    cardExpenseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    cardExpenseInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        flex: 1,
    },
    cardExpenseName: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    cardExpenseType: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
    },
    cardExpenseTotal: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    cardSection: {
        marginTop: theme.spacing.md,
    },
    cardSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
    },
    cardSectionTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
        flex: 1,
    },
    cardSectionTotal: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
    },
    
    // Due Items
    dueSection: {
        marginBottom: theme.spacing.lg,
    },
    dueSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    dueSectionTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
    },
    dueItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    dueItemOverdue: {
        borderLeftColor: theme.colors.danger,
        backgroundColor: theme.colors.danger + '08',
    },
    dueItemUrgent: {
        borderLeftColor: theme.colors.warning,
        backgroundColor: theme.colors.warning + '08',
    },
    dueItemInfo: {
        flex: 1,
    },
    dueItemDescription: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text,
        marginBottom: 2,
    },
    dueItemDate: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
    },
    dueItemAmount: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    
    // Empty State
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xxl,
    },
    emptyText: {
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: theme.spacing.md,
        fontSize: theme.fontSize.md,
    },
});

export default styles;
