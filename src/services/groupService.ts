import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  Timestamp,
  arrayUnion,
  arrayRemove,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Group, UserProfile } from '../types';
import { AuthService } from './authService';

export const GroupService = {
  // Gerar código único de 6 dígitos
  generateGroupCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  },

  // Criar novo grupo
  async createGroup(name: string): Promise<Group> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const code = this.generateGroupCode();
      
      const groupData = {
        name,
        code,
        ownerId: user.uid,
        members: [user.uid],
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'groups'), groupData);
      
      // Adicionar grupo ao perfil do usuário
      await this.addGroupToUser(user.uid, docRef.id);

      return {
        id: docRef.id,
        ...groupData,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  // Entrar em grupo usando código
  async joinGroup(code: string): Promise<Group> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar grupo pelo código
      const q = query(collection(db, 'groups'), where('code', '==', code.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Código inválido. Grupo não encontrado.');
      }

      const groupDoc = querySnapshot.docs[0];
      const groupData = groupDoc.data();

      // Verificar se já é membro
      if (groupData.members.includes(user.uid)) {
        throw new Error('Você já é membro deste grupo');
      }

      // Adicionar usuário ao grupo
      await updateDoc(doc(db, 'groups', groupDoc.id), {
        members: arrayUnion(user.uid),
      });

      // Adicionar grupo ao perfil do usuário
      await this.addGroupToUser(user.uid, groupDoc.id);

      return {
        id: groupDoc.id,
        name: groupData.name,
        code: groupData.code,
        ownerId: groupData.ownerId,
        members: [...groupData.members, user.uid],
        createdAt: groupData.createdAt.toDate().toISOString(),
      };
    } catch (error: any) {
      console.error('Error joining group:', error);
      throw error;
    }
  },

  // Adicionar grupo ao usuário
  async addGroupToUser(userId: string, groupId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const groupIds = data.groupIds || [];
        
        // Adicionar grupo se não existir
        if (!groupIds.includes(groupId)) {
          await updateDoc(userRef, {
            groupIds: arrayUnion(groupId),
            activeGroupId: groupId, // Tornar o novo grupo ativo
          });
        }
      } else {
        // Criar perfil se não existir
        const user = AuthService.getCurrentUser();
        await setDoc(userRef, {
          id: userId,
          email: user?.email || '',
          displayName: user?.displayName || '',
          groupIds: [groupId],
          activeGroupId: groupId,
          createdAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Error adding group to user:', error);
      throw error;
    }
  },

  // Obter todos os grupos do usuário
  async getUserGroups(): Promise<Group[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return [];

      const profile = await this.getUserProfile(user.uid);
      if (!profile?.groupIds || profile.groupIds.length === 0) return [];

      const groups: Group[] = [];
      
      for (const groupId of profile.groupIds) {
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (groupDoc.exists()) {
          const data = groupDoc.data();
          groups.push({
            id: groupDoc.id,
            name: data.name,
            code: data.code,
            ownerId: data.ownerId,
            members: data.members,
            createdAt: data.createdAt.toDate().toISOString(),
          });
        }
      }

      return groups;
    } catch (error) {
      console.error('Error getting user groups:', error);
      return [];
    }
  },

  // Obter grupo ativo do usuário (alias para compatibilidade)
  async getUserGroup(): Promise<Group | null> {
    return this.getActiveGroup();
  },

  // Obter grupo ativo do usuário
  async getActiveGroup(): Promise<Group | null> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return null;

      const profile = await this.getUserProfile(user.uid);
      if (!profile?.activeGroupId) return null;

      const groupDoc = await getDoc(doc(db, 'groups', profile.activeGroupId));
      if (!groupDoc.exists()) return null;

      const data = groupDoc.data();
      return {
        id: groupDoc.id,
        name: data.name,
        code: data.code,
        ownerId: data.ownerId,
        members: data.members,
        createdAt: data.createdAt.toDate().toISOString(),
      };
    } catch (error) {
      console.error('Error getting active group:', error);
      return null;
    }
  },

  // Alternar grupo ativo
  async switchActiveGroup(groupId: string): Promise<void> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const profile = await this.getUserProfile(user.uid);
      if (!profile?.groupIds.includes(groupId)) {
        throw new Error('Você não é membro deste grupo');
      }

      await updateDoc(doc(db, 'users', user.uid), {
        activeGroupId: groupId,
      });
    } catch (error) {
      console.error('Error switching active group:', error);
      throw error;
    }
  },

  // Sair do grupo
  async leaveGroup(groupId: string): Promise<void> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Remover do grupo
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (groupDoc.exists()) {
        await updateDoc(groupRef, {
          members: arrayRemove(user.uid),
        });
      }

      // Remover do perfil do usuário
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const groupIds = (data.groupIds || []).filter((id: string) => id !== groupId);
        
        const updates: any = {
          groupIds: groupIds,
        };

        // Se era o grupo ativo, mudar para outro ou remover
        if (data.activeGroupId === groupId) {
          updates.activeGroupId = groupIds.length > 0 ? groupIds[0] : null;
        }

        await updateDoc(userRef, updates);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  },

  // Obter perfil do usuário
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;

      const data = userDoc.data();
      return {
        id: userDoc.id,
        email: data.email,
        displayName: data.displayName,
        groupIds: data.groupIds || [],
        activeGroupId: data.activeGroupId,
        createdAt: data.createdAt.toDate().toISOString(),
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  // Obter ID do grupo ativo do usuário atual
  async getActiveGroupId(): Promise<string | null> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return null;

      const profile = await this.getUserProfile(user.uid);
      return profile?.activeGroupId || null;
    } catch (error) {
      return null;
    }
  },

  // Remover membro do grupo (apenas o dono pode fazer isso)
  async removeMember(groupId: string, memberId: string): Promise<void> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se é o dono do grupo
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error('Grupo não encontrado');
      }

      const groupData = groupDoc.data();
      if (groupData.ownerId !== user.uid) {
        throw new Error('Apenas o dono do grupo pode remover membros');
      }

      // Não pode remover a si mesmo (dono)
      if (memberId === user.uid) {
        throw new Error('O dono não pode ser removido do grupo');
      }

      // Remover membro do grupo
      await updateDoc(groupRef, {
        members: arrayRemove(memberId),
      });

      // Remover grupo do perfil do membro removido
      const memberRef = doc(db, 'users', memberId);
      const memberDoc = await getDoc(memberRef);

      if (memberDoc.exists()) {
        const memberData = memberDoc.data();
        const memberGroupIds = (memberData.groupIds || []).filter((id: string) => id !== groupId);

        const updates: any = {
          groupIds: memberGroupIds,
        };

        // Se era o grupo ativo do membro, mudar para outro ou remover
        if (memberData.activeGroupId === groupId) {
          updates.activeGroupId = memberGroupIds.length > 0 ? memberGroupIds[0] : null;
        }

        await updateDoc(memberRef, updates);
      }
    } catch (error: any) {
      console.error('Error removing member:', error);
      throw error;
    }
  },

  // Regenerar código do grupo (apenas o dono pode fazer isso)
  async regenerateGroupCode(groupId: string): Promise<string> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se é o dono do grupo
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error('Grupo não encontrado');
      }

      const groupData = groupDoc.data();
      if (groupData.ownerId !== user.uid) {
        throw new Error('Apenas o dono do grupo pode alterar o código');
      }

      // Gerar novo código
      const newCode = this.generateGroupCode();

      // Atualizar no Firestore
      await updateDoc(groupRef, {
        code: newCode,
      });

      return newCode;
    } catch (error: any) {
      console.error('Error regenerating group code:', error);
      throw error;
    }
  },

  // Obter perfis dos membros do grupo
  async getMemberProfiles(memberIds: string[]): Promise<{ id: string; email: string; displayName: string }[]> {
    try {
      const profiles: { id: string; email: string; displayName: string }[] = [];

      for (const memberId of memberIds) {
        const profile = await this.getUserProfile(memberId);
        if (profile) {
          profiles.push({
            id: profile.id,
            email: profile.email || '',
            displayName: profile.displayName || profile.email || 'Usuário',
          });
        } else {
          // Usuário sem perfil completo
          profiles.push({
            id: memberId,
            email: '',
            displayName: 'Usuário',
          });
        }
      }

      return profiles;
    } catch (error) {
      console.error('Error getting member profiles:', error);
      return [];
    }
  },

  // Verificar se o usuário atual é dono do grupo
  async isGroupOwner(groupId: string): Promise<boolean> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return false;

      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (!groupDoc.exists()) return false;

      return groupDoc.data().ownerId === user.uid;
    } catch (error) {
      return false;
    }
  },
};
