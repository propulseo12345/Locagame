import {
  CheckCircle,
  Clock,
  PartyPopper,
  XCircle,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import type { ConfirmationPaymentState } from '../../hooks/checkout/useConfirmation';

interface ConfirmationHeaderProps {
  paymentState: ConfirmationPaymentState;
  reservation: any;
  retrying: boolean;
  onRetryPayment: () => void;
}

export default function ConfirmationHeader({
  paymentState,
  reservation,
  retrying,
  onRetryPayment,
}: ConfirmationHeaderProps) {
  if (paymentState === 'success') {
    return (
      <div className="bg-white/5 rounded-2xl border border-white/10 p-8 mb-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#33ffcc]/20 rounded-full mb-4">
          <PartyPopper className="w-12 h-12 text-[#33ffcc]" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Paiement confirme !</h2>
        <p className="text-xl text-[#33ffcc] font-medium mb-4">
          Votre reservation est confirmee
        </p>
        <div className="inline-block bg-[#33ffcc]/10 border border-[#33ffcc]/30 px-6 py-3 rounded-xl mb-6">
          <p className="text-sm text-gray-400 mb-1">Numero de commande</p>
          <p className="text-2xl font-bold text-[#33ffcc]">
            #{reservation?.id?.substring(0, 8).toUpperCase()}
          </p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-left">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-1">Paiement recu</p>
              <p className="text-gray-300 text-sm">
                Votre paiement a ete confirme et votre reservation est validee.
                L'equipe LOCAGAME vous contactera <strong className="text-white">sous 24h</strong> pour
                les details de livraison.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentState === 'cancelled') {
    return (
      <div className="bg-white/5 rounded-2xl border border-white/10 p-8 mb-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/20 rounded-full mb-4">
          <XCircle className="w-12 h-12 text-orange-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Paiement annule</h2>
        <p className="text-lg text-gray-400 mb-6">
          Votre reservation est en attente de paiement. Vous pouvez reessayer.
        </p>
        <button
          onClick={onRetryPayment}
          disabled={retrying}
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] disabled:opacity-50 transition-colors"
        >
          {retrying ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> Redirection...</>
          ) : (
            <><CreditCard className="w-5 h-5" /> Reessayer le paiement</>
          )}
        </button>
        <p className="text-gray-500 text-sm mt-3">
          La session de paiement expire dans 30 minutes
        </p>
      </div>
    );
  }

  if (paymentState === 'pending') {
    return (
      <div className="bg-white/5 rounded-2xl border border-white/10 p-8 mb-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/20 rounded-full mb-4">
          <Clock className="w-12 h-12 text-orange-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Paiement en attente</h2>
        <p className="text-lg text-gray-400 mb-6">
          Cette reservation n'a pas encore ete payee.
        </p>
        <button
          onClick={onRetryPayment}
          disabled={retrying}
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] disabled:opacity-50 transition-colors"
        >
          {retrying ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> Redirection...</>
          ) : (
            <><CreditCard className="w-5 h-5" /> Proceder au paiement</>
          )}
        </button>
      </div>
    );
  }

  return null;
}
