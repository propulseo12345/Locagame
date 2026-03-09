import { LogIn, UserPlus } from 'lucide-react';

type Tab = 'login' | 'register';

interface AuthTabsProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function AuthTabs({ tab, onTabChange }: AuthTabsProps) {
  return (
    <div className="flex border-b border-white/10">
      <button
        onClick={() => onTabChange('login')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
          tab === 'login'
            ? 'text-[#33ffcc] border-b-2 border-[#33ffcc]'
            : 'text-white/50 hover:text-white/70'
        }`}
      >
        <LogIn className="w-4 h-4" />
        Connexion
      </button>
      <button
        onClick={() => onTabChange('register')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
          tab === 'register'
            ? 'text-[#33ffcc] border-b-2 border-[#33ffcc]'
            : 'text-white/50 hover:text-white/70'
        }`}
      >
        <UserPlus className="w-4 h-4" />
        Inscription
      </button>
    </div>
  );
}
