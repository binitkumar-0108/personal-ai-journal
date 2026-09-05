import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Lock } from 'lucide-react';

interface AuthPageProps {
  onSignIn: () => Promise<void>;
  onCancel?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSignIn, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onSignIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FAF8F3] border border-[#DDD6C8] rounded-2xl p-8 shadow-xl relative overflow-hidden paper-grain">
        {/* Top Branding */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#25211E] flex items-center justify-center text-[#FAF8F3] mx-auto mb-4 shadow-xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#25211E]">
            Personal AI Journal
          </h2>
          <p className="mt-2 text-sm text-[#79726A] font-sans">
            A quiet sanctuary for your personal thoughts.
          </p>
        </div>

        {/* Privacy Note */}
        <div className="bg-[#FAF8F3] border border-[#EAE4D8] p-4 rounded-xl mb-8 flex items-start gap-3 text-xs text-[#524C46] leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-[#9E4F36] shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-[#25211E] block mb-0.5">
              Privacy-First Architecture
            </span>
            Your personal journal entries and conversations are strictly isolated to your account. Thoughts belong exclusively to you.
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 px-4 py-2.5 bg-[#FDF4F0] border border-[#E8C5B5] rounded-xl text-xs text-[#9E4F36]">
            {error}
          </div>
        )}

        {/* Sign In */}
        <div className="space-y-3">
          <button
            id="google-sign-in-btn"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#FAF8F3] hover:bg-[#EFEAE0] active:scale-[0.99] border border-[#DDD6C8] rounded-xl font-medium text-sm text-[#25211E] flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-[#25211E] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full py-2 text-xs text-[#79726A] hover:text-[#25211E] cursor-pointer"
            >
              Cancel and Return
            </button>
          )}
        </div>

        {/* Security note */}
        <div className="mt-8 pt-6 border-t border-[#EAE4D8] text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-[#8F877E] font-mono">
            <Lock className="w-3 h-3 text-[#9E4F36]" />
            <span>Secured by Firebase Auth with Owner Isolation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
