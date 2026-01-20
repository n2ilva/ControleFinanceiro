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
        marginBottom: theme.spacing.md,
        ...theme.shadows.lg,
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
