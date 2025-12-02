// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPQBoOhNWSqUMEcawIF9U7zExUYe_oe1g",
  authDomain: "lokmat-app.firebaseapp.com",
  projectId: "lokmat-app",
  storageBucket: "lokmat-app.firebasestorage.app",
  messagingSenderId: "253512412538",
  appId: "1:253512412538:web:25c4448943cf369a5d7ac3",
  measurementId: "G-L94FN8GW2D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
