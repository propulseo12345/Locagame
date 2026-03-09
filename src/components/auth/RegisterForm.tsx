import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button, Input } from '../ui';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  registerData: RegisterData;
  onRegisterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function RegisterForm({
  registerData,
  onRegisterChange,
  showPassword,
  setShowPassword,
  loading,
  onSubmit,
}: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="text"
          name="firstName"
          label="Prénom"
          value={registerData.firstName}
          onChange={onRegisterChange}
          leftIcon={<User className="w-4 h-4" />}
          placeholder="Jean"
          autoComplete="given-name"
          required
          fullWidth
        />
        <Input
          type="text"
          name="lastName"
          label="Nom"
          value={registerData.lastName}
          onChange={onRegisterChange}
          leftIcon={<User className="w-4 h-4" />}
          placeholder="Dupont"
          autoComplete="family-name"
          required
          fullWidth
        />
      </div>
      <Input
        type="email"
        name="email"
        label="Email"
        value={registerData.email}
        onChange={onRegisterChange}
        leftIcon={<Mail className="w-4 h-4" />}
        placeholder="votre@email.com"
        autoComplete="email"
        required
        fullWidth
      />
      <Input
        type="tel"
        name="phone"
        label="Téléphone"
        value={registerData.phone}
        onChange={onRegisterChange}
        leftIcon={<Phone className="w-4 h-4" />}
        placeholder="06 12 34 56 78"
        autoComplete="tel"
        fullWidth
      />
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          name="password"
          label="Mot de passe"
          value={registerData.password}
          onChange={onRegisterChange}
          leftIcon={<Lock className="w-4 h-4" />}
          placeholder="Minimum 6 caractères"
          autoComplete="new-password"
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
      <Input
        type={showPassword ? 'text' : 'password'}
        name="confirmPassword"
        label="Confirmer"
        value={registerData.confirmPassword}
        onChange={onRegisterChange}
        leftIcon={<Lock className="w-4 h-4" />}
        placeholder="Retapez le mot de passe"
        autoComplete="new-password"
        required
        fullWidth
      />
      <Button type="submit" variant="primary" size="md" fullWidth isLoading={loading} leftIcon={<UserPlus className="w-4 h-4" />}>
        Créer mon compte
      </Button>
      <p className="text-gray-500 text-[11px] text-center leading-relaxed">
        En créant un compte, vous acceptez nos Conditions Générales et notre Politique de Confidentialité.
      </p>
    </form>
  );
}
