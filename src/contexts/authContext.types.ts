import { User } from '../lib/auth-helpers';

export interface SignUpMetadata {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface SignUpResult {
  needsEmailConfirmation: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: 'admin' | 'client' | 'technician') => boolean;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}
