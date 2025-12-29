import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, loadUserProfile } from '../lib/auth-helpers';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: 'admin' | 'client' | 'technician') => boolean;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger la session et le profil au démarrage
  useEffect(() => {
    // Vérifier la session existante
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userProfile = await loadUserProfile(session.user);
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userProfile = await loadUserProfile(session.user);
          setUser(userProfile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Recharger le profil en cas de refresh de token
          const userProfile = await loadUserProfile(session.user);
          setUser(userProfile);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message || 'Email ou mot de passe incorrect');
    }

    if (!data.user) {
      throw new Error('Erreur lors de la connexion');
    }

    // Charger le profil immédiatement et attendre qu'il soit chargé
    const userProfile = await loadUserProfile(data.user);
    if (!userProfile) {
      throw new Error('Profil utilisateur introuvable. Vérifiez que votre compte est correctement configuré.');
    }
    
    setUser(userProfile);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
  };

  const hasRole = (role: 'admin' | 'client' | 'technician'): boolean => {
    return user?.role === role;
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      // Mettre à jour dans Supabase selon le rôle
      if (user.role === 'client') {
        const { error } = await supabase
          .from('customers')
          .update({
            first_name: updates.firstName,
            last_name: updates.lastName,
            phone: updates.phone,
            company_name: updates.companyName,
          })
          .eq('id', user.id);

        if (error) throw error;
      } else if (user.role === 'technician') {
        const { error } = await supabase
          .from('technicians')
          .update({
            first_name: updates.firstName,
            last_name: updates.lastName,
            phone: updates.phone,
          })
          .eq('user_id', user.id);

        if (error) throw error;
      }

      // Mettre à jour l'état local
      setUser({ ...user, ...updates });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isAuthenticated: !!user,
        hasRole,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
