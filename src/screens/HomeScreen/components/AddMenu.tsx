import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';
import { AddTransactionModal } from './AddTransactionModal';

interface AddMenuProps {
    bottomInset: number;
    month: number;
    year: number;
    onTransactionAdded: () => void;
}

export function AddMenu({ bottomInset, month, year, onTransactionAdded }: AddMenuProps) {
    const [menuVisible, setMenuVisible] = useState(false);
    const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
    const [formVisible, setFormVisible] = useState(false);

    const fabBottom = bottomInset + 20;

    const openForm = (type: 'expense' | 'income') => {
        setMenuVisible(false);
        setTransactionType(type);
        setFormVisible(true);
    };

    return (
        <>
            {/* FAB Button */}
            <TouchableOpacity
                style={[styles.fab, { bottom: fabBottom }]}
                onPress={() => setMenuVisible(true)}
            >
                <Ionicons name="add" size={28} color={theme.colors.white} />
            </TouchableOpacity>

            {/* Modal Menu - Escolha de tipo */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
                    <View style={[styles.menuContainer, { paddingBottom: 20 + bottomInset }]}>
                        <Text style={styles.menuTitle}>Adicionar</Text>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => openForm('expense')}
                        >
                            <Ionicons name="arrow-up-circle" size={20} color={theme.colors.danger} />
                            <Text style={styles.menuItemText}>Despesa</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => openForm('income')}
                        >
                            <Ionicons name="arrow-down-circle" size={20} color={theme.colors.success} />
                            <Text style={styles.menuItemText}>Receita</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            {/* Modal de formulário */}
            <AddTransactionModal
                visible={formVisible}
                type={transactionType}
                month={month}
                year={year}
                onClose={() => setFormVisible(false)}
                onSuccess={onTransactionAdded}
            />
        </>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: theme.spacing.md,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.lg,
    },
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    menuContainer: {
        backgroundColor: theme.colors.backgroundCard,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        padding: theme.spacing.md,
    },
    menuTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        gap: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.xs,
    },
    menuItemText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
    },
});
