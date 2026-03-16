import { Users, Info, Building, ShoppingBag } from 'lucide-react';
import { Order, RecipientData, EventDetails } from '../../../types';

interface ReservationExpandedRowProps {
  reservation: Order;
}

export default function ReservationExpandedRow({ reservation }: ReservationExpandedRowProps) {
  const recipientData = (reservation as any).recipient_data as RecipientData | null;
  const eventDetails = (reservation as any).event_details as EventDetails | null;
  const items = (reservation as any).reservation_items || [];

  return (
    <tr className="bg-slate-50/80">
      <td colSpan={9} className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Articles */}
          {items.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-gray-500" />
                Articles ({items.length})
              </h4>
              <div className="text-sm text-gray-600 space-y-1.5">
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="truncate mr-2">
                      {item.quantity}x {item.product?.name || 'Produit'}
                    </span>
                    {item.unit_price != null && (
                      <span className="text-gray-500 tabular-nums flex-shrink-0">{item.unit_price}&euro;</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Réceptionnaire */}
          {recipientData && !recipientData.sameAsCustomer && (
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" />
                Réceptionnaire
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Nom:</strong> {recipientData.firstName} {recipientData.lastName}</p>
                <p><strong>Tél:</strong> {recipientData.phone}</p>
                {recipientData.email && <p><strong>Email:</strong> {recipientData.email}</p>}
              </div>
            </div>
          )}

          {/* Détails événement */}
          {eventDetails && (
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Détails événement
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                {eventDetails.venueName && <p><strong>Lieu:</strong> {eventDetails.venueName}</p>}
                {eventDetails.guestCount && <p><strong>Invités:</strong> {eventDetails.guestCount}</p>}
                {(reservation as any).event_type && <p><strong>Type:</strong> {(reservation as any).event_type}</p>}
              </div>
            </div>
          )}

          {/* Accès */}
          {eventDetails && (eventDetails.hasElevator !== undefined || eventDetails.floorNumber || eventDetails.parkingAvailable !== undefined || eventDetails.accessDetails) && (
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-500" />
                Accès au lieu
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                {eventDetails.floorNumber && <p><strong>Étage:</strong> {eventDetails.floorNumber}</p>}
                {eventDetails.hasElevator !== undefined && (
                  <p><strong>Ascenseur:</strong> {eventDetails.hasElevator ? 'Oui' : 'Non'}</p>
                )}
                {eventDetails.parkingAvailable !== undefined && (
                  <p><strong>Parking:</strong> {eventDetails.parkingAvailable ? 'Oui' : 'Non'}</p>
                )}
                {eventDetails.electricityAvailable !== undefined && (
                  <p><strong>Électricité:</strong> {eventDetails.electricityAvailable ? 'Oui' : 'Non'}</p>
                )}
                {eventDetails.accessDetails && <p><strong>Détails:</strong> {eventDetails.accessDetails}</p>}
              </div>
            </div>
          )}

          {/* Notes */}
          {(reservation as any).notes && (
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 md:col-span-3">
              <h4 className="font-semibold text-gray-900 mb-2">Notes / Demandes spéciales</h4>
              <p className="text-sm text-gray-600">{(reservation as any).notes}</p>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
