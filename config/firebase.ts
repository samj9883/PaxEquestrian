// config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Optional: only import Analytics if you're on web (not needed for React Native)

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAZgtADyajUjIGVhs6dWqtOPnGcMHYrEsc',
  authDomain: 'paxequestrian-e455d.firebaseapp.com',
  projectId: 'paxequestrian-e455d',
  storageBucket: 'paxequestrian-e455d.appspot.com', // FIXED the .app typo here
  messagingSenderId: '1036218277230',
  appId: '1:1036218277230:web:18cb00f2df973e42c5357f',
  measurementId: 'G-5FWMQN4GZ1'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Init services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Optional: Only use Analytics if you're not on React Native
// export const analytics = getAnalytics(app);
