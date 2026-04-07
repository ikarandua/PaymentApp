# App Store & Play Store Deployment Guide

This guide covers building and deploying the Payment App to Apple App Store and Google Play Store.

## Prerequisites

- Apple Developer Program membership ($99/year)
- Google Play Developer Console account ($25 one-time)
- App icon (1024x1024 for iOS, 512x512 for Android)
- Screenshots for app preview
- Privacy policy URL
- Support/Contact email

---

## iOS App Store Deployment

### Step 1: Configure App in Xcode

1. Open `ios/PaymentApp.xcworkspace` in Xcode
2. Select **PaymentApp** target
3. Go to **Signing & Capabilities**
4. Select your development team
5. Check **Automatically manage signing**
6. Set **Deployment Target** to iOS 15.1 or higher

### Step 2: Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** > **+** > **New App**
3. Fill in details:
   - Platforms: iOS
   - Name: PaymentApp
   - Primary Language: English
   - Bundle ID: `com.ikarandua.PaymentApp`
   - SKU: PAYMENTAPP001
4. Click **Create**

### Step 3: Build Release Build

```bash
# Clean and build
cd ios
xcodebuild clean -workspace PaymentApp.xcworkspace -scheme PaymentApp
xcodebuild -workspace PaymentApp.xcworkspace -scheme PaymentApp -configuration Release -archivePath build/PaymentApp.xcarchive archive
```

### Step 4: Export & Upload

```bash
# Export the archive
xcodebuild -exportArchive -archivePath build/PaymentApp.xcarchive -exportOptionsPlist ExportOptions.plist -exportPath build/output
```

Or use Xcode UI:

1. Select **Product** > **Archive**
2. Select your archive in Organizer
3. Click **Distribute App**
4. Choose **App Store Connect**
5. Select **Upload**

### Step 5: Configure App Store Listing

In App Store Connect, fill in:

#### App Information

- Category: Finance
- Subcategory: Payments
- Content Rights: None

#### Pricing and Availability

- Price: Free or Paid
- Availability: All territories or specific countries

#### App Privacy

- Answer the privacy questions
- Data collection disclosures required

#### Contact Information

- Support URL (required)
- Marketing URL (optional)
- Privacy Policy URL (required)
- Copyright: Your company name

### Step 6: Upload Screenshots

Required sizes:
| Device | Size |
|--------|------|
| iPhone 6.5" (Optional) | 1284 x 2778 |
| iPhone 6.5" (Required) | 1284 x 2778 |
| iPhone 5.5" (Required) | 1242 x 2208 |
| iPad Pro 12.9" (Optional) | 2048 x 2732 |

### Step 7: Submit for Review

1. Go to your app in App Store Connect
2. Click **+ Version or Platform**
3. Enter version number (e.g., 1.0.0)
4. Fill in:
   - What's New in This Version
   - App Review Information
   - Version Release (Manual or Automatic)
5. Click **Add for Review**
6. Submit

**Review Time**: 24-48 hours (typically)

---

## Android Play Store Deployment

### Step 1: Configure App in Android Studio

1. Open `android/` in Android Studio
2. Update `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "com.paymentapp"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }

    signingConfigs {
        release {
            storeFile file('your-release-key.jks')
            storePassword 'your-password'
            keyAlias 'your-key-alias'
            keyPassword 'your-key-password'
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 2: Create Release Build

```bash
# Generate signed APK/AAB
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`
Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Step 3: Create App in Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Select:
   - App type: App
   - Name: PaymentApp
   - Default language: English (United States)
4. Click **Create**

### Step 4: Complete Store Listing

#### Main Store Listing

- **Title**: PaymentApp
- **Short description** (80 chars): Send & receive money instantly
- **Full description** (4000 chars): Detailed app description

#### Graphics

- **App icon**: 512 x 512 PNG
- **Feature graphic**: 1024 x 500 PNG
- **Screenshots**: At least 2 per type
  - Phone screenshots: 1080 x 1920
  - 7" tablet screenshots: 1200 x 1920
  - 10" tablet screenshots: 1920 x 1200

#### Categorization

- Category: Finance
- Game category: (not applicable)
- Tags: payment, money, transfer, wallet

### Step 5: Content Rating

1. Go to **Content rating**
2. Click **Continue**
3. Answer the questionnaire about:
   - Content type
   - Targeted audience
   - User-generated content
   - Gambling content
4. Submit questionnaire

### Step 6: Privacy Policy

1. Create a privacy policy page on your website
2. Include:
   - Data collection practices
   - Third-party services (Firebase)
   - User rights
   - Contact information
3. Add URL in Play Console

### Step 7: Set Pricing & Distribution

1. Go to **Pricing & distribution**
2. Select: Free or Paid
3. Choose countries/regions
4. Agree to privacy guidelines

### Step 8: Upload AAB

1. Go to **Production** > **Create release**
2. Drag and drop your `.aab` file
3. Review release details
4. Click **Save** > **Review release**

### Step 9: Submit for Review

1. Click **Submit for review**
2. Confirm:
   - Declarations are accurate
   - Ad content compliance
   - Export compliance (if applicable)
3. Submit

**Review Time**: 1-7 days (typically 2-3 days)

---

## Pre-Launch Checklist

### Both Stores

- [ ] Privacy policy published
- [ ] Support email configured
- [ ] App icon created (all sizes)
- [ ] Screenshots uploaded
- [ ] App description written
- [ ] Version number incremented
- [ ] Test flight/staged rollout tested

### iOS Specific

- [ ] Bundle ID registered
- [ ] Signing certificates valid
- [ ] App Store icons ready
- [ ] Marketing icon ready
- [ ] Privacy answers completed

### Android Specific

- [ ] AAB signed with release key
- [ ] Version code incremented
- [ ] Content rating completed
- [ ] Target API level 34+
- [ ] 64-bit builds included

---

## Post-Submission

### Monitoring

- **iOS**: App Store Connect > App Analytics
- **Android**: Play Console > Statistics

### Handling Reviews

- Respond to user reviews promptly
- Fix critical bugs quickly
- Update app regularly

### Updates

#### iOS

1. Increment version in Xcode
2. Create new archive
3. Upload to App Store Connect
4. Submit for review

#### Android

1. Increment `versionCode` and `versionName`
2. Build new AAB
3. Upload in Play Console
4. Select release track
5. Submit

---

## Common Rejection Reasons

### iOS

- Crash on launch
- Missing privacy policy
- Incorrect category
- Incomplete contact information
- Sign-in issues

### Android

- Private user data transmitted insecurely
- Missing privacy policy URL
- Violation of device & network abuse policy
- Ads policy violations

---

## Staged Rollout (Recommended)

### iOS

1. In App Store Connect, set **Phase 1** to 1%
2. Monitor for crashes
3. Gradually increase to 25%, 50%, 100%

### Android

1. In Play Console, select **Production**
2. Choose percentage rollout
3. Monitor crash reports
4. Expand rollout gradually

---

## Support

- [Apple Developer Support](https://developer.apple.com/contact/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
