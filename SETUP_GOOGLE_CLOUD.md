# DriveDrop Architecture & Google Cloud Deployment Guide

DriveDrop implements **Option 2 Architecture**: Direct URL → Google Cloud Backend → Stream Download → Google Drive API → Upload Complete → Android App Receives Status.

The Android phone **never downloads the actual file**, saving 100% of mobile data and battery while supporting files of any size (e.g. 50 MB to 10+ GB).

---

## 1. Cloud Backend Overview

The backend is built with **Node.js, TypeScript, and Express**, designed for **Google Cloud Run**.

### Key REST Endpoints:
- `POST /api/upload`: Accepts `{ url, folderName, customFileName }` and initiates asynchronous chunked streaming to Google Drive. Returns `{ jobId, status: "queued", fileName }`.
- `GET /api/upload/:jobId/status`: Returns current progress (`downloadProgress`, `uploadProgress`, `fileName`, `fileSizeBytes`, `status`, `driveFileId`).
- `POST /api/upload/:jobId/cancel`: Aborts active download/upload stream.
- `GET /api/jobs`: Returns list of all recent cloud jobs.
- `GET /api/health`: Health check endpoint.

---

## 2. Google Cloud Prerequisites & Setup

### Step 1: Install & Authenticate Google Cloud SDK (`gcloud`)
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud config set run/region us-central1
```

### Step 2: Enable Required Google Cloud APIs
```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  drive.googleapis.com
```

### Step 3: Configure Google OAuth Consent Screen
1. In the [Google Cloud Console](https://console.cloud.google.com/), navigate to **APIs & Services > OAuth consent screen**.
2. Select **External** and enter App Name: `DriveDrop`.
3. Add the scope: `https://www.googleapis.com/auth/drive.file` (*See, edit, create, and delete only specific Google Drive files created by this app*).
4. Add your Google account as a **Test User**.

---

## 3. Deploying Backend to Google Cloud Run

### Option A: One-Command Deployment from Source (Recommended)
From the project root:
```bash
gcloud run deploy drivedrop-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 3600
```
*Note: The `--timeout 3600` flag gives the Cloud Run instance up to 60 minutes to stream very large files (e.g., 5GB+).*

### Option B: Build & Deploy Container via Artifact Registry
```bash
# 1. Create Docker repository
gcloud artifacts repositories create drivedrop-repo \
  --repository-format=docker \
  --location=us-central1

# 2. Build and push image
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/drivedrop-repo/backend:latest .

# 3. Deploy to Cloud Run
gcloud run deploy drivedrop-backend \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/drivedrop-repo/backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 3600
```

Once deployment completes, Cloud Run will output your live URL:
```
Service URL: https://drivedrop-backend-abc123xyz-uc.a.run.app
```

---

## 4. Configuring Android App to Use Your Backend URL

In `app/src/main/java/com/drivedrop/app/data/network/CloudApiService.kt`, set `backendBaseUrl`:
```kotlin
class CloudApiService(
    private val backendBaseUrl: String = "https://drivedrop-backend-abc123xyz-uc.a.run.app"
) { ... }
```

---

## 5. Local Testing & Verification

### Running the Backend Locally:
```bash
npm install
npm run dev    # Starts Vite dev server with integrated API middleware on http://localhost:3000
# or
npm start      # Starts standalone Express production server on http://localhost:3000
```

### Testing Small File:
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "folderName": "DriveDrop"
  }'
```

### Testing Large File (Big Buck Bunny, ~158 MB):
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "folderName": "DriveDrop"
  }'
```

### Polling Status:
```bash
curl http://localhost:3000/api/upload/JOB_ID_HERE/status
```
