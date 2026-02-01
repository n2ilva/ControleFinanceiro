import { StyleSheet } from 'react-native';
import { theme } from '../../theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        padding: theme.spacing.md,
        paddingBottom: 120,
    },
    cardItem: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardInfo: {
        flex: 1,
        gap: 6,
    },
    cardNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardName: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    paidBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: theme.colors.successLight || 'rgba(34, 197, 94, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    paidBadgeText: {
        fontSize: theme.fontSize.xs,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.success,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardMetaText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    amountContainer: {
        marginTop: theme.spacing.sm,
        paddingTop: theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    amountLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    amountValue: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.danger,
    },
    amountValuePaid: {
        color: theme.colors.success,
    },
    amountValueZero: {
        color: theme.colors.success,
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    actionButton: {
        padding: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.sm,
    },
    actionButtonPaid: {
        backgroundColor: theme.colors.successLight || 'rgba(34, 197, 94, 0.1)',
    },
    editButton: {
        position: 'absolute',
        top: theme.spacing.md,
        right: theme.spacing.md,
        padding: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.sm,
        zIndex: 1,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.sm,
    },
    fab: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.lg,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xxl,
    },
    emptyStateText: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.md,
    },
    emptyStateSubtext: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    modalTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    modalBody: {
        gap: theme.spacing.md,
    },
    inputGroup: {
        gap: theme.spacing.xs,
    },
    label: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    input: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    typeButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    typeButtonText: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text,
    },
    typeButtonTextActive: {
        color: theme.colors.white,
        fontWeight: theme.fontWeight.bold,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginTop: theme.spacing.lg,
    },
    button: {
        flex: 1,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: theme.colors.surface,
    },
    cancelButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        ...theme.shadows.md,
    },
    saveButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.white,
    },
    deleteButtonModal: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        paddingVertical: theme.spacing.md,
        marginTop: theme.spacing.lg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    deleteButtonText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.danger,
        fontWeight: theme.fontWeight.medium,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.backgroundCard,
    },
    filterButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterButtonText: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text,
    },
    filterButtonTextActive: {
        color: theme.colors.white,
    },
});

export default styles;
