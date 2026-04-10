# MKS Education & Legal Service Management System

A comprehensive mobile and web application built with **React Native (Expo)** and **Firebase** to manage education and legal services. This project is a modernized migration from a PHP/MySQL legacy system.

## 🚀 Overview

MKS Education Hub serves as a central platform for students, agents, and administrators to handle educational documentation, university applications, notary translations, and legal services in one place.

## ✨ Key Features

### 1. Education Services
* **High School:** Exam registration, certificate issuance, and marksheet retrieval.
* **University:** Admission applications, transfers, major changes, and graduation processing.
* **Directory:** Searchable list of Universities, Colleges, and Vocational schools with detailed requirements.

### 2. Legal & Translation Services
* **Notary Translation:** Professional translation of educational documents.
* **Court Affidavits:** Legal document preparation and processing.

### 3. Management & Operations
* **Role-Based Access:** Distinct dashboards for Students, Agents (Partners), and MKS Admin.
* **Document Hub:** Secure upload and storage for NRC cards, household lists, and photos.
* **Financials:** Real-time ledger for tracking service fees, tuition, and payments.
* **Delivery Tracking:** End-to-end tracking of physical document shipments.
* **Communication:** Real-time chat system between users and MKS staff.

## 🛠️ Tech Stack

* **Frontend:** React Native (Expo), TypeScript, React Native Paper.
* **Backend:** Firebase Authentication, Cloud Firestore, Firebase Storage.
* **Architecture:** Monorepo structure managed with PNPM workspaces.

## 📂 Project Structure

```text
artifacts/
 └── app-mks-education-hub/   # Main Mobile/Web Application
lib/
 ├── api-zod/                 # API Schemas and Validation
 └── db/                      # Database Models and Logic
```

## Firebase Hosting (Web)

This repo is configured to host the Expo web build on Firebase Hosting.

### Local web build

```bash
pnpm --filter @workspace/mks-education run build:web
```

Build output will be generated at `artifacts/mks-education/dist`.

### Local deploy (manual)

```bash
pnpm dlx firebase-tools deploy --only hosting --project mks-education-hub
```

### Auto deploy with GitHub Actions

Workflow file: `.github/workflows/firebase-hosting.yml`
Firestore rules workflow: `.github/workflows/firestore-rules.yml`

Set these repository secrets in GitHub:

1. `FIREBASE_SERVICE_ACCOUNT_MKS_EDUCATION_HUB`
2. `EXPO_PUBLIC_FIREBASE_API_KEY`
3. `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
4. `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
5. `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
6. `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
7. `EXPO_PUBLIC_FIREBASE_APP_ID`

Behavior:

1. `push` to `main`: builds web and deploys to live hosting
2. `pull_request`: builds web and deploys to preview channel
3. `workflow_dispatch`: manual run from GitHub Actions

Firestore rules behavior:

1. `firestore.rules` (or `firebase.json`) changed on `main` -> auto deploy Firestore rules
2. `workflow_dispatch` -> manual Firestore rules deploy
