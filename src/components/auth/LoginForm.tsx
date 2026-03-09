import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { Button, Input } from '../ui';

interface LoginFormProps {
  loginEmail: string;
  loginPassword: string;
  setLoginEmail: (value: string) => void;
  setLoginPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({
  loginEmail,
  loginPassword,
  setLoginEmail,
  setLoginPassword,
  showPassword,
  setShowPassword,
  loading,
  onSubmit,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        type="email"
        label="Email"
        value={loginEmail}
        onChange={e => setLoginEmail(e.target.value)}
        leftIcon={<Mail className="w-4 h-4" />}
        placeholder="votre@email.com"
        autoComplete="email"
        required
        fullWidth
      />
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          label="Mot de passe"
          value={loginPassword}
          onChange={e => setLoginPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          placeholder="Votre mot de passe"
          autoComplete="current-password"
          required
          fullWidth
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] text-gray-400 hover:text-white transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <Button type="submit" variant="primary" size="md" fullWidth isLoading={loading} leftIcon={<LogIn className="w-4 h-4" />}>
        Se connecter
      </Button>
    </form>
  );
}
