import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldX, Home, LogIn, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleGoBack = () => {
    if (user) {
      // Rediriger vers le dashboard approprié
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'technician') {
        navigate('/technician/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } else {
      navigate('/');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] via-[#001144] to-[#000033] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-red-500 opacity-10 rounded-full blur-3xl top-20 left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-orange-500 opacity-10 rounded-full blur-3xl bottom-20 right-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-black text-white mb-4">
            Accès refusé
          </h1>

          {/* Message */}
          <p className="text-gray-400 mb-8">
            {user ? (
              <>
                Votre compte <span className="text-white font-semibold">{user.email}</span> n'a pas les permissions nécessaires pour accéder à cette page.
              </>
            ) : (
              <>
                Vous devez être connecté pour accéder à cette page.
              </>
            )}
          </p>

          {/* Role info */}
          {user && (
            <div className="mb-8 p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-gray-500">Votre rôle actuel</p>
              <p className="text-[#33ffcc] font-bold capitalize">
                {user.role === 'admin' ? 'Administrateur' :
                 user.role === 'technician' ? 'Technicien' : 'Client'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<ArrowLeft className="w-5 h-5" />}
              onClick={handleGoBack}
            >
              {user ? 'Retour à mon espace' : 'Accueil'}
            </Button>

            {user ? (
              <Button
                variant="outline"
                size="lg"
                fullWidth
                leftIcon={<LogIn className="w-5 h-5" />}
                onClick={handleSignOut}
              >
                Se connecter avec un autre compte
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                fullWidth
                leftIcon={<LogIn className="w-5 h-5" />}
                onClick={() => navigate('/login')}
              >
                Se connecter
              </Button>
            )}

            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              <Home className="w-4 h-4 inline mr-2" />
              Retour au site vitrine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
