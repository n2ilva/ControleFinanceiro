import { Platform, StyleSheet } from 'react-native';
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
    insightsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
    },
    insightCard: {
        width: '48%',
        flexGrow: 1,
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        borderLeftWidth: 4,
        ...theme.shadows.sm,
    },
    insightCardActionable: {
        borderWidth: 1,
        borderColor: theme.colors.border,
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
    insightActionHint: {
        marginTop: theme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    insightActionHintText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.semibold,
    },

    // Insight Details Modal
    insightModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        justifyContent: 'center',
        padding: theme.spacing.lg,
    },
    insightModalContent: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.lg,
        width: '100%',
        ...(Platform.OS === 'web' && {
            maxWidth: 720,
            alignSelf: 'center',
        }),
        maxHeight: '80%',
        ...theme.shadows.lg,
    },
    insightModalHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.md,
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    insightModalTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    insightModalSubtitle: {
        marginTop: 4,
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    insightModalCloseButton: {
        padding: theme.spacing.xs,
    },
    insightModalList: {
        padding: theme.spacing.md,
    },
    insightModalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    insightModalItemTitle: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    insightModalItemSubtitle: {
        marginTop: 2,
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
    },
    insightModalItemAmount: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    
    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.xs,
        marginBottom: theme.spacing.md,
        gap: theme.spacing.xs,
        ...theme.shadows.sm,
    },
    tab: {
        width: '24%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
        gap: 4,
    },
    tabCompact: {
        minHeight: 40,
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: 2,
        gap: 2,
    },
    tabActive: {
        backgroundColor: theme.colors.primary + '15',
    },
    tabText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
        fontWeight: theme.fontWeight.medium,
    },
    tabTextCompact: {
        fontSize: 10,
    },
    tabTextActive: {
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.bold,
    },
    tabContent: {
        minHeight: 200,
    },
    
    // Month Comparison
    monthComparisonContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: theme.spacing.sm,
    },
    monthComparisonBlock: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        gap: theme.spacing.xs,
    },
    monthComparisonDivider: {
        width: 1,
        backgroundColor: theme.colors.border,
        alignSelf: 'stretch',
    },
    monthComparisonTitle: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: 4,
    },
    monthComparisonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 2,
    },
    monthComparisonLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
    },
    monthComparisonValue: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
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
