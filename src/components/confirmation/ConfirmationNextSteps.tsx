import { CheckCircle, Phone, Mail } from 'lucide-react';
import type { ConfirmationPaymentState } from '../../hooks/checkout/useConfirmation';

interface ConfirmationNextStepsProps {
  paymentState: ConfirmationPaymentState;
}

export default function ConfirmationNextSteps({ paymentState }: ConfirmationNextStepsProps) {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
      <h3 className="font-bold text-white mb-4">Et maintenant ?</h3>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
            paymentState === 'success' ? 'bg-green-500/30' : 'bg-[#33ffcc]/20'
          }`}>
            {paymentState === 'success' ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <span className="text-[#33ffcc] font-bold text-xs">1</span>
            )}
          </div>
          <div>
            <p className="text-white font-medium text-sm">Paiement et confirmation</p>
            <p className="text-gray-400 text-xs">
              {paymentState === 'success'
                ? 'Paiement recu — reservation confirmee.'
                : 'Finalisez votre paiement pour confirmer la reservation.'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 bg-[#33ffcc]/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[#33ffcc] font-bold text-xs">2</span>
          </div>
          <div>
            <p className="text-white font-medium text-sm">Preparation</p>
            <p className="text-gray-400 text-xs">Nous preparons votre commande et vous contactons sous 24h pour les details.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 bg-[#33ffcc]/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[#33ffcc] font-bold text-xs">3</span>
          </div>
          <div>
            <p className="text-white font-medium text-sm">Livraison / Retrait</p>
            <p className="text-gray-400 text-xs">Nous installons tout pour votre evenement !</p>
          </div>
        </div>
      </div>

      {/* Contact integre */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-gray-400 text-xs mb-2">Une question ?</p>
        <div className="flex items-center gap-4 text-sm">
          <a href="tel:0430220383" className="flex items-center gap-1 text-[#33ffcc] hover:underline">
            <Phone className="w-3 h-3" />
            04 30 22 03 83
          </a>
          <a href="mailto:contact@locagame.fr" className="flex items-center gap-1 text-[#33ffcc] hover:underline">
            <Mail className="w-3 h-3" />
            contact@locagame.fr
          </a>
        </div>
      </div>
    </div>
  );
}
