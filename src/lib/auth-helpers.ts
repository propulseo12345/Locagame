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

/**
 * Détermine le rôle d'un utilisateur en vérifiant dans les tables Supabase
 */
export async function getUserRole(userId: string): Promise<'admin' | 'client' | 'technician' | null> {
  try {
    // Ajouter un timeout pour éviter les blocages
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 10000); // 10 secondes max
    });

    const rolePromise = (async () => {
      // Vérifier si c'est un admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (adminData && !adminError) {
        return 'admin' as const;
      }

      // Vérifier si c'est un technicien
      const { data: technicianData, error: techError } = await supabase
        .from('technicians')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (technicianData && !techError) {
        return 'technician' as const;
      }

      // Vérifier si c'est un client
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (customerData && !customerError) {
        return 'client' as const;
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
 * Charge le profil complet d'un utilisateur depuis Supabase
 */
export async function loadUserProfile(supabaseUser: SupabaseUser): Promise<User | null> {
  try {
    const userId = supabaseUser.id;
    const role = await getUserRole(userId);

    if (!role) {
      return null;
    }

    // Charger les données selon le rôle
    if (role === 'admin') {
      // Les admins peuvent aussi avoir un profil dans customers
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      return {
        id: userId,
        email: supabaseUser.email || '',
        role: 'admin' as const,
        firstName: customerData?.first_name || 'Admin',
        lastName: customerData?.last_name || 'User',
        phone: customerData?.phone || undefined,
        companyName: customerData?.company_name || undefined,
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
        role: 'technician' as const,
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
      role: 'client' as const,
      firstName: customerData.first_name || '',
      lastName: customerData.last_name || '',
      phone: customerData.phone || undefined,
      companyName: customerData.company_name || undefined,
    };
  } catch (error) {
    console.error('[loadUserProfile] Error loading user profile:', error);
    return null;
  }
}
