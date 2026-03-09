import { Eye, EyeOff, RefreshCw } from 'lucide-react';

interface TechnicianFormPasswordProps {
  isEdit: boolean;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showResetPassword: boolean;
  setShowResetPassword: (v: boolean) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  onGenerate: () => string;
}

export default function TechnicianFormPassword({
  isEdit,
  password, setPassword,
  showPassword, setShowPassword,
  showResetPassword, setShowResetPassword,
  newPassword, setNewPassword,
  onGenerate,
}: TechnicianFormPasswordProps) {
  if (!isEdit) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe *
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setPassword(onGenerate());
              setShowPassword(true);
            }}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-1 text-sm whitespace-nowrap"
            title="G&eacute;n&eacute;rer un mot de passe"
          >
            <RefreshCw className="w-4 h-4" />
            G&eacute;n&eacute;rer
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Min. 8 caract&egrave;res</p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-4">
      <button
        type="button"
        onClick={() => setShowResetPassword(!showResetPassword)}
        className="text-sm font-medium text-[#33ffcc] hover:text-[#66cccc]"
      >
        {showResetPassword ? 'Annuler le reset' : 'R\u00e9initialiser le mot de passe'}
      </button>
      {showResetPassword && (
        <div className="mt-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe (min. 8 car.)"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewPassword(onGenerate());
                setShowPassword(true);
              }}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              title="G&eacute;n&eacute;rer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
