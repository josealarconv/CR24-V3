import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA9-BuoaxcyAXjYOEoDpwlUNkcQM65GTDI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cr24-v3.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cr24-v3",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cr24-v3.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "63308624671",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:63308624671:web:fac1ad07a257d5108e362a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TQ2DS06L8R"
};

const isConfigured = Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);

let app = null;
let db = null;
let auth = null;

if (isConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('Firebase Cloud Firestore cr24-v3 conectado correctamente.');
  } catch (e) {
    console.error('Error al inicializar Firebase SDK:', e);
  }
}

export { app, db, auth, isConfigured, firebaseConfig };
