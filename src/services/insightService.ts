/**
 * Firestore insight service.
 *
 * Weekly insights are written exclusively by the Cloud Run backend via Admin SDK.
 * The client can only READ insights.
 */

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  type Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { WeeklyInsight } from '../types/index';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function docToInsight(id: string, data: DocumentData): WeeklyInsight {
  const generatedAt: Date =
    (data.generatedAt as Timestamp)?.toDate() ?? new Date();

  return {
    id,
    userId: data.userId as string,
    weekRange: data.weekRange as string,
    headline: data.headline as string,
    narrativeOverview: data.narrativeOverview as string,
    recurringThemes: (data.recurringThemes as WeeklyInsight['recurringThemes']) ?? [],
    goalsIdentified: (data.goalsIdentified as string[]) ?? [],
    actionItemsRecorded: (data.actionItemsRecorded as string[]) ?? [],
    patternObservations: (data.patternObservations as string[]) ?? [],
    reflectionHighlights:
      (data.reflectionHighlights as WeeklyInsight['reflectionHighlights']) ?? [],
    totalWordsWritten: (data.totalWordsWritten as number) ?? 0,
    entriesAnalyzedCount: (data.entriesAnalyzedCount as number) ?? 0,
    generatedAt,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch the most recent weekly insight for the authenticated user.
 * Returns null if none has been generated yet.
 */
export async function getLatestWeeklyInsight(
  uid: string,
): Promise<WeeklyInsight | null> {
  const ref = collection(db, 'users', uid, 'weeklyInsights');
  const q = query(ref, orderBy('generatedAt', 'desc'), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return docToInsight(d.id, d.data());
}
