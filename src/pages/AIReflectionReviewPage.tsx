import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import type { Journal, AIReflection } from '../types/index';
import { Button } from '../components/common/Button';
import { ReflectionCard } from '../components/reflection/ReflectionCard';

interface AIReflectionReviewPageProps {
  journal: Journal;
  entryTitle: string;
  originalContent: string;
  reflection: AIReflection;
  onBackToEdit: () => void;
  onSaveToJournal: () => void;
}

export const AIReflectionReviewPage: React.FC<AIReflectionReviewPageProps> = ({
  journal,
  entryTitle,
  originalContent,
  reflection,
  onBackToEdit,
  onSaveToJournal,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirmSave = () => {
    setIsSaving(true);
    onSaveToJournal();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#E8DFCFA] mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToEdit}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Edit
          </Button>
          <span className="text-[#D5CABB]">•</span>
          <span className="text-xs font-serif italic text-[#7D736A]">
            Review Reflection before Binding
          </span>
        </div>

        <Button
          variant="terracotta"
          size="md"
          leftIcon={<Save className="w-4 h-4" />}
          isLoading={isSaving}
          onClick={handleConfirmSave}
        >
          Save to Journal
        </Button>
      </div>

      <div className="space-y-8">
        {/* User's Original Writing Preview (Clearly distinguished) */}
        <div className="bg-[#FAF6EE] rounded-2xl border border-[#DDD3C2] p-6 sm:p-8 paper-texture">
          <div className="flex items-center justify-between text-xs font-mono text-[#8C8277] mb-3 pb-2 border-b border-[#E8DFCFA]">
            <span className="uppercase tracking-wider font-semibold text-[#1C1816]">
              Your Original Words (Unmodified)
            </span>
            <span>{journal.title}</span>
          </div>
          <h2 className="font-serif text-2xl font-medium text-[#1C1816] mb-3">
            {entryTitle}
          </h2>
          <p className="font-serif text-base text-[#463F3A] leading-relaxed whitespace-pre-wrap">
            {originalContent}
          </p>
        </div>

        {/* AI Structured Reflection Card */}
        <ReflectionCard reflection={reflection} />

        {/* Bottom actions */}
        <div className="pt-6 border-t border-[#E8DFCFA] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8C8277] font-mono">
            Saving will trigger the page-binding animation into your physical journal volume.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              onClick={onBackToEdit}
              className="w-full sm:w-auto"
            >
              Back to Edit
            </Button>
            <Button
              variant="terracotta"
              size="md"
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleConfirmSave}
              className="w-full sm:w-auto"
            >
              Save to Journal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
