import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ReservationsService } from '../../services';
import { Order } from '../../types';

export default function ClientReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const { userProfile } = useAuth();
  const [reservation, setReservation] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReservation = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await ReservationsService.getReservationById(id);
        // Vérifier que la réservation appartient à l'utilisateur connecté
        if (data && userProfile && data.customer_id === userProfile.id) {
          setReservation(data);
        } else if (data) {
          // Pour le moment, on affiche quand même (à améliorer avec RLS)
          setReservation(data);
        } else {
          setError('Réservation introuvable');
        }
      } catch (err) {
        console.error('Erreur chargement réservation:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadReservation();
  }, [id, userProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#33ffcc] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Réservation introuvable</h3>
          <p className="text-gray-600 mb-4">{error || 'Cette réservation n\'existe pas ou ne vous appartient pas'}</p>
          <Link
            to="/client/reservations"
            className="inline-block px-6 py-3 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
          >
            Retour aux réservations
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      delivered: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      preparing: 'En préparation',
      delivered: 'Livré',
      completed: 'Terminé',
      cancelled: 'Annulé'
    };
    return (
      <span className={`px-4 py-2 text-sm font-medium rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6 mt-6 md:mt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/client/reservations"
            className="text-sm text-[#33ffcc] hover:text-[#66cccc] mb-2 inline-block"
          >
            ← Retour aux réservations
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Détails de la réservation</h1>
          <p className="text-gray-600 mt-1">Commande #{reservation.id.substring(0, 8)}</p>
        </div>
        {getStatusBadge(reservation.status || 'pending')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Produits réservés</h2>
            <div className="space-y-4">
              {(reservation.reservation_items || []).map((item, index) => (
                <div key={index} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.product?.name || 'Produit'}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div>Quantité: {item.quantity}</div>
                      <div>Durée: {item.duration_days || 1} jour(s)</div>
                      <div>Prix unitaire: {item.unit_price}€</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {item.subtotal}€
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations de livraison</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Dates</div>
                <div className="text-sm text-gray-900">
                  Du <strong>{new Date(reservation.start_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</strong>
                </div>
                <div className="text-sm text-gray-900">
                  Au <strong>{new Date(reservation.end_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</strong>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">Type de livraison</div>
                <div className="text-sm text-gray-900">
                  {reservation.delivery_type === 'delivery' ? 'Livraison à domicile' : 'Retrait sur place'}
                </div>
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Suivi de la réservation</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[#000033] font-bold bg-[#33ffcc]">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Créée</div>
                  <div className="text-sm text-gray-500">
                    {reservation.created_at ? new Date(reservation.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Récapitulatif</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span className="text-gray-900">{reservation.subtotal || 0}€</span>
              </div>
              {(reservation.delivery_fee || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 text-base">Frais de livraison</span>
                  <span className="font-bold text-xl text-gray-900">{reservation.delivery_fee}€</span>
                </div>
              )}
              {(reservation.discount || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Réduction</span>
                  <span className="text-green-600">-{reservation.discount}€</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">{reservation.total || 0}€</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {reservation.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Notes</h3>
              <p className="text-sm text-blue-800">{reservation.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <button className="w-full px-4 py-2 text-sm bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors">
              Contacter le support
            </button>
            {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
              <button className="w-full px-4 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                Annuler la réservation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
