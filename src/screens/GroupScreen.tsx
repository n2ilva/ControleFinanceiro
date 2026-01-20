import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    Share,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupService } from '../services/groupService';
import { useAuth } from '../contexts/AuthContext';
import { Group } from '../types';
import { theme } from '../theme';

export default function GroupScreen({ navigation }: any) {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<Group[]>([]);
    const [activeGroup, setActiveGroup] = useState<Group | null>(null);
    const [groupName, setGroupName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            setLoading(true);
            const userGroups = await GroupService.getUserGroups();
            const active = await GroupService.getActiveGroup();
            setGroups(userGroups);
            setActiveGroup(active);
        } catch (error) {
            console.error('Error loading groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            Alert.alert('Erro', 'Por favor, insira um nome para o grupo');
            return;
        }

        setCreating(true);
        try {
            const newGroup = await GroupService.createGroup(groupName.trim());
            setGroupName('');
            await loadGroups();
            Alert.alert('Sucesso!', `Grupo "${newGroup.name}" criado!\n\nCódigo: ${newGroup.code}\n\nCompartilhe este código com outras pessoas.`);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Não foi possível criar o grupo');
        } finally {
            setCreating(false);
        }
    };

    const handleJoinGroup = async () => {
        if (!joinCode.trim()) {
            Alert.alert('Erro', 'Por favor, insira o código do grupo');
            return;
        }

        setCreating(true);
        try {
            const joinedGroup = await GroupService.joinGroup(joinCode.trim());
            setJoinCode('');
            await loadGroups();
            Alert.alert('Sucesso!', `Você entrou no grupo "${joinedGroup.name}"!`);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Não foi possível entrar no grupo');
        } finally {
            setCreating(false);
        }
    };

    const handleSwitchGroup = async (group: Group) => {
        if (activeGroup?.id === group.id) return;

        try {
            await GroupService.switchActiveGroup(group.id);
            setActiveGroup(group);
            Alert.alert('Grupo Alterado', `Agora você está visualizando: ${group.name}`);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível alternar o grupo');
        }
    };

    const handleLeaveGroup = (group: Group) => {
        Alert.alert(
            'Sair do Grupo',
            `Tem certeza que deseja sair do grupo "${group.name}"? Você perderá acesso aos dados compartilhados.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await GroupService.leaveGroup(group.id);
                            await loadGroups();
                            Alert.alert('Sucesso', 'Você saiu do grupo');
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível sair do grupo');
                        }
                    },
                },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            'Sair da Conta',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível fazer logout');
                        }
                    },
                },
            ]
        );
    };

    const handleShareCode = async (group: Group) => {
        try {
            await Share.share({
                message: `Entre no meu grupo de controle financeiro!\n\nNome: ${group.name}\nCódigo: ${group.code}\n\nBaixe o app e use este código para acessar os dados compartilhados.`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const renderGroupCard = ({ item }: { item: Group }) => {
        const isActive = activeGroup?.id === item.id;

        return (
            <TouchableOpacity
                style={[styles.groupCard, isActive && styles.groupCardActive]}
                onPress={() => handleSwitchGroup(item)}
                activeOpacity={0.7}
            >
                <View style={styles.groupCardHeader}>
                    <View style={styles.groupCardInfo}>
                        <View style={styles.groupCardTitleRow}>
                            <Ionicons
                                name="people"
                                size={24}
                                color={isActive ? theme.colors.primary : theme.colors.textSecondary}
                            />
                            <Text style={[styles.groupCardName, isActive && styles.groupCardNameActive]}>
                                {item.name}
                            </Text>
                            {isActive && (
                                <View style={styles.activeBadge}>
                                    <Text style={styles.activeBadgeText}>ATIVO</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.groupCardMeta}>
                            <Text style={styles.groupCardCode}>Código: {item.code}</Text>
                            <Text style={styles.groupCardMembers}>
                                {item.members.length} membro(s)
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.groupCardActions}>
                    <TouchableOpacity
                        style={styles.groupCardAction}
                        onPress={() => handleShareCode(item)}
                    >
                        <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.groupCardAction}
                        onPress={() => handleLeaveGroup(item)}
                    >
                        <Ionicons name="exit-outline" size={20} color={theme.colors.danger} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {groups.length > 0 ? (
                <>
                    {/* Grupos do Usuário */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Meus Grupos</Text>
                        <Text style={styles.sectionHint}>
                            Toque em um grupo para alternar
                        </Text>
                        <FlatList
                            data={groups}
                            renderItem={renderGroupCard}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            contentContainerStyle={styles.groupsList}
                        />
                    </View>

                    {/* Adicionar Novo Grupo */}
                    <View style={styles.addGroupSection}>
                        <Text style={styles.sectionTitle}>Adicionar Outro Grupo</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nome do novo grupo"
                            placeholderTextColor={theme.colors.textMuted}
                            value={groupName}
                            onChangeText={setGroupName}
                        />
                        <TouchableOpacity
                            style={[styles.button, styles.createButton, creating && styles.buttonDisabled]}
                            onPress={handleCreateGroup}
                            disabled={creating}
                        >
                            {creating ? (
                                <ActivityIndicator color={theme.colors.white} />
                            ) : (
                                <>
                                    <Ionicons name="add-circle-outline" size={20} color={theme.colors.white} />
                                    <Text style={styles.buttonText}>Criar Grupo</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OU</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Código do grupo (6 caracteres)"
                            placeholderTextColor={theme.colors.textMuted}
                            value={joinCode}
                            onChangeText={setJoinCode}
                            autoCapitalize="characters"
                            maxLength={6}
                        />
                        <TouchableOpacity
                            style={[styles.button, styles.joinButton, creating && styles.buttonDisabled]}
                            onPress={handleJoinGroup}
                            disabled={creating}
                        >
                            {creating ? (
                                <ActivityIndicator color={theme.colors.white} />
                            ) : (
                                <>
                                    <Ionicons name="enter-outline" size={20} color={theme.colors.white} />
                                    <Text style={styles.buttonText}>Entrar no Grupo</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                // Usuário não está em nenhum grupo
                <View>
                    <View style={styles.welcomeCard}>
                        <Ionicons name="people-outline" size={64} color={theme.colors.primary} />
                        <Text style={styles.welcomeTitle}>Compartilhamento de Dados</Text>
                        <Text style={styles.welcomeText}>
                            Crie um grupo ou entre em um existente para compartilhar suas finanças com outras pessoas.
                        </Text>
                    </View>

                    {/* Criar Grupo */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Criar Novo Grupo</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nome do grupo (ex: Família Silva)"
                            placeholderTextColor={theme.colors.textMuted}
                            value={groupName}
                            onChangeText={setGroupName}
                        />
                        <TouchableOpacity
                            style={[styles.button, styles.createButton, creating && styles.buttonDisabled]}
                            onPress={handleCreateGroup}
                            disabled={creating}
                        >
                            {creating ? (
                                <ActivityIndicator color={theme.colors.white} />
                            ) : (
                                <>
                                    <Ionicons name="add-circle-outline" size={20} color={theme.colors.white} />
                                    <Text style={styles.buttonText}>Criar Grupo</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Divisor */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OU</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Entrar em Grupo */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Entrar em Grupo Existente</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Código do grupo (6 caracteres)"
                            placeholderTextColor={theme.colors.textMuted}
                            value={joinCode}
                            onChangeText={setJoinCode}
                            autoCapitalize="characters"
                            maxLength={6}
                        />
                        <TouchableOpacity
                            style={[styles.button, styles.joinButton, creating && styles.buttonDisabled]}
                            onPress={handleJoinGroup}
                            disabled={creating}
                        >
                            {creating ? (
                                <ActivityIndicator color={theme.colors.white} />
                            ) : (
                                <>
                                    <Ionicons name="enter-outline" size={20} color={theme.colors.white} />
                                    <Text style={styles.buttonText}>Entrar no Grupo</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Botão de Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color={theme.colors.white} />
                <Text style={styles.logoutButtonText}>Sair da Conta</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
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
});
