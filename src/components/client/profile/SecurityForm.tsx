import { Lock, Shield, Eye, EyeOff, Check, Loader2 } from 'lucide-react';

interface SecurityFormProps {
  passwordData: {
    current: string;
    new: string;
    confirm: string;
  };
  setPasswordData: (data: SecurityFormProps['passwordData']) => void;
  showPasswords: {
    current: boolean;
    new: boolean;
    confirm: boolean;
  };
  togglePasswordVisibility: (field: 'current' | 'new' | 'confirm') => void;
  savingPassword: boolean;
  passwordError: string;
  passwordSuccess: boolean;
  onChangePassword: () => void;
}

export default function SecurityForm({
  passwordData,
  setPasswordData,
  showPasswords,
  togglePasswordVisibility,
  savingPassword,
  passwordError,
  passwordSuccess,
  onChangePassword,
}: SecurityFormProps) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
        <div className="p-2 bg-[#fe1979]/20 rounded-xl">
          <Shield className="w-5 h-5 text-[#fe1979]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Securite</h2>
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
              onClick={() => togglePasswordVisibility('current')}
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
                onClick={() => togglePasswordVisibility('new')}
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
                onClick={() => togglePasswordVisibility('confirm')}
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
            Mot de passe modifie avec succes
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            onClick={onChangePassword}
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
  );
}
