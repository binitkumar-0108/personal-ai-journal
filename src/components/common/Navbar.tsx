import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Clock,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Menu,
  X,
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { Button } from './Button';

/**
 * Navbar accepts the raw Firebase User object.
 * All fields (displayName, photoURL, email) are available on firebase/auth User.
 */
interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string, param?: string) => void;
  currentUser: FirebaseUser | null;
  onSignOut: () => void;
  onOpenNewEntryModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  currentUser,
  onSignOut,
  onOpenNewEntryModal,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F3]/90 backdrop-blur-md border-b border-[#DDD6C8]/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('journals')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-[#25211E] flex items-center justify-center text-[#FAF8F3] shadow-xs group-hover:bg-[#9E4F36] transition-colors">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif text-lg font-semibold tracking-tight text-[#25211E] block leading-none">
              Personal AI Journal
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#8F877E] font-medium block mt-0.5">
              Private Digital Reflection
            </span>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#EFEAE0]/80 p-1 rounded-xl border border-[#DDD6C8]/70">
          <button
            onClick={() => onNavigate('journals')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'journals'
                ? 'bg-[#FAF8F3] text-[#25211E] shadow-xs'
                : 'text-[#6E665E] hover:text-[#25211E] hover:bg-[#FAF8F3]/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Journals</span>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#FAF8F3] text-[#25211E] shadow-xs'
                : 'text-[#6E665E] hover:text-[#25211E] hover:bg-[#FAF8F3]/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>History</span>
          </button>

          <button
            onClick={() => onNavigate('weekly-insights')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'weekly-insights'
                ? 'bg-[#FAF8F3] text-[#25211E] shadow-xs'
                : 'text-[#6E665E] hover:text-[#25211E] hover:bg-[#FAF8F3]/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B87B28]" />
            <span>Weekly Insights</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <Button
                variant="terracotta"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={onOpenNewEntryModal}
                className="hidden sm:inline-flex"
              >
                New Entry
              </Button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#DDD6C8] transition-all cursor-pointer focus:outline-none"
                  aria-expanded={isProfileOpen}
                >
                  <img
                    src={
                      currentUser.photoURL ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
                    }
                    alt={currentUser.displayName ?? 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-[#DDD6C8]"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-[#79726A] hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-[#FAF8F3] border border-[#DDD6C8] rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#EAE4D8]">
                      <p className="text-sm font-medium text-[#25211E] truncate">
                        {currentUser.displayName ?? 'Anonymous'}
                      </p>
                      <p className="text-xs text-[#8F877E] truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate('settings')}
                      className="w-full text-left px-4 py-2 text-sm text-[#524C46] hover:bg-[#EFEAE0] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-[#79726A]" />
                      <span>Settings &amp; Privacy</span>
                    </button>

                    <button
                      onClick={onSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-[#9E4F36] hover:bg-[#EFEAE0] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-[#9E4F36]" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('auth')}
            >
              Sign In
            </Button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-[#524C46] hover:bg-[#EFEAE0] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#DDD6C8] bg-[#FAF8F3] px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => {
              onNavigate('journals');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'journals' ? 'bg-[#EFEAE0] text-[#25211E]' : 'text-[#524C46]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>My Journals</span>
          </button>

          <button
            onClick={() => {
              onNavigate('history');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'history' ? 'bg-[#EFEAE0] text-[#25211E]' : 'text-[#524C46]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Personal History</span>
          </button>

          <button
            onClick={() => {
              onNavigate('weekly-insights');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'weekly-insights' ? 'bg-[#EFEAE0] text-[#25211E]' : 'text-[#524C46]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#B87B28]" />
            <span>Weekly Insights</span>
          </button>

          <button
            onClick={() => {
              onNavigate('settings');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'settings' ? 'bg-[#EFEAE0] text-[#25211E]' : 'text-[#524C46]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <div className="pt-2">
            <Button
              variant="terracotta"
              size="sm"
              className="w-full"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                onOpenNewEntryModal();
                setIsMobileMenuOpen(false);
              }}
            >
              New Entry
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
