import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Demo mode - NEVER enable in production
const DEMO_MODE_ENABLED = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

// Credentials lus depuis les variables d'environnement (jamais hardcodés).
// Si VITE_ENABLE_DEMO_MODE !== 'true', vaut null → aucune donnée dans le bundle.
const DEMO_CREDENTIALS = DEMO_MODE_ENABLED
  ? {
      admin: {
        email: import.meta.env.VITE_DEMO_ADMIN_EMAIL || '',
        password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD || '',
        description: 'Accès complet à l\'interface d\'administration',
      },
      client: {
        email: import.meta.env.VITE_DEMO_CLIENT_EMAIL || '',
        password: import.meta.env.VITE_DEMO_CLIENT_PASSWORD || '',
        description: 'Accès à l\'espace client avec réservations',
      },
      technician: {
        email: import.meta.env.VITE_DEMO_TECH_EMAIL || '',
        password: import.meta.env.VITE_DEMO_TECH_PASSWORD || '',
        description: 'Accès à l\'interface de livraison',
      },
    }
  : null;

export { DEMO_MODE_ENABLED };

export type DemoType = 'admin' | 'client' | 'technician';

function navigateByRole(role: string, navigate: ReturnType<typeof useNavigate>) {
  if (role === 'admin') {
    navigate('/admin/dashboard');
  } else if (role === 'technician') {
    navigate('/technician/dashboard');
  } else {
    navigate('/client/dashboard');
  }
}

export function useLoginAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigateByRole(user.role, navigate);
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const profile = await signIn(email, password);
      navigateByRole(profile.role, navigate);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoType: DemoType) => {
    if (!DEMO_CREDENTIALS) return;

    const credentials = DEMO_CREDENTIALS[demoType];
    setEmail(credentials.email);
    setPassword(credentials.password);
    setError('');
    setLoading(true);

    try {
      const profile = await signIn(credentials.email, credentials.password);
      navigateByRole(profile.role, navigate);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    loading,
    isVisible,
    handleSubmit,
    handleDemoLogin,
    demoCredentials: DEMO_CREDENTIALS,
  };
}
