import { Mail, Phone, Building, FileText } from 'lucide-react';
import type { CustomerState, BillingAddressState } from '../../hooks/checkout/types';
import { inputClass, labelClass, errorClass } from '../../hooks/checkout/types';

interface CheckoutCustomerStepProps {
  customer: CustomerState;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerState>>;
  billingAddress: BillingAddressState;
  setBillingAddress: React.Dispatch<React.SetStateAction<BillingAddressState>>;
  errors: Record<string, string>;
}

export function CheckoutCustomerStep({
  customer,
  setCustomer,
  billingAddress,
  setBillingAddress,
  errors,
}: CheckoutCustomerStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Vos coordonnees</h2>
        <p className="text-gray-400 text-sm">Informations de facturation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Prenom *</label>
          <input
            type="text"
            value={customer.firstName}
            onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
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
            onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
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
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              className={`${inputClass} pl-10`}
              placeholder="jean@email.com"
            />
          </div>
          {errors.email && <p className={errorClass}>{errors.email}</p>}
        </div>
        <div>
          <label className={labelClass}>Telephone *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="tel"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
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
          onChange={(e) => setCustomer({ ...customer, isProfessional: e.target.checked })}
          className="w-4 h-4 rounded border-white/20 text-[#33ffcc] focus:ring-[#33ffcc] bg-white/5"
        />
        <span className="text-gray-300">Je suis un professionnel</span>
      </label>

      {customer.isProfessional && (
        <div className="space-y-4">
          {/* Company info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <label className={labelClass}>Nom de l'entreprise *</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={customer.companyName}
                  onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
                  className={`${inputClass} pl-10`}
                  placeholder="Ma Societe SAS"
                />
              </div>
              {errors.companyName && <p className={errorClass}>{errors.companyName}</p>}
            </div>
            <div>
              <label className={labelClass}>SIRET (optionnel)</label>
              <input
                type="text"
                value={customer.siret}
                onChange={(e) => setCustomer({ ...customer, siret: e.target.value })}
                className={inputClass}
                placeholder="123 456 789 00012"
              />
            </div>
          </div>

          {/* Billing address */}
          <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Adresse de facturation
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Raison sociale *</label>
                  <input
                    type="text"
                    value={billingAddress.companyName}
                    onChange={(e) => setBillingAddress({ ...billingAddress, companyName: e.target.value })}
                    className={inputClass}
                    placeholder="Ma Societe SAS"
                  />
                  {errors.billingCompanyName && <p className={errorClass}>{errors.billingCompanyName}</p>}
                </div>
                <div>
                  <label className={labelClass}>N. TVA intracommunautaire</label>
                  <input
                    type="text"
                    value={billingAddress.vatNumber}
                    onChange={(e) => setBillingAddress({ ...billingAddress, vatNumber: e.target.value })}
                    className={inputClass}
                    placeholder="FR12345678901"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Adresse *</label>
                <input
                  type="text"
                  value={billingAddress.addressLine1}
                  onChange={(e) => setBillingAddress({ ...billingAddress, addressLine1: e.target.value })}
                  className={inputClass}
                  placeholder="123 rue de la Facturation"
                />
                {errors.billingAddressLine1 && <p className={errorClass}>{errors.billingAddressLine1}</p>}
              </div>
              <div>
                <label className={labelClass}>Complement d'adresse</label>
                <input
                  type="text"
                  value={billingAddress.addressLine2}
                  onChange={(e) => setBillingAddress({ ...billingAddress, addressLine2: e.target.value })}
                  className={inputClass}
                  placeholder="Batiment B, 2eme etage"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>Code postal *</label>
                  <input
                    type="text"
                    value={billingAddress.postalCode}
                    onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                    className={inputClass}
                    placeholder="13001"
                  />
                  {errors.billingPostalCode && <p className={errorClass}>{errors.billingPostalCode}</p>}
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className={labelClass}>Ville *</label>
                  <input
                    type="text"
                    value={billingAddress.city}
                    onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                    className={inputClass}
                    placeholder="Marseille"
                  />
                  {errors.billingCity && <p className={errorClass}>{errors.billingCity}</p>}
                </div>
                <div>
                  <label className={labelClass}>Pays *</label>
                  <select
                    value={billingAddress.country}
                    onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                    className={inputClass}
                  >
                    <option value="FR">France</option>
                    <option value="BE">Belgique</option>
                    <option value="CH">Suisse</option>
                    <option value="LU">Luxembourg</option>
                    <option value="MC">Monaco</option>
                  </select>
                  {errors.billingCountry && <p className={errorClass}>{errors.billingCountry}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
