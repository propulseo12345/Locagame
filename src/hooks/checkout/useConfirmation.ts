import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ReservationsService } from '../../services/reservations.service';
import { CheckoutService } from '../../services/checkout.service';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';
import { logger } from '../../lib/logger';

export type ConfirmationPaymentState = 'loading' | 'success' | 'cancelled' | 'pending' | 'error';

export function useConfirmation() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [reservation, setReservation] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [paymentState, setPaymentState] = useState<ConfirmationPaymentState>('loading');
  const [retrying, setRetrying] = useState(false);
  const cartCleared = useRef(false);

  const paymentParam = searchParams.get('payment');

  useEffect(() => {
    if (!reservationId) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await ReservationsService.getReservationById(reservationId);

        // Vérification ownership
        if (!data) {
          navigate('/', { replace: true });
          return;
        }

        const isOwner = user && data.customer?.id === user.id;
        const isGuestWithSession = data.customer?.is_guest &&
          sessionStorage.getItem('lastReservationId') === reservationId;

        if (!isOwner && !isGuestWithSession) {
          navigate('/', { replace: true });
          return;
        }

        setReservation(data);

        if (paymentParam === 'success') {
          // Paiement reussi - vider le panier une seule fois
          if (!cartCleared.current) {
            clearCart();
            cartCleared.current = true;
          }

          // Fallback: si le webhook n'a pas encore mis à jour le statut,
          // on le fait côté client (le webhook fera un no-op grâce à l'idempotence)
          if (data?.status === 'pending_payment') {
            try {
              await ReservationsService.updatePaymentStatus(reservationId, 'paid');
              // Mettre aussi le statut reservation à confirmed
              const { error: statusError } = await (await import('../../lib/supabase')).supabase
                .from('reservations')
                .update({ status: 'confirmed', payment_status: 'paid', paid_at: new Date().toISOString() })
                .eq('id', reservationId);
              if (!statusError) {
                setReservation({ ...data, status: 'confirmed', payment_status: 'paid' });
              }
            } catch {
              // Non-bloquant: le webhook le fera
            }
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
        logger.error('Error loading reservation', err);
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
      logger.error('Retry payment error', err);
      setError('Impossible de relancer le paiement. Veuillez reessayer.');
      setRetrying(false);
    }
  };

  return {
    reservation,
    loading,
    error,
    paymentState,
    retrying,
    handleRetryPayment,
  };
}
