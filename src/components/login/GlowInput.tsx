import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface GlowInputProps {
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ElementType;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

/**
 * Enhanced input component with glow effects for the login page.
 */
export function GlowInput({
  type,
  label,
  value,
  onChange,
  icon: Icon,
  placeholder,
  autoComplete,
  required,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
}: GlowInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="group relative">
      <label className="block text-sm font-medium text-white/70 mb-2 tracking-wide uppercase">
        {label}
        {required && <span className="text-[#fe1979] ml-1">*</span>}
      </label>
      <div className="relative">
        {/* Glow effect on focus */}
        <div
          className={`absolute -inset-0.5 bg-gradient-to-r from-[#33ffcc] via-[#66cccc] to-[#33ffcc] rounded-xl opacity-0 blur-sm transition-opacity duration-300 ${isFocused ? 'opacity-60' : 'group-hover:opacity-30'}`}
        />
        <div className="relative flex items-center">
          <div className={`absolute left-4 transition-colors duration-300 ${isFocused ? 'text-[#33ffcc]' : 'text-white/40'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <input
            type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required={required}
            className="w-full pl-12 pr-12 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-transparent transition-all duration-300"
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={onTogglePassword}
              className={`absolute right-4 transition-colors duration-300 ${isFocused ? 'text-[#33ffcc]' : 'text-white/40'} hover:text-[#33ffcc]`}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
