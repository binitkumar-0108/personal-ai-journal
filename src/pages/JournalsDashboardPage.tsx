import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Search } from 'lucide-react';
import type { Journal } from '../types/index';
import { JournalCard } from '../components/journal/JournalCard';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';

interface JournalsDashboardPageProps {
  journals: Journal[];
  onOpenJournal: (journal: Journal) => void;
  onEditJournal: (journal: Journal) => void;
  onDeleteJournal: (journal: Journal) => void;
  onCreateNewJournal: () => void;
}

export const JournalsDashboardPage: React.FC<JournalsDashboardPageProps> = ({
  journals,
  onOpenJournal,
  onEditJournal,
  onDeleteJournal,
  onCreateNewJournal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning.' : hour < 17 ? 'Good afternoon.' : 'Good evening.';

  const filteredJournals = journals.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[#E8DFCFA] gap-4">
        <div>
          <span className="font-serif italic text-lg sm:text-xl text-[#A25438] block mb-1">
            {greeting}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1816] tracking-tight">
            Your journals
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#7D736A] font-sans">
            Each book holds a chapter of your thoughts, memories, and perspectives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {journals.length > 2 && (
            <div className="relative">
              <Search className="w-4 h-4 text-[#8C8277] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find a journal..."
                className="pl-9 pr-4 py-2 bg-[#F2ECE1] border border-[#DDD3C2] rounded-xl text-xs sm:text-sm text-[#221E1C] placeholder-[#8C8277] focus:outline-none focus:ring-2 focus:ring-[#A25438]/30 w-44 sm:w-56"
              />
            </div>
          )}

          <Button
            variant="terracotta"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={onCreateNewJournal}
          >
            New Journal
          </Button>
        </div>
      </div>

      {/* Journals Grid */}
      <div className="mt-8 sm:mt-10">
        {filteredJournals.length === 0 ? (
          journals.length === 0 ? (
            <EmptyState
              title="No journals created yet"
              description="Your thoughts need a home. Create your first physical book to begin writing and reflecting."
              actionText="+ Create Your First Journal"
              onAction={onCreateNewJournal}
              icon={<BookOpen className="w-7 h-7 text-[#A25438]" />}
            />
          ) : (
            <div className="text-center py-16 text-sm text-[#7D736A]">
              No journals match &ldquo;{searchQuery}&rdquo;.
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredJournals.map((journal, i) => (
              <motion.div
                key={journal.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <JournalCard
                  journal={journal}
                  onOpen={onOpenJournal}
                  onEdit={onEditJournal}
                  onDelete={onDeleteJournal}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
