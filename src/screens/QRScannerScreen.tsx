import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { NfService } from '../services/nfService';

export default function QRScannerScreen({ navigation }: any) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!permission) {
        // Carregando permissões
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, styles.permissionContainer]}>
                <Ionicons name="videocam-off" size={64} color={theme.colors.textMuted} />
                <Text style={styles.message}>Precisamos da sua permissão para acessar a câmera e ler o QR Code da nota fiscal.</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Conceder Permissão</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = async ({ type, data }: any) => {
        if (scanned || loading) return;
        setScanned(true);
        setLoading(true);

        try {
            // Validação básica simples
            if (!data || !data.includes('http')) {
                Alert.alert('Código Inválido', 'O código lido não parece ser uma URL válida.', [
                    { text: 'Tentar Novamente', onPress: () => { setScanned(false); setLoading(false); } }
                ]);
                return;
            }

            // Chama serviço
            Alert.alert('Nota Detectada', 'Consultando dados na API Infosimples...', [{ text: 'Aguarde...', onPress: () => { } }]);

            const nfData = await NfService.fetchNfData(data);

            // Retorna para a tela interior passando os dados
            // Navegação deve ser feita após o await
            navigation.navigate('AddTransaction', { nfData });

        } catch (error) {
            Alert.alert('Erro', 'Falha ao processar QR Code', [
                { text: 'Tentar Novamente', onPress: () => { setScanned(false); setLoading(false); } }
            ]);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />

            <View style={[styles.overlay, StyleSheet.absoluteFill]}>
                <View style={styles.headerOverlay}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="close-circle" size={48} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.scanAreaContainer}>
                    <View style={styles.scanArea}>
                        <View style={[styles.corner, styles.tl]} />
                        <View style={[styles.corner, styles.tr]} />
                        <View style={[styles.corner, styles.bl]} />
                        <View style={[styles.corner, styles.br]} />
                    </View>
                    <Text style={styles.instructionText}>Aponte o código QR da NF-e para a área acima</Text>
                </View>

                <View style={styles.footerOverlay} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    permissionContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
    },
    message: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: theme.fontSize.lg,
        marginVertical: theme.spacing.lg,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        width: '100%',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: theme.fontSize.md,
    },
    cancelButton: {
        padding: theme.spacing.md,
    },
    cancelButtonText: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.md,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'space-between',
    },
    headerOverlay: {
        paddingTop: 50,
        paddingHorizontal: 20,
        alignItems: 'flex-end',
    },
    closeButton: {
        padding: 8,
    },
    scanAreaContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanArea: {
        width: 250,
        height: 250,
        borderWidth: 0,
        borderColor: 'transparent',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: theme.colors.primary,
        borderWidth: 4,
    },
    tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
    instructionText: {
        color: 'white',
        marginTop: 20,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    footerOverlay: {
        height: 100,
    }
});
