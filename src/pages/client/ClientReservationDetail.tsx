import { useParams, Link } from 'react-router-dom';
import { fakeReservations, fakeCustomers } from '../../lib/fake-data';

export default function ClientReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const currentCustomer = fakeCustomers[0];
  const reservation = fakeReservations.find(r => r.id === id && r.customer.id === currentCustomer.id);

  if (!reservation) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Réservation introuvable</h3>
          <p className="text-gray-600 mb-4">Cette réservation n'existe pas ou ne vous appartient pas</p>
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
          <p className="text-gray-600 mt-1">{reservation.orderNumber}</p>
        </div>
        {getStatusBadge(reservation.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Produits réservés</h2>
            <div className="space-y-4">
              {reservation.products.map((product, index) => (
                <div key={index} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{product.productName}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div>Quantité: {product.quantity}</div>
                      <div>Durée: {product.duration} jour(s)</div>
                      <div>Prix unitaire: {product.unitPrice}€</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {product.unitPrice * product.quantity * product.duration}€
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
                  Du <strong>{new Date(reservation.dates.start).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</strong>
                </div>
                <div className="text-sm text-gray-900">
                  Au <strong>{new Date(reservation.dates.end).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</strong>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Heure de livraison: {reservation.dates.deliveryTime}
                </div>
              </div>

              {reservation.delivery.address && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Adresse de livraison</div>
                  <div className="text-sm text-gray-900">
                    {reservation.delivery.address.street}<br />
                    {reservation.delivery.address.zipCode} {reservation.delivery.address.city}<br />
                    {reservation.delivery.address.country}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Zone: {reservation.delivery.zone}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Suivi de la réservation</h2>
            <div className="space-y-4">
              {reservation.timeline.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === reservation.timeline.length - 1 ? 'bg-[#33ffcc]' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{event.status}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
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
                <span className="text-gray-900">{reservation.pricing.subtotal}€</span>
              </div>
              {reservation.pricing.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 text-base">Frais de livraison</span>
                  <span className="font-bold text-xl text-gray-900">{reservation.pricing.deliveryFee}€</span>
                </div>
              )}
              {reservation.pricing.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Réduction</span>
                  <span className="text-green-600">-{reservation.pricing.discount}€</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">{reservation.pricing.total}€</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Paiement</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Méthode</span>
                <span className="text-gray-900">{reservation.payment.method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Statut</span>
                <span className={`font-medium ${
                  reservation.payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {reservation.payment.status === 'paid' ? '✅ Payé' : '⏳ En attente'}
                </span>
              </div>
              {reservation.payment.transactionId && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Transaction ID</div>
                  <div className="text-xs font-mono text-gray-900">{reservation.payment.transactionId}</div>
                </div>
              )}
              {reservation.payment.paidAt && (
                <div className="text-xs text-gray-500">
                  Payé le {new Date(reservation.payment.paidAt).toLocaleDateString('fr-FR')}
                </div>
              )}
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
            {reservation.status === 'pending' && (
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
