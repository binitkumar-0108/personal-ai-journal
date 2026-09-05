/**
 * Real Firestore entry service.
 *
 * Security guarantees:
 *   - All operations require caller-supplied uid (from Firebase Auth token).
 *   - originalContent is IMMUTABLE after creation — updateEntry does not accept it.
 *   - aiReflection is NOT accepted by the client-facing updateEntry function.
 *     It can only be written by the Cloud Run backend via Admin SDK.
 *   - userId and journalId are set at creation and excluded from updates.
 *   - entryCount is updated via journalService.incrementEntryCount (atomic).
 */

import {
  collection,
  collectionGroup,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  type Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type {
  JournalEntry,
  ChatMessage,
  AIReflection,
  ReflectionMode,
} from '../types/index';
import { incrementEntryCount } from './journalService';

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface CreateEntryDTO {
  journalId: string;
  title: string;
  mode: ReflectionMode;
  originalContent: string;
  conversation?: ChatMessage[];
  /**
   * Only set when the backend has already generated a reflection BEFORE the
   * entry is first persisted (e.g. TalkToGemini review → confirm save flow).
   * Under normal create flows this is undefined.
   */
  aiReflection?: AIReflection;
}

/**
 * Safe update shape — explicitly excludes immutable fields.
 * Clients may update title only (and, in the future, soft-flags).
 * AI fields (aiReflection) are excluded here; backend writes them via Admin SDK.
 */
export type UpdateEntryDTO = {
  title?: string;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Format a Date as a human-readable day string. */
function formatDisplayDate(d: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

/** Convert a raw Firestore document to a typed JournalEntry. */
function docToEntry(id: string, data: DocumentData): JournalEntry {
  const createdAt: Date = (data.createdAt as Timestamp)?.toDate() ?? new Date();
  const updatedAt: Date = (data.updatedAt as Timestamp)?.toDate() ?? new Date();

  // Normalise aiReflection timestamps from Firestore
  let aiReflection: AIReflection | undefined;
  if (data.aiReflection) {
    const raw = data.aiReflection as Record<string, unknown>;
    aiReflection = {
      ...(raw as Omit<AIReflection, 'generatedAt'>),
      generatedAt:
        raw.generatedAt instanceof Object && 'toDate' in (raw.generatedAt as object)
          ? (raw.generatedAt as Timestamp).toDate()
          : new Date(raw.generatedAt as string),
    };
  }

  return {
    id,
    journalId: data.journalId as string,
    userId: data.userId as string,
    title: data.title as string,
    date: (data.date as string) || formatDisplayDate(createdAt),
    mode: (data.mode as ReflectionMode) || 'write',
    originalContent: (data.originalContent as string) || '',
    conversation: data.conversation as ChatMessage[] | undefined,
    aiReflection,
    wordCount: (data.wordCount as number) || 0,
    createdAt,
    updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch all entries for a journal, newest-first.
 * Pass journalId to scope to one journal; omit to get across all journals.
 */
export async function getEntries(
  uid: string,
  journalId: string,
): Promise<JournalEntry[]> {
  const ref = collection(db, 'users', uid, 'journals', journalId, 'entries');
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToEntry(d.id, d.data()));
}

/**
 * Fetch ALL entries across all journals for a user.
 * Used for History page, Weekly Insights.
 */
export async function getAllEntries(uid: string): Promise<JournalEntry[]> {
  const q = query(
    collectionGroup(db, 'entries'),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  // Filter to this user's entries (Firestore rules also enforce this)
  return snap.docs
    .filter((d) => d.data().userId === uid)
    .map((d) => docToEntry(d.id, d.data()));
}

/** Fetch a single entry by journalId + entryId. */
export async function getEntry(
  uid: string,
  journalId: string,
  entryId: string,
): Promise<JournalEntry | null> {
  const ref = doc(db, 'users', uid, 'journals', journalId, 'entries', entryId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return docToEntry(snap.id, snap.data());
}

/**
 * Create a new entry.
 *
 * originalContent is persisted in full and will never be overwritten.
 * If aiReflection is supplied (conversation-confirm flow), it is written once
 * at creation. After that, the client has no pathway to modify aiReflection.
 */
export async function createEntry(
  uid: string,
  dto: CreateEntryDTO,
): Promise<JournalEntry> {
  const wordCount = dto.originalContent
    ? dto.originalContent.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const now = new Date();
  const displayDate = formatDisplayDate(now);

  // Build payload — aiReflection only included if provided
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: Record<string, any> = {
    journalId: dto.journalId,
    userId: uid,
    title: dto.title.trim() || 'Untitled Reflection',
    date: displayDate,
    mode: dto.mode,
    originalContent: dto.originalContent,
    wordCount,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (dto.conversation && dto.conversation.length > 0) {
    payload.conversation = dto.conversation;
  }

  // aiReflection only when supplied (conversation-confirm flow)
  if (dto.aiReflection) {
    payload.aiReflection = {
      ...dto.aiReflection,
      // Ensure generatedAt is stored as an ISO string for Admin SDK compatibility
      generatedAt:
        dto.aiReflection.generatedAt instanceof Date
          ? dto.aiReflection.generatedAt.toISOString()
          : dto.aiReflection.generatedAt,
    };
  }

  const ref = collection(db, 'users', uid, 'journals', dto.journalId, 'entries');
  const docRef = await addDoc(ref, payload);

  // Atomically increment the journal's entryCount
  await incrementEntryCount(uid, dto.journalId, 1);

  const snap = await getDoc(docRef);
  return docToEntry(snap.id, snap.data()!);
}

/**
 * Update safe mutable fields on an entry.
 *
 * Intentionally does NOT accept:
 *   - originalContent (immutable)
 *   - aiReflection (backend-only)
 *   - userId, journalId (identity fields)
 *   - wordCount (derived from originalContent)
 */
export async function updateEntry(
  uid: string,
  journalId: string,
  entryId: string,
  updates: UpdateEntryDTO,
): Promise<void> {
  const ref = doc(db, 'users', uid, 'journals', journalId, 'entries', entryId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete an entry and decrement the journal's entryCount atomically.
 */
export async function deleteEntry(
  uid: string,
  journalId: string,
  entryId: string,
): Promise<void> {
  const ref = doc(db, 'users', uid, 'journals', journalId, 'entries', entryId);
  await deleteDoc(ref);
  // Atomically decrement entryCount (min 0 guard is handled by Firestore rules)
  await incrementEntryCount(uid, journalId, -1);
}
