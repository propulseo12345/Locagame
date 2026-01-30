/**
 * Script pour créer les utilisateurs de démonstration dans Supabase Auth
 * 
 * Usage: node scripts/create-demo-users.js
 * 
 * Prérequis:
 * - Avoir les variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
 * - Ou les définir dans ce script
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://koqdpkkuarbjiimkopei.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY n\'est pas définie');
  console.log('💡 Pour obtenir la service role key:');
  console.log('   1. Allez dans Supabase Dashboard > Settings > API');
  console.log('   2. Copiez la "service_role" key (⚠️  gardez-la secrète!)');
  console.log('   3. Ajoutez-la dans votre .env: SUPABASE_SERVICE_ROLE_KEY=your-key');
  process.exit(1);
}

// Créer un client avec la service role key (permissions admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const users = [
  {
    email: 'admin@locagame.fr',
    password: 'admin123',
    profile: {
      first_name: 'Sophie',
      last_name: 'Martin',
      phone: '+33 6 12 34 56 78',
      role: 'admin'
    }
  },
  {
    email: 'client@exemple.fr',
    password: 'client123',
    profile: {
      first_name: 'Marie',
      last_name: 'Lefebvre',
      phone: '+33 6 34 56 78 90',
      role: 'client',
      loyalty_points: 150
    }
  },
  {
    email: 'technicien@locagame.fr',
    password: 'tech123',
    profile: {
      first_name: 'Lucas',
      last_name: 'Moreau',
      phone: '+33 6 45 67 89 01',
      role: 'technician'
    }
  }
];

async function createUser(userData) {
  try {
    console.log(`\n📝 Création de ${userData.email}...`);

    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirmer l'email
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`   ⚠️  Utilisateur ${userData.email} existe déjà, récupération...`);
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const user = existingUser.users.find(u => u.email === userData.email);
        if (user) {
          // Réinitialiser le mot de passe
          await supabase.auth.admin.updateUserById(user.id, {
            password: userData.password
          });
          console.log(`   ✅ Mot de passe réinitialisé pour ${userData.email}`);
          return user;
        }
      } else {
        throw authError;
      }
    }

    if (!authData.user) {
      throw new Error('Utilisateur non créé');
    }

    console.log(`   ✅ Utilisateur créé: ${authData.user.id}`);

    // Créer le profil selon le rôle
    if (userData.profile.role === 'admin') {
      // Créer le profil customer
      const { error: customerError } = await supabase
        .from('customers')
        .upsert({
          id: authData.user.id,
          email: userData.email,
          first_name: userData.profile.first_name,
          last_name: userData.profile.last_name,
          phone: userData.profile.phone,
          customer_type: 'individual'
        });

      if (customerError) throw customerError;

      // Créer le profil admin_user
      const { error: adminError } = await supabase
        .from('admin_users')
        .upsert({
          user_id: authData.user.id,
          role: 'admin',
          is_active: true
        });

      if (adminError) throw adminError;
      console.log(`   ✅ Profil admin créé`);

    } else if (userData.profile.role === 'client') {
      const { error: customerError } = await supabase
        .from('customers')
        .upsert({
          id: authData.user.id,
          email: userData.email,
          first_name: userData.profile.first_name,
          last_name: userData.profile.last_name,
          phone: userData.profile.phone,
          customer_type: 'individual',
          loyalty_points: userData.profile.loyalty_points
        });

      if (customerError) throw customerError;
      console.log(`   ✅ Profil client créé`);

    } else if (userData.profile.role === 'technician') {
      const { error: techError } = await supabase
        .from('technicians')
        .upsert({
          user_id: authData.user.id,
          first_name: userData.profile.first_name,
          last_name: userData.profile.last_name,
          email: userData.email,
          phone: userData.profile.phone,
          is_active: true
        });

      if (techError) throw techError;
      console.log(`   ✅ Profil technicien créé`);
    }

    return authData.user;
  } catch (error) {
    console.error(`   ❌ Erreur pour ${userData.email}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Création des utilisateurs de démonstration...\n');

  for (const userData of users) {
    try {
      await createUser(userData);
    } catch (error) {
      console.error(`❌ Échec pour ${userData.email}:`, error.message);
    }
  }

  console.log('\n✅ Terminé !');
  console.log('\n📋 Credentials:');
  console.log('   Admin: admin@locagame.fr / admin123');
  console.log('   Client: client@exemple.fr / client123');
  console.log('   Technicien: technicien@locagame.fr / tech123');
}

main().catch(console.error);

