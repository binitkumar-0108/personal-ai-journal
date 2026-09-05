import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import type { CoverTheme, Journal, CreateJournalDTO } from '../types/index';

interface CreateJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (dto: CreateJournalDTO) => Promise<Journal>;
  editingJournal?: Journal | null;
  onUpdate?: (id: string, updates: Partial<Pick<Journal, 'title' | 'description' | 'coverTheme'>>) => Promise<void>;
}

export const CreateJournalModal: React.FC<CreateJournalModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  editingJournal,
  onUpdate,
}) => {
  const [title, setTitle] = useState(editingJournal ? editingJournal.title : '');
  const [description, setDescription] = useState(editingJournal ? editingJournal.description : '');
  const [coverTheme, setCoverTheme] = useState<CoverTheme>(
    editingJournal ? editingJournal.coverTheme : 'terracotta',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (editingJournal) {
      setTitle(editingJournal.title);
      setDescription(editingJournal.description);
      setCoverTheme(editingJournal.coverTheme);
    } else {
      setTitle('');
      setDescription('');
      setCoverTheme('terracotta');
    }
  }, [editingJournal, isOpen]);

  const themes: { id: CoverTheme; label: string; color: string }[] = [
    { id: 'terracotta', label: 'Terracotta Leather', color: 'bg-[#8C4631]' },
    { id: 'moss', label: 'Forest Linen', color: 'bg-[#334D3E]' },
    { id: 'indigo', label: 'Deep Indigo Cloth', color: 'bg-[#243342]' },
    { id: 'espresso', label: 'Espresso Calfskin', color: 'bg-[#3A2D26]' },
    { id: 'parchment', label: 'Vintage Parchment', color: 'bg-[#D8C9B3]' },
    { id: 'burgundy', label: 'Royal Burgundy', color: 'bg-[#542127]' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingJournal && onUpdate) {
        await onUpdate(editingJournal.id, {
          title: title.trim(),
          description: description.trim(),
          coverTheme,
        });
      } else {
        await onCreate({
          title: title.trim(),
          description: description.trim(),
          coverTheme,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingJournal ? 'Edit Journal Binding' : 'Bind a New Journal'}
      subtitle="Give this volume a name, purpose, and distinctive cover."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Preview Mini */}
        <div className="p-4 bg-[#EFEAE0] rounded-xl border border-[#DDD6C8] flex items-center gap-4">
          <div
            className={`w-12 h-16 rounded-r-md rounded-l-xs ${
              themes.find((t) => t.id === coverTheme)?.color || 'bg-[#8C4631]'
            } shadow-md border-r border-black/20 flex flex-col justify-between p-1.5 shrink-0`}
          >
            <div className="w-1.5 h-full bg-black/20 -ml-1" />
          </div>
          <div>
            <h4 className="font-serif text-base font-medium text-[#25211E]">
              {title.trim() || 'Untitled Journal'}
            </h4>
            <p className="text-xs text-[#79726A] line-clamp-1 font-sans">
              {description.trim() || 'No description yet.'}
            </p>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#79726A] mb-1.5">
            Journal Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Personal Reflections, Studio Notes, Kyoto Field Journal"
            className="w-full px-4 py-2.5 bg-[#FAF8F3] border border-[#DDD6C8] rounded-xl text-[#25211E] placeholder-[#8F877E] focus:outline-none focus:ring-2 focus:ring-[#9E4F36]/30 font-serif text-base"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#79726A] mb-1.5">
            Description / Intention (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What thoughts, seasons, or questions will live between these pages?"
            className="w-full px-4 py-2.5 bg-[#FAF8F3] border border-[#DDD6C8] rounded-xl text-xs sm:text-sm text-[#25211E] placeholder-[#8F877E] focus:outline-none focus:ring-2 focus:ring-[#9E4F36]/30 font-sans resize-none"
          />
        </div>

        {/* Cover Theme */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#79726A] mb-2">
            Binding &amp; Cloth Appearance
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setCoverTheme(t.id)}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                  coverTheme === t.id
                    ? 'border-[#25211E] bg-[#FAF8F3] shadow-xs'
                    : 'border-[#DDD6C8] bg-[#FAF8F3]/50 hover:bg-[#FAF8F3]'
                }`}
              >
                <span className={`w-5 h-5 rounded-full ${t.color} border border-black/15 shrink-0 flex items-center justify-center text-white text-[10px]`}>
                  {coverTheme === t.id && <Check className="w-3 h-3" />}
                </span>
                <span className="text-xs font-medium text-[#25211E] truncate">
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-[#EAE4D8] flex items-center justify-end gap-3">
          <Button variant="ghost" size="md" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="terracotta"
            size="md"
            type="submit"
            isLoading={isSubmitting}
            disabled={!title.trim()}
          >
            {editingJournal ? 'Save Changes' : 'Create Journal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
