/**
 * Canonical type system for Personal AI Journal.
 *
 * Storage boundary: Firestore Timestamps are converted to `Date` in services.
 * UI boundary: components receive `Date` objects; format for display at render time.
 * AI fields (aiReflection, weeklyInsights) are written exclusively by the Cloud Run
 * backend using Firebase Admin SDK. Clients must never write these fields directly.
 */

// ---------------------------------------------------------------------------
// Primitive enumerations
// ---------------------------------------------------------------------------

export type ReflectionMode = 'write' | 'summarize' | 'conversation';

export type CoverTheme =
  | 'terracotta'
  | 'moss'
  | 'indigo'
  | 'espresso'
  | 'parchment'
  | 'burgundy';

// ---------------------------------------------------------------------------
// Application-level User (distinct from firebase/auth User)
// Derived from the Firebase Auth user at the UI boundary.
// ---------------------------------------------------------------------------

export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Journal
// Stored at: users/{uid}/journals/{journalId}
// entryCount is server-controlled (atomic increment). Clients must NOT write it.
// ---------------------------------------------------------------------------

export interface Journal {
  id: string;
  userId: string;
  title: string;
  description: string;
  coverTheme: CoverTheme;
  /** Server-controlled via atomic increment. Never write from client. */
  entryCount: number;
  /** Human-readable display string derived from updatedAt at service boundary. */
  lastUpdated: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Chat (conversation mode)
// ---------------------------------------------------------------------------

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string; // display string (HH:MM)
}

// ---------------------------------------------------------------------------
// AI Reflection
// Written exclusively by Cloud Run backend — never by client.
// ---------------------------------------------------------------------------

export interface AIReflection {
  title: string;
  shortSummary: string;
  keyThoughts: string[];
  themes: string[];
  goals: string[];
  actionItems: string[];
  reflection: string;
  generatedAt: Date;
}

// ---------------------------------------------------------------------------
// Journal Entry
// Stored at: users/{uid}/journals/{journalId}/entries/{entryId}
//
// Security invariants:
//   - originalContent is IMMUTABLE after creation. Services enforce this.
//   - aiReflection is written only by the backend.
//   - userId and journalId are set at creation and never changed.
// ---------------------------------------------------------------------------

export interface JournalEntry {
  id: string;
  journalId: string;
  userId: string;
  title: string;
  /** Human-readable display date string e.g. "September 3, 2026" */
  date: string;
  mode: ReflectionMode;
  /** Immutable after creation. Original user text is preserved verbatim. */
  originalContent: string;
  conversation?: ChatMessage[];
  /** Set only by Cloud Run backend — never written by the client. */
  aiReflection?: AIReflection;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Weekly Insight
// Stored at: users/{uid}/weeklyInsights/{insightId}
// Written exclusively by Cloud Run backend.
// ---------------------------------------------------------------------------

export interface WeeklyInsight {
  id: string;
  userId: string;
  weekRange: string;
  headline: string;
  narrativeOverview: string;
  recurringThemes: {
    theme: string;
    count: number;
    description: string;
  }[];
  goalsIdentified: string[];
  actionItemsRecorded: string[];
  patternObservations: string[];
  reflectionHighlights: {
    quote: string;
    journalTitle: string;
    date: string;
  }[];
  totalWordsWritten: number;
  entriesAnalyzedCount: number;
  generatedAt: Date;
}

// ---------------------------------------------------------------------------
// User Preferences (stored in Firestore at users/{uid}/preferences)
// ---------------------------------------------------------------------------

export interface UserPreferences {
  defaultMode: ReflectionMode;
  reflectionTone: 'deep_philosophical' | 'grounded_practical' | 'gentle_inquisitive';
  fontPreference: 'serif' | 'sans';
  allowAiWeeklySynthesis: boolean;
  theme: 'light_paper' | 'twilight_reading';
}

// ---------------------------------------------------------------------------
// Service DTOs (Data Transfer Objects for service layer)
// ---------------------------------------------------------------------------

export interface CreateJournalDTO {
  title: string;
  description: string;
  coverTheme: CoverTheme;
}

export interface CreateEntryDTO {
  journalId: string;
  title: string;
  mode: ReflectionMode;
  originalContent: string;
  conversation?: ChatMessage[];
  /** Optional: only set when saving a full reflection generated by the backend before persisting. */
  aiReflection?: AIReflection;
}
