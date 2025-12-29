import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CustomersService } from '../../services';
import {
  User,
  Mail,
  Phone,
  Building2,
  Lock,
  Shield,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Camera,
  Bell,
  Globe,
  Loader2
} from 'lucide-react';

export default function ClientProfile() {
  const { user, updateUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newsletter: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const customerData = await CustomersService.getCustomerById(user.id);

      setFormData({
        firstName: customerData?.first_name || user.firstName || '',
        lastName: customerData?.last_name || user.lastName || '',
        email: customerData?.email || user.email || '',
        phone: customerData?.phone || user.phone || '',
        company: customerData?.company_name || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        company: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.new.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setSavingPassword(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordSuccess(true);
      setPasswordData({ current: '', new: '', confirm: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      setPasswordError('Erreur lors du changement de mot de passe');
    } finally {
      setSavingPassword(false);
    }
  };

  const getInitials = () => {
    return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#33ffcc] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6 md:mt-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#33ffcc]/20 via-[#66cccc]/10 to-transparent backdrop-blur-md rounded-2xl border border-white/20 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#33ffcc]/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-[#33ffcc] to-[#66cccc] rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-black text-[#000033] shadow-lg shadow-[#33ffcc]/30">
              {getInitials()}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white hover:bg-[#33ffcc] hover:text-[#000033] transition-all opacity-0 group-hover:opacity-100">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#33ffcc]/20 border border-[#33ffcc]/30 rounded-full mb-3">
              <Sparkles className="w-4 h-4 text-[#33ffcc]" />
              <span className="text-sm text-[#33ffcc] font-medium">Compte vérifié</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
              {formData.firstName} {formData.lastName}
            </h1>
            <p className="text-white/60 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {formData.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="xl:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
              <div className="p-2 bg-[#33ffcc]/20 rounded-xl">
                <User className="w-5 h-5 text-[#33ffcc]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Informations personnelles</h2>
                <p className="text-sm text-white/50">Gérez vos coordonnées</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Nom</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-12 pr-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-white/50 cursor-not-allowed"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#33ffcc]/20 rounded-md">
                    <span className="text-xs text-[#33ffcc] font-medium">Vérifié</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all"
                  />
                </div>
              </div>

              {formData.company && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Entreprise</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Bouton sauvegarder */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
                {saved && (
                  <span className="flex items-center gap-2 text-sm text-[#33ffcc]">
                    <Check className="w-4 h-4" />
                    Modifications enregistrées
                  </span>
                )}
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#4fffdd] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sécurité */}
          <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
              <div className="p-2 bg-[#fe1979]/20 rounded-xl">
                <Shield className="w-5 h-5 text-[#fe1979]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Sécurité</h2>
                <p className="text-sm text-white/50">Modifiez votre mot de passe</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Mot de passe actuel</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                      className="w-full pl-12 pr-12 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      className="w-full pl-12 pr-12 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {passwordError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Mot de passe modifié avec succès
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  onClick={handleChangePassword}
                  disabled={savingPassword || !passwordData.current || !passwordData.new || !passwordData.confirm}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 border border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Modification...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Changer le mot de passe
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Préférences de notification */}
          <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-xl">
                <Bell className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Notifications</h2>
            </div>

            <div className="p-6 space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-white/40" />
                  <span className="text-white/80">Notifications email</span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${preferences.emailNotifications ? 'bg-[#33ffcc]' : 'bg-white/20'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${preferences.emailNotifications ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'}`}></div>
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-white/40" />
                  <span className="text-white/80">Notifications SMS</span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={preferences.smsNotifications}
                    onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${preferences.smsNotifications ? 'bg-[#33ffcc]' : 'bg-white/20'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${preferences.smsNotifications ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'}`}></div>
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-white/40" />
                  <span className="text-white/80">Newsletter</span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={preferences.newsletter}
                    onChange={(e) => setPreferences({ ...preferences, newsletter: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${preferences.newsletter ? 'bg-[#33ffcc]' : 'bg-white/20'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${preferences.newsletter ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'}`}></div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Zone de danger */}
          <div className="bg-red-500/5 backdrop-blur-md rounded-2xl border border-red-500/20 overflow-hidden">
            <div className="px-6 py-5 border-b border-red-500/20">
              <h2 className="text-lg font-bold text-red-400">Zone de danger</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-white/60 mb-4">
                La suppression de votre compte est irréversible. Toutes vos données seront perdues.
              </p>
              <button className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-medium rounded-xl hover:bg-red-500/20 transition-colors">
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
