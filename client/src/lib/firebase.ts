import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Use environment variables for Firebase config when available
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAAGc4incl4ZYr28mfy2VgRtSphXJWMvlg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "note-taker-1a709.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "note-taker-1a709",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "note-taker-1a709.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "930469178778",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:930469178778:web:b0e7835293859a26abde23",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5L85PW948C"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
