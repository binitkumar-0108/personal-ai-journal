import admin from 'firebase-admin';
import './env.js';

// The canonical Firebase Project ID shared between frontend and backend
const PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.VITE_FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCLOUD_PROJECT ||
  'project-9de0e9d1-3b4e-44bb-91c';

// Initialize Firebase Admin using Application Default Credentials (ADC)
// Explicitly binding projectId ensures verifyIdToken verifies against the correct project issuer (aud & iss).
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: PROJECT_ID,
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export { admin, PROJECT_ID };
