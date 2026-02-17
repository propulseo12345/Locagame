import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CustomersService } from '../../services';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
}

interface PasswordData {
  current: string;
  new: string;
  confirm: string;
}

interface ShowPasswords {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

interface Preferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  newsletter: boolean;
}

export function useClientProfile() {
  const { user, updateUserProfile } = useAuth();

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    current: '',
    new: '',
    confirm: '',
  });

  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
    current: false,
    new: false,
    confirm: false,
  });

  const [preferences, setPreferences] = useState<Preferences>({
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
      setPasswordError('Le mot de passe doit contenir au moins 8 caracteres');
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

  const togglePasswordVisibility = (field: keyof ShowPasswords) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  return {
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
  };
}
