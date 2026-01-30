import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Project ID Supabase (utilisé pour les outils MCP)
export const SUPABASE_PROJECT_ID = 'koqdpkkuarbjiimkopei';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Créer un client Supabase même si les variables ne sont pas définies
// Cela permet à l'application de fonctionner en mode développement sans Supabase
// Les appels API échoueront silencieusement, mais l'application ne plantera pas
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Avertissement en mode développement si les variables ne sont pas définies
if (import.meta.env.DEV && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.warn(
    '⚠️ Supabase environment variables are not set. The app will run but Supabase features will not work.\n' +
    'To enable Supabase, create a .env file with:\n' +
    'VITE_SUPABASE_URL=your-supabase-url\n' +
    'VITE_SUPABASE_ANON_KEY=your-supabase-anon-key'
  );
}
