import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Project ID Supabase (utilisé pour les outils MCP)
export const SUPABASE_PROJECT_ID = 'koqdpkkuarbjiimkopei';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// ============================================================
// NETTOYAGE TOTAL DES SESSIONS SUPABASE AU DEMARRAGE
// Un JWT périmé/corrompu bloque TOUTES les requêtes publiques.
// On supprime TOUT token Supabase AVANT de créer le client.
// ============================================================
try {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('sb-')) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    console.warn(`[Supabase] Nettoyage session: ${key}`);
    localStorage.removeItem(key);
  }
} catch {
  // Ignore
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Pas de validation async — le nettoyage synchrone ci-dessus suffit

// Avertissement en mode développement si les variables ne sont pas définies
if (import.meta.env.DEV && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.warn(
    '⚠️ Supabase environment variables are not set. The app will run but Supabase features will not work.\n' +
    'To enable Supabase, create a .env file with:\n' +
    'VITE_SUPABASE_URL=your-supabase-url\n' +
    'VITE_SUPABASE_ANON_KEY=your-supabase-anon-key'
  );
}
