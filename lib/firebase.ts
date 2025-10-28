import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCOpHt4w4OYIEaqdLyRycuOTr3nSbtd02k",
  authDomain: "adg-app-2ead0.firebaseapp.com",
  projectId: "adg-app-2ead0",
  storageBucket: "adg-app-2ead0.firebasestorage.app",
  messagingSenderId: "583158452743",
  appId: "1:583158452743:web:a39554695f3fc7ca6110a2",
  measurementId: "G-QZ6HMXK5PZ"
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
