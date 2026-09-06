import type { Request } from 'express';

export type ReflectionMode = 'write' | 'summarize' | 'conversation';

export interface ChatMessage {
  id?: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp?: string;
}

export interface AIReflection {
  title: string;
  shortSummary: string;
  keyThoughts: string[];
  themes: string[];
  goals: string[];
  actionItems: string[];
  reflection: string;
  generatedAt?: Date | string;
}

export interface WeeklyInsight {
  id?: string;
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
  generatedAt?: Date | string;
}

export interface AuthenticatedUser {
  uid: string;
  email?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
