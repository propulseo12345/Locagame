import { supabase } from '../lib/supabase';

export interface AppSetting {
  id: string;
  key: string;
  value: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
}

export class SettingsService {
  /**
   * Récupère tous les paramètres
   */
  static async getAllSettings(): Promise<Record<string, string>> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*');

    if (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }

    const settings: Record<string, string> = {};
    (data || []).forEach((setting: AppSetting) => {
      settings[setting.key] = setting.value || '';
    });

    return settings;
  }

  /**
   * Récupère les paramètres de l'entreprise
   */
  static async getCompanySettings(): Promise<CompanySettings> {
    const settings = await this.getAllSettings();

    return {
      company_name: settings.company_name || 'LOCAGAME',
      company_email: settings.company_email || 'contact@locagame.fr',
      company_phone: settings.company_phone || '',
      company_address: settings.company_address || '',
    };
  }

  /**
   * Met à jour un paramètre
   */
  static async updateSetting(key: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  }

  /**
   * Met à jour plusieurs paramètres
   */
  static async updateSettings(settings: Record<string, string>): Promise<void> {
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString()
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('app_settings')
        .upsert(update, { onConflict: 'key' });

      if (error) {
        console.error('Error updating setting:', error);
        throw error;
      }
    }
  }

  /**
   * Met à jour les paramètres de l'entreprise
   */
  static async updateCompanySettings(settings: Partial<CompanySettings>): Promise<void> {
    const updates: Record<string, string> = {};

    if (settings.company_name !== undefined) updates.company_name = settings.company_name;
    if (settings.company_email !== undefined) updates.company_email = settings.company_email;
    if (settings.company_phone !== undefined) updates.company_phone = settings.company_phone;
    if (settings.company_address !== undefined) updates.company_address = settings.company_address;

    await this.updateSettings(updates);
  }
}
