// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZgtADyajUjIGVhs6dWqtOPnGcMHYrEsc",
  authDomain: "paxequestrian-e455d.firebaseapp.com",
  projectId: "paxequestrian-e455d",
  storageBucket: "paxequestrian-e455d.firebasestorage.app",
  messagingSenderId: "1036218277230",
  appId: "1:1036218277230:web:18cb00f2df973e42c5357f",
  measurementId: "G-5FWMQN4GZ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);