// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chatapp-418c4.firebaseapp.com",
  projectId: "chatapp-418c4",
  storageBucket: "chatapp-418c4.appspot.com",
  messagingSenderId: "255735531631",
  appId: "1:255735531631:web:7cc1e69b2d7b6c7338259a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()