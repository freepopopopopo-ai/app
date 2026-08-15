# DriveDrop - Native Android Application

**DriveDrop** is a native Android application built with Kotlin, Jetpack Compose, Android WorkManager, and the Google Drive REST API. It allows users to stream-download any file from a direct HTTP/HTTPS URL directly into their personal Google Drive in the background.

---

## 🛠️ Architecture & Technologies

- **Language:** Kotlin
- **UI Framework:** Jetpack Compose with Material 3 Design
- **Architecture:** MVVM (Model-View-ViewModel) + Clean Architecture
- **Background Execution:** Android WorkManager with `ForegroundInfo` and persistent System Notifications
- **Network Streaming:** OkHttp with 64KB chunked buffer streaming (zero full-file RAM caching)
- **Cloud Storage:** Google Drive REST API v3 (Resumable Upload Session with 1MB chunked streaming)
- **Local Persistence:** Room Database for transfer logs + EncryptedSharedPreferences for OAuth credentials
- **OAuth Authentication:** Google Play Services Auth with narrow `https://www.googleapis.com/auth/drive.file` scope
- **System Integration:** `ACTION_SEND` and `ACTION_VIEW` intent filters to accept URLs shared from Chrome, Firefox, or any Android app

---

## 📂 Project Structure

```
├── app/
│   ├── build.gradle.kts          # Dependencies (Compose, WorkManager, Room, OkHttp, Google Auth & Drive)
│   ├── proguard-rules.pro
│   └── src/main/
│       ├── AndroidManifest.xml   # Permissions, foreground services, share sheet intent-filter
│       ├── java/com/drivedrop/app/
│       │   ├── DriveDropApp.kt                      # Application class & Notification Channel
│       │   ├── MainActivity.kt                      # Compose navigation, OAuth launcher & Intent handling
│       │   ├── data/
│       │   │   ├── auth/GoogleAuthManager.kt        # Google Sign-In & Drive scope token retrieval
│       │   │   ├── drive/GoogleDriveService.kt      # Resumable upload session & folder management
│       │   │   ├── local/AppDatabase.kt             # Room Database
│       │   │   ├── local/TransferDao.kt             # Room DAO
│       │   │   ├── local/SecurePreferences.kt       # EncryptedSharedPreferences
│       │   │   ├── model/TransferEntity.kt          # Transfer state entity
│       │   │   ├── model/TransferStatus.kt          # Transfer status enum
│       │   │   ├── model/GoogleAccount.kt           # Connected account model
│       │   │   └── network/StreamDownloader.kt      # Stream downloading with Content-Disposition
│       │   ├── ui/
│       │   │   ├── components/TransferProgressCard.kt # Multi-stage download/upload progress card
│       │   │   ├── components/HistoryList.kt          # Transfer history list
│       │   │   ├── screens/MainScreen.kt              # Main UI
│       │   │   ├── screens/SettingsScreen.kt          # Settings & Disconnect UI
│       │   │   ├── theme/Color.kt, Theme.kt, Type.kt  # Material 3 theme
│       │   │   └── viewmodel/MainViewModel.kt, SettingsViewModel.kt
│       │   ├── utils/UrlValidator.kt                # URL regex, filename & byte formatters
│       │   ├── utils/NotificationHelper.kt          # Persistent foreground notification builder
│       │   └── work/DriveDropWorker.kt              # WorkManager CoroutineWorker with ForegroundService
│       │   └── work/WorkManagerHelper.kt            # Enqueuing & cancel helpers
│       └── res/
│           ├── values/strings.xml, colors.xml, themes.xml
│           └── drawable/ic_launcher_foreground.xml
├── gradle/
│   ├── libs.versions.toml        # Version catalog
│   └── wrapper/gradle-wrapper.properties
├── build.gradle.kts              # Root project build file
├── settings.gradle.kts
├── gradle.properties
└── SETUP_GOOGLE_CLOUD.md         # Google Cloud Console OAuth setup guide
```

---

## 🚀 How to Build in Android Studio

1. **Open Android Studio** (Hedgehog, Iguana, Jellyfish, Koala, Ladybug, or newer).
2. Choose **Open** and select this project directory.
3. Allow Gradle to sync dependencies automatically.
4. Set up your Google Cloud OAuth Client ID (see [SETUP_GOOGLE_CLOUD.md](./SETUP_GOOGLE_CLOUD.md)).
5. Connect an Android device (Android 8.0 / API 26+) or launch an Android Emulator.
6. Click **Run** ▶️ (`Shift + F10`) or select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 🔒 Security & Privacy Highlights

1. **Zero Intermediate Servers:** Data flows directly from the source server to your Android device, and straight into your personal Google Drive account.
2. **Narrow OAuth Scope:** Only requests `https://www.googleapis.com/auth/drive.file` (access strictly limited to files and folders created by DriveDrop).
3. **Local Cleanup:** Local temp files are deleted immediately upon successful upload.
4. **Secure Token Storage:** Auth tokens and preferences are encrypted using Android Keystore with `EncryptedSharedPreferences`.
