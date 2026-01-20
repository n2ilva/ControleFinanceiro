import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../../services/authService';
import { theme } from '../../theme';
import styles from './styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        setLoading(true);
        try {
            await AuthService.signIn(email.trim(), password);
            // Navegação será tratada pelo AuthContext
        } catch (error: any) {
            Alert.alert('Erro ao fazer login', error.message);
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
                        <Ionicons name="wallet" size={64} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.appName}>Controle Financeiro</Text>
                    <Text style={styles.appTagline}>Gerencie suas finanças com facilidade</Text>
                </View>

                {/* Formulário */}
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Entrar</Text>

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
                            placeholder="Senha"
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

                    {/* Botão de Login */}
                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.white} />
                        ) : (
                            <Text style={styles.loginButtonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>

                    {/* Link para Registro */}
                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>Não tem uma conta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLink}>Criar conta</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
