import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';
import { NfService } from '../../services/nfService';

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
                <Ionicons name="videocam-off" size={64} color={styles.message.color} />
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
            navigation.navigate('AddExpense', { nfData });

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
