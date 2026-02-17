import { Users, Info, Building } from 'lucide-react';
import { Order, RecipientData, EventDetails } from '../../../types';

interface ReservationExpandedRowProps {
  reservation: Order;
}

export default function ReservationExpandedRow({ reservation }: ReservationExpandedRowProps) {
  const recipientData = (reservation as any).recipient_data as RecipientData | null;
  const eventDetails = (reservation as any).event_details as EventDetails | null;

  return (
    <tr className="bg-gray-50">
      <td colSpan={8} className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Receptionnaire */}
          {recipientData && !recipientData.sameAsCustomer && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" />
                Receptionnaire
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Nom:</strong> {recipientData.firstName} {recipientData.lastName}</p>
                <p><strong>Tel:</strong> {recipientData.phone}</p>
                {recipientData.email && <p><strong>Email:</strong> {recipientData.email}</p>}
              </div>
            </div>
          )}

          {/* Details evenement */}
          {eventDetails && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Details evenement
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                {eventDetails.venueName && <p><strong>Lieu:</strong> {eventDetails.venueName}</p>}
                {eventDetails.guestCount && <p><strong>Invites:</strong> {eventDetails.guestCount}</p>}
                {(reservation as any).event_type && <p><strong>Type:</strong> {(reservation as any).event_type}</p>}
              </div>
            </div>
          )}

          {/* Acces */}
          {eventDetails && (eventDetails.hasElevator !== undefined || eventDetails.floorNumber || eventDetails.parkingAvailable !== undefined || eventDetails.accessDetails) && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-500" />
                Acces au lieu
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                {eventDetails.floorNumber && <p><strong>Etage:</strong> {eventDetails.floorNumber}</p>}
                {eventDetails.hasElevator !== undefined && (
                  <p><strong>Ascenseur:</strong> {eventDetails.hasElevator ? 'Oui' : 'Non'}</p>
                )}
                {eventDetails.parkingAvailable !== undefined && (
                  <p><strong>Parking:</strong> {eventDetails.parkingAvailable ? 'Oui' : 'Non'}</p>
                )}
                {eventDetails.electricityAvailable !== undefined && (
                  <p><strong>Electricite:</strong> {eventDetails.electricityAvailable ? 'Oui' : 'Non'}</p>
                )}
                {eventDetails.accessDetails && <p><strong>Details:</strong> {eventDetails.accessDetails}</p>}
              </div>
            </div>
          )}

          {/* Notes */}
          {(reservation as any).notes && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 md:col-span-3">
              <h4 className="font-semibold text-gray-900 mb-2">Notes / Demandes speciales</h4>
              <p className="text-sm text-gray-600">{(reservation as any).notes}</p>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
