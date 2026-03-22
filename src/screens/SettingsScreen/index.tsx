import React from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles';

export default function SettingsScreen() {
    const { themeMode, toggleTheme, isDark } = useTheme();
    const { user } = useAuth();

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Text style={styles.title}>Configurações</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Aparência */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Aparência</Text>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.settingIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                                <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={theme.colors.primary} />
                            </View>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Tema Escuro</Text>
                                <Text style={styles.settingDescription}>
                                    {isDark ? 'Modo escuro ativado' : 'Modo claro ativado'}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                            thumbColor={isDark ? theme.colors.primary : theme.colors.textMuted}
                        />
                    </View>
                </View>

                {/* Conta */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Conta</Text>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.settingIconContainer, { backgroundColor: theme.colors.success + '20' }]}>
                                <Ionicons name="person" size={22} color={theme.colors.success} />
                            </View>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>{user?.displayName || 'Usuário'}</Text>
                                <Text style={styles.settingDescription}>{user?.email || ''}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <Text style={styles.versionText}>Controle Financeiro v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}
