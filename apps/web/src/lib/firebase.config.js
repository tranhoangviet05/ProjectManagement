// ============================================================
// FIREBASE CONFIGURATION - web
// ============================================================
// Giá trị được đọc từ apps/web/.env (các biến bắt đầu bằng VITE_FIREBASE_)
// Lấy từ: Firebase Console -> Project Settings -> Your apps -> Web app
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Khởi tạo Firebase Auth
const auth = getAuth(app);

// Khởi tạo Firestore
const db = getFirestore(app);

export { app, auth, db, analytics };
