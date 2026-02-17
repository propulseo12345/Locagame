import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  Package,
  Truck,
  Calendar,
  Phone,
  Mail,
  ArrowLeft,
  Clock,
  PartyPopper,
  XCircle,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { ReservationsService } from '../services/reservations.service';
import { CheckoutService } from '../services/checkout.service';
import { useCart } from '../contexts/CartContext';
import { formatPrice, formatDate } from '../utils/pricing';

type PaymentState = 'loading' | 'success' | 'cancelled' | 'pending' | 'error';

export default function ConfirmationPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [paymentState, setPaymentState] = useState<PaymentState>('loading');
  const [retrying, setRetrying] = useState(false);
  const cartCleared = useRef(false);

  const paymentParam = searchParams.get('payment');

  useEffect(() => {
    if (!reservationId) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await ReservationsService.getReservationById(reservationId);
        setReservation(data);

        if (paymentParam === 'success') {
          // Paiement reussi - vider le panier une seule fois
          if (!cartCleared.current) {
            clearCart();
            cartCleared.current = true;
          }
          setPaymentState('success');
        } else if (paymentParam === 'cancelled') {
          setPaymentState('cancelled');
        } else {
          // Acces direct - determiner l'etat depuis la reservation
          if (data?.payment_status === 'paid') {
            setPaymentState('success');
          } else if (data?.status === 'pending_payment') {
            setPaymentState('pending');
          } else {
            setPaymentState('success'); // Ancienne reservation sans paiement
          }
        }
      } catch (err) {
        console.error('Error loading reservation:', err);
        setError('Impossible de charger la reservation');
        setPaymentState('error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [reservationId, paymentParam]);

  const handleRetryPayment = async () => {
    if (!reservationId) return;
    setRetrying(true);
    try {
      const confirmationUrl = `${window.location.origin}/confirmation/${reservationId}`;
      const { session_url } = await CheckoutService.createStripeCheckoutSession(
        reservationId,
        confirmationUrl,
        confirmationUrl
      );
      window.location.href = session_url;
    } catch (err) {
      console.error('Retry payment error:', err);
      setError('Impossible de relancer le paiement. Veuillez reessayer.');
      setRetrying(false);
    }
  };

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

        {/* Header conditionnel selon l'etat du paiement */}
        {paymentState === 'success' && (
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 mb-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#33ffcc]/20 rounded-full mb-4">
              <PartyPopper className="w-12 h-12 text-[#33ffcc]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Paiement confirme !</h2>
            <p className="text-xl text-[#33ffcc] font-medium mb-4">
              Votre reservation est enregistree
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
                    Votre paiement a ete confirme. L'equipe LOCAGAME va maintenant valider
                    votre reservation et vous contacter <strong className="text-white">sous 24h</strong> pour
                    confirmer les details de livraison.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {paymentState === 'cancelled' && (
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 mb-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/20 rounded-full mb-4">
              <XCircle className="w-12 h-12 text-orange-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Paiement annule</h2>
            <p className="text-lg text-gray-400 mb-6">
              Votre reservation est en attente de paiement. Vous pouvez reessayer.
            </p>
            <button
              onClick={handleRetryPayment}
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
        )}

        {paymentState === 'pending' && (
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 mb-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/20 rounded-full mb-4">
              <Clock className="w-12 h-12 text-orange-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Paiement en attente</h2>
            <p className="text-lg text-gray-400 mb-6">
              Cette reservation n'a pas encore ete payee.
            </p>
            <button
              onClick={handleRetryPayment}
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
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Contenu principal en 2 colonnes */}
        {reservation && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Colonne gauche - Recapitulatif */}
            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#33ffcc]" />
                  Recapitulatif
                </h2>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-[#33ffcc]" />
                      <p className="font-medium text-white text-sm">Periode</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDate(reservation.start_date)} &rarr; {formatDate(reservation.end_date)}
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-[#33ffcc]" />
                      <p className="font-medium text-white text-sm">
                        {reservation.delivery_type === 'delivery' ? 'Livraison' : 'Retrait'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {reservation.delivery_type === 'pickup'
                        ? '553 rue St Pierre, 13012'
                        : reservation.delivery_time || 'A confirmer'}
                    </p>
                  </div>
                </div>

                {reservation.reservation_items && reservation.reservation_items.length > 0 && (
                  <div className="space-y-2">
                    {reservation.reservation_items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded-lg text-sm">
                        <div>
                          <p className="font-medium text-white">{item.product_name || `Produit ${index + 1}`}</p>
                          <p className="text-xs text-gray-400">Qte: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-white">{formatPrice(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="bg-[#33ffcc]/10 rounded-2xl border border-[#33ffcc]/30 p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Sous-total</span>
                    <span className="text-white">{formatPrice(reservation.subtotal)}</span>
                  </div>
                  {reservation.delivery_fee > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Livraison</span>
                      <span className="text-white">{formatPrice(reservation.delivery_fee)}</span>
                    </div>
                  )}
                  {reservation.delivery_type === 'pickup' && (
                    <div className="flex justify-between text-gray-400">
                      <span>Retrait</span>
                      <span className="text-green-400">Gratuit</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                    <span className="font-semibold text-white">Total</span>
                    <span className="text-xl font-bold text-[#33ffcc]">{formatPrice(reservation.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite - Prochaines etapes */}
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
                    <p className="text-white font-medium text-sm">Paiement</p>
                    <p className="text-gray-400 text-xs">
                      {paymentState === 'success'
                        ? 'Paiement recu et confirme.'
                        : 'Finalisez votre paiement pour confirmer la reservation.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-[#33ffcc]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#33ffcc] font-bold text-xs">2</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Validation par l'equipe</p>
                    <p className="text-gray-400 text-xs">Nous verifions la disponibilite et preparons votre commande.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-[#33ffcc]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#33ffcc] font-bold text-xs">3</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Confirmation sous 24h</p>
                    <p className="text-gray-400 text-xs">Vous recevrez un email de confirmation avec tous les details.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-[#33ffcc]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#33ffcc] font-bold text-xs">4</span>
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
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            to="/catalogue"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] font-semibold rounded-xl hover:bg-[#66cccc] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au catalogue
          </Link>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
