import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CreditCardFirestoreService } from '../services/creditCardFirestoreService';
import { theme } from '../theme';

interface AddCardBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onCardAdded?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AddCardBottomSheet({ visible, onClose, onCardAdded }: AddCardBottomSheetProps) {
    const [name, setName] = useState('');
    const [dueDay, setDueDay] = useState('');
    const [cardType, setCardType] = useState<'debit' | 'credit'>('credit');
    const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

    React.useEffect(() => {
        if (visible) {
            // Reset fields when opening
            setName('');
            setDueDay('');
            setCardType('credit');
            
            // Animate in
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            // Animate out
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Erro', 'Por favor, insira o nome do cartão');
            return;
        }

        const parsedDay = parseInt(dueDay, 10);
        if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) {
            Alert.alert('Erro', 'Dia de vencimento deve ser entre 1 e 31');
            return;
        }

        try {
            await CreditCardFirestoreService.addCreditCard({
                name: name.trim(),
                dueDay: parsedDay,
                cardType,
                createdAt: new Date().toISOString(),
            });

            Alert.alert('Sucesso', 'Cartão adicionado com sucesso!');
            onCardAdded?.();
            onClose();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível adicionar o cartão');
        }
    };

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent={true}
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.bottomSheet,
                                {
                                    transform: [{ translateY: slideAnim }],
                                },
                            ]}
                        >
                            <View style={styles.handle} />
                            
                            <View style={styles.header}>
                                <Text style={styles.title}>Novo Cartão</Text>
                                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color={theme.colors.text} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.content}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Nome do Cartão</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ex: Nubank"
                                        placeholderTextColor={theme.colors.textMuted}
                                        value={name}
                                        onChangeText={setName}
                                        autoFocus
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Dia de Vencimento</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ex: 10"
                                        placeholderTextColor={theme.colors.textMuted}
                                        value={dueDay}
                                        onChangeText={setDueDay}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Tipo</Text>
                                    <View style={styles.typeSelector}>
                                        <TouchableOpacity
                                            style={[
                                                styles.typeButton,
                                                cardType === 'credit' && styles.typeButtonActive,
                                            ]}
                                            onPress={() => setCardType('credit')}
                                        >
                                            <Ionicons
                                                name="card"
                                                size={20}
                                                color={cardType === 'credit' ? theme.colors.white : theme.colors.primary}
                                            />
                                            <Text
                                                style={[
                                                    styles.typeButtonText,
                                                    cardType === 'credit' && styles.typeButtonTextActive,
                                                ]}
                                            >
                                                Crédito
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.typeButton,
                                                cardType === 'debit' && styles.typeButtonActive,
                                            ]}
                                            onPress={() => setCardType('debit')}
                                        >
                                            <Ionicons
                                                name="card-outline"
                                                size={20}
                                                color={cardType === 'debit' ? theme.colors.white : theme.colors.primary}
                                            />
                                            <Text
                                                style={[
                                                    styles.typeButtonText,
                                                    cardType === 'debit' && styles.typeButtonTextActive,
                                                ]}
                                            >
                                                Débito
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.footer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={handleClose}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.saveButton]}
                                    onPress={handleSave}
                                >
                                    <Text style={styles.saveButtonText}>Salvar</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
        maxHeight: SCREEN_HEIGHT * 0.75,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.colors.text,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text,
        marginBottom: 4,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.background,
    },
    typeButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    typeButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    typeButtonTextActive: {
        color: theme.colors.white,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.white,
    },
});
