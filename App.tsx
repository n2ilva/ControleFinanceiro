import { StatusBar } from 'expo-status-bar';
import Navigation from './src/navigation';
import { AuthProvider } from './src/contexts/AuthContext';
import './src/config/security'; // Proteção contra console
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setupWebAutofillStyles } from './src/config/webAutofill';
import { Platform, StyleSheet, View } from 'react-native';
import { theme } from './src/theme';

setupWebAutofillStyles();

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.rootContainer}>
        <AuthProvider>
          <View style={styles.appContainer}>
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
  },
  appContainer: {
    flex: 1,
    width: Platform.OS === 'web' ? '60%' : '100%',
    alignSelf: Platform.OS === 'web' ? 'center' : 'auto',
  },
});
