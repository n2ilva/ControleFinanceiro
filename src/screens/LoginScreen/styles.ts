import { StyleSheet } from 'react-native';
import { theme } from '../../theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: theme.spacing.lg,
        alignItems: 'center',
    },
    innerContainer: {
        width: '100%',
        maxWidth: 460,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.backgroundCard,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: theme.spacing.md,
        ...theme.shadows.lg,
    },
    logoImage: {
        width: 88,
        height: 88,
        borderRadius: 44,
    },
    appName: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    appTagline: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
    },
    formContainer: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        ...theme.shadows.md,
    },
    title: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    inputIcon: {
        marginRight: theme.spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
    },
    eyeIcon: {
        padding: theme.spacing.sm,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginTop: -theme.spacing.xs,
        marginBottom: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
    },
    forgotPasswordText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.medium,
    },
    resetFeedbackContainer: {
        borderRadius: theme.borderRadius.sm,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
    },
    resetFeedbackSuccess: {
        backgroundColor: theme.colors.success + '20',
        borderColor: theme.colors.success + '40',
    },
    resetFeedbackError: {
        backgroundColor: theme.colors.danger + '20',
        borderColor: theme.colors.danger + '40',
    },
    resetFeedbackText: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
    },
    resetFeedbackTextSuccess: {
        color: theme.colors.success,
    },
    resetFeedbackTextError: {
        color: theme.colors.danger,
    },
    loginButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        marginTop: theme.spacing.md,
        ...theme.shadows.md,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.white,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: theme.spacing.lg,
    },
    registerText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
    },
    registerLink: {
        fontSize: theme.fontSize.md,
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.semibold,
    },
});

export default styles;
