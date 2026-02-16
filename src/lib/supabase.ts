import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Project ID Supabase (utilisé pour les outils MCP)
export const SUPABASE_PROJECT_ID = 'koqdpkkuarbjiimkopei';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// ============================================================
// NETTOYAGE SESSION CORROMPUE AU DEMARRAGE
// Si un JWT périmé est stocké dans localStorage, le SDK Supabase
// l'envoie avec CHAQUE requête, ce qui fait échouer même les
// requêtes publiques (products, categories, testimonials).
// On nettoie AVANT de créer le client.
// ============================================================
const STORAGE_KEY = `sb-koqdpkkuarbjiimkopei-auth-token`;
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Supporte les deux formats (v1 et v2 du SDK)
    const expiresAt =
      parsed?.expires_at ??
      parsed?.expiresAt ??
      parsed?.currentSession?.expires_at;
    const now = Math.floor(Date.now() / 1000);
    if (expiresAt && expiresAt < now) {
      console.warn('[Supabase] Session expirée détectée — nettoyage localStorage');
      localStorage.removeItem(STORAGE_KEY);
    } else if (!expiresAt) {
      // Pas de champ expires_at = session corrompue
      console.warn('[Supabase] Session sans expiration — nettoyage localStorage');
      localStorage.removeItem(STORAGE_KEY);
    }
  }
} catch {
  // Si le JSON est corrompu, on supprime aussi
  localStorage.removeItem(STORAGE_KEY);
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Validation async : si la session ne peut pas être rafraîchie, on la supprime
(async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('[Supabase] getSession erreur, signOut forcé:', error.message);
      await supabase.auth.signOut();
    } else if (session) {
      // Vérifier que le token est encore utilisable avec une requête test
      const { error: testError } = await supabase.from('categories').select('id').limit(1);
      if (testError) {
        console.warn('[Supabase] Session inutilisable, signOut forcé:', testError.message);
        await supabase.auth.signOut();
      }
    }
  } catch {
    // Silencieux — pas critique
  }
})();

// Avertissement en mode développement si les variables ne sont pas définies
if (import.meta.env.DEV && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.warn(
    '⚠️ Supabase environment variables are not set. The app will run but Supabase features will not work.\n' +
    'To enable Supabase, create a .env file with:\n' +
    'VITE_SUPABASE_URL=your-supabase-url\n' +
    'VITE_SUPABASE_ANON_KEY=your-supabase-anon-key'
  );
}
