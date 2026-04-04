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
