# Firebase Setup Guide for Leather Works App

This guide will walk you through setting up Firebase for the Leather Works React Native application.

## 🔥 Firebase Project Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `leather-works-app` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In your Firebase project, navigate to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Click **Save**

### 3. Create Firestore Database

1. Navigate to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll secure it later)
4. Select your region (choose closest to your users)
5. Click **Done**

### 4. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **Add app** and select **Web** (</>)
4. Register app name: `leather-works-web`
5. Copy the Firebase configuration object

## ⚙️ App Configuration

### 1. Update Firebase Config

Replace the configuration in `config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyExample...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
```

### 2. Create Initial User

Since this is an internal app, you'll need to create the first user manually:

1. Go to **Authentication** > **Users** in Firebase Console
2. Click **Add user**
3. Enter email: `manager@yourcompany.com`
4. Enter password: `SecurePassword123!`
5. Click **Add user**

### 3. Add User Profile to Firestore

1. Go to **Firestore Database**
2. Click **Start collection**
3. Collection ID: `users`
4. Document ID: Use the UID from the user you just created
5. Add these fields:
   ```
   username: "manager"
   role: "admin"
   createdAt: [timestamp] (use current timestamp)
   ```

## 🔒 Security Rules

### Firestore Security Rules

Replace the default rules in **Firestore Database** > **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write all documents
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // More restrictive rules for production:
    // Users can only access their own data and shared collections
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
    
    match /clients/{clientId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Authentication Rules

In **Authentication** > **Settings**:

1. Set **Authorized domains** to include your domain
2. Enable **Email enumeration protection**
3. Set password policy if needed

## 📊 Initial Data Structure

Create these collections in Firestore with sample data:

### Orders Collection

Document ID: Auto-generated
```json
{
  "orderNumber": "LW241201-001",
  "clientId": "sample-client-id",
  "clientName": "Sample Client",
  "dateReceived": "2024-12-01T10:00:00.000Z",
  "description": "Custom leather wallet with embossing",
  "internalCost": 25.00,
  "clientPrice": 85.00,
  "estimatedHours": 4.0,
  "hoursCompleted": 1.5,
  "deadline": "2024-12-15T17:00:00.000Z",
  "status": "started",
  "createdAt": "2024-12-01T10:00:00.000Z",
  "updatedAt": "2024-12-01T10:00:00.000Z"
}
```

### Clients Collection

Document ID: `sample-client-id`
```json
{
  "name": "Sample Client",
  "email": "client@example.com",
  "phone": "(555) 123-4567",
  "address": "123 Main St, Anytown, ST 12345",
  "notes": "Prefers handcrafted items, regular customer",
  "createdAt": "2024-11-01T10:00:00.000Z",
  "updatedAt": "2024-11-01T10:00:00.000Z"
}
```

## 🚀 Testing the Setup

### 1. Test Authentication

1. Run the app: `npm start`
2. Try logging in with the credentials you created
3. You should be redirected to the Orders tab

### 2. Test Database Operations

1. Navigate to the Manage tab
2. Try adding a new client
3. Try adding a new order
4. Check that data appears in Firebase Console

### 3. Test Real-time Updates

1. Open the app on multiple devices/browsers
2. Update an order status on one device
3. Verify the change appears immediately on other devices

## 🔧 Environment-Specific Setup

### Development Environment

Use the test mode Firestore rules for easier development.

### Production Environment

1. Update Firestore rules to be more restrictive
2. Enable additional security features
3. Set up Firebase App Check for additional security
4. Configure backup and monitoring

## 🛠️ Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check if Email/Password provider is enabled
   - Verify Firebase config is correct
   - Check network permissions

2. **Firestore permission denied**
   - Verify security rules allow authenticated access
   - Check if user is properly authenticated
   - Ensure collections exist

3. **Real-time updates not working**
   - Check internet connection
   - Verify Firestore rules allow read access
   - Check for JavaScript errors in console

### Debug Mode

Add this to your `config/firebase.ts` for debugging:

```typescript
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

// Only connect to emulators in development
if (__DEV__) {
  // Uncomment these lines to use Firebase emulators
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## 📊 Monitoring and Analytics

### Enable Analytics

1. Go to **Analytics** in Firebase Console
2. View user engagement and app performance
3. Set up custom events for key actions

### Performance Monitoring

1. Enable **Performance Monitoring**
2. Monitor app startup time and network requests
3. Set up alerts for performance issues

## 🔐 Security Best Practices

1. **Never commit Firebase config to public repositories**
2. **Use environment variables for sensitive data**
3. **Regularly review Firestore security rules**
4. **Enable audit logging for production**
5. **Use Firebase App Check in production**
6. **Regular security reviews and updates**

## 📞 Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)

For app-specific issues, contact the development team.