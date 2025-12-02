import { initializeApp } from 'firebase/app';
import 'firebase/auth'; // Compat for auth
import 'firebase/firestore'; // Compat for firestore
import * as Location from 'expo-location';
import MapView, { Heatmap } from 'react-native-maps';

const firebaseConfig = {
  apiKey: "AIzaSyDPQBoOhNWSqUMEcawIF9U7zExUYe_oe1g",
  authDomain: "lokmat-app.firebaseapp.com",
  projectId: "lokmat-app",
  storageBucket: "lokmat-app.firebasestorage.app",
  messagingSenderId: "253512412538",
  appId: "1:253512412538:web:25c4448943cf369a5d7ac3"
};

const app = initializeApp(firebaseConfig);
export const auth = app.auth();
export const db = app.firestore();
