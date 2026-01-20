import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA1Ki7azHJIWYe_XSnhuZg4Q11QX9cL640",
  authDomain: "controle-financeiro-6ba4b.firebaseapp.com",
  projectId: "controle-financeiro-6ba4b",
  storageBucket: "controle-financeiro-6ba4b.firebasestorage.app",
  messagingSenderId: "1016960353822",
  appId: "1:1016960353822:android:4d5e3527d05343a48c100f"
};

let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // @ts-ignore
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} else {
  app = getApp();
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);

export default app;
