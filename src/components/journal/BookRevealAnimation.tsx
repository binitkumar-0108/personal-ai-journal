import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Feather } from 'lucide-react';
import type { Journal, JournalEntry, CoverTheme } from '../../types/index';
import { Button } from '../common/Button';

interface BookRevealAnimationProps {
  journal: Journal;
  entry: JournalEntry;
  onComplete: () => void;
}

export const BookRevealAnimation: React.FC<BookRevealAnimationProps> = ({
  journal,
  entry,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(2), 700);
    const timer2 = setTimeout(() => setStep(3), 1500);
    const timer3 = setTimeout(() => setStep(4), 2300);
    const timer4 = setTimeout(() => setStep(5), 3100);
    const timer5 = setTimeout(() => setStep(6), 4000);
    const timer6 = setTimeout(() => setStep(7), 4900);
    const timer7 = setTimeout(() => setStep(8), 5800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
      clearTimeout(timer7);
    };
  }, []);

  const themeColors: Record<CoverTheme, { bg: string; spine: string }> = {
    terracotta: { bg: 'bg-[#8F472E]', spine: 'bg-[#6D331F]' },
    moss: { bg: 'bg-[#2E453A]', spine: 'bg-[#1D2E26]' },
    indigo: { bg: 'bg-[#202D3F]', spine: 'bg-[#141C28]' },
    espresso: { bg: 'bg-[#362A24]', spine: 'bg-[#221A16]' },
    parchment: { bg: 'bg-[#D6C5AD]', spine: 'bg-[#B8A48B]' },
    burgundy: { bg: 'bg-[#582025]', spine: 'bg-[#3A1316]' },
  };

  const currentTheme = themeColors[journal.coverTheme] || themeColors.terracotta;

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1614]/85 backdrop-blur-md flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Sequence Stage Label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 z-20"
      >
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#E8DFCFA] px-3 py-1 rounded-full bg-white/10 border border-white/15">
          {step === 1 && 'Saving Reflection...'}
          {step === 2 && 'Retrieving Personal Journal...'}
          {step === 3 && 'Opening Journal...'}
          {step === 4 && 'Preparing Bound Page...'}
          {step === 5 && 'Turning to New Page...'}
          {step === 6 && 'Inscribing Original Thoughts...'}
          {step === 7 && 'Illuminating Perspective...'}
          {step >= 8 && 'Page Inscribed into History'}
        </span>
      </motion.div>

      {/* 3D Scene Viewport */}
      <div className="relative w-full max-w-3xl perspective-2000 flex items-center justify-center min-h-[420px] sm:min-h-[500px]">
        {/* Closed Book Stage (Steps 1-2) */}
        {step < 3 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateY: 20 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`w-64 h-84 sm:w-72 sm:h-96 rounded-r-2xl rounded-l-md ${currentTheme.bg} p-8 journal-cover-shadow relative flex flex-col justify-between border-y border-r border-black/20`}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-6 ${currentTheme.spine} border-r border-black/20`} />
            <div className="relative z-10">
              <span className="text-xs uppercase tracking-widest font-mono text-[#F6EBD9]/70">
                Personal Journal
              </span>
              <h3 className="font-serif text-2xl font-semibold text-[#FAF3EB] mt-2">
                {journal.title}
              </h3>
            </div>
            <div className="relative z-10 flex items-center justify-between text-xs text-[#E8D6C4]">
              <span>Volume</span>
              <span>{journal.entryCount + 1} pages</span>
            </div>
          </motion.div>
        )}

        {/* Opened Book Stage (Steps 3-8) */}
        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-2xl aspect-[1.5/1] h-[420px] sm:h-[460px] bg-[#FAF8F3] rounded-xl border border-[#DDD6C8] shadow-2xl overflow-hidden flex flex-col sm:flex-row relative"
          >
            {/* Center Book Crease */}
            <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-6 -translate-x-1/2 bg-gradient-to-r from-black/15 via-black/5 to-black/15 z-20 pointer-events-none" />

            {/* Left Page (Original Writing Reveal) */}
            <div className="w-full sm:w-1/2 h-full p-6 sm:p-8 flex flex-col justify-between overflow-hidden paper-texture border-b sm:border-b-0 sm:border-r border-[#E0D5C3] relative">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8C8277] mb-3">
                  <span>{entry.date}</span>
                  <span>Page {journal.entryCount + 1}</span>
                </div>

                <h4 className="font-serif text-xl font-medium text-[#221E1C] truncate">
                  {entry.title}
                </h4>

                {/* Animated Inscription of Content */}
                <div className="mt-4">
                  {step >= 6 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8 }}
                      className="text-sm font-serif text-[#2B2623] leading-relaxed line-clamp-6"
                    >
                      {entry.originalContent}
                    </motion.div>
                  ) : (
                    <div className="h-28 flex items-center justify-center">
                      {step === 5 && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        >
                          <Feather className="w-5 h-5 text-[#A25438]" />
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[11px] italic font-serif text-[#8C8277] pt-4 border-t border-[#E8DFCFA]">
                Original Thoughts Preserved
              </div>
            </div>

            {/* Right Page (Reflection Reveal) */}
            <div className="w-full sm:w-1/2 h-full p-6 sm:p-8 flex flex-col justify-between overflow-hidden paper-grain bg-[#FAF7F0] relative">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#7D736A] mb-3">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#B87D2E]" />
                    Reflection
                  </span>
                  <span>Companion</span>
                </div>

                {step >= 7 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-3"
                  >
                    {entry.aiReflection ? (
                      <>
                        <h5 className="font-serif text-base font-medium text-[#221E1C]">
                          {entry.aiReflection.title}
                        </h5>
                        <p className="text-xs text-[#5E5650] leading-relaxed font-sans line-clamp-4">
                          {entry.aiReflection.shortSummary}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.aiReflection.themes.slice(0, 3).map((theme, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#EFE8DC] text-[#463F3A]"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs italic font-serif text-[#7D736A]">
                        Written in quiet solitude. No AI analysis requested.
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <div className="h-28 flex items-center justify-center">
                    <span className="text-xs text-[#A89F93] font-mono">
                      {step >= 5 ? 'Awaiting ink...' : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-[11px] italic font-serif text-[#8C8277] pt-4 border-t border-[#E8DFCFA]">
                Stored in Journal Book
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action to proceed to Book or skip */}
      <div className="mt-8 z-20 flex items-center gap-4">
        {step >= 7 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              variant="terracotta"
              size="lg"
              leftIcon={<Check className="w-4 h-4" />}
              onClick={onComplete}
            >
              Open in Journal
            </Button>
          </motion.div>
        ) : (
          <button
            onClick={onComplete}
            className="text-xs text-[#D8CEBE] hover:text-[#FAF6EE] underline underline-offset-4 cursor-pointer"
          >
            Skip animation
          </button>
        )}
      </div>
    </div>
  );
};
