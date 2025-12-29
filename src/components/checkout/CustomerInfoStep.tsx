import { Mail, Phone, Building } from 'lucide-react';

interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isProfessional: boolean;
  companyName: string;
  siret: string;
}

interface CustomerInfoStepProps {
  customer: CustomerData;
  errors: Record<string, string>;
  onChange: (data: CustomerData) => void;
}

const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#33ffcc] focus:outline-none transition-colors";
const labelClass = "block text-sm text-gray-400 mb-1.5";
const errorClass = "text-red-400 text-xs mt-1";

export function CustomerInfoStep({ customer, errors, onChange }: CustomerInfoStepProps) {
  const updateField = (field: keyof CustomerData, value: string | boolean) => {
    onChange({ ...customer, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Vos coordonnées</h2>
        <p className="text-gray-400 text-sm">Informations de facturation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Prénom *</label>
          <input
            type="text"
            value={customer.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            className={inputClass}
            placeholder="Jean"
          />
          {errors.firstName && <p className={errorClass}>{errors.firstName}</p>}
        </div>
        <div>
          <label className={labelClass}>Nom *</label>
          <input
            type="text"
            value={customer.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            className={inputClass}
            placeholder="Dupont"
          />
          {errors.lastName && <p className={errorClass}>{errors.lastName}</p>}
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              value={customer.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="jean@email.com"
            />
          </div>
          {errors.email && <p className={errorClass}>{errors.email}</p>}
        </div>
        <div>
          <label className={labelClass}>Téléphone *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="tel"
              value={customer.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="06 12 34 56 78"
            />
          </div>
          {errors.phone && <p className={errorClass}>{errors.phone}</p>}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={customer.isProfessional}
          onChange={(e) => updateField('isProfessional', e.target.checked)}
          className="w-4 h-4 rounded border-white/20 text-[#33ffcc] focus:ring-[#33ffcc] bg-white/5"
        />
        <span className="text-gray-300">Je suis un professionnel</span>
      </label>

      {customer.isProfessional && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <label className={labelClass}>Nom de l'entreprise *</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={customer.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="Ma Société SAS"
              />
            </div>
            {errors.companyName && <p className={errorClass}>{errors.companyName}</p>}
          </div>
          <div>
            <label className={labelClass}>SIRET (optionnel)</label>
            <input
              type="text"
              value={customer.siret}
              onChange={(e) => updateField('siret', e.target.value)}
              className={inputClass}
              placeholder="123 456 789 00012"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export type { CustomerData };
