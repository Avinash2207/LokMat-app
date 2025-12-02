import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDPQBoOhNWSqUMEcawIF9U7zExUYe_oe1g",
  authDomain: "lokmat-app.firebaseapp.com",
  projectId: "lokmat-app",
  storageBucket: "lokmat-app.firebasestorage.app",
  messagingSenderId: "253512412538",
  appId: "1:253512412538:web:25c4448943cf369a5d7ac3"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
