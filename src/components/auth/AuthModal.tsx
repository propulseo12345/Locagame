import { X, Heart, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../hooks/useAuthModal';
import { Button } from '../ui';
import { AuthTabs } from './AuthTabs';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userId: string) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const {
    tab, error, loading, showPassword, setShowPassword, registerSuccess,
    loginEmail, setLoginEmail, loginPassword, setLoginPassword,
    registerData, handleClose, handleTabChange,
    handleLogin, handleRegister, handleRegisterChange,
  } = useAuthModal({ signIn, signUp, onClose });

  if (!isOpen) return null;

  // Registration success screen
  if (registerSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
        <div className="bg-gradient-to-br from-[#001144] to-[#000033] border border-white/15 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 bg-[#33ffcc]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#33ffcc]" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Vérifiez votre email</h3>
          <p className="text-gray-400 text-sm mb-6">
            Un email de confirmation a été envoyé. Après confirmation, connectez-vous et votre produit sera automatiquement ajouté à vos favoris.
          </p>
          <Button variant="primary" fullWidth onClick={handleClose}>
            Compris
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div
        className="bg-gradient-to-br from-[#001144] to-[#000033] border border-white/15 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-white/10">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#fe1979]/20 rounded-xl">
              <Heart className="w-6 h-6 text-[#fe1979] fill-[#fe1979]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Sauvegardez vos coups de coeur</h2>
              <p className="text-sm text-gray-400">Créez un compte pour retrouver vos favoris</p>
            </div>
          </div>
        </div>

        <AuthTabs tab={tab} onTabChange={handleTabChange} />

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Forms */}
        <div className="p-6">
          {tab === 'login' ? (
            <LoginForm
              loginEmail={loginEmail} loginPassword={loginPassword}
              setLoginEmail={setLoginEmail} setLoginPassword={setLoginPassword}
              showPassword={showPassword} setShowPassword={setShowPassword}
              loading={loading} onSubmit={handleLogin}
            />
          ) : (
            <RegisterForm
              registerData={registerData} onRegisterChange={handleRegisterChange}
              showPassword={showPassword} setShowPassword={setShowPassword}
              loading={loading} onSubmit={handleRegister}
            />
          )}
        </div>
      </div>
    </div>
  );
}
