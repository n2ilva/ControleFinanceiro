import { StyleSheet } from 'react-native';
import { theme } from '../../theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.md,
        paddingBottom: 40,
    },
    section: {
        marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    label: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
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
    helperText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.xs,
    },
    emptyCardContainer: {
        gap: theme.spacing.sm,
    },
    cardListContainer: {
        gap: theme.spacing.sm,
    },
    cardChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginRight: theme.spacing.sm,
    },
    cardChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    cardChipText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
        fontWeight: theme.fontWeight.medium,
    },
    cardChipTextActive: {
        color: theme.colors.white,
        fontWeight: theme.fontWeight.bold,
    },
    addCardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    addCardButtonInline: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    addCardButtonText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.medium,
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
        backgroundColor: theme.colors.backgroundCard,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    typeButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    typeButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    typeButtonTextActive: {
        color: theme.colors.white,
    },
    qrFab: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.lg,
        elevation: 8,
    },
    linkButton: {
        marginTop: theme.spacing.xs,
        alignSelf: 'flex-start',
    },
    linkButtonText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.primary,
        textDecorationLine: 'underline',
    },
    categoryGroup: {
        marginTop: theme.spacing.md,
    },
    categoryGroupTitle: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
    },
    categoryRow: {
        gap: theme.spacing.sm,
        paddingRight: theme.spacing.sm,
    },
    categoryButton: {
        width: 120,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.backgroundCard,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    categoryButtonText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
        textAlign: 'center',
    },
    categoryButtonTextActive: {
        color: theme.colors.white,
        fontWeight: theme.fontWeight.semibold,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
    },
    switchLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        flex: 1,
    },
    switchLabelText: {
        flex: 1,
    },
    switchDescription: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
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
});

export default styles;
