import { LogIn, ArrowRight } from 'lucide-react';

interface SubmitButtonProps {
  loading: boolean;
  children: React.ReactNode;
}

/**
 * Animated submit button with gradient background and shine effect.
 */
export function SubmitButton({ loading, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group relative w-full py-4 px-6 overflow-hidden rounded-xl font-bold text-lg tracking-wide transition-all duration-300 disabled:cursor-not-allowed"
    >
      {/* Button background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#33ffcc] via-[#66cccc] to-[#33ffcc] bg-[length:200%_100%] animate-gradient-shift" />

      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      {/* Button content */}
      <span className="relative flex items-center justify-center gap-3 text-[#000033]">
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-[#000033]/30 border-t-[#000033] rounded-full animate-spin" />
            <span>Connexion en cours...</span>
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            <span>{children}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </>
        )}
      </span>
    </button>
  );
}
