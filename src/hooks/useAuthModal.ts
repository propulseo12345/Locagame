import { useState } from 'react';

type Tab = 'login' | 'register';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface UseAuthModalProps {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: { firstName: string; lastName: string; phone?: string }) => Promise<{ needsEmailConfirmation: boolean }>;
  onClose: () => void;
}

export function useAuthModal({ signIn, signUp, onClose }: UseAuthModalProps) {
  const [tab, setTab] = useState<Tab>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [registerData, setRegisterData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const resetForms = () => {
    setError('');
    setLoginEmail('');
    setLoginPassword('');
    setRegisterData({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
    setShowPassword(false);
    setRegisterSuccess(false);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setError('');
    setRegisterSuccess(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      // signIn sets user in AuthContext, FavoritesContext will detect the change
      // We need the user id - get it after signIn succeeds
      // The onAuthSuccess callback is handled by FavoritesContext watching user changes
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = registerData;

    if (!firstName || !lastName || !email || !password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const result = await signUp(email, password, {
        firstName,
        lastName,
        phone: registerData.phone,
      });
      if (result.needsEmailConfirmation) {
        setRegisterSuccess(true);
      } else {
        // Auto-confirmé : fermer le modal, l'utilisateur est connecté
        handleClose();
      }
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        setError('Cette adresse email est déjà utilisée. Connectez-vous !');
      } else {
        setError(err.message || 'Erreur lors de la création du compte');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return {
    tab,
    error,
    loading,
    showPassword,
    setShowPassword,
    registerSuccess,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    registerData,
    handleClose,
    handleTabChange,
    handleLogin,
    handleRegister,
    handleRegisterChange,
  };
}
