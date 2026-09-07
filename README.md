# 🧠 Personal AI Journal

> A secure, authenticated AI journaling application powered by Firebase Authentication, Cloud Firestore, Gemini, and Google Cloud Run.

Personal AI Journal is a full-stack AI application that allows users to securely create, manage, and reflect on their personal journal entries. Gemini provides AI-powered insights and assistance, while Firebase provides authentication and data storage.

The application is deployed on Google Cloud Run for a scalable, publicly accessible production environment.

---

---

## 🚀 Live Application

🌐 **Production App:**
https://personal-ai-journal-204807482912.asia-south1.run.app

> Replace the URL above with the publicly accessible Cloud Run deployment URL.

---

## ✨ Features

### 🔐 Secure Authentication

* Firebase Authentication for user sign-up and sign-in.
* Authenticated users can access their personal journal.
* User-specific data isolation.
* Unauthenticated users cannot access protected journal functionality.

### 📖 Personal Journaling

* Create journal entries.
* View existing entries.
* Edit journal entries.
* Delete journal entries.
* Maintain a personal collection of journal content.

### 🤖 Gemini-Powered AI

The application integrates the **Gemini API** to provide AI-powered functionality such as:

* Journal analysis
* Intelligent summaries
* Personal reflection
* Context-aware insights
* AI-assisted understanding of journal entries

Gemini transforms raw journal content into useful, natural-language insights.

### ☁️ Cloud Run Deployment

The application is deployed on **Google Cloud Run**, providing:

* Production-ready hosting
* Automatic scaling
* Containerized deployment
* HTTPS-accessible application
* Integration with Google's cloud infrastructure

---

# 🏗️ Technology Stack

| Technology                        | Purpose                                  |
| --------------------------------- | ---------------------------------------- |
| **Google AI Studio / Gemini API** | AI-powered journal analysis and insights |
| **Firebase Authentication**       | User authentication and access control   |
| **Cloud Firestore**               | Persistent journal data storage          |
| **Google Cloud Run**              | Production deployment and hosting        |
| **React**                         | Frontend application                     |
| **TypeScript**                    | Type-safe application development        |
| **Node.js**                       | Backend/runtime                          |
| **Express**                       | Backend API layer                        |
| **Tailwind CSS**                  | UI styling                               |
| **GitHub**                        | Source code and version control          |

---

# 🏛️ Architecture


                         ┌─────────────────────┐
                         │        USER         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   React Frontend    │
                         │ TypeScript + Tailwind│
                         └──────────┬──────────┘
                                    │
                         Firebase Authentication
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Firebase Auth      │
                         │                     │
                         │ Identity & Access   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Cloud Run        │
                         │                     │
                         │ Node.js + Express   │
                         └─────────┬───────────┘
                                   │
                     ┌─────────────┴──────────────┐
                     │                            │
                     ▼                            ▼
          ┌────────────────────┐       ┌────────────────────┐
          │   Cloud Firestore  │       │   Gemini API       │
          │                    │       │   Google AI Studio │
          │ Journal Entries    │       │                    │
          └────────────────────┘       └────────────────────┘


---

# 🔄 How It Works

### 1. User Authentication

A user signs in through **Firebase Authentication**.

```text
User → Firebase Authentication → Authenticated Session
```

The authenticated identity is used to determine which journal data the user can access.

---

### 2. Journal Creation

After authentication, the user can create journal entries.

```text
User
  ↓
React UI
  ↓
Backend
  ↓
Cloud Firestore
  ↓
Journal Entry Stored
```

Journal entries are associated with the authenticated user.

---

### 3. AI Journal Analysis

When the user requests AI assistance:

```text
Journal Entry
      ↓
Cloud Run Backend
      ↓
Gemini API
      ↓
AI Processing
      ↓
Generated Insight
      ↓
React UI
```

The Gemini API processes the relevant journal content and returns an AI-generated response.

---

# 🔥 Firebase Integration

Firebase is a core component of the application.

## Firebase Authentication

Firebase Authentication handles:

* User registration
* User login
* Authentication state
* Protected application access
* User identity

This prevents journal functionality from being openly accessible to unauthenticated users.

---

# 🗄️ Cloud Firestore

**Cloud Firestore** is used as the application's persistent database.

Journal data is stored in a user-specific structure so that users can access their own journal content.

Example conceptual structure:

```text
users/
  └── {userId}/
       └── journals/
            ├── {entryId}
            │    ├── title
            │    ├── content
            │    ├── createdAt
            │    └── updatedAt
            │
            └── {entryId}
```

Firestore provides scalable document-based storage for the journal application.

---

# 🤖 Gemini Integration

The application uses the **Gemini API through Google AI Studio** to add intelligence to the journaling experience.

Gemini is used to analyze journal content and generate useful responses based on the user's request.

Example:

