import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    Share,
    FlatList,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GroupService } from '../../services/groupService';
import { useAuth } from '../../contexts/AuthContext';
import { Group } from '../../types';
import { theme } from '../../theme';
import styles from './styles';

interface MemberProfile {
    id: string;
    email: string;
    displayName: string;
}

export default function GroupScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<Group[]>([]);
    const [activeGroup, setActiveGroup] = useState<Group | null>(null);
    const [groupName, setGroupName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [creating, setCreating] = useState(false);

    // Estados para gerenciamento de membros
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [memberProfiles, setMemberProfiles] = useState<MemberProfile[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);

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

    const loadMemberProfiles = async (group: Group) => {
        setLoadingMembers(true);
        try {
            const profiles = await GroupService.getMemberProfiles(group.members);
            setMemberProfiles(profiles);
        } catch (error) {
            console.error('Error loading member profiles:', error);
            setMemberProfiles([]);
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleOpenMembersModal = async (group: Group) => {
        setSelectedGroup(group);
        setShowMembersModal(true);
        await loadMemberProfiles(group);
    };

    const handleRemoveMember = (member: MemberProfile) => {
        if (!selectedGroup) return;

        Alert.alert(
            'Remover Membro',
            `Tem certeza que deseja remover ${member.displayName || member.email} do grupo?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await GroupService.removeMember(selectedGroup.id, member.id);
                            Alert.alert('Sucesso', 'Membro removido do grupo');
                            // Recarregar membros e grupos
                            await loadMemberProfiles(selectedGroup);
                            await loadGroups();
                            // Atualizar selectedGroup com dados atualizados
                            const updatedGroups = await GroupService.getUserGroups();
                            const updatedGroup = updatedGroups.find(g => g.id === selectedGroup.id);
                            if (updatedGroup) {
                                setSelectedGroup(updatedGroup);
                            }
                        } catch (error: any) {
                            Alert.alert('Erro', error.message || 'Não foi possível remover o membro');
                        }
                    },
                },
            ]
        );
    };

    const handleRegenerateCode = () => {
        if (!selectedGroup) return;

        Alert.alert(
            'Alterar Código',
            'Ao alterar o código, o código antigo não funcionará mais. Deseja continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Alterar',
                    onPress: async () => {
                        try {
                            const newCode = await GroupService.regenerateGroupCode(selectedGroup.id);
                            Alert.alert('Sucesso', `Novo código: ${newCode}`);
                            // Atualizar grupo selecionado com novo código
                            setSelectedGroup({ ...selectedGroup, code: newCode });
                            await loadGroups();
                        } catch (error: any) {
                            Alert.alert('Erro', error.message || 'Não foi possível alterar o código');
                        }
                    },
                },
            ]
        );
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
                <View style={styles.groupCardContent}>
                    <View style={styles.groupCardHeader}>
                        <View style={[styles.groupIconContainer, isActive && styles.groupIconContainerActive]}>
                            <Ionicons
                                name="people"
                                size={24}
                                color={isActive ? theme.colors.primary : theme.colors.textSecondary}
                            />
                        </View>
                        <View style={styles.groupCardInfo}>
                            <View style={styles.groupCardTitleRow}>
                                <Text style={[styles.groupCardName, isActive && styles.groupCardNameActive]} numberOfLines={1}>
                                    {item.name}
                                </Text>
                                {isActive && (
                                    <View style={styles.activeBadge}>
                                        <Text style={styles.activeBadgeText}>Ativo</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.groupCardMeta}>
                                <View style={styles.groupCardMetaItem}>
                                    <Ionicons name="key-outline" size={14} color={theme.colors.textMuted} />
                                    <Text style={styles.groupCardCode}>{item.code}</Text>
                                </View>
                                <View style={styles.groupCardMetaItem}>
                                    <Ionicons name="person-outline" size={14} color={theme.colors.textMuted} />
                                    <Text style={styles.groupCardMembers}>
                                        {item.members.length} {item.members.length === 1 ? 'membro' : 'membros'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.groupCardActions}>
                    <TouchableOpacity
                        style={styles.groupCardAction}
                        onPress={() => handleOpenMembersModal(item)}
                    >
                        <Ionicons name="settings-outline" size={18} color={theme.colors.textSecondary} />
                        <Text style={styles.groupCardActionText}>Gerenciar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.groupCardAction}
                        onPress={() => handleShareCode(item)}
                    >
                        <Ionicons name="share-outline" size={18} color={theme.colors.textSecondary} />
                        <Text style={styles.groupCardActionText}>Compartilhar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.groupCardAction, styles.groupCardActionLast]}
                        onPress={() => handleLeaveGroup(item)}
                    >
                        <Ionicons name="exit-outline" size={18} color={theme.colors.danger} />
                        <Text style={[styles.groupCardActionText, styles.groupCardActionTextDanger]}>Sair</Text>
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
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 80 + insets.bottom }]}>
                {/* Header do Usuário */}
                <View style={styles.userHeader}>
                    <View style={styles.userHeaderContent}>
                        <View style={styles.userAvatar}>
                            <Ionicons name="person" size={28} color={theme.colors.white} />
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName} numberOfLines={1}>
                                {user?.displayName || 'Usuário'}
                            </Text>
                            <Text style={styles.userEmail} numberOfLines={1}>
                                {user?.email}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.logoutIconButton} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={22} color={theme.colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                {groups.length > 0 ? (
                    <>
                        {/* Grupos do Usuário */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Meus Grupos</Text>
                            </View>
                            <Text style={styles.sectionHint}>
                                Toque em um grupo para ativá-lo
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
                            <Text style={styles.addGroupSectionTitle}>Adicionar Grupo</Text>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Criar novo grupo</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nome do grupo"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={groupName}
                                    onChangeText={setGroupName}
                                />
                            </View>
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
                                <Text style={styles.dividerText}>ou</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Entrar em grupo existente</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Código do grupo"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={joinCode}
                                    onChangeText={setJoinCode}
                                    autoCapitalize="characters"
                                    maxLength={6}
                                />
                            </View>
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
                            <Text style={styles.welcomeTitle}>Compartilhamento</Text>
                            <Text style={styles.welcomeText}>
                                Crie um grupo ou entre em um existente para compartilhar suas finanças com outras pessoas.
                            </Text>
                        </View>

                        {/* Criar Grupo */}
                        <View style={styles.addGroupSection}>
                            <Text style={styles.addGroupSectionTitle}>Criar Novo Grupo</Text>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Nome do grupo</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: Família Silva"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={groupName}
                                    onChangeText={setGroupName}
                                />
                            </View>
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

                            {/* Divisor */}
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>ou</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Entrar em Grupo */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Entrar em grupo existente</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Código (6 caracteres)"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={joinCode}
                                    onChangeText={setJoinCode}
                                    autoCapitalize="characters"
                                    maxLength={6}
                                />
                            </View>
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

                        {/* Botão de Logout para quando não tem grupos */}
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
                            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Modal de Gerenciamento de Membros */}
            <Modal
                visible={showMembersModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowMembersModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {selectedGroup?.name}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowMembersModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Código do Grupo */}
                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Código do Grupo</Text>
                            <View style={styles.codeContainer}>
                                <View style={styles.codeRow}>
                                    <Text style={styles.codeText}>{selectedGroup?.code}</Text>
                                    {user?.uid === selectedGroup?.ownerId && (
                                        <TouchableOpacity
                                            style={styles.regenerateButton}
                                            onPress={handleRegenerateCode}
                                        >
                                            <Ionicons name="refresh" size={18} color={theme.colors.white} />
                                            <Text style={styles.regenerateButtonText}>Alterar</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* Lista de Membros */}
                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>
                                Membros ({selectedGroup?.members.length || 0})
                            </Text>

                            {loadingMembers ? (
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                            ) : (
                                <FlatList
                                    data={memberProfiles}
                                    keyExtractor={(item) => item.id}
                                    scrollEnabled={false}
                                    renderItem={({ item: member }) => {
                                        const isOwner = member.id === selectedGroup?.ownerId;
                                        const isCurrentUser = member.id === user?.uid;
                                        const canRemove = user?.uid === selectedGroup?.ownerId && !isOwner;

                                        return (
                                            <View style={styles.memberItem}>
                                                <View style={styles.memberInfo}>
                                                    <View style={[styles.memberAvatar, isOwner && styles.memberAvatarOwner]}>
                                                        <Ionicons
                                                            name={isOwner ? "star" : "person"}
                                                            size={18}
                                                            color={isOwner ? theme.colors.warning : theme.colors.textSecondary}
                                                        />
                                                    </View>
                                                    <View style={styles.memberTextContainer}>
                                                        <Text style={styles.memberName}>
                                                            {member.displayName || member.email.split('@')[0]}
                                                            {isCurrentUser && ' (você)'}
                                                        </Text>
                                                        <Text style={styles.memberEmail}>{member.email}</Text>
                                                        {isOwner && (
                                                            <Text style={styles.ownerBadge}>Administrador</Text>
                                                        )}
                                                    </View>
                                                </View>
                                                {canRemove && (
                                                    <TouchableOpacity
                                                        style={styles.removeMemberButton}
                                                        onPress={() => handleRemoveMember(member)}
                                                    >
                                                        <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        );
                                    }}
                                    ListEmptyComponent={
                                        <Text style={styles.emptyMembersText}>Nenhum membro encontrado</Text>
                                    }
                                />
                            )}
                        </View>

                        {/* Botão Fechar */}
                        <TouchableOpacity
                            style={styles.modalCloseBottomButton}
                            onPress={() => setShowMembersModal(false)}
                        >
                            <Text style={styles.modalCloseBottomButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
