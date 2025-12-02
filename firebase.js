import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPQBoOhNWSqUMEcawIF9U7zExUYe_oe1g",
  authDomain: "lokmat-app.firebaseapp.com",
  projectId: "lokmat-app",
  storageBucket: "lokmat-app.firebasestorage.app",
  messagingSenderId: "253512412538",
  appId: "1:253512412538:web:25c4448943cf369a5d7ac3",
  measurementId: "G-L94FN8GW2D"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
