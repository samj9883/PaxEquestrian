# Leather Works - React Native Management App

A comprehensive mobile-first React Native application designed for leather work companies to manage orders, clients, and project timelines.

## 🚀 Features

### 📦 Orders Management
- View all active orders sorted by deadline
- Real-time status updates (waiting, started, complete)
- Progress tracking with hours completed vs. estimated
- Quick status updates and hour logging
- Automatic completion date calculations

### 📅 Completion Timeline
- Dynamic completion date estimation based on work preferences
- Configurable work schedule (days/week, hours/day, days off)
- Visual timeline for all active orders
- Deadline management and prioritization

### 👤 Client Management
- Searchable client database
- Complete contact information (email, phone, address)
- Order history for each client
- Notes and client relationship management

### ➕ Order & Client Creation
- Streamlined forms for adding new orders
- Client auto-suggestion when creating orders
- Form validation and error handling
- Instant database updates

## 🔐 Security Features

- Firebase Authentication with email/password
- Secure user management with role-based access
- Internal use authentication system
- Session management and auto-logout

## 📱 Technical Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase Firestore (real-time database)
- **Authentication**: Firebase Auth
- **Navigation**: Expo Router with bottom tabs
- **Styling**: React Native StyleSheet with professional design
- **State Management**: React Context API
- **TypeScript**: Full type safety

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Firebase project (see Firebase Setup below)

### 1. Clone and Install

```bash
git clone <repository-url>
cd leather-works-app
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication and Firestore Database
3. Copy your Firebase config to `config/firebase.ts`
4. See `FIREBASE_SETUP.md` for detailed instructions

### 3. Run the App

```bash
# Start the development server
npm start

# Run on specific platforms
npm run ios     # iOS simulator
npm run android # Android emulator
npm run web     # Web browser
```

## 📁 Project Structure

```
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── orders.tsx     # Orders management
│   │   ├── estimation.tsx # Timeline calculations
│   │   ├── clients.tsx    # Client management
│   │   └── manage.tsx     # Add orders/clients
│   ├── login.tsx          # Authentication screen
│   ├── index.tsx          # App entry point
│   └── _layout.tsx        # Root layout with providers
├── components/            # Reusable UI components
│   ├── common/           # Generic components
│   │   ├── Button.tsx    # Custom button component
│   │   └── Input.tsx     # Custom input component
│   └── OrderCard.tsx     # Order display component
├── contexts/             # React Context providers
│   ├── AuthContext.tsx   # Authentication state
│   └── DataContext.tsx   # Orders/clients data
├── config/               # Configuration files
│   └── firebase.ts       # Firebase configuration
├── types/                # TypeScript type definitions
│   └── index.ts          # Data models
└── utils/                # Utility functions
    └── completionCalculator.ts # Date calculations
```

## 🔧 Configuration

### Environment Variables

Update `config/firebase.ts` with your Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Initial User Setup

1. Create a user in Firebase Authentication console
2. Add user document to Firestore `users` collection:

```json
{
  "username": "manager",
  "role": "admin",
  "createdAt": "timestamp"
}
```

## 🎨 Design System

### Colors
- **Primary**: `#8B4513` (Saddle Brown - leather theme)
- **Background**: `#F5F5DC` (Beige)
- **Success**: `#10B981`
- **Warning**: `#F59E0B`
- **Error**: `#DC2626`

### Typography
- **Headers**: Bold, 18-24px
- **Body**: Regular, 14-16px
- **Captions**: Regular, 12-14px

### Components
- Consistent 8px spacing grid
- 12px border radius for cards
- Shadow/elevation for depth
- Professional mobile-first design

## 📊 Database Schema

### Orders Collection
```typescript
{
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  dateReceived: Date;
  description: string;
  internalCost: number;
  clientPrice: number;
  estimatedHours: number;
  hoursCompleted: number;
  deadline?: Date;
  status: 'waiting' | 'started' | 'complete';
  createdAt: Date;
  updatedAt: Date;
}
```

### Clients Collection
```typescript
{
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🚀 Deployment

### Expo Build
```bash
# Build for production
expo build:android
expo build:ios
```

### Web Deployment
```bash
# Build for web
expo build:web
```

## 🔒 Security Considerations

- All Firebase security rules should be configured
- User authentication required for all operations
- Role-based access control implemented
- Input validation on all forms
- Secure environment variable handling

## 📝 Usage Guide

### Adding Orders
1. Navigate to "Manage" tab
2. Fill in client name (auto-suggests existing clients)
3. Add description, hours, costs, and optional deadline
4. Submit to create order

### Managing Orders
1. View orders in "Orders" tab
2. Tap order to update status or add hours
3. Orders automatically update completion status

### Timeline Planning
1. Check "Timeline" tab for completion estimates
2. Adjust work preferences in settings
3. View estimated completion dates

### Client Management
1. Search and view clients in "Clients" tab
2. View order history and contact details
3. Edit client information as needed

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is proprietary software for internal use only.

## 📞 Support

For setup assistance or feature requests, contact the development team.
