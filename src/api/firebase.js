// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCSPAcB5VHg9JD7N3jNeQTKw2wAfQVfyTQ",
  authDomain: "todogamequest.firebaseapp.com",
  projectId: "todogamequest",
  storageBucket: "todogamequest.appspot.com",
  messagingSenderId: "891925699820",
  appId: "1:891925699820:web:baddeb6b67a345798259c9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Export Firebase services
export { auth, firestore, googleProvider, signInWithPopup };