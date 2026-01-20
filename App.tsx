import { StatusBar } from 'expo-status-bar';
import Navigation from './src/navigation';
import { AuthProvider } from './src/contexts/AuthContext';
import './src/config/security'; // Proteção contra console
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navigation />
        <StatusBar style="light" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
