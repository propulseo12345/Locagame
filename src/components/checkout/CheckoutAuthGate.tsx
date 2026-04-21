import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Phone, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../constants/routes';

export function CheckoutAuthGate() {
  const { signIn } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) { setError('Veuillez remplir tous les champs'); return; }
    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regFirstName || !regLastName || !regEmail || !regPassword) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (regPassword.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères'); return; }
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('checkout-register', {
        body: { email: regEmail, first_name: regFirstName, last_name: regLastName, phone: regPhone, password: regPassword },
      });

      if (fnError) {
        let errMsg = 'Erreur lors de la création du compte';
        try {
          if (fnError.context && typeof fnError.context.json === 'function') {
            const body = await fnError.context.json();
            errMsg = body?.error || errMsg;
          }
        } catch { /* ignore */ }
        if (errMsg === 'EMAIL_EXISTS') {
          setError('Cette adresse email est déjà utilisée. Connectez-vous !');
          setLoginEmail(regEmail);
          setTab('login');
          return;
        }
        throw new Error(errMsg);
      }

      if (!data?.success) {
        const errMsg = data?.error || '';
        if (errMsg === 'EMAIL_EXISTS') {
          setError('Cette adresse email est déjà utilisée. Connectez-vous !');
          setLoginEmail(regEmail);
          setTab('login');
          return;
        }
        throw new Error(errMsg || 'Erreur lors de la création du compte');
      }

      await signIn(regEmail, regPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:border-[#33ffcc]/50 focus:outline-none focus:ring-1 focus:ring-[#33ffcc]/30 transition-colors';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000033] to-[#001144] pt-header">
      <div className="max-w-md mx-auto px-4 py-10">
        <Link to="/panier" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-5 h-5" />Retour au panier
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#33ffcc]/10 border border-[#33ffcc]/20 mb-4">
            <Lock className="w-7 h-7 text-[#33ffcc]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Connectez-vous pour commander</h1>
          <p className="text-white/50 text-sm">Vos articles sont dans votre panier. Créez un compte ou connectez-vous pour finaliser votre commande.</p>
        </div>

        <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/10">
          <button onClick={() => { setTab('login'); setError(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === 'login' ? 'bg-[#33ffcc] text-[#000033]' : 'text-white/60 hover:text-white'}`}>
            Connexion
          </button>
          <button onClick={() => { setTab('register'); setError(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === 'register' ? 'bg-[#33ffcc] text-[#000033]' : 'text-white/60 hover:text-white'}`}>
            Inscription
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400/80 text-sm">{error}</p>
          </div>
        )}

        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email" required className={inputClass} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Mot de passe" required className={`${inputClass} pr-10`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60" tabIndex={-1}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se connecter'}
            </button>
            <div className="text-center">
              <Link to={ROUTES.RESET_PASSWORD} className="text-[#33ffcc]/70 hover:text-[#33ffcc] text-sm transition-colors">Mot de passe oublié ?</Link>
            </div>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input type="text" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} placeholder="Prénom" required className={inputClass} />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input type="text" value={regLastName} onChange={e => setRegLastName(e.target.value)} placeholder="Nom" required className={inputClass} />
              </div>
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Email" required className={inputClass} />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="Téléphone (optionnel)" className={inputClass} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input type={showPassword ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Mot de passe (min. 8 caractères)" required className={`${inputClass} pr-10`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60" tabIndex={-1}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Créer mon compte'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
