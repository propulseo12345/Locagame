/**
 * Utilisateurs de démonstration pour tester les 3 interfaces
 */

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

export const FAKE_USERS: FakeUser[] = [
  // ADMIN
  {
    id: 'admin-001',
    email: 'admin@locagame.fr',
    password: 'admin123',
    role: 'admin',
    firstName: 'Sophie',
    lastName: 'Martin',
    phone: '+33 6 12 34 56 78',
    avatar: '👩‍💼',
  },
  {
    id: 'admin-002',
    email: 'manager@locagame.fr',
    password: 'manager123',
    role: 'admin',
    firstName: 'Thomas',
    lastName: 'Dubois',
    phone: '+33 6 23 45 67 89',
    avatar: '👨‍💼',
  },

  // CLIENTS
  {
    id: 'client-001',
    email: 'client@exemple.fr',
    password: 'client123',
    role: 'client',
    firstName: 'Marie',
    lastName: 'Lefebvre',
    phone: '+33 6 34 56 78 90',
    avatar: '👩',
  },
  {
    id: 'client-002',
    email: 'jean.dupont@exemple.fr',
    password: 'client123',
    role: 'client',
    firstName: 'Jean',
    lastName: 'Dupont',
    phone: '+33 6 45 67 89 01',
    avatar: '👨',
  },
  {
    id: 'client-003',
    email: 'pro@entreprise.fr',
    password: 'client123',
    role: 'client',
    firstName: 'Claire',
    lastName: 'Bernard',
    phone: '+33 6 56 78 90 12',
    companyName: 'Events & Co',
    avatar: '👩‍💼',
  },

  // TECHNICIENS
  {
    id: 'tech-001',
    email: 'technicien@locagame.fr',
    password: 'tech123',
    role: 'technician',
    firstName: 'Lucas',
    lastName: 'Moreau',
    phone: '+33 6 67 89 01 23',
    avatar: '👷‍♂️',
  },
  {
    id: 'tech-002',
    email: 'pierre.tech@locagame.fr',
    password: 'tech123',
    role: 'technician',
    firstName: 'Pierre',
    lastName: 'Roux',
    phone: '+33 6 78 90 12 34',
    avatar: '🚚',
  },
];

/**
 * Trouve un utilisateur par email et password
 */
export function findUserByCredentials(
  email: string,
  password: string
): FakeUser | null {
  return (
    FAKE_USERS.find(
      (user) => user.email === email && user.password === password
    ) || null
  );
}

/**
 * Trouve un utilisateur par ID
 */
export function findUserById(id: string): FakeUser | null {
  return FAKE_USERS.find((user) => user.id === id) || null;
}

/**
 * Récupère tous les utilisateurs d'un rôle
 */
export function getUsersByRole(role: 'admin' | 'client' | 'technician'): FakeUser[] {
  return FAKE_USERS.filter((user) => user.role === role);
}

/**
 * Informations pour la page de connexion
 */
export const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@locagame.fr',
    password: 'admin123',
    description: 'Accès complet à l\'interface d\'administration',
  },
  client: {
    email: 'client@exemple.fr',
    password: 'client123',
    description: 'Accès à l\'espace client avec réservations',
  },
  technician: {
    email: 'technicien@locagame.fr',
    password: 'tech123',
    description: 'Accès à l\'interface de livraison',
  },
};
