import { StyleSheet } from 'react-native';
import { theme } from '../../theme';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.md,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    welcomeCard: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        ...theme.shadows.md,
    },
    welcomeTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    welcomeText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    section: {
        marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    sectionHint: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.md,
    },
    groupsList: {
        gap: theme.spacing.sm,
    },
    groupCard: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        ...theme.shadows.sm,
    },
    groupCardActive: {
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}10`,
    },
    groupCardHeader: {
        flex: 1,
    },
    groupCardInfo: {
        flex: 1,
    },
    groupCardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    groupCardName: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
        flex: 1,
    },
    groupCardNameActive: {
        color: theme.colors.primary,
    },
    activeBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.sm,
    },
    activeBadgeText: {
        fontSize: theme.fontSize.xs,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.white,
    },
    groupCardMeta: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    groupCardCode: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    groupCardMembers: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    groupCardActions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    groupCardAction: {
        padding: theme.spacing.sm,
    },
    addGroupSection: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.md,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.md,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.md,
    },
    createButton: {
        backgroundColor: theme.colors.primary,
    },
    joinButton: {
        backgroundColor: theme.colors.success,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.white,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.spacing.md,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.border,
    },
    dividerText: {
        marginHorizontal: theme.spacing.md,
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.danger,
        marginTop: theme.spacing.xl,
        ...theme.shadows.md,
    },
    logoutButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.white,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.backgroundCard,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    modalCloseButton: {
        padding: theme.spacing.sm,
    },
    modalSection: {
        marginBottom: theme.spacing.lg,
    },
    modalSectionTitle: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
        textTransform: 'uppercase',
    },
    codeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    codeText: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.primary,
        letterSpacing: 4,
    },
    regenerateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
    },
    regenerateButtonText: {
        color: theme.colors.white,
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
    },
    memberItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        flex: 1,
    },
    memberTextContainer: {
        flex: 1,
    },
    memberName: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        fontWeight: theme.fontWeight.medium,
    },
    ownerBadge: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.warning,
        fontWeight: theme.fontWeight.bold,
        marginTop: 2,
    },
    removeMemberButton: {
        padding: theme.spacing.sm,
        backgroundColor: `${theme.colors.danger}15`,
        borderRadius: theme.borderRadius.sm,
    },
    emptyMembersText: {
        color: theme.colors.textMuted,
        textAlign: 'center',
        paddingVertical: theme.spacing.md,
    },
    modalCloseBottomButton: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        marginTop: theme.spacing.md,
    },
    modalCloseBottomButtonText: {
        color: theme.colors.text,
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
    },
});
