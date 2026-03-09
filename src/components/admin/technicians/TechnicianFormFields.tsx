import type { Vehicle } from '../../../services/technicians.service';

interface TechnicianFormFieldsProps {
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  email: string;
  phone: string;
  setPhone: (v: string) => void;
  vehicleId: string;
  setVehicleId: (v: string) => void;
  isActive: boolean;
  setIsActive: (v: boolean) => void;
  vehicles: Vehicle[];
  isEdit: boolean;
  setEmail: (v: string) => void;
}

export default function TechnicianFormFields({
  firstName, setFirstName,
  lastName, setLastName,
  email, setEmail,
  phone, setPhone,
  vehicleId, setVehicleId,
  isActive, setIsActive,
  vehicles,
  isEdit,
}: TechnicianFormFieldsProps) {
  return (
    <>
      {/* Name fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pr&eacute;nom *
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Email (create only) */}
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            required
          />
        </div>
      )}

      {/* Email display (edit mode) */}
      {isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
          />
        </div>
      )}

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">T&eacute;l&eacute;phone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+33 6 12 34 56 78"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
        />
      </div>

      {/* Vehicle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">V&eacute;hicule</label>
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent bg-white"
        >
          <option value="">Aucun v&eacute;hicule</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.type === 'truck' ? 'Camion' : 'Fourgon'}) — {v.license_plate}
            </option>
          ))}
        </select>
      </div>

      {/* Active toggle (edit only) */}
      {isEdit && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Compte actif</span>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isActive ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                isActive ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
      )}
    </>
  );
}
