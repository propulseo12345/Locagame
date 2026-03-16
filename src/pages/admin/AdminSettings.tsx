import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SettingsService } from '../../services';
import { Loader2, Check, Settings } from 'lucide-react';

export default function AdminSettings() {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [companySaved, setCompanySaved] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [companyData, setCompanyData] = useState({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (user) {
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
        });
      }
      const companySettings = await SettingsService.getCompanySettings();
      setCompanyData(companySettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      await updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erreur lors de la sauvegarde du profil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveCompany = async () => {
    setSavingCompany(true);
    try {
      await SettingsService.updateCompanySettings(companyData);
      setCompanySaved(true);
      setTimeout(() => setCompanySaved(false), 3000);
    } catch (error) {
      console.error('Error saving company settings:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSavingCompany(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-40" />
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-32" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-gray-100 rounded" />
            <div className="h-10 bg-gray-100 rounded" />
          </div>
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-48" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-gray-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-sm text-gray-600 mt-0.5">Gérez les paramètres de l'application</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Mon profil</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex justify-end items-center gap-3 pt-2">
                {profileSaved && (
                  <span className="flex items-center gap-1.5 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    Profil enregistré
                  </span>
                )}
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {savingProfile ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Enregistrement...</>
                  ) : (
                    'Enregistrer le profil'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Informations de l'entreprise</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'entreprise</label>
                <input
                  type="text"
                  value={companyData.company_name}
                  onChange={(e) => setCompanyData({...companyData, company_name: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email de contact</label>
                <input
                  type="email"
                  value={companyData.company_email}
                  onChange={(e) => setCompanyData({...companyData, company_email: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  value={companyData.company_phone}
                  onChange={(e) => setCompanyData({...companyData, company_phone: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
                <textarea
                  rows={3}
                  value={companyData.company_address}
                  onChange={(e) => setCompanyData({...companyData, company_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent text-sm resize-none"
                />
              </div>
              <div className="flex justify-end items-center gap-3 pt-2">
                {companySaved && (
                  <span className="flex items-center gap-1.5 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    Paramètres enregistrés
                  </span>
                )}
                <button
                  onClick={handleSaveCompany}
                  disabled={savingCompany}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {savingCompany ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Enregistrement...</>
                  ) : (
                    "Enregistrer l'entreprise"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
