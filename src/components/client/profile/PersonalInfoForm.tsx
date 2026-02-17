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

export default function PersonalInfoForm({
  formData,
  setFormData,
  saving,
  saved,
  onSave,
}: PersonalInfoFormProps) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
        <div className="p-2 bg-[#33ffcc]/20 rounded-xl">
          <User className="w-5 h-5 text-[#33ffcc]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Informations personnelles</h2>
          <p className="text-sm text-white/50">Gerez vos coordonnees</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Prenom</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Nom</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full pl-12 pr-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-white/50 cursor-not-allowed"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#33ffcc]/20 rounded-md">
              <span className="text-xs text-[#33ffcc] font-medium">Verifie</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Telephone</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+33 6 12 34 56 78"
              className="w-full pl-12 pr-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all"
            />
          </div>
        </div>

        {formData.company && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Entreprise</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all"
              />
            </div>
          </div>
        )}

        {/* Bouton sauvegarder */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
          {saved && (
            <span className="flex items-center gap-2 text-sm text-[#33ffcc]">
              <Check className="w-4 h-4" />
              Modifications enregistrees
            </span>
          )}
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#4fffdd] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
