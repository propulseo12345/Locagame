import { ChevronRight } from 'lucide-react';

interface DemoCardProps {
  type: string;
  icon: React.ElementType;
  title: string;
  description: string;
  email: string;
  password: string;
  gradient: string;
  accentColor: string;
  onClick: () => void;
  loading: boolean;
}

/**
 * Demo account card with hover effects for quick login.
 */
export function DemoCard({
  type,
  icon: Icon,
  title,
  description,
  email,
  password,
  gradient,
  accentColor,
  onClick,
  loading,
}: DemoCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="group relative w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Card glow on hover */}
      <div
        className={`absolute -inset-0.5 ${gradient} rounded-2xl opacity-0 group-hover:opacity-50 blur transition-opacity duration-300`}
      />

      <div className="relative p-5 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl group-hover:border-transparent group-hover:bg-white/[0.06] transition-all duration-300">
        <div className="flex items-start gap-4">
          {/* Icon container */}
          <div
            className={`w-14 h-14 rounded-xl ${gradient} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
            style={{ boxShadow: `0 8px 32px ${accentColor}40` }}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-bold text-lg">{title}</h3>
              <ChevronRight
                className={`w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`}
                style={{ color: accentColor }}
              />
            </div>
            <p className="text-white/50 text-sm mb-3 line-clamp-2">{description}</p>

            {/* Credentials */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <code
                className="px-2 py-1 rounded-md bg-white/5 font-mono"
                style={{ color: accentColor }}
              >
                {email}
              </code>
              <span className="text-white/20">•</span>
              <code className="px-2 py-1 rounded-md bg-white/5 text-white/40 font-mono">
                {password}
              </code>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
