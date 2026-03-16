import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
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
        logger.log('[Auth] Initialisation de la session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          logger.error('[Auth] Erreur getSession', sessionError);
          return;
        }

        if (session?.user) {
          logger.log('[Auth] Session trouvée, chargement du profil...');
          const userProfile = await loadUserProfile(session.user);
          if (!userProfile) {
            logger.warn('[Auth] Profil non trouvé');
          }
          setUser(userProfile);
        } else {
          logger.log('[Auth] Pas de session active');
        }
      } catch (error: unknown) {
        logger.error('[Auth] Erreur initialisation', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Écouter les changements d'authentification
    // IMPORTANT: ne PAS faire d'appels Supabase async dans ce callback —
    // onAuthStateChange est await-é par le SDK, ce qui crée un deadlock
    // si on appelle supabase.rpc() ou autre pendant que l'auth est en cours.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        // TOKEN_REFRESHED: le token JWT change mais le profil utilisateur
        // reste identique — pas besoin de recharger (évite des re-renders inutiles).
        // SIGNED_IN: géré par signIn() et initAuth() directement.
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    logger.log('[Auth] Tentative de connexion');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error('[Auth] Erreur signIn', error);
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
    return userProfile;
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata: SignUpMetadata): Promise<SignUpResult> => {
    // Créer l'utilisateur dans Supabase Auth
    // Le trigger handle_new_user() crée automatiquement le profil dans customers
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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

    // Si une session est retournée, l'utilisateur est auto-confirmé
    if (data.session) {
      // Envoyer l'email de bienvenue uniquement quand la session est active
      // (garantit que supabase.functions.invoke passe un JWT utilisateur valide,
      //  requis par la vérification d'auth de la Edge Function send-email)
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

      const userProfile = await loadUserProfile(data.user);
      if (userProfile) {
        setUser(userProfile);
      }
      return { needsEmailConfirmation: false };
    }

    // Sinon, l'utilisateur doit confirmer son email
    return { needsEmailConfirmation: true };
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    supabase.auth.signOut().catch((err) => {
      logger.error('[Auth] Error signing out', err);
    });
  }, []);

  const hasRole = useCallback((role: 'admin' | 'client' | 'technician'): boolean => {
    return user?.role === role;
  }, [user]);

  const updateUserProfile = useCallback(async (updates: Partial<User>) => {
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
      logger.error('[Auth] Error updating user profile', error);
      throw error;
    }
  }, [user]);

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
      isAuthenticated: !!user,
      hasRole,
      updateUserProfile,
    }),
    [user, loading, signIn, signUp, signOut, hasRole, updateUserProfile]
  );

  return (
    <AuthContext.Provider value={contextValue}>
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
