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
    // Header com informações do usuário
    userHeader: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.md,
    },
    userHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    userAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.white,
    },
    userEmail: {
        fontSize: theme.fontSize.sm,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    logoutIconButton: {
        padding: theme.spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: theme.borderRadius.md,
    },
    // Welcome Card
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
        lineHeight: 22,
    },
    // Sections
    section: {
        marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    sectionHint: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
        marginTop: -theme.spacing.xs,
        marginBottom: theme.spacing.md,
    },
    groupsList: {
        gap: theme.spacing.sm,
    },
    // Group Cards - Novo design
    groupCard: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    groupCardActive: {
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    groupCardContent: {
        padding: theme.spacing.md,
    },
    groupCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    groupIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    groupIconContainerActive: {
        backgroundColor: `${theme.colors.primary}20`,
    },
    groupCardInfo: {
        flex: 1,
    },
    groupCardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    groupCardName: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        flex: 1,
    },
    groupCardNameActive: {
        color: theme.colors.primary,
    },
    activeBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 3,
        borderRadius: 12,
    },
    activeBadgeText: {
        fontSize: 10,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.white,
        textTransform: 'uppercase',
    },
    groupCardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        marginTop: theme.spacing.xs,
    },
    groupCardMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
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
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    groupCardAction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: theme.spacing.sm,
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
    },
    groupCardActionLast: {
        borderRightWidth: 0,
    },
    groupCardActionText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.medium,
    },
    groupCardActionTextDanger: {
        color: theme.colors.danger,
    },
    // Add Group Section
    addGroupSection: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.md,
    },
    addGroupSectionTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    // Inputs
    inputContainer: {
        marginBottom: theme.spacing.md,
    },
    inputLabel: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    // Buttons
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.sm,
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
    // Divider
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.spacing.lg,
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
        fontWeight: theme.fontWeight.medium,
    },
    // Logout Button
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginTop: theme.spacing.md,
    },
    logoutButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.danger,
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
        maxHeight: '85%',
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
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
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
        letterSpacing: 0.5,
    },
    codeContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
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
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberAvatarOwner: {
        backgroundColor: `${theme.colors.warning}20`,
    },
    memberTextContainer: {
        flex: 1,
    },
    memberName: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        fontWeight: theme.fontWeight.medium,
    },
    memberEmail: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
        marginTop: 2,
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
        paddingVertical: theme.spacing.lg,
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
