import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

type FirebaseRuntimeConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
};

const constantsWithManifest = Constants as typeof Constants & {
  manifest?: { extra?: { firebase?: FirebaseRuntimeConfig } };
  manifest2?: { extra?: { expoClient?: { extra?: { firebase?: FirebaseRuntimeConfig } } } };
};

const extraFirebaseConfig =
  (Constants.expoConfig?.extra?.firebase as FirebaseRuntimeConfig | undefined) ||
  constantsWithManifest.manifest?.extra?.firebase ||
  constantsWithManifest.manifest2?.extra?.expoClient?.extra?.firebase ||
  {};

// Fallback final para evitar quebra de inicialização quando env/manifest não carregam
const projectFallbackConfig: FirebaseRuntimeConfig = {
  apiKey: 'AIzaSyA1Ki7azHJIWYe_XSnhuZg4Q11QX9cL640',
  authDomain: 'controle-financeiro-6ba4b.firebaseapp.com',
  projectId: 'controle-financeiro-6ba4b',
  storageBucket: 'controle-financeiro-6ba4b.firebasestorage.app',
  messagingSenderId: '1016960353822',
  appId: '1:1016960353822:android:4d5e3527d05343a48c100f',
};

// Configuração do Firebase com prioridade para variáveis de ambiente,
// e fallback para app.json (expo.extra.firebase)
const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    extraFirebaseConfig.apiKey ||
    projectFallbackConfig.apiKey,
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    extraFirebaseConfig.authDomain ||
    projectFallbackConfig.authDomain,
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    extraFirebaseConfig.projectId ||
    projectFallbackConfig.projectId,
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    extraFirebaseConfig.storageBucket ||
    projectFallbackConfig.storageBucket,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    extraFirebaseConfig.messagingSenderId ||
    projectFallbackConfig.messagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || extraFirebaseConfig.appId || projectFallbackConfig.appId,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || extraFirebaseConfig.measurementId,
};

// Validação para garantir que as variáveis de ambiente foram carregadas
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase config missing! Configure EXPO_PUBLIC_FIREBASE_* ou expo.extra.firebase no app.json');
  throw new Error('Firebase configuration is missing. Configure EXPO_PUBLIC_FIREBASE_* or expo.extra.firebase in app.json.');
}

let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  
  // Usar persistência diferente para web e mobile
  if (Platform.OS === 'web') {
    // Para web, usar a autenticação padrão
    auth = getAuth(app);
  } else {
    // Para mobile, usar AsyncStorage
    // @ts-ignore
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} else {
  app = getApp();
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);

export default app;
