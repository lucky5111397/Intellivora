# INTELLIVORA

> AI-Powered Interview & Aptitude Preparation Platform

## Overview

INTELLIVORA is a full-stack AI-powered preparation platform designed to help
candidates practice interviews, evaluate their performance, improve weak areas,
and prepare for aptitude assessments through personalized learning workflows.

---

## ✨ Key Features

### 🤖 AI Interview Preparation
- Resume-based interview preparation
- Role and experience-based interview generation
- AI-powered response evaluation
- Structured feedback and scoring
- Interview performance reports
- Interview history

### 🧠 Aptitude Preparation
- Topic-based aptitude preparation
- Configurable aptitude tests
- Questions across multiple aptitude categories
- Timer-based test experience
- Automatic scoring
- Detailed result analysis
- Progress tracking
- Attempt history
- AI-assisted question generation

### 📄 Resume Analysis
- PDF resume upload
- Resume text extraction
- Resume analysis
- ATS-oriented evaluation
- Interview-readiness insights

### 🔐 Authentication & Security
- Firebase Google Authentication
- JWT authentication
- HTTP-only cookies
- Protected API routes
- Centralized error handling

### 💳 Payments & Credits
- Credit-based usage system
- Razorpay integration
- Server-side payment verification
- Plan-based access

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    A[User] --> B[React Frontend]

    B --> C[Authentication]
    B --> D[Interview Module]
    B --> E[Aptitude Module]
    B --> F[Resume Analysis]
    B --> G[Payment & Credits]

    C --> H[Express API]
    D --> H
    E --> H
    F --> H
    G --> H

    H --> I[JWT Middleware]
    H --> J[Business Services]

    J --> K[(MongoDB Atlas)]
    J --> L[AI Providers]
    J --> M[Razorpay]
    J --> N[Firebase]

    L --> O[OpenRouter]
    L --> P[Gemini]
