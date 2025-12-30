import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TechniciansService } from '../../services';
import { Technician, Vehicle } from '../../services/technicians.service';
import { Loader2, Check, User, Mail, Phone, Truck } from 'lucide-react';

export default function TechnicianProfile() {
  const { user, updateUserProfile } = useAuth();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const techData = await TechniciansService.getTechnicianByUserId(user.id);
      setTechnician(techData);

      if (techData) {
        setFormData({
          firstName: techData.first_name || '',
          lastName: techData.last_name || '',
          phone: techData.phone || '',
        });

        if (techData.vehicle_id) {
          const vehicleData = await TechniciansService.getVehicleById(techData.vehicle_id);
          setVehicle(vehicleData);
        }
      }
    } catch (err) {
      console.error('Erreur chargement profil:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#33ffcc] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Profil technicien introuvable</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#33ffcc]/20 rounded-lg">
            <User className="w-5 h-5 text-[#33ffcc]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={technician.email}
                disabled
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+33 6 12 34 56 78"
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-200">
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Check className="w-4 h-4" />
                Profil enregistré
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {vehicle && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Truck className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Véhicule assigné</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Nom</p>
              <p className="text-base font-semibold text-gray-900">{vehicle.name}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Plaque d'immatriculation</p>
              <p className="text-base font-semibold text-gray-900">{vehicle.license_plate}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Type</p>
              <p className="text-base font-semibold text-gray-900">
                {vehicle.type === 'truck' ? 'Camion' : 'Utilitaire'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Capacité</p>
              <p className="text-base font-semibold text-gray-900">{vehicle.capacity} m³</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

