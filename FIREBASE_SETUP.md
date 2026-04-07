# Firebase Setup Guide

This guide walks you through setting up Firebase for the Payment App project.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add project**
3. Enter project name: `PaymentApp`
4. Disable Google Analytics (optional) or keep enabled
5. Click **Create project**
6. Wait for project to be provisioned, then click **Continue**

## Step 2: Register Apps

### iOS App

1. In Firebase Console, click the **iOS** icon (apple)
2. Enter bundle ID: `com.ikarandua.PaymentApp`
3. App nickname: `PaymentApp iOS`
4. (Optional) App Store ID - leave blank
5. Click **Register app**
6. Download `GoogleService-Info.plist`
7. Move it to: `ios/PaymentApp/GoogleService-Info.plist`
8. Click **Continue**

### Android App

1. In Firebase Console, click the **Android** icon
2. Enter package name: `com.paymentapp`
3. App nickname: `PaymentApp Android`
4. (Optional) Debug signing certificate SHA-1
5. Click **Register app**
6. Download `google-services.json`
7. Move it to: `android/app/google-services.json`
8. Click **Continue**

## Step 3: Enable Authentication

### Phone Provider

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click **Phone** provider
3. Toggle **Enable**
4. (Optional) Configure reCAPTCHA for development
5. Click **Save**

### Security Considerations

For production, consider enabling:

- **App Verification**: Prevents abuse
- **reCAPTCHA**: Security for web clients

## Step 4: Enable Cloud Firestore

1. Go to **Firestore Database** in the sidebar
2. Click **Create database**
3. Choose **Start in production mode** (recommended for production)
4. Select a location close to your users
5. Click **Enable**
6. Copy the rules from `firestore.rules` or set them manually:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) &&
        !request.resource.data.diff(resource.data).affectedKeys().hasAny(['balance']);
      allow delete: if false;
    }

    match /transactions/{transactionId} {
      allow read: if isAuthenticated() &&
        (request.auth.uid == resource.data.senderId ||
         request.auth.uid == resource.data.receiverId);
      allow create: if isAuthenticated() &&
        request.resource.data.senderId == request.auth.uid;
      allow update, delete: if false;
    }

    match /paymentRequests/{requestId} {
      allow read: if isAuthenticated() &&
        (request.auth.uid == resource.data.fromId ||
         request.auth.uid == resource.data.toId);
      allow create: if isAuthenticated() &&
        request.resource.data.fromId == request.auth.uid;
      allow update: if isAuthenticated() &&
        request.auth.uid == resource.data.toId &&
        request.resource.data.status in ['accepted', 'rejected'];
      allow delete: if false;
    }
  }
}
```

## Step 5: Enable Cloud Messaging

1. Go to **Messaging** in the sidebar
2. Click **Get started**
3. (iOS) Follow the instructions to upload APNs certificates or keys
4. (Android) Configure FCM for Android if needed

## Step 6: Configure App-Level Settings

### iOS Configuration

1. Open `ios/PaymentApp.xcworkspace` in Xcode
2. Enable capabilities:
   - **Push Notifications**
   - **Background Modes** > **Remote notifications**

3. Set minimum iOS version in Podfile:

```ruby
platform :ios, '15.1'
```

### Android Configuration

1. Open `android/app/build.gradle`
2. Ensure `minSdkVersion` is at least 21

## Step 7: Update App Code

Update `src/services/firebase.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: 'AIzaSy...', // From GoogleService-Info.plist
  authDomain: 'paymentapp.firebaseapp.com',
  projectId: 'paymentapp-xxx',
  storageBucket: 'paymentapp-xxx.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:ios:abc123',
};
```

Find these values in:

- **iOS**: `GoogleService-Info.plist`
- **Android**: `google-services.json`

## Step 8: Deploy Cloud Functions

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Login

```bash
firebase login
```

### Initialize Functions

```bash
cd functions
npm install
```

### Deploy

```bash
firebase deploy --only functions
```

## Step 9: Test Configuration

### Run the App

```bash
npx react-native run-ios
# or
npx react-native run-android
```

### Verify Firebase Connection

Check Xcode/Android Studio console for:

- `Firebase App initialized successfully`
- No Firebase-related errors on startup

## Troubleshooting

### Phone Auth Not Working

1. Verify Phone provider is enabled in Console
2. Check bundle ID matches exactly
3. For iOS simulator, phone auth may not work (use real device)
4. Check APNs certificate in Cloud Messaging settings

### Firestore Errors

1. Ensure Firestore is enabled
2. Check security rules allow your operations
3. Verify network connectivity
4. Check if you're in the correct Firestore region

### Push Notifications Not Working

**iOS:**

1. Verify provisioning profile includes Push Notifications
2. Upload APNs certificate or key in Firebase Console
3. Check device token is being sent to your backend

**Android:**

1. Verify `google-services.json` is in correct location
2. Check FCM server key configuration
3. Ensure app is installed on a device (not emulator, mostly)

## Firebase Console Quick Reference

| Service          | Console Location           |
| ---------------- | -------------------------- |
| Authentication   | Build > Authentication     |
| Firestore        | Build > Firestore Database |
| Cloud Messaging  | Engage > Messaging         |
| Functions        | Build > Functions          |
| Project Settings | ⚙️ > Project Settings      |

## Security Checklist

- [ ] Firestore security rules restrict access to user data
- [ ] Balance updates only through transactions (not direct writes)
- [ ] Payment requests validated server-side
- [ ] Push notification tokens stored securely
- [ ] No sensitive data in client-side logs
- [ ] APNs certificates valid and not expired

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase Docs](https://rnfirebase.io/)
- [Firebase Console](https://console.firebase.google.com)
