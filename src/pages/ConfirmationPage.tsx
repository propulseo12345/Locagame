import { Link } from 'react-router-dom';
import { useConfirmation } from '../hooks/checkout/useConfirmation';
import {
  ConfirmationHeader,
  ConfirmationSummary,
  ConfirmationNextSteps,
  ConfirmationActions,
} from '../components/confirmation';

export default function ConfirmationPage() {
  const { reservation, loading, error, paymentState, retrying, handleRetryPayment } =
    useConfirmation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000033] to-[#001144] pt-header flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#33ffcc] border-t-transparent"></div>
      </div>
    );
  }

  if (error && !reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000033] to-[#001144] pt-header flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <Link to="/" className="text-[#33ffcc] hover:underline">Retour a l'accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000033] to-[#001144] pt-header">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="sr-only">Confirmation de commande</h1>

        <ConfirmationHeader
          paymentState={paymentState}
          reservation={reservation}
          retrying={retrying}
          onRetryPayment={handleRetryPayment}
        />

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {reservation && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ConfirmationSummary reservation={reservation} />
            <ConfirmationNextSteps paymentState={paymentState} />
          </div>
        )}

        <ConfirmationActions />
      </div>
    </div>
  );
}
