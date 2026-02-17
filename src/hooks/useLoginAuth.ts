import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Demo mode - NEVER enable in production
const DEMO_MODE_ENABLED = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

// Demo credentials only loaded if demo mode is enabled
export const DEMO_CREDENTIALS = DEMO_MODE_ENABLED ? {
  admin: {
    email: 'admin@locagame.fr',
    password: 'admin123',
    description: 'Accès complet à l\'interface d\'administration',
  },
  client: {
    email: 'client@exemple.fr',
    password: 'client123',
    description: 'Accès à l\'espace client avec réservations',
  },
  technician: {
    email: 'technicien@locagame.fr',
    password: 'tech123',
    description: 'Accès à l\'interface de livraison',
  },
} : null;

export { DEMO_MODE_ENABLED };

export type DemoType = 'admin' | 'client' | 'technician';

export function useLoginAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<DemoType | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Redirect once user is loaded
  useEffect(() => {
    if (user && pendingRedirect) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'technician') {
        navigate('/technician/dashboard');
      } else {
        navigate('/client/dashboard');
      }
      setPendingRedirect(null);
      setLoading(false);
    } else if (user && !pendingRedirect) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'technician') {
        navigate('/technician/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    }
  }, [user, pendingRedirect, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      if (email.includes('admin')) {
        setPendingRedirect('admin');
      } else if (email.includes('technicien')) {
        setPendingRedirect('technician');
      } else {
        setPendingRedirect('client');
      }
      if (user) {
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Identifiants incorrects. Veuillez réessayer.');
      setLoading(false);
      setPendingRedirect(null);
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
      await signIn(credentials.email, credentials.password);
      setPendingRedirect(demoType);
      if (user) {
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
      setLoading(false);
      setPendingRedirect(null);
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
  };
}
