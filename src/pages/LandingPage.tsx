import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Feather, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';

interface LandingPageProps {
  onStart: () => void;
  onExplore: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onExplore }) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#EBE2D3]/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F2ECE1] border border-[#DDD3C2] text-xs font-mono text-[#7D736A] mb-8"
        >
          <Feather className="w-3.5 h-3.5 text-[#A25438]" />
          <span>A Sanctuary for Solitary Thought &amp; Thoughtful Reflection</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-4xl sm:text-6xl lg:text-7xl font-semibold text-[#1C1816] tracking-tight leading-[1.12]"
        >
          Your thoughts <br className="hidden sm:inline" />
          <span className="italic font-normal text-[#A25438]">belong to you.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 sm:mt-8 text-base sm:text-xl text-[#5E5650] max-w-2xl mx-auto font-sans leading-relaxed"
        >
          Write freely. Reflect deeply. Let Gemini offer another perspective{' '}
          <span className="text-[#1C1816] font-medium">only when you want it.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={onStart}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Start Journaling
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={onExplore}
            className="w-full sm:w-auto"
          >
            Explore the Philosophy
          </Button>
        </motion.div>

        {/* 3D Book Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 sm:mt-16 max-w-2xl mx-auto perspective-1000"
        >
          <div className="relative rounded-2xl bg-[#FAF6EE] p-6 sm:p-8 border border-[#DDD3C2] shadow-2xl text-left paper-texture transform hover:rotate-x-1 transition-transform">
            <div className="flex items-center justify-between border-b border-[#E8DFCFA] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#8C8277]">September 3, 2026</span>
                <span className="text-[#DDD3C2]">•</span>
                <span className="text-xs font-serif italic text-[#A25438]">Morning Entry</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#F2ECE1] text-[#7D736A]">
                Page 12
              </span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl text-[#221E1C] font-medium">
              The sacred territory of the quiet morning
            </h3>
            <p className="mt-3 font-serif text-sm sm:text-base text-[#463F3A] leading-relaxed line-clamp-3">
              &ldquo;Lately I feel a pull toward stripping away decorative complexity—not just in my software architecture, but in how I allocate my hours. If something does not clarify either my understanding or my peace of mind, it does not belong in my week...&rdquo;
            </p>

            <div className="mt-6 pt-4 border-t border-[#E8DFCFA] flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[#8C8277] italic font-serif">Original thoughts preserved without alteration</span>
              <span className="inline-flex items-center gap-1.5 text-[#A25438] font-medium font-sans">
                <Sparkles className="w-3.5 h-3.5 text-[#B87D2E]" />
                Gemini Perspective Available
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Three Reflection Modes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full border-t border-[#E8DFCFA]">
        <div className="text-center mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1C1816]">
            Three Ways to Reflect
          </h2>
          <p className="mt-2 text-sm text-[#7D736A] font-sans">
            Never forced into an interview. Never pressured by a chatbot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FAF7F0] border border-[#DDD3C2] p-6 rounded-2xl paper-grain flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#F2ECE1] flex items-center justify-center text-[#A25438] mb-4">
                <Feather className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#1C1816]">Write Yourself</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#5E5650] leading-relaxed font-sans">
                Write freely with complete independence. No prompts, no suggestions, no AI interruptions while you put pen to digital paper.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8DFCFA] text-[11px] font-mono text-[#8C8277]">
              Solitary &amp; Unassisted
            </div>
          </div>

          <div className="bg-[#FAF7F0] border border-[#DDD3C2] p-6 rounded-2xl paper-grain flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#F2ECE1] flex items-center justify-center text-[#B87D2E] mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#1C1816]">Summarize with Gemini</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#5E5650] leading-relaxed font-sans">
                Pour out raw, unstructured thoughts and explicitly invite Gemini to illuminate recurring themes, core intentions, and key ideas.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8DFCFA] text-[11px] font-mono text-[#8C8277]">
              Original Text Never Overwritten
            </div>
          </div>

          <div className="bg-[#FAF7F0] border border-[#DDD3C2] p-6 rounded-2xl paper-grain flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#F2ECE1] flex items-center justify-center text-[#2E453A] mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#1C1816]">Talk to Gemini</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#5E5650] leading-relaxed font-sans">
                Have a natural dialogue with a thoughtful companion. No rigid questionnaires—explore whatever is lingering on your mind.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8DFCFA] text-[11px] font-mono text-[#8C8277]">
              Conversational &amp; Non-Prescriptive
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Foundation */}
      <section className="py-12 bg-[#F3ECE0]/60 border-t border-[#E4DAC8] px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FAF6EE] border border-[#DDD3C2] flex items-center justify-center text-[#A25438] shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-medium text-[#1C1816]">Private by Architecture</h4>
              <p className="text-xs text-[#7D736A] font-sans">
                Your entries remain strictly your own. Each reflection becomes a personal page in your private book.
              </p>
            </div>
          </div>
          <Button variant="primary" size="md" onClick={onStart}>
            Open Your Journal
          </Button>
        </div>
      </section>
    </div>
  );
};
