import { StyleSheet } from 'react-native';
import { theme } from '../../theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    permissionContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
    },
    message: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: theme.fontSize.lg,
        marginVertical: theme.spacing.lg,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        width: '100%',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: theme.fontSize.md,
    },
    cancelButton: {
        padding: theme.spacing.md,
    },
    cancelButtonText: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.md,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'space-between',
    },
    headerOverlay: {
        paddingTop: 50,
        paddingHorizontal: 20,
        alignItems: 'flex-end',
    },
    closeButton: {
        padding: 8,
    },
    scanAreaContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanArea: {
        width: 250,
        height: 250,
        borderWidth: 0,
        borderColor: 'transparent',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: theme.colors.primary,
        borderWidth: 4,
    },
    tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
    instructionText: {
        color: 'white',
        marginTop: 20,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    footerOverlay: {
        height: 100,
    },
});

export default styles;
