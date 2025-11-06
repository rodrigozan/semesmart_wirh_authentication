// Import the functions you need from the SDKs you need
// Fix: Separated the FirebaseApp type import to potentially resolve module resolution issues.
import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// TODO: Add your own Firebase configuration from your project settings
const firebaseConfig = {
  apiKey: "AIzaSyDWRbtZs5CT5EFbUJ7_JqX3OlqASCjZFt0",
  authDomain: "semesmart-b51d3.firebaseapp.com",
  projectId: "semesmart-b51d3",
  storageBucket: "semesmart-b51d3.firebasestorage.app",
  messagingSenderId: "105358128593",
  appId: "1:105358128593:web:8b4b1d93841ca6f39e1cf0",
  measurementId: "G-680B90R2P3"
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Only initialize if the config isn't using placeholder values.
// This prevents the app from crashing on load if Firebase isn't configured.
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  console.warn("Firebase config is not set. Please update firebaseConfig.ts with your project credentials.");
}


export { app, auth, db };
