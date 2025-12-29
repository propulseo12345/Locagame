import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Calendar, MapPin, Phone, Mail, ArrowLeft, Download } from 'lucide-react';
import { ReservationsService } from '../services/reservations.service';
import { formatPrice, formatDate } from '../utils/pricing';

export default function ConfirmationPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (reservationId) {
      loadReservation();
    }
  }, [reservationId]);

  const loadReservation = async () => {
    try {
      setLoading(true);
      const data = await ReservationsService.getReservationById(reservationId!);
      setReservation(data);
    } catch (err) {
      console.error('Error loading reservation:', err);
      setError('Impossible de charger la réservation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-header flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50 pt-header flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ {error || 'Réservation introuvable'}</div>
          <Link to="/" className="text-blue-600 hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-header">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête de confirmation */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Réservation confirmée !
          </h1>
          <p className="text-gray-600 mb-4">
            Merci pour votre confiance. Votre réservation a été enregistrée avec succès.
          </p>
          <div className="inline-block bg-blue-50 px-6 py-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Numéro de réservation</p>
            <p className="text-2xl font-bold text-blue-600">
              #{reservation.id.substring(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Détails de la réservation */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-6 h-6" />
            Détails de votre réservation
          </h2>

          <div className="space-y-4">
            {/* Dates */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Période de location</p>
                <p className="text-sm text-gray-600">
                  Du {formatDate(reservation.start_date)}
                </p>
                <p className="text-sm text-gray-600">
                  Au {formatDate(reservation.end_date)}
                </p>
              </div>
            </div>

            {/* Type de livraison */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {reservation.delivery_type === 'delivery' ? 'Livraison à domicile' : 'Retrait en magasin'}
                </p>
                {reservation.delivery_type === 'delivery' && (
                  <>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(reservation.start_date)} à {reservation.delivery_time || '09:00'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {reservation.delivery_address_id ? 'Adresse enregistrée' : 'Adresse fournie'}
                    </p>
                  </>
                )}
                {reservation.delivery_type === 'pickup' && (
                  <p className="text-sm text-gray-600 mt-1">
                    À récupérer le {formatDate(reservation.start_date)}
                  </p>
                )}
              </div>
            </div>

            {/* Produits */}
            <div>
              <p className="font-medium text-gray-900 mb-3">Produits réservés</p>
              <div className="space-y-2">
                {reservation.reservation_items?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name || `Produit ${index + 1}`}</p>
                      <p className="text-sm text-gray-600">
                        Quantité: {item.quantity} × {formatPrice(item.unit_price)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Récapitulatif financier */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Récapitulatif</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{formatPrice(reservation.subtotal)}</span>
            </div>
            {reservation.delivery_fee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Frais de livraison</span>
                <span>{formatPrice(reservation.delivery_fee)}</span>
              </div>
            )}
            {reservation.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Réduction</span>
                <span>-{formatPrice(reservation.discount)}</span>
              </div>
            )}
            {reservation.deposit > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Caution (remboursable)</span>
                <span>{formatPrice(reservation.deposit)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(reservation.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informations importantes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-blue-900 mb-3">📧 Confirmation envoyée</h3>
          <p className="text-blue-800 text-sm mb-4">
            Un email de confirmation a été envoyé à votre adresse. Vous y trouverez tous les détails de votre réservation.
          </p>

          {reservation.deposit > 0 && (
            <>
              <h3 className="font-bold text-blue-900 mb-2 mt-4">💰 Caution</h3>
              <p className="text-blue-800 text-sm">
                Une caution de {formatPrice(reservation.deposit)} a été prélevée. Elle vous sera intégralement remboursée après retour du matériel en bon état.
              </p>
            </>
          )}

          {reservation.delivery_type === 'delivery' && (
            <>
              <h3 className="font-bold text-blue-900 mb-2 mt-4">🚚 Livraison et Retrait</h3>
              <p className="text-blue-800 text-sm">
                Le matériel sera livré le {formatDate(reservation.start_date)} et récupéré le {formatDate(reservation.end_date)}. Vous recevrez un SMS la veille de chaque intervention.
              </p>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/client/reservations"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voir mes réservations
          </Link>
          <Link
            to="/catalogue"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au catalogue
          </Link>
        </div>

        {/* Aide */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-2">Besoin d'aide ? Contactez-nous :</p>
          <div className="flex items-center justify-center gap-6">
            <a href="tel:0612345678" className="flex items-center gap-2 text-blue-600 hover:underline">
              <Phone className="w-4 h-4" />
              06 12 34 56 78
            </a>
            <a href="mailto:contact@locagame.fr" className="flex items-center gap-2 text-blue-600 hover:underline">
              <Mail className="w-4 h-4" />
              contact@locagame.fr
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
