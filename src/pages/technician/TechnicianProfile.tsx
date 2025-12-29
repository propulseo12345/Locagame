import { fakeTechnicians, fakeVehicles } from '../../lib/fake-data';

export default function TechnicianProfile() {
  // En production, on récupérerait le technicien connecté
  const technician = fakeTechnicians[0];
  const vehicle = technician.vehicleId 
    ? fakeVehicles.find(v => v.id === technician.vehicleId)
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations personnelles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Prénom</p>
            <p className="text-base font-semibold text-gray-900">
              {technician.firstName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Nom</p>
            <p className="text-base font-semibold text-gray-900">
              {technician.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Email</p>
            <p className="text-base font-semibold text-gray-900">
              {technician.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Téléphone</p>
            <p className="text-base font-semibold text-gray-900">
              {technician.phone}
            </p>
          </div>
        </div>
      </div>

      {vehicle && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Véhicule assigné</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Nom</p>
              <p className="text-base font-semibold text-gray-900">
                {vehicle.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Plaque d'immatriculation</p>
              <p className="text-base font-semibold text-gray-900">
                {vehicle.licensePlate}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Type</p>
              <p className="text-base font-semibold text-gray-900">
                {vehicle.type === 'truck' ? 'Camion' : 'Utilitaire'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Capacité</p>
              <p className="text-base font-semibold text-gray-900">
                {vehicle.capacity} m³
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

