// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSG82jHn3MnXUnpiUZGFLNld7-5Z0GPfo",
  authDomain: "travel-planner-1b496.firebaseapp.com",
  projectId: "travel-planner-1b496",
  storageBucket: "travel-planner-1b496.firebasestorage.app",
  messagingSenderId: "984411209523",
  appId: "1:984411209523:web:1aab48fbe36152a26a8846",
  measurementId: "G-0Q98H6SGSX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);