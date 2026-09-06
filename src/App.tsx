import { useState, useEffect, useCallback, useMemo } from 'react';
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
  deleteEntry,
  attachEntryReflection,
  attachVoiceRecording
} from './services/entryService';
import { uploadVoiceRecording, deleteVoiceRecording } from './services/storageService';
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

        // Parse hash if present on initial load
        const hash = window.location.hash;
        if (hash.startsWith('#/journals/')) {
          const parts = hash.split('/');
          const journalId = parts[2];
          const entriesPart = parts[3];
          const entryId = parts[4];
          
          if (journalId && fetchedJournals.some(j => j.id === journalId)) {
            setActiveJournalId(journalId);
            if (entriesPart === 'entries' && entryId) {
              const jEntries = allEntries
                .filter(e => e.journalId === journalId)
                .sort((a, b) => {
                  const diff = a.createdAt.getTime() - b.createdAt.getTime();
                  if (diff !== 0) return diff;
                  return a.id.localeCompare(b.id);
                });
              const idx = jEntries.findIndex(e => e.id === entryId);
              if (idx >= 0) {
                setActiveEntryIndex(idx);
              }
            }
            setCurrentRoute('journal-detail');
          } else {
            setActiveJournalId(fetchedJournals[0].id);
          }
        } else {
          setActiveJournalId((prev) => prev || fetchedJournals[0].id);
        }
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
        const hash = window.location.hash.replace(/^#\/?/, '');
        if (hash.startsWith('journals/')) {
          setCurrentRoute('journal-detail');
        } else if (['history', 'weekly-insights', 'settings', 'journals', 'write-yourself', 'summarize-gemini', 'talk-to-gemini'].includes(hash)) {
          setCurrentRoute(hash);
        } else {
          setCurrentRoute('journals');
        }
      } else {
        setJournals([]);
        setEntries([]);
        setWeeklyInsight(null);
        setActiveJournalId('');
        const hash = window.location.hash.replace(/^#\/?/, '');
        setCurrentRoute(hash === 'auth' ? 'auth' : 'landing');
      }
    }
  }, [user, authLoading, loadUserData]);

  // Handle hash changes (e.g. browser back/forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!user) {
        if (hash === '#/auth') setCurrentRoute('auth');
        else setCurrentRoute('landing');
        return;
      }

      if (hash.startsWith('#/journals/')) {
        const parts = hash.split('/');
        const jId = parts[2];
        const entriesPart = parts[3];
        const eId = parts[4];
        if (jId) {
          setActiveJournalId(jId);
          if (entriesPart === 'entries' && eId) {
            const jEntries = entries
              .filter(e => e.journalId === jId)
              .sort((a, b) => {
                const diff = a.createdAt.getTime() - b.createdAt.getTime();
                if (diff !== 0) return diff;
                return a.id.localeCompare(b.id);
              });
            const idx = jEntries.findIndex(e => e.id === eId);
            if (idx >= 0) {
              setActiveEntryIndex(idx);
            }
          }
          setCurrentRoute('journal-detail');
        }
      } else {
        const routeName = hash.replace(/^#\/?/, '');
        if (routeName && ['journals', 'history', 'weekly-insights', 'settings', 'write-yourself', 'summarize-gemini', 'talk-to-gemini'].includes(routeName)) {
          setCurrentRoute(routeName);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user, entries]);

  const activeJournal = journals.find((j) => j.id === activeJournalId) || journals[0];
  const activeJournalEntries = useMemo(() => {
    if (!activeJournal) return [];
    return entries
      .filter((e) => e.journalId === activeJournal.id)
      .sort((a, b) => {
        const diff = a.createdAt.getTime() - b.createdAt.getTime();
        if (diff !== 0) return diff;
        return a.id.localeCompare(b.id);
      });
  }, [entries, activeJournal]);
  const activeEntry = entries.find((e) => e.id === activeEntryId);

  // Navigation handlers
  const handleNavigate = (route: string, param?: string, entryIndex?: number) => {
    if (param) {
      if (route === 'journal-detail') {
        setActiveJournalId(param);
        if (entryIndex !== undefined) {
          setActiveEntryIndex(entryIndex);
        } else {
          setActiveEntryIndex(0);
        }
      } else if (route === 'entry-detail') {
        setActiveEntryId(param);
      }
    }
    
    // Sync hash
    if (route === 'journal-detail') {
      const activeJId = param || activeJournalId;
      // We don't have entry id easily if entryIndex is 0 unless we look it up, 
      // but let's just do base journal hash for now, it'll update on actual JournalDetailPage.
      window.location.hash = `#/journals/${activeJId}`;
    } else if (route !== 'landing' && route !== 'auth') {
      window.location.hash = `#/${route}`;
    } else {
      window.location.hash = '';
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

  // Save from Write Yourself (Solitary writing)
  const handleSaveWriteYourself = async (data: {
    title: string;
    content: string;
    voiceBlob?: Blob;
    voiceDuration?: number;
  }) => {
    if (!user || !activeJournal) return;
    const newEntry = await createEntry(user.uid, {
      journalId: activeJournal.id,
      title: data.title,
      mode: 'write',
      originalContent: data.content,
    });

    if (data.voiceBlob) {
      try {
        const recording = await uploadVoiceRecording(user.uid, newEntry.id, data.voiceBlob, data.voiceDuration);
        await attachVoiceRecording(user.uid, activeJournal.id, newEntry.id, recording);
      } catch (err) {
        console.warn('Failed to upload initial voice recording:', err);
      }
    }

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
    voiceBlob?: Blob;
    voiceDuration?: number;
  }) => {
    if (!user || !activeJournal) return;

    // 1. Always save original entry in Firestore first (with reflection if available)
    const newEntry = await createEntry(user.uid, {
      journalId: activeJournal.id,
      title: data.title,
      mode: 'summarize',
      originalContent: data.content,
      aiReflection: data.aiReflection,
    });

    if (data.voiceBlob) {
      try {
        const recording = await uploadVoiceRecording(user.uid, newEntry.id, data.voiceBlob, data.voiceDuration);
        await attachVoiceRecording(user.uid, activeJournal.id, newEntry.id, recording);
      } catch (err) {
        console.warn('Failed to upload initial voice recording:', err);
      }
    }

    if (data.aiReflection) {
      try {
        localStorage.setItem(`gemini_reflection_${newEntry.id}`, JSON.stringify(data.aiReflection));
      } catch {
        // ignore
      }
    }

    // 2. If reflection was already requested/generated, also attempt backend persistence via Admin SDK
    if (data.aiReflection) {
      try {
        const token = await getIdToken();
        await generateReflection(
          token,
          'summarize',
          data.content,
          undefined,
          activeJournal.id,
          newEntry.id,
        );
      } catch (err) {
        console.warn('Backend reflection route call completed or skipped:', err);
      }
    }

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

    // 1. Persist the original content, dialogue, and AI reflection together
    const newEntry = await createEntry(user.uid, {
      journalId: pendingReflectionData.journal.id,
      title: pendingReflectionData.title,
      mode: 'conversation',
      originalContent: pendingReflectionData.content,
      conversation: pendingReflectionData.conversation,
      aiReflection: pendingReflectionData.reflection,
    });

    if (pendingReflectionData.reflection) {
      try {
        localStorage.setItem(`gemini_reflection_${newEntry.id}`, JSON.stringify(pendingReflectionData.reflection));
      } catch {
        // ignore
      }
    }

    // 2. Also attempt backend persistence via Admin SDK
    try {
      const token = await getIdToken();
      await generateReflection(
        token,
        'conversation',
        pendingReflectionData.content,
        pendingReflectionData.conversation,
        pendingReflectionData.journal.id,
        newEntry.id,
      );
    } catch (err) {
      console.warn('Backend reflection route call completed or skipped:', err);
    }

    await loadUserData(user.uid);

    setRevealData({
      journal: pendingReflectionData.journal,
      entry: newEntry,
    });
    setPendingReflectionData(null);
  };

  // When 3D reveal animation finishes, transition into the journal book on the newly added page
  const handleRevealComplete = () => {
    if (revealData) {
      const targetJournalId = revealData.journal.id;
      const targetEntryId = revealData.entry.id;
      setActiveJournalId(targetJournalId);

      // Find the index of the newly created page in the chronologically ordered journal
      const journalEntries = entries
        .filter((e) => e.journalId === targetJournalId)
        .sort((a, b) => {
          const diff = a.createdAt.getTime() - b.createdAt.getTime();
          if (diff !== 0) return diff;
          return a.id.localeCompare(b.id);
        });

      const foundIdx = journalEntries.findIndex((e) => e.id === targetEntryId);
      const targetIdx = foundIdx >= 0 ? foundIdx : Math.max(0, journalEntries.length - 1);

      setActiveEntryIndex(targetIdx);
      setRevealData(null);
      setCurrentRoute('journal-detail');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user || !activeJournal) return;
    
    // Optimistically find entry to cleanup voice if it exists
    const entryToDelete = entries.find(e => e.id === entryId);
    
    try {
      if (entryToDelete?.voiceRecording?.storagePath) {
        await deleteVoiceRecording(entryToDelete.voiceRecording.storagePath);
      }
    } catch (err) {
      console.warn('Failed to delete voice recording, but proceeding with entry deletion', err);
    }

    await deleteEntry(user.uid, activeJournal.id, entryId);
    
    try {
      localStorage.removeItem(`gemini_reflection_${entryId}`);
    } catch {
      // ignore
    }

    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  const handleRequestReflection = async (entry: JournalEntry) => {
    try {
      const token = await getIdToken();
      const reflection = await generateReflection(
        token,
        entry.mode,
        entry.originalContent,
        entry.conversation,
        entry.journalId,
        entry.id,
      );

      // Persist directly to Firestore as authenticated owner
      if (user) {
        try {
          await attachEntryReflection(user.uid, entry.journalId, entry.id, reflection);
        } catch (persistErr) {
          console.warn('Firestore direct write failed; falling back to local cache:', persistErr);
        }
        try {
          localStorage.setItem(`gemini_reflection_${entry.id}`, JSON.stringify(reflection));
        } catch {
          // ignore localStorage quota error
        }
      }

      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, aiReflection: reflection } : e)),
      );
    } catch (err) {
      console.error('Failed to request reflection:', err);
      throw err;
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
            onDeleteEntry={handleDeleteEntry}
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