import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, loadUserProfile } from '../lib/auth-helpers';
import { SignUpMetadata, SignUpResult, AuthContextType } from './authContext.types';
import { buildWelcomeHtml } from './authContext.utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger la session et le profil au démarrage
  useEffect(() => {
    // Vérifier la session existante
    const initAuth = async () => {
      try {
        console.log('[Auth] Initialisation de la session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[Auth] Erreur getSession:', sessionError.message);
          return;
        }

        if (session?.user) {
          console.log('[Auth] Session trouvée, chargement du profil...');
          const userProfile = await loadUserProfile(session.user);
          if (userProfile) {
            console.log('[Auth] Profil chargé:', userProfile.role);
          } else {
            console.warn('[Auth] Profil non trouvé pour user:', session.user.id);
          }
          setUser(userProfile);
        } else {
          console.log('[Auth] Pas de session active');
        }
      } catch (error: any) {
        console.error('[Auth] Erreur initialisation:', error?.message || error);
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
    console.log('[Auth] Tentative de connexion:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Auth] Erreur signIn:', error.message, '| status:', error.status);
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

  const signUp = async (email: string, password: string, metadata: SignUpMetadata): Promise<SignUpResult> => {
    // Créer l'utilisateur dans Supabase Auth
    // Le trigger handle_new_user() crée automatiquement le profil dans customers
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: metadata.firstName,
          last_name: metadata.lastName,
          phone: metadata.phone,
        },
      },
    });

    if (error) {
      throw new Error(error.message || 'Erreur lors de la création du compte');
    }

    if (!data.user) {
      throw new Error('Erreur lors de la création du compte');
    }

    // Envoyer l'email de bienvenue (best-effort, non-bloquant)
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: 'Bienvenue sur LOCAGAME',
          html: buildWelcomeHtml(`${metadata.firstName} ${metadata.lastName}`),
        },
      });
    } catch {
      // Ne pas bloquer l'inscription si l'email échoue
    }

    // Si une session est retournée, l'utilisateur est auto-confirmé
    if (data.session) {
      const userProfile = await loadUserProfile(data.user);
      if (userProfile) {
        setUser(userProfile);
      }
      return { needsEmailConfirmation: false };
    }

    // Sinon, l'utilisateur doit confirmer son email
    return { needsEmailConfirmation: true };
  };

  const signOut = async () => {
    setUser(null);
    supabase.auth.signOut().catch((err) => {
      console.error('Error signing out:', err);
    });
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
      } else if (user.role === 'admin') {
        const { error } = await supabase
          .from('admin_users')
          .update({
            first_name: updates.firstName,
            last_name: updates.lastName,
            phone: updates.phone,
            email: updates.email,
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
        signUp,
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
