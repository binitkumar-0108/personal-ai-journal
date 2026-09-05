import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, MoreVertical, Edit2, Trash2, BookOpen as BookOpenAlt } from 'lucide-react';
import type { Journal, CoverTheme } from '../../types/index';

interface JournalCardProps {
  journal: Journal;
  onOpen: (journal: Journal) => void;
  onEdit?: (journal: Journal) => void;
  onDelete?: (journal: Journal) => void;
}

export const JournalCard: React.FC<JournalCardProps> = ({
  journal,
  onOpen,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const themeStyles: Record<
    CoverTheme,
    {
      cover: string;
      spine: string;
      ribbon: string;
      foil: string;
      textColor: string;
      subtextColor: string;
    }
  > = {
    terracotta: {
      cover: 'bg-[#8C4631]',
      spine: 'bg-[#6E3321]',
      ribbon: 'bg-[#B87B28]',
      foil: 'text-[#F5EDE1]',
      textColor: 'text-[#FAF5EE]',
      subtextColor: 'text-[#E7D6C5]',
    },
    moss: {
      cover: 'bg-[#334D3E]',
      spine: 'bg-[#22362B]',
      ribbon: 'bg-[#A38956]',
      foil: 'text-[#E7ECE7]',
      textColor: 'text-[#F2F6F3]',
      subtextColor: 'text-[#CAD7CE]',
    },
    indigo: {
      cover: 'bg-[#243342]',
      spine: 'bg-[#18232E]',
      ribbon: 'bg-[#BD7342]',
      foil: 'text-[#E7EEF4]',
      textColor: 'text-[#F0F5FA]',
      subtextColor: 'text-[#C9D6E5]',
    },
    espresso: {
      cover: 'bg-[#3A2D26]',
      spine: 'bg-[#261C17]',
      ribbon: 'bg-[#9E4F36]',
      foil: 'text-[#EFE5DB]',
      textColor: 'text-[#FAF4EE]',
      subtextColor: 'text-[#D8C7B8]',
    },
    parchment: {
      cover: 'bg-[#D8C9B3]',
      spine: 'bg-[#BDB09B]',
      ribbon: 'bg-[#8C4631]',
      foil: 'text-[#33271F]',
      textColor: 'text-[#28201A]',
      subtextColor: 'text-[#57493D]',
    },
    burgundy: {
      cover: 'bg-[#542127]',
      spine: 'bg-[#381419]',
      ribbon: 'bg-[#CFA158]',
      foil: 'text-[#F9ECEB]',
      textColor: 'text-[#FCF3F2]',
      subtextColor: 'text-[#E3C3C0]',
    },
  };

  const theme = themeStyles[journal.coverTheme] || themeStyles.terracotta;

  return (
    <div className="relative group perspective-1000">
      <motion.div
        whileHover={{ y: -6, rotateY: -3, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative cursor-pointer select-none"
        onClick={() => onOpen(journal)}
      >
        {/* Book Edge Effect (Visible stacked paper pages on right) */}
        <div className="absolute right-[-7px] top-2 bottom-2 w-3 bg-[#EFEAE0] border-y border-r border-[#DDD6C8] rounded-r-sm shadow-xs flex flex-col justify-between py-1">
          <div className="w-full h-px bg-[#DDD6C8]" />
          <div className="w-full h-px bg-[#DDD6C8]" />
          <div className="w-full h-px bg-[#DDD6C8]" />
        </div>

        {/* Physical Book Cover Card */}
        <div
          className={`relative w-full rounded-r-xl rounded-l-md overflow-hidden ${theme.cover} journal-cover-shadow transition-shadow duration-300 border-y border-r border-black/10 min-h-[260px] sm:min-h-[290px] flex flex-col justify-between p-6 pl-8`}
        >
          {/* Subtle Leather Texture Vignette */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/10 pointer-events-none" />

          {/* Book Spine (Left side binding) */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-5 ${theme.spine} border-r border-black/20 shadow-inner flex flex-col justify-around items-center py-4`}
          >
            <div className="w-full h-1 bg-black/30" />
            <div className="w-full h-1 bg-black/30" />
            <div className="w-full h-1 bg-black/30" />
          </div>

          {/* Spine vertical indentation line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-black/25 pointer-events-none" />
          <div className="absolute left-[25px] top-0 bottom-0 w-px bg-white/15 pointer-events-none" />

          {/* Bookmark Ribbon */}
          <div
            className={`absolute top-0 right-7 w-3.5 h-12 ${theme.ribbon} shadow-md rounded-b-[2px] transition-transform duration-300 group-hover:h-14 z-10`}
          >
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/15" />
          </div>

          {/* Book Top Foil / Header */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-1.5 opacity-80">
              <BookOpen className={`w-3.5 h-3.5 ${theme.foil}`} />
              <span className={`text-[10px] uppercase tracking-widest font-mono font-medium ${theme.subtextColor}`}>
                Volume
              </span>
            </div>

            {/* Context menu for edit/delete */}
            <div
              className="relative"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-black/20 transition-colors"
                aria-label="Journal options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 mt-1 w-36 bg-[#FAF8F3] border border-[#DDD6C8] rounded-lg shadow-xl py-1 z-30 animate-in fade-in"
                  onClick={() => setShowMenu(false)}
                >
                  <button
                    onClick={() => onOpen(journal)}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#25211E] hover:bg-[#EFEAE0] flex items-center gap-2"
                  >
                    <BookOpenAlt className="w-3.5 h-3.5 text-[#524C46]" />
                    Open Book
                  </button>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(journal)}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#25211E] hover:bg-[#EFEAE0] flex items-center gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#524C46]" />
                      Edit Cover
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(journal)}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#9E4F36] hover:bg-[#EFEAE0] flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#9E4F36]" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Book Title & Description (Center) */}
          <div className="relative z-10 my-auto py-4">
            <h3 className={`font-serif text-xl sm:text-2xl font-semibold tracking-tight ${theme.textColor} line-clamp-2 drop-shadow-xs`}>
              {journal.title}
            </h3>
            <p className={`mt-2 text-xs sm:text-sm ${theme.subtextColor} font-sans line-clamp-3 leading-relaxed opacity-90`}>
              {journal.description}
            </p>
          </div>

          {/* Book Bottom / Metadata Bar */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/20 text-white/90">
                {journal.entryCount} {journal.entryCount === 1 ? 'entry' : 'entries'}
              </span>
            </div>
            <span className={`text-[11px] font-sans ${theme.subtextColor} opacity-80`}>
              {journal.lastUpdated}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
