import React from 'react';
import { Feather } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  label?: string;
  sublabel?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Gathering thoughts...',
  sublabel = 'Taking a quiet moment to reflect',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative mb-6">
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-16 h-16 rounded-full bg-[#EFEAE0] flex items-center justify-center border border-[#DDD6C8]"
        >
          <Feather className="w-7 h-7 text-[#9E4F36]" />
        </motion.div>
        <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9E4F36] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#9E4F36]"></span>
        </span>
      </div>
      <p className="font-serif text-lg font-medium text-[#25211E]">{label}</p>
      {sublabel && (
        <p className="text-xs text-[#79726A] mt-1 font-sans">{sublabel}</p>
      )}
    </div>
  );
};