```text
User Journal
     │
     ▼
"Analyze this entry"
     │
     ▼
Gemini API
     │
     ▼
AI-generated reflection
```

The AI functionality is integrated into the application rather than being a separate demonstration.

---

# ☁️ Google Cloud Run

The application is deployed as a production service on **Google Cloud Run**.

Cloud Run provides:

* Containerized application deployment
* Public HTTPS endpoint
* Automatic scaling
* Managed infrastructure
* Integration with Google Cloud services

Deployment architecture:

```text
GitHub Repository
       ↓
Container Build
       ↓
Google Cloud
       ↓
Cloud Run
       ↓
Public Application
```

---

# 🔐 Security

Security is particularly important because journal entries can contain personal information.

The application uses:

* Firebase Authentication
* Authenticated user sessions
* User-specific Firestore data
* Server-side Gemini API communication
* Environment-based configuration
* Protected backend routes

### API Key Protection

Sensitive credentials should never be committed to GitHub.

```text
❌ Frontend → Gemini API + exposed API key

✅ Frontend → Cloud Run Backend → Gemini API
```

Environment variables are used for sensitive configuration.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
```

> Never commit actual API keys, service-account credentials, or other secrets to the repository.

---

# 📁 Project Structure

```text
personal-ai-journal/
│
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
│
├── server/                 # Backend/API
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── ...
│
├── Dockerfile
├── .dockerignore
├── .gitignore
├── package.json
└── README.md
```

> The exact structure may differ depending on the current implementation.

---

# ⚙️ Local Development

## Prerequisites

Install:

* Node.js
* npm
* Git
* Firebase project
* Firestore database
* Gemini API access
* Google Cloud CLI for Cloud Run deployment

---

## Clone the Repository

```bash
git clone https://github.com/binitkumar-0108/personal-ai-journal.git

cd personal-ai-journal
```

---

## Install Dependencies

```bash
npm install
```

If frontend and backend dependencies are separated:

```bash
cd client
npm install

cd ../server
npm install
```

---

# 🔑 Environment Configuration

Create the required environment configuration according to the project implementation.

Typical configuration includes:

```env
GEMINI_API_KEY=your_gemini_api_key

FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

Do **not** commit real credentials.

---

# ▶️ Run Locally

Start the backend:

```bash
npm run dev
```

Start the frontend if it uses a separate development server:

```bash
npm run dev
```

Open the local URL provided by the development server.

---

# 🧪 Testing Checklist

Before deployment, verify:

* [ ] User registration works
* [ ] User login works
* [ ] Logout works
* [ ] Unauthenticated users cannot access protected journal functionality
* [ ] Journal creation works
* [ ] Journal editing works
* [ ] Journal deletion works
* [ ] Firestore correctly stores entries
* [ ] Users only access their own journal data
* [ ] Gemini API returns responses
* [ ] Invalid AI requests are handled
* [ ] Production Cloud Run URL works
* [ ] No API keys are exposed in GitHub

---

# 🎯 Problem Being Solved

Traditional digital journals primarily provide a place to store thoughts. They do not necessarily help users understand patterns, summarize their writing, or reflect on what they have written.

Personal AI Journal adds an intelligent layer to journaling by combining secure personal storage with Gemini-powered analysis.

### Core idea

**Write → Store Securely → Analyze with AI → Reflect**

---

# 💡 Key Value Proposition

The project brings together four Google technologies into one practical application:

### 🔥 Firebase Authentication

Provides secure identity and authenticated access.

### 🗄️ Cloud Firestore

Stores journal entries in a scalable, user-specific database.

### 🤖 Gemini

Provides the application's AI-powered intelligence.

### ☁️ Cloud Run

Hosts the application as a scalable production service.

Together:

Firebase Auth
      +
Firestore
      +
Gemini
      +
Cloud Run
      ↓
Authenticated AI Application


---

# 🚀 Future Improvements

Potential future enhancements include:

* 📊 Long-term journal analytics
* 🔎 Semantic search across journal history
* 🧠 Personalized AI memory
* 🎙️ Voice journaling
* 📱 Mobile/PWA support
* 🏷️ Automatic journal categorization
* 📈 Personal reflection dashboards
* 📤 Secure journal export
* 🔐 Additional privacy controls
* 🌐 Multilingual journaling

---

# ⚠️ AI Disclaimer

Gemini-generated responses are intended for reflection and informational assistance.

The application does not replace professional medical, psychological, legal, or financial advice.

Users should independently evaluate AI-generated information before making important decisions.

---

# 📜 License

See the repository license for terms of use.

---

# 👨‍💻 Author

**Binit Kumar**

GitHub:
https://github.com/binitkumar-0108/personal-ai-journal

---

## ⭐ Project

If you find this project interesting, consider starring the repository ⭐

**Built with React, Firebase Authentication, Cloud Firestore, Google AI Studio + Gemini API, Node.js, Express, Docker, and Google Cloud Run.**
