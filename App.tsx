import { StatusBar } from 'expo-status-bar';
import Navigation from './src/navigation';
import { AuthProvider } from './src/contexts/AuthContext';
import './src/config/security'; // Proteção contra console
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setupWebAutofillStyles } from './src/config/webAutofill';
import { Platform, StyleSheet, View } from 'react-native';
import { theme } from './src/theme';
import { useResponsive } from './src/hooks/useResponsive';

setupWebAutofillStyles();

export default function App() {
  const { containerStyle } = useResponsive();

  return (
    <SafeAreaProvider>
      <View style={styles.rootContainer}>
        <AuthProvider>
          <View style={[styles.appContainer, containerStyle]}>
            <Navigation />
          </View>
          <StatusBar style="light" />
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    ...(Platform.OS === 'web' ? { height: '100vh' as any, overflow: 'hidden' as any } : {}),
  },
  appContainer: {
    flex: 1,
  },
});
