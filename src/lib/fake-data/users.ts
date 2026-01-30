// ============================================================
// FICHIER NETTOYÉ - CREDENTIALS SUPPRIMÉS
// ============================================================
//
// Les credentials de démonstration ont été retirés de ce fichier
// pour des raisons de sécurité.
//
// Le mode démo est géré dans LoginPage.tsx et conditionné
// à la variable d'environnement VITE_ENABLE_DEMO_MODE.
//
// Pour le développement local avec mode démo:
// 1. Ajouter VITE_ENABLE_DEMO_MODE=true dans .env
// 2. S'assurer que les comptes démo existent dans Supabase Auth
//
// ============================================================

// Types conservés pour référence
export interface FakeUser {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'client' | 'technician';
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  companyName?: string;
}

// No data exported - credentials removed for security
export const FAKE_USERS: FakeUser[] = [];
export const DEMO_CREDENTIALS = null;
export function findUserByCredentials(): null { return null; }
export function findUserById(): null { return null; }
export function getUsersByRole(): FakeUser[] { return []; }
