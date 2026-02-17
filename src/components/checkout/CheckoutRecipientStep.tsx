import { Info } from 'lucide-react';
import type { CustomerState, RecipientState } from '../../hooks/checkout/types';
import { inputClass, labelClass, errorClass } from '../../hooks/checkout/types';

interface CheckoutRecipientStepProps {
  customer: CustomerState;
  recipient: RecipientState;
  setRecipient: React.Dispatch<React.SetStateAction<RecipientState>>;
  errors: Record<string, string>;
}

export function CheckoutRecipientStep({
  customer,
  recipient,
  setRecipient,
  errors,
}: CheckoutRecipientStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Qui receptionne le materiel ?</h2>
        <p className="text-gray-400 text-sm">Personne presente lors de la livraison</p>
      </div>

      <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
        <input
          type="checkbox"
          checked={recipient.sameAsCustomer}
          onChange={(e) => setRecipient({ ...recipient, sameAsCustomer: e.target.checked })}
          className="w-4 h-4 rounded border-white/20 text-[#33ffcc] focus:ring-[#33ffcc] bg-white/5"
        />
        <div>
          <span className="text-white font-medium">Moi-meme</span>
          <p className="text-gray-500 text-sm">{customer.firstName} {customer.lastName} - {customer.phone}</p>
        </div>
      </label>

      {!recipient.sameAsCustomer && (
        <div className="space-y-4 p-4 bg-[#33ffcc]/5 rounded-xl border border-[#33ffcc]/20">
          <p className="text-[#33ffcc] text-sm font-medium flex items-center gap-2">
            <Info className="w-4 h-4" />
            Coordonnees de la personne qui receptionnera le materiel
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Prenom *</label>
              <input
                type="text"
                value={recipient.firstName}
                onChange={(e) => setRecipient({ ...recipient, firstName: e.target.value })}
                className={inputClass}
              />
              {errors.recipientFirstName && <p className={errorClass}>{errors.recipientFirstName}</p>}
            </div>
            <div>
              <label className={labelClass}>Nom *</label>
              <input
                type="text"
                value={recipient.lastName}
                onChange={(e) => setRecipient({ ...recipient, lastName: e.target.value })}
                className={inputClass}
              />
              {errors.recipientLastName && <p className={errorClass}>{errors.recipientLastName}</p>}
            </div>
            <div>
              <label className={labelClass}>Telephone *</label>
              <input
                type="tel"
                value={recipient.phone}
                onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })}
                className={inputClass}
                placeholder="06 12 34 56 78"
              />
              {errors.recipientPhone && <p className={errorClass}>{errors.recipientPhone}</p>}
            </div>
            <div>
              <label className={labelClass}>Email (optionnel)</label>
              <input
                type="email"
                value={recipient.email}
                onChange={(e) => setRecipient({ ...recipient, email: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
