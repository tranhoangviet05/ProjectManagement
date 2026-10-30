import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyA51XmvcPlcvl9aTkVjN5PE__xuEoFzgME",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "socialtravelbooking.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "socialtravelbooking",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "socialtravelbooking.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "381847101639",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:381847101639:web:fad4a94c294b2b6e075ee2",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XSNZ6G8B7H",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export default app;
