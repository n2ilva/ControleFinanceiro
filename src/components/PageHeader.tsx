import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface PageHeaderProps {
    title: string;
    onGroupPress?: () => void;
}

export function PageHeader({ title, onGroupPress }: PageHeaderProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {onGroupPress && (
                <TouchableOpacity onPress={onGroupPress} style={styles.iconButton}>
                    <Ionicons name="people" size={22} color={theme.colors.text} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        paddingVertical: 5,
        marginBottom: 5,
    },
    title: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    iconButton: {
        padding: 5,
    },
});
