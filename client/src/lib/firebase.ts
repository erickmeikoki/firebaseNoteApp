import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAAGc4incl4ZYr28mfy2VgRtSphXJWMvlg",
  authDomain: "note-taker-1a709.firebaseapp.com",
  projectId: "note-taker-1a709",
  storageBucket: "note-taker-1a709.firebasestorage.app",
  messagingSenderId: "930469178778",
  appId: "1:930469178778:web:b0e7835293859a26abde23",
  measurementId: "G-5L85PW948C"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
