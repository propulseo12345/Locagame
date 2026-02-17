import React from 'react';
import { FileText, Building, Car, Zap, Layers, MessageSquare } from 'lucide-react';
import { Order } from '../../../types';

interface EventDetailsCardProps {
  reservation: Order;
}

export default function EventDetailsCard({ reservation }: EventDetailsCardProps) {
  const eventDetails = reservation.event_details as any;

  return (
    <>
      {/* Details de l'evenement */}
      {eventDetails && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Details de l'evenement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reservation.event_type && (
              <div>
                <div className="text-sm text-gray-500">Type d'evenement</div>
                <div className="font-medium text-gray-900">{reservation.event_type}</div>
              </div>
            )}
            {eventDetails.guestCount && (
              <div>
                <div className="text-sm text-gray-500">Nombre d'invites</div>
                <div className="font-medium text-gray-900">{eventDetails.guestCount} personnes</div>
              </div>
            )}
            {eventDetails.venueName && (
              <div className="md:col-span-2">
                <div className="text-sm text-gray-500">Lieu / Salle</div>
                <div className="font-medium text-gray-900">{eventDetails.venueName}</div>
              </div>
            )}
          </div>

          {/* Acces au lieu */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Acces au lieu</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`flex items-center gap-2 p-2 rounded-lg ${eventDetails.hasElevator ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                <Building className="w-4 h-4" />
                <span className="text-sm">Ascenseur {eventDetails.hasElevator ? '\u2713' : '\u2717'}</span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${eventDetails.parkingAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                <Car className="w-4 h-4" />
                <span className="text-sm">Parking {eventDetails.parkingAvailable ? '\u2713' : '\u2717'}</span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${eventDetails.electricityAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                <Zap className="w-4 h-4" />
                <span className="text-sm">Electricite {eventDetails.electricityAvailable ? '\u2713' : '\u2717'}</span>
              </div>
              {eventDetails.floorNumber && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 text-blue-700">
                  <Layers className="w-4 h-4" />
                  <span className="text-sm">Etage {eventDetails.floorNumber}</span>
                </div>
              )}
            </div>

            {eventDetails.accessDifficulty && eventDetails.accessDifficulty !== 'Aucune' && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm font-medium text-yellow-800">
                  Difficulte d'acces: {eventDetails.accessDifficulty}
                </div>
                {eventDetails.accessDetails && (
                  <div className="text-sm text-yellow-700 mt-1">{eventDetails.accessDetails}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes / Demandes speciales */}
      {reservation.notes && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-yellow-500" />
            Notes / Demandes speciales
          </h2>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-gray-800 whitespace-pre-wrap">{reservation.notes}</p>
          </div>
        </div>
      )}
    </>
  );
}
