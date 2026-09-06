import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../config/firebaseAdmin.js';
import type { AIReflection, WeeklyInsight } from '../types/index.js';

interface JournalEntryData {
  id: string;
  journalId: string;
  userId: string;
  title: string;
  date: string;
  originalContent: string;
  aiReflection?: AIReflection;
  createdAt: Date;
}

/**
 * Fetch entries for the verified user within the last N days (default 7 days).
 *
 * Invariants:
 * 1. Uses collectionGroup('entries') filtered strictly by verifiedUid.
 * 2. Does NOT fetch all entries in memory — uses Firestore index.
 */
export async function getVerifiedUserRecentEntries(
  verifiedUid: string,
  daysLookback: number = 7,
): Promise<JournalEntryData[]> {
  const cutoffDate = new Date(Date.now() - daysLookback * 24 * 60 * 60 * 1000);
  const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

  const snapshot = await adminDb
    .collectionGroup('entries')
    .where('userId', '==', verifiedUid)
    .where('createdAt', '>=', cutoffTimestamp)
    .orderBy('createdAt', 'desc')
    .get();

  const entries: JournalEntryData[] = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();

    entries.push({
      id: doc.id,
      journalId: data.journalId as string,
      userId: data.userId as string,
      title: (data.title as string) || 'Untitled',
      date: (data.date as string) || '',
      originalContent: (data.originalContent as string) || '',
      aiReflection: data.aiReflection as AIReflection | undefined,
      createdAt,
    });
  }

  return entries;
}

/**
 * Store a synthesized WeeklyInsight in Firestore for the verified user.
 * Written exclusively by Cloud Run backend via Admin SDK.
 */
export async function saveWeeklyInsight(
  verifiedUid: string,
  insightData: Omit<WeeklyInsight, 'id' | 'userId' | 'generatedAt'>,
): Promise<WeeklyInsight> {
  const collectionRef = adminDb
    .collection('users')
    .doc(verifiedUid)
    .collection('weeklyInsights');

  const payload = {
    userId: verifiedUid,
    ...insightData,
    generatedAt: FieldValue.serverTimestamp(),
  };

  const docRef = await collectionRef.add(payload);
  const snap = await docRef.get();
  const data = snap.data()!;

  return {
    id: docRef.id,
    userId: verifiedUid,
    weekRange: data.weekRange as string,
    headline: data.headline as string,
    narrativeOverview: data.narrativeOverview as string,
    recurringThemes: data.recurringThemes,
    goalsIdentified: data.goalsIdentified,
    actionItemsRecorded: data.actionItemsRecorded,
    patternObservations: data.patternObservations,
    reflectionHighlights: data.reflectionHighlights,
    totalWordsWritten: data.totalWordsWritten as number,
    entriesAnalyzedCount: data.entriesAnalyzedCount as number,
    generatedAt: new Date(),
  };
}

/**
 * Write aiReflection directly to an existing journal entry using Admin SDK.
 * Ensures generatedAt is persisted with FieldValue.serverTimestamp().
 */
export async function writeEntryAIReflection(
  verifiedUid: string,
  journalId: string,
  entryId: string,
  reflection: AIReflection,
): Promise<void> {
  const entryRef = adminDb
    .collection('users')
    .doc(verifiedUid)
    .collection('journals')
    .doc(journalId)
    .collection('entries')
    .doc(entryId);

  const entrySnap = await entryRef.get();
  if (!entrySnap.exists) {
    throw new Error('Target journal entry not found.');
  }

  await entryRef.update({
    aiReflection: {
      ...reflection,
      generatedAt: FieldValue.serverTimestamp(),
    },
    updatedAt: FieldValue.serverTimestamp(),
  });
}
