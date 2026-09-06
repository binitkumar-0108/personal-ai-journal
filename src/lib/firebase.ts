import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Default public web app configuration for project-9de0e9d1-3b4e-44bb-91c.
// Firebase web client configurations (API keys, project IDs) are public client identifiers
// and safe for frontend distribution. Environment variables (VITE_*) override these when provided.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBCyoilDzJY8J3kbzWwDfNBcjwxfy4mBrU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "project-9de0e9d1-3b4e-44bb-91c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "project-9de0e9d1-3b4e-44bb-91c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "project-9de0e9d1-3b4e-44bb-91c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "204807482912",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:204807482912:web:eb4a00709ea897f61d1645",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);