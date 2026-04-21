import { AccessConstraints } from '../../../types';

interface TaskAccessConstraintsProps {
  accessConstraints: AccessConstraints;
}

export function TaskAccessConstraints({ accessConstraints }: TaskAccessConstraintsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
      <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">{"Contraintes d'accès"}</h2>
      <div className="space-y-3">
        {accessConstraints.floor !== undefined && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="text-sm text-gray-600 sm:w-32 shrink-0">{"Étage :"}</span>
            <span className="text-base font-semibold text-gray-900">{accessConstraints.floor}</span>
          </div>
        )}
        {accessConstraints.hasElevator !== undefined && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="text-sm text-gray-600 sm:w-32 shrink-0">Ascenseur:</span>
            <span className="text-base font-semibold text-gray-900">{accessConstraints.hasElevator ? 'Oui' : 'Non'}</span>
          </div>
        )}
        {accessConstraints.accessCode && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="text-sm text-gray-600 sm:w-32 shrink-0">{"Code d'accès :"}</span>
            <span className="text-base font-semibold text-gray-900">{accessConstraints.accessCode}</span>
          </div>
        )}
        {accessConstraints.parkingInfo && (
          <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
            <span className="text-sm text-gray-600 sm:w-32 shrink-0">Parking:</span>
            <span className="text-base font-semibold text-gray-900">{accessConstraints.parkingInfo}</span>
          </div>
        )}
        {accessConstraints.contactOnSite && (
          <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
            <span className="text-sm text-gray-600 sm:w-32 shrink-0">Contact sur site:</span>
            <span className="text-base font-semibold text-gray-900">{accessConstraints.contactOnSite}</span>
          </div>
        )}
        {accessConstraints.specialInstructions && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-semibold text-yellow-900 mb-2">{"Instructions spéciales :"}</p>
            <p className="text-sm text-yellow-800">{accessConstraints.specialInstructions}</p>
          </div>
        )}
      </div>
    </div>
  );
}
