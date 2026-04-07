# Payment App

A fully functional mobile payment application built with React Native and Firebase. Send money, request payments, track transactions, and receive real-time notifications.

## Features

- **Authentication**: Phone number + password login with OTP verification
- **Wallet Management**: Real-time balance updates, add money functionality
- **P2P Payments**: Send/receive money using phone numbers
- **Transaction History**: Complete history with filters (sent/received, status)
- **Payment Requests**: Request money from users, accept/reject incoming requests
- **Push Notifications**: Real-time notifications via Firebase Cloud Messaging
- **QR Code Payments**: Scan QR codes to pay instantly
- **PIN Security**: Optional transaction PIN protection
- **Dark Mode**: System-aware theme switching

## Tech Stack

- React Native 0.84.1 (New Architecture)
- Firebase Authentication
- Cloud Firestore
- Firebase Cloud Messaging (FCM)
- Cloud Functions
- React Navigation 7
- Zustand (State Management)
- react-native-vision-camera

## Prerequisites

- Node.js >= 22.11.0
- Xcode 15+ (for iOS)
- Android Studio (for Android)
- CocoaPods
- Firebase Account

## Project Setup

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd PaymentApp
npm install
```

### 2. Firebase Configuration

#### iOS Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Add an iOS app with bundle ID: `com.ikarandua.PaymentApp`
3. Download `GoogleService-Info.plist`
4. Move it to: `ios/PaymentApp/GoogleService-Info.plist`
5. Enable **Phone Authentication** under Authentication > Sign-in method
6. Enable **Cloud Firestore** and create database in production mode
7. Enable **Cloud Messaging**

#### Android Setup

1. Add an Android app with package name: `com.paymentapp`
2. Download `google-services.json`
3. Move it to: `android/app/google-services.json`
4. Add SHA-1 fingerprint from `android/app/debug.keystore` (or your release keystore)

### 3. Update Firebase Config

Edit `src/services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

### 4. iOS Setup

```bash
cd ios
pod install
cd ..
```

If pod install times out, try:

```bash
cd ios
pod install --verbose
```

### 5. Deploy Cloud Functions

```bash
cd functions
npm install
npm run deploy
```

This deploys functions for:

- Sending push notifications on transactions
- Sending notifications on payment requests
- Request accept/reject notifications

## Running the App

### iOS (Simulator)

```bash
npx react-native run-ios
```

### iOS (Specific Simulator)

```bash
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Android

```bash
npx react-native run-android
```

### Development Server

```bash
npx react-native start
```

## Firestore Security Rules

Deploy rules from `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

Or copy rules manually to Firebase Console > Firestore > Rules.

## App Architecture

```
src/
├── screens/           # All screen components
│   ├── auth/         # Login, Signup, Phone Auth
│   ├── home/         # Home/Wallet
│   ├── payment/      # Send, Request, QR Scanner
│   ├── transactions/ # History, Details
│   └── profile/      # User profile, settings
├── navigation/        # React Navigation setup
│   ├── AuthNavigator.tsx
│   ├── MainTabNavigator.tsx
│   └── RootNavigator.tsx
├── stores/            # Zustand state management
│   ├── authStore.ts
│   ├── walletStore.ts
│   └── settingsStore.ts
├── services/          # Business logic
│   ├── firebase.ts
│   ├── paymentService.ts
│   ├── notificationService.ts
│   └── pinService.ts
├── types/             # TypeScript interfaces
└── utils/             # Helper functions
```

## Data Model

### Users Collection

```
users/{uid}
  - phone: string
  - name: string
  - balance: number
  - pin?: string
  - fcmToken?: string
  - createdAt: timestamp
```

### Transactions Collection

```
transactions/{transactionId}
  - senderId: string
  - receiverId: string
  - senderName: string
  - receiverName: string
  - amount: number
  - status: 'completed' | 'pending' | 'failed'
  - note?: string
  - createdAt: timestamp
```

### Payment Requests Collection

```
paymentRequests/{requestId}
  - fromId: string
  - toId: string
  - amount: number
  - note?: string
  - status: 'pending' | 'accepted' | 'rejected'
  - createdAt: timestamp
```

## Testing

### Test Users

New users get $1,000 initial balance for testing.

### Simulating Payments

1. Create two test accounts with different phone numbers
2. Each account starts with $1,000 balance
3. Send money between accounts to test transactions

## Troubleshooting

### Pod Install Fails

```bash
cd ios
pod deintegrate
pod install --repo-update
```

### Firebase Module Errors

Make sure you have the latest versions:

```bash
npm install @react-native-firebase/app@latest
```

### TypeScript Errors

Run:

```bash
npx tsc --noEmit
```

## License

MIT
