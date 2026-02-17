import { Loader2 } from 'lucide-react';
import { useClientProfile } from '../../hooks/client/useClientProfile';
import {
  ProfileHeader,
  PersonalInfoForm,
  SecurityForm,
  NotificationPreferences,
  DangerZone,
} from '../../components/client/profile';

export default function ClientProfile() {
  const {
    formData,
    setFormData,
    passwordData,
    setPasswordData,
    showPasswords,
    togglePasswordVisibility,
    preferences,
    setPreferences,
    loading,
    saving,
    savingPassword,
    saved,
    passwordError,
    passwordSuccess,
    getInitials,
    handleSaveProfile,
    handleChangePassword,
  } = useClientProfile();

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
      <ProfileHeader
        firstName={formData.firstName}
        lastName={formData.lastName}
        email={formData.email}
        initials={getInitials()}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="xl:col-span-2 space-y-6">
          <PersonalInfoForm
            formData={formData}
            setFormData={setFormData}
            saving={saving}
            saved={saved}
            onSave={handleSaveProfile}
          />

          <SecurityForm
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            showPasswords={showPasswords}
            togglePasswordVisibility={togglePasswordVisibility}
            savingPassword={savingPassword}
            passwordError={passwordError}
            passwordSuccess={passwordSuccess}
            onChangePassword={handleChangePassword}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <NotificationPreferences
            preferences={preferences}
            setPreferences={setPreferences}
          />
          <DangerZone />
        </div>
      </div>
    </div>
  );
}
