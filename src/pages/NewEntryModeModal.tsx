import React from 'react';
import { Feather, BookOpen, Sparkles } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import type { ReflectionMode } from '../types/index';

interface NewEntryModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: ReflectionMode) => void;
  journalTitle: string;
}

export const NewEntryModeModal: React.FC<NewEntryModeModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
  journalTitle,
}) => {
  const modes: {
    id: ReflectionMode;
    label: string;
    description: string;
    note: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'write',
      label: 'Write Yourself',
      description:
        'Write freely in complete independence. No prompts, no suggestions, no AI while you write. You may optionally request a Gemini perspective afterward.',
      note: 'Solitary & Unassisted',
      icon: <Feather className="w-5 h-5 text-[#9E4F36]" />,
      color: 'hover:border-[#9E4F36]/40',
    },
    {
      id: 'summarize',
      label: 'Summarize with Gemini',
      description:
        'Pour out raw, unstructured thoughts, then explicitly invite Gemini to illuminate recurring themes and core intentions. Your original writing is preserved completely unaltered.',
      note: 'Original text never overwritten',
      icon: <BookOpen className="w-5 h-5 text-[#B87B28]" />,
      color: 'hover:border-[#B87B28]/40',
    },
    {
      id: 'conversation',
      label: 'Talk to Gemini',
      description:
        'Have a natural dialogue with a thoughtful companion. Explore whatever is lingering on your mind. The conversation becomes your personal record.',
      note: 'Conversational & Non-Prescriptive',
      icon: <Sparkles className="w-5 h-5 text-[#3B5446]" />,
      color: 'hover:border-[#3B5446]/40',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose a reflection mode"
      subtitle={`Adding a new entry to "${journalTitle}"`}
      maxWidth="lg"
    >
      <div className="space-y-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => {
              onSelectMode(mode.id);
              onClose();
            }}
            className={`w-full p-5 text-left rounded-xl border border-[#DDD6C8] bg-[#FAF8F3] ${mode.color} transition-all hover:shadow-xs group cursor-pointer`}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFEAE0] border border-[#DDD6C8] flex items-center justify-center shrink-0">
                {mode.icon}
              </div>
              <div>
                <h4 className="font-serif text-base font-medium text-[#25211E]">
                  {mode.label}
                </h4>
                <p className="mt-1 text-xs text-[#79726A] leading-relaxed font-sans">
                  {mode.description}
                </p>
                <span className="mt-2 inline-block text-[11px] font-mono text-[#8F877E] bg-[#EFEAE0] px-2 py-0.5 rounded-full">
                  {mode.note}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
};
