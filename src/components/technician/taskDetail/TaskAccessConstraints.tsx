import { AccessConstraints } from '../../../types';

interface TaskAccessConstraintsProps {
  accessConstraints: AccessConstraints;
}

export function TaskAccessConstraints({ accessConstraints }: TaskAccessConstraintsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{"Contraintes d'acc\u00e8s"}</h2>
      <div className="space-y-3">
        {accessConstraints.floor !== undefined && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-32">{"\u00c9tage:"}</span>
            <span className="text-base font-semibold text-gray-900">
              {accessConstraints.floor}
            </span>
          </div>
        )}
        {accessConstraints.hasElevator !== undefined && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-32">Ascenseur:</span>
            <span className="text-base font-semibold text-gray-900">
              {accessConstraints.hasElevator ? 'Oui' : 'Non'}
            </span>
          </div>
        )}
        {accessConstraints.accessCode && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-32">{"Code d'acc\u00e8s:"}</span>
            <span className="text-base font-semibold text-gray-900">
              {accessConstraints.accessCode}
            </span>
          </div>
        )}
        {accessConstraints.parkingInfo && (
          <div className="flex items-start gap-3">
            <span className="text-sm text-gray-600 w-32">Parking:</span>
            <span className="text-base font-semibold text-gray-900">
              {accessConstraints.parkingInfo}
            </span>
          </div>
        )}
        {accessConstraints.contactOnSite && (
          <div className="flex items-start gap-3">
            <span className="text-sm text-gray-600 w-32">Contact sur site:</span>
            <span className="text-base font-semibold text-gray-900">
              {accessConstraints.contactOnSite}
            </span>
          </div>
        )}
        {accessConstraints.specialInstructions && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-semibold text-yellow-900 mb-2">{"Instructions sp\u00e9ciales:"}</p>
            <p className="text-sm text-yellow-800">
              {accessConstraints.specialInstructions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
