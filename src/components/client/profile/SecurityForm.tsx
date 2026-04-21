import { Lock, Eye, EyeOff, Check, Loader2 } from 'lucide-react';

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

const inputClass = 'w-full pl-10 pr-10 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#33ffcc]/40 focus:border-[#33ffcc]/30 transition-all';

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
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white">Sécurité</h2>
        <p className="text-xs text-gray-500 mt-0.5">Modifiez votre mot de passe</p>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Mot de passe actuel</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.current}
              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Nouveau mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirmer</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {passwordError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Mot de passe modifié avec succès
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-white/[0.06]">
          <button
            onClick={onChangePassword}
            disabled={savingPassword || !passwordData.current || !passwordData.new || !passwordData.confirm}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] text-sm text-white font-medium rounded-lg border border-white/[0.08] hover:bg-white/[0.1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {savingPassword ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Modification...</>
            ) : (
              'Changer le mot de passe'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
