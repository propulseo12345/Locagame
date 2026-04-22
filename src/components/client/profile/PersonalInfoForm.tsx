import { User, Mail, Phone, Building2, Check, Loader2 } from 'lucide-react';

interface PersonalInfoFormProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
  };
  setFormData: (data: PersonalInfoFormProps['formData']) => void;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
}

const inputClass = 'w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#33ffcc]/40 focus:border-[#33ffcc]/30 transition-all';

export default function PersonalInfoForm({
  formData,
  setFormData,
  saving,
  saved,
  onSave,
}: PersonalInfoFormProps) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white">Informations personnelles</h2>
        <p className="text-xs text-gray-500 mt-0.5">Gérez vos coordonnées</p>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Prénom</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Nom</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full pl-10 pr-20 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg text-sm text-gray-500 cursor-not-allowed"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-emerald-500/10 rounded text-[10px] font-medium text-emerald-400">
              Vérifié
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Téléphone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+33 6 12 34 56 78"
              className={inputClass}
            />
          </div>
        </div>

        {formData.company && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Entreprise</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Check className="w-3.5 h-3.5" />
              Enregistré
            </span>
          )}
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-3 min-h-[44px] bg-[#33ffcc] text-[#000033] text-sm font-semibold rounded-lg hover:bg-[#4fffdd] transition-colors active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
