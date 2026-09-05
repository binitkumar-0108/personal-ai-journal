/**
 * Real Firestore journal service.
 *
 * Security guarantees:
 *   - All operations require a caller-supplied uid (derived from Firebase Auth token).
 *   - entryCount is only modified via atomic FieldValue.increment — never set directly.
 *   - Clients never write aiReflection; that field belongs to Cloud Run backend only.
 *   - Journal deletion also batch-deletes all entries in the subcollection.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  increment,
  writeBatch,
  type Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Journal, CreateJournalDTO } from '../types/index';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Compute a human-readable relative date string for display. */
function computeLastUpdated(updatedAt: Date): string {
  const diffMs = Date.now() - updatedAt.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Convert a raw Firestore document to a typed Journal. */
function docToJournal(id: string, data: DocumentData): Journal {
  const createdAt: Date = (data.createdAt as Timestamp)?.toDate() ?? new Date();
  const updatedAt: Date = (data.updatedAt as Timestamp)?.toDate() ?? new Date();
  return {
    id,
    userId: data.userId as string,
    title: data.title as string,
    description: (data.description as string) ?? '',
    coverTheme: data.coverTheme ?? 'terracotta',
    entryCount: (data.entryCount as number) ?? 0,
    lastUpdated: computeLastUpdated(updatedAt),
    createdAt,
    updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Fetch all journals for the authenticated user, newest-first. */
export async function getJournals(uid: string): Promise<Journal[]> {
  const ref = collection(db, 'users', uid, 'journals');
  const q = query(ref, orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToJournal(d.id, d.data()));
}

/** Fetch a single journal. Returns null if not found. */
export async function getJournal(
  uid: string,
  journalId: string,
): Promise<Journal | null> {
  const ref = doc(db, 'users', uid, 'journals', journalId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return docToJournal(snap.id, snap.data());
}

/** Create a new journal and return it. */
export async function createJournal(
  uid: string,
  dto: CreateJournalDTO,
): Promise<Journal> {
  const ref = collection(db, 'users', uid, 'journals');
  const payload = {
    userId: uid,
    title: dto.title.trim(),
    description: dto.description.trim() || 'A private space for thoughts and reflections.',
    coverTheme: dto.coverTheme ?? 'terracotta',
    entryCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(ref, payload);
  // Re-fetch to get the server-resolved timestamps
  const snap = await getDoc(docRef);
  return docToJournal(snap.id, snap.data()!);
}

/** Update mutable journal fields (title, description, coverTheme). */
export async function updateJournal(
  uid: string,
  journalId: string,
  updates: Partial<Pick<Journal, 'title' | 'description' | 'coverTheme'>>,
): Promise<void> {
  const ref = doc(db, 'users', uid, 'journals', journalId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a journal and ALL its entries (subcollection).
 * Firestore does not auto-delete subcollections when the parent is deleted,
 * so we must batch-delete entries first.
 */
export async function deleteJournal(uid: string, journalId: string): Promise<void> {
  const entriesRef = collection(db, 'users', uid, 'journals', journalId, 'entries');
  const entriesSnap = await getDocs(entriesRef);

  // Batch-delete all entries (Firestore batch limit is 500 writes)
  const BATCH_LIMIT = 400;
  let batch = writeBatch(db);
  let opCount = 0;

  for (const entryDoc of entriesSnap.docs) {
    batch.delete(entryDoc.ref);
    opCount++;
    if (opCount >= BATCH_LIMIT) {
      await batch.commit();
      batch = writeBatch(db);
      opCount = 0;
    }
  }
  if (opCount > 0) {
    await batch.commit();
  }

  // Delete the journal document itself
  const journalRef = doc(db, 'users', uid, 'journals', journalId);
  await deleteDoc(journalRef);
}

/**
 * Atomically increment the entry count on a journal.
 * Server-controlled — clients must not set entryCount directly.
 */
export async function incrementEntryCount(
  uid: string,
  journalId: string,
  delta: 1 | -1 = 1,
): Promise<void> {
  const ref = doc(db, 'users', uid, 'journals', journalId);
  await updateDoc(ref, {
    entryCount: increment(delta),
    updatedAt: serverTimestamp(),
  });
}

export type { CreateJournalDTO };