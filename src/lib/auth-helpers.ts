import { supabase } from './supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'client' | 'technician';
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  companyName?: string;
}

interface RoleResponse {
  role: string;
  profile_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

/**
 * Détermine le rôle d'un utilisateur via la RPC Supabase
 * Le rôle est déterminé côté serveur (non falsifiable)
 * Priorité: admin > technician > client
 */
export async function getUserRole(userId: string): Promise<'admin' | 'client' | 'technician' | null> {
  try {
    // Ajouter un timeout pour éviter les blocages
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 10000); // 10 secondes max
    });

    const rolePromise = (async () => {
      // Utiliser la RPC optimisée
      const { data, error } = await supabase.rpc('get_current_user_role');

      if (error) {
        console.error('[getUserRole] RPC error:', error);
        // Fallback vers les queries directes si la RPC n'existe pas encore
        return await getUserRoleFallback(userId);
      }

      if (data && data.length > 0) {
        const roleData = data[0] as RoleResponse;
        return roleData.role as 'admin' | 'client' | 'technician';
      }

      return null;
    })();

    return await Promise.race([rolePromise, timeoutPromise]);
  } catch (error) {
    console.error('[getUserRole] Error determining user role:', error);
    return null;
  }
}

/**
 * Fallback: détermination du rôle via queries directes
 * Utilisé si la RPC n'est pas encore déployée
 */
async function getUserRoleFallback(userId: string): Promise<'admin' | 'client' | 'technician' | null> {
  // Vérifier si c'est un admin
  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (adminData && !adminError) {
    return 'admin';
  }

  // Vérifier si c'est un technicien
  const { data: technicianData, error: techError } = await supabase
    .from('technicians')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (technicianData && !techError) {
    return 'technician';
  }

  // Vérifier si c'est un client
  const { data: customerData, error: customerError } = await supabase
    .from('customers')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (customerData && !customerError) {
    return 'client';
  }

  return null;
}

/**
 * Charge le profil complet d'un utilisateur depuis Supabase
 * Utilise la RPC get_current_user_role() pour optimiser les requêtes
 */
export async function loadUserProfile(supabaseUser: SupabaseUser): Promise<User | null> {
  try {
    const userId = supabaseUser.id;

    // Essayer d'abord la RPC optimisée qui retourne tout en une requête
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_current_user_role');

    if (!rpcError && rpcData && rpcData.length > 0) {
      const profileData = rpcData[0] as RoleResponse;
      const role = profileData.role as 'admin' | 'client' | 'technician';

      // Pour les clients, on a besoin de company_name en plus
      if (role === 'client') {
        const { data: customerData } = await supabase
          .from('customers')
          .select('company_name')
          .eq('id', userId)
          .maybeSingle();

        return {
          id: userId,
          email: profileData.email || supabaseUser.email || '',
          role,
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          phone: profileData.phone || undefined,
          companyName: customerData?.company_name || undefined,
        };
      }

      return {
        id: userId,
        email: profileData.email || supabaseUser.email || '',
        role,
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        phone: profileData.phone || undefined,
      };
    }

    // Fallback si la RPC n'existe pas encore
    return await loadUserProfileFallback(supabaseUser);
  } catch (error) {
    console.error('[loadUserProfile] Error loading user profile:', error);
    return null;
  }
}

/**
 * Fallback: charge le profil via queries directes
 */
async function loadUserProfileFallback(supabaseUser: SupabaseUser): Promise<User | null> {
  const userId = supabaseUser.id;
  const role = await getUserRoleFallback(userId);

  if (!role) {
    return null;
  }

  // Charger les données selon le rôle
  if (role === 'admin') {
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return {
      id: userId,
      email: adminData?.email || supabaseUser.email || '',
      role: 'admin',
      firstName: adminData?.first_name || 'Admin',
      lastName: adminData?.last_name || '',
      phone: adminData?.phone || undefined,
    };
  }

  if (role === 'technician') {
    const { data: technicianData } = await supabase
      .from('technicians')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!technicianData) return null;

    return {
      id: userId,
      email: technicianData.email,
      role: 'technician',
      firstName: technicianData.first_name,
      lastName: technicianData.last_name,
      phone: technicianData.phone || undefined,
    };
  }

  // Client
  const { data: customerData } = await supabase
    .from('customers')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (!customerData) return null;

  return {
    id: userId,
    email: customerData.email,
    role: 'client',
    firstName: customerData.first_name || '',
    lastName: customerData.last_name || '',
    phone: customerData.phone || undefined,
    companyName: customerData.company_name || undefined,
  };
}
