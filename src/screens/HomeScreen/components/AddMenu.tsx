import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';

interface AddMenuProps {
    bottomInset: number;
    onAddExpense: () => void;
    onAddIncome: () => void;
}

export function AddMenu({ bottomInset, onAddExpense, onAddIncome }: AddMenuProps) {
    const [menuVisible, setMenuVisible] = useState(false);

    // 60 = altura do tab bar, 2 = gap
    const fabBottom = bottomInset + 5;

    return (
        <>
            {/* FAB Button */}
            <TouchableOpacity
                style={[styles.fab, { bottom: fabBottom }]}
                onPress={() => setMenuVisible(true)}
            >
                <Ionicons name="add" size={32} color={theme.colors.white} />
            </TouchableOpacity>

            {/* Modal Menu */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
                    <View style={[styles.menuContainer, { paddingBottom: 20 + bottomInset }]}>
                        <Text style={styles.menuTitle}>Adicionar</Text>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setMenuVisible(false);
                                onAddExpense();
                            }}
                        >
                            <Ionicons name="arrow-up-circle" size={20} color={theme.colors.danger} />
                            <Text style={styles.menuItemText}>Despesas</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setMenuVisible(false);
                                onAddIncome();
                            }}
                        >
                            <Ionicons name="arrow-down-circle" size={20} color={theme.colors.success} />
                            <Text style={styles.menuItemText}>Receitas</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: 20,
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
