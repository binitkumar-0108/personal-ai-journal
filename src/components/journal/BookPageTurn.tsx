import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type PageTurnDirection = 'forward' | 'backward';

export interface BookPageTurnProps {
  isFlipping: boolean;
  direction: PageTurnDirection;
  animationKey: number | string;
}

/**
 * Presentation component for physical 3D book page-turn animation.
 * Completely decoupled from Firestore, journal data, or business logic.
 *
 * - 'forward': Right leaf lifts and turns RIGHT-to-LEFT over the spine (rotateY: 0 -> -180deg)
 * - 'backward': Left leaf lifts and turns LEFT-to-RIGHT over the spine (rotateY: 0 -> +180deg)
 */
export const BookPageTurn: React.FC<BookPageTurnProps> = ({
  isFlipping,
  direction,
  animationKey,
}) => {
  return (
    <AnimatePresence mode="wait">
      {isFlipping && (
        <motion.div
          key={`page-turn-${animationKey}`}
          initial={{
            rotateY: 0,
            opacity: 0.98,
          }}
          animate={{
            rotateY: direction === 'forward' ? -180 : 180,
            opacity: 1,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.35,
            ease: [0.33, 1, 0.68, 1], // natural paper turn easing
          }}
          style={{
            transformOrigin: direction === 'forward' ? 'left center' : 'right center',
            transformStyle: 'preserve-3d',
          }}
          className={`hidden lg:block absolute top-3.5 bottom-3.5 sm:top-4 sm:bottom-4 lg:top-5 lg:bottom-5 z-30 pointer-events-none overflow-hidden paper-texture bg-[#FAF8F3] border border-[#DDD6C8] shadow-2xl ${
            direction === 'forward'
              ? 'left-1/2 right-3.5 sm:right-4 lg:right-5 rounded-r-xl'
              : 'left-3.5 sm:left-4 lg:left-5 right-1/2 rounded-l-xl'
          }`}
        >
          {/* Paper sheen & lighting gradient that responds to physical page angle */}
          <div
            className={`w-full h-full ${
              direction === 'forward'
                ? 'bg-gradient-to-r from-black/25 via-transparent to-black/10'
                : 'bg-gradient-to-l from-black/25 via-transparent to-black/10'
            }`}
          />

          {/* Spine crease shadow simulation on turning page */}
          <div
            className={`absolute top-0 bottom-0 w-3 pointer-events-none ${
              direction === 'forward'
                ? 'left-0 bg-gradient-to-r from-black/20 to-transparent'
                : 'right-0 bg-gradient-to-l from-black/20 to-transparent'
            }`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
