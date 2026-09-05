import { useState, useEffect, useCallback } from 'react';
import type { 
  Journal, 
  JournalEntry, 
  ReflectionMode, 
  WeeklyInsight, 
  AIReflection,
  ChatMessage 
} from './types/index';
import { useAuth } from './context/AuthContext';
import { 
  getJournals, 
  createJournal, 
  updateJournal, 
  deleteJournal, 
  type CreateJournalDTO 
} from './services/journalService';
import { 
  getEntries, 
  createEntry, 
  deleteEntry 
} from './services/entryService';
import { getLatestWeeklyInsight } from './services/insightService';
import { generateReflection, generateWeeklyInsights } from './services/apiService';

import { Navbar } from './components/common/Navbar';
import { LoadingState } from './components/common/LoadingState';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { JournalsDashboardPage } from './pages/JournalsDashboardPage';
import { CreateJournalModal } from './pages/CreateJournalModal';
import { JournalDetailPage } from './pages/JournalDetailPage';
import { NewEntryModeModal } from './pages/NewEntryModeModal';
import { WriteYourselfPage } from './pages/WriteYourselfPage';
import { SummarizeGeminiPage } from './pages/SummarizeGeminiPage';
import { TalkToGeminiPage } from './pages/TalkToGeminiPage';
import { AIReflectionReviewPage } from './pages/AIReflectionReviewPage';
import { BookRevealAnimation } from './components/journal/BookRevealAnimation';
import { EntryDetailPage } from './pages/EntryDetailPage';
import { HistoryPage } from './pages/HistoryPage';
import { WeeklyInsightsPage } from './pages/WeeklyInsightsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const { user, loading: authLoading, signInWithGoogle, logout, getIdToken } = useAuth();

  // Navigation & View State
  const [currentRoute, setCurrentRoute] = useState<string>('landing');

  // Application Data States
  const [journals, setJournals] = useState<Journal[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [weeklyInsight, setWeeklyInsight] = useState<WeeklyInsight | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [insightsLoading, setInsightsLoading] = useState<boolean>(false);

  // Active selections
  const [activeJournalId, setActiveJournalId] = useState<string>('');
  const [activeEntryId, setActiveEntryId] = useState<string>('');
  const [activeEntryIndex, setActiveEntryIndex] = useState<number>(0);

  // Modals state
  const [isCreateJournalOpen, setIsCreateJournalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);

  // 3D Reveal state
  const [revealData, setRevealData] = useState<{
    journal: Journal;
    entry: JournalEntry;
  } | null>(null);

  // Pre-save reflection review state
  const [pendingReflectionData, setPendingReflectionData] = useState<{
    journal: Journal;
    title: string;
    content: string;
    conversation?: ChatMessage[];
    reflection: AIReflection;
  } | null>(null);

  // Reload all data for the current user
  const loadUserData = useCallback(async (uid: string) => {
    setDataLoading(true);
    try {
      const fetchedJournals = await getJournals(uid);
      setJournals(fetchedJournals);

      if (fetchedJournals.length > 0) {
        // Load entries for all journals
        const entriesPromises = fetchedJournals.map((j) => getEntries(uid, j.id));
        const entriesArrays = await Promise.all(entriesPromises);
        const allEntries = entriesArrays.flat();
        setEntries(allEntries);

        setActiveJournalId((prev) => prev || fetchedJournals[0].id);
      } else {
        setEntries([]);
      }

      const fetchedInsight = await getLatestWeeklyInsight(uid);
      setWeeklyInsight(fetchedInsight);
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Sync route on auth state changes
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadUserData(user.uid);
        setCurrentRoute((prev) => (prev === 'landing' || prev === 'auth' ? 'journals' : prev));
      } else {
        setJournals([]);
        setEntries([]);
        setWeeklyInsight(null);
        setActiveJournalId('');
        setCurrentRoute('landing');
      }
    }
  }, [user, authLoading, loadUserData]);

  const activeJournal = journals.find((j) => j.id === activeJournalId) || journals[0];
  const activeJournalEntries = entries.filter((e) => e.journalId === activeJournal?.id);
  const activeEntry = entries.find((e) => e.id === activeEntryId);

  // Navigation handlers
  const handleNavigate = (route: string, param?: string) => {
    if (param) {
      if (route === 'journal-detail') {
        setActiveJournalId(param);
        setActiveEntryIndex(0);
      } else if (route === 'entry-detail') {
        setActiveEntryId(param);
      }
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth actions
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      setCurrentRoute('journals');
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentRoute('landing');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  // Journal CRUD
  const handleCreateJournal = async (dto: CreateJournalDTO): Promise<Journal> => {
    if (!user) throw new Error('Must be signed in');
    const newJournal = await createJournal(user.uid, dto);
    const updated = await getJournals(user.uid);
    setJournals(updated);
    setActiveJournalId(newJournal.id);
    setActiveEntryIndex(0);
    setCurrentRoute('journal-detail');
    return newJournal;
  };

  const handleUpdateJournal = async (id: string, updates: Partial<Journal>) => {
    if (!user) return;
    await updateJournal(user.uid, id, updates);
    const updated = await getJournals(user.uid);
    setJournals(updated);
    setEditingJournal(null);
  };

  const handleDeleteJournal = async (journal: Journal) => {
    if (!user) return;
    if (window.confirm(`Are you sure you want to delete "${journal.title}" and its pages?`)) {
      await deleteJournal(user.uid, journal.id);
      const updatedJournals = await getJournals(user.uid);
      setJournals(updatedJournals);
      setEntries((prev) => prev.filter((e) => e.journalId !== journal.id));
      if (activeJournalId === journal.id) {
        if (updatedJournals.length > 0) {
          setActiveJournalId(updatedJournals[0].id);
        } else {
          setActiveJournalId('');
        }
      }
    }
  };

  // Entry CRUD & Flow
  const handleSelectReflectionMode = (mode: ReflectionMode, targetJournalId?: string) => {
    if (targetJournalId) {
      setActiveJournalId(targetJournalId);
    }
    if (mode === 'write') {
      setCurrentRoute('write-yourself');
    } else if (mode === 'summarize') {
      setCurrentRoute('summarize-gemini');
    } else if (mode === 'conversation') {
      setCurrentRoute('talk-to-gemini');
    }
  };

  // Save from Write Yourself
  const handleSaveWriteYourself = async (data: { title: string; content: string }) => {
    if (!user || !activeJournal) return;
    const newEntry = await createEntry(user.uid, {
      journalId: activeJournal.id,
      title: data.title,
      mode: 'write',
      originalContent: data.content,
    });

    await loadUserData(user.uid);

    // Launch signature 3D book reveal sequence
    setRevealData({
      journal: activeJournal,
      entry: newEntry,
    });
  };

  // Save from Summarize with Gemini
  const handleSaveSummarize = async (data: {
    title: string;
    content: string;
    aiReflection?: AIReflection;
  }) => {
    if (!user || !activeJournal) return;
    const newEntry = await createEntry(user.uid, {
      journalId: activeJournal.id,
      title: data.title,
      mode: 'summarize',
      originalContent: data.content,
      aiReflection: data.aiReflection,
    });

    await loadUserData(user.uid);

    // Launch reveal sequence
    setRevealData({
      journal: activeJournal,
      entry: newEntry,
    });
  };

  // Save from Talk to Gemini (route to review page first)
  const handleSaveTalkToGemini = async (data: {
    title: string;
    content: string;
    conversation: ChatMessage[];
    aiReflection: AIReflection;
  }) => {
    if (!activeJournal) return;
    setPendingReflectionData({
      journal: activeJournal,
      title: data.title,
      content: data.content,
      conversation: data.conversation,
      reflection: data.aiReflection,
    });
    setCurrentRoute('reflection-review');
  };

  // Confirm Save from Reflection Review Page
  const handleConfirmReflectionReview = async () => {
    if (!user || !pendingReflectionData) return;

    const newEntry = await createEntry(user.uid, {
      journalId: pendingReflectionData.journal.id,
      title: pendingReflectionData.title,
      mode: 'conversation',
      originalContent: pendingReflectionData.content,
      conversation: pendingReflectionData.conversation,
      aiReflection: pendingReflectionData.reflection,
    });

    await loadUserData(user.uid);

    setRevealData({
      journal: pendingReflectionData.journal,
      entry: newEntry,
    });
    setPendingReflectionData(null);
  };

  // When 3D reveal animation finishes, transition into the journal book
  const handleRevealComplete = () => {
    if (revealData) {
      setActiveJournalId(revealData.journal.id);
      setActiveEntryIndex(0);
      setRevealData(null);
      setCurrentRoute('journal-detail');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user || !activeJournal) return;
    await deleteEntry(user.uid, activeJournal.id, entryId);
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  const handleRequestReflection = async (entry: JournalEntry) => {
    try {
      const token = await getIdToken();
      const reflection = await generateReflection(
        token,
        entry.mode,
        entry.originalContent,
        entry.conversation
      );
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, aiReflection: reflection } : e))
      );
    } catch (err) {
      console.error('Failed to request reflection:', err);
    }
  };

  const handleGenerateWeeklyInsight = async () => {
    setInsightsLoading(true);
    try {
      const token = await getIdToken();
      const insight = await generateWeeklyInsights(token);
      setWeeklyInsight(insight);
    } catch (err) {
      console.error('Failed to generate weekly insight:', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5EE] flex items-center justify-center">
        <LoadingState label="Loading Personal AI Journal..." sublabel="Securing owner-isolated workspace" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#25211E] flex flex-col font-sans selection:bg-[#EBE2D3] selection:text-[#1F1C1A]">
      {/* Global Navigation Bar */}
      <Navbar
        activeTab={currentRoute}
        onNavigate={(tab, param) => handleNavigate(tab, param)}
        currentUser={user}
        onSignOut={handleSignOut}
        onOpenNewEntryModal={() => setIsNewEntryModalOpen(true)}
      />

      {/* Main Routed View */}
      <main className="flex-1">
        {/* 1. Welcome / Landing Page */}
        {currentRoute === 'landing' && (
          <LandingPage
            onStart={() => {
              if (user) {
                setCurrentRoute('journals');
              } else {
                setCurrentRoute('auth');
              }
            }}
            onExplore={() => {
              setCurrentRoute('history');
            }}
          />
        )}

        {/* 2. Authentication Page */}
        {currentRoute === 'auth' && (
          <AuthPage
            onSignIn={handleSignIn}
            onCancel={() => setCurrentRoute('landing')}
          />
        )}

        {/* 3. My Journals Dashboard */}
        {currentRoute === 'journals' && (
          dataLoading ? (
            <div className="py-20 flex justify-center">
              <LoadingState label="Opening your journals..." sublabel="Fetching authenticated volumes" />
            </div>
          ) : (
            <JournalsDashboardPage
              journals={journals}
              onOpenJournal={(journal) => {
                setActiveJournalId(journal.id);
                setActiveEntryIndex(0);
                setCurrentRoute('journal-detail');
              }}
              onEditJournal={(journal) => {
                setEditingJournal(journal);
                setIsCreateJournalOpen(true);
              }}
              onDeleteJournal={handleDeleteJournal}
              onCreateNewJournal={() => {
                setEditingJournal(null);
                setIsCreateJournalOpen(true);
              }}
            />
          )
        )}

        {/* 4. Journal Detail / 3D Book Experience */}
        {currentRoute === 'journal-detail' && activeJournal && (
          <JournalDetailPage
            journal={activeJournal}
            entries={activeJournalEntries}
            initialEntryIndex={activeEntryIndex}
            onBack={() => setCurrentRoute('journals')}
            onNewEntry={() => setIsNewEntryModalOpen(true)}
            onEditJournal={(journal) => {
              setEditingJournal(journal);
              setIsCreateJournalOpen(true);
            }}
            onRequestReflection={handleRequestReflection}
            onEntryUpdated={(updatedEntry) => {
              setEntries((prev) => prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)));
            }}
          />
        )}

        {/* 5. Write Yourself Mode */}
        {currentRoute === 'write-yourself' && activeJournal && (
          <WriteYourselfPage
            journal={activeJournal}
            onBack={() => setCurrentRoute('journal-detail')}
            onSaveEntry={handleSaveWriteYourself}
          />
        )}

        {/* 6. Summarize with Gemini Mode */}
        {currentRoute === 'summarize-gemini' && activeJournal && (
          <SummarizeGeminiPage
            journal={activeJournal}
            onBack={() => setCurrentRoute('journal-detail')}
            onSaveEntry={handleSaveSummarize}
          />
        )}

        {/* 7. Talk to Gemini Mode */}
        {currentRoute === 'talk-to-gemini' && activeJournal && (
          <TalkToGeminiPage
            journal={activeJournal}
            onBack={() => setCurrentRoute('journal-detail')}
            onSaveReflection={handleSaveTalkToGemini}
          />
        )}

        {/* 8. AI Reflection Review */}
        {currentRoute === 'reflection-review' && pendingReflectionData && (
          <AIReflectionReviewPage
            journal={pendingReflectionData.journal}
            entryTitle={pendingReflectionData.title}
            originalContent={pendingReflectionData.content}
            reflection={pendingReflectionData.reflection}
            onBackToEdit={() => setCurrentRoute('talk-to-gemini')}
            onSaveToJournal={handleConfirmReflectionReview}
          />
        )}

        {/* 9. Entry Detail View */}
        {currentRoute === 'entry-detail' && activeEntry && (
          <EntryDetailPage
            journal={
              journals.find((j) => j.id === activeEntry.journalId) || activeJournal
            }
            entry={activeEntry}
            onBack={() => setCurrentRoute('history')}
            onDeleteEntry={handleDeleteEntry}
          />
        )}

        {/* 10. Personal History */}
        {currentRoute === 'history' && (
          <HistoryPage
            entries={entries}
            journals={journals}
            onOpenEntry={(entry) => {
              setActiveEntryId(entry.id);
              setCurrentRoute('entry-detail');
            }}
            onOpenJournal={(journal) => {
              setActiveJournalId(journal.id);
              setActiveEntryIndex(0);
              setCurrentRoute('journal-detail');
            }}
          />
        )}

        {/* 11. Weekly Insights ("Your Week in Reflection") */}
        {currentRoute === 'weekly-insights' && (
          <WeeklyInsightsPage 
            insight={weeklyInsight} 
            isLoading={insightsLoading}
            onGenerateInsight={handleGenerateWeeklyInsight}
          />
        )}

        {/* 12. Settings / Profile */}
        {currentRoute === 'settings' && (
          <SettingsPage
            currentUser={user}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* Signature 3D Book Reveal Sequence Overlay */}
      {revealData && (
        <BookRevealAnimation
          journal={revealData.journal}
          entry={revealData.entry}
          onComplete={handleRevealComplete}
        />
      )}

      {/* Modals */}
      <CreateJournalModal
        isOpen={isCreateJournalOpen}
        onClose={() => {
          setIsCreateJournalOpen(false);
          setEditingJournal(null);
        }}
        onCreate={handleCreateJournal}
        editingJournal={editingJournal}
        onUpdate={handleUpdateJournal}
      />

      <NewEntryModeModal
        isOpen={isNewEntryModalOpen}
        onClose={() => setIsNewEntryModalOpen(false)}
        journalTitle={activeJournal?.title || 'Personal Journal'}
        onSelectMode={(mode) => handleSelectReflectionMode(mode, activeJournalId)}
      />
    </div>
  );
}