import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../services/authService';
import { theme } from '../theme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            await AuthService.signUp(email.trim(), password, name.trim());
            Alert.alert('Sucesso', 'Conta criada com sucesso!');
            // Navegação será tratada pelo AuthContext
        } catch (error: any) {
            Alert.alert('Erro ao criar conta', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Logo/Ícone */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="person-add" size={64} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.appName}>Criar Conta</Text>
                    <Text style={styles.appTagline}>Comece a gerenciar suas finanças hoje</Text>
                </View>

                {/* Formulário */}
                <View style={styles.formContainer}>
                    {/* Nome */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Nome completo"
                            placeholderTextColor={theme.colors.textMuted}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* E-mail */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="E-mail"
                            placeholderTextColor={theme.colors.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Senha */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Senha (mínimo 6 caracteres)"
                            placeholderTextColor={theme.colors.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons
                                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                size={20}
                                color={theme.colors.textMuted}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Confirmar Senha */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmar senha"
                            placeholderTextColor={theme.colors.textMuted}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons
                                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                size={20}
                                color={theme.colors.textMuted}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Botão de Registro */}
                    <TouchableOpacity
                        style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.white} />
                        ) : (
                            <Text style={styles.registerButtonText}>Criar Conta</Text>
                        )}
                    </TouchableOpacity>

                    {/* Link para Login */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Já tem uma conta? </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.loginLink}>Fazer login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

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
    registerButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        marginTop: theme.spacing.md,
        ...theme.shadows.md,
    },
    registerButtonDisabled: {
        opacity: 0.6,
    },
    registerButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.white,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: theme.spacing.lg,
    },
    loginText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
    },
    loginLink: {
        fontSize: theme.fontSize.md,
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.semibold,
    },
});
