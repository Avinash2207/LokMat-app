import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyD0d8Z8Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z", // ← we’ll replace this in 2 minutes
  authDomain: "lokmat-2025.firebaseapp.com",
  projectId: "lokmat-2025",
  storageBucket: "lokmat-2025.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
