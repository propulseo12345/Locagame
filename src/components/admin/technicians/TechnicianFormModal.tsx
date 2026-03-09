import { X } from 'lucide-react';
import type { Technician, Vehicle } from '../../../services/technicians.service';
import { useTechnicianForm } from '../../../hooks/admin/useTechnicianForm';
import TechnicianFormFields from './TechnicianFormFields';
import TechnicianFormPassword from './TechnicianFormPassword';
import TechnicianFormActions from './TechnicianFormActions';

export type { TechnicianFormData } from '../../../hooks/admin/useTechnicianForm';

interface TechnicianFormModalProps {
  technician?: Technician | null;
  vehicles: Vehicle[];
  onSubmit: (data: import('../../../hooks/admin/useTechnicianForm').TechnicianFormData) => Promise<void>;
  onClose: () => void;
}

export default function TechnicianFormModal({
  technician,
  vehicles,
  onSubmit,
  onClose,
}: TechnicianFormModalProps) {
  const form = useTechnicianForm({ technician, onSubmit });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {form.isEdit ? 'Modifier le technicien' : 'Nouveau technicien'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit} className="p-6 space-y-4">
          {form.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {form.error}
            </div>
          )}

          <TechnicianFormFields
            firstName={form.firstName} setFirstName={form.setFirstName}
            lastName={form.lastName} setLastName={form.setLastName}
            email={form.email} setEmail={form.setEmail}
            phone={form.phone} setPhone={form.setPhone}
            vehicleId={form.vehicleId} setVehicleId={form.setVehicleId}
            isActive={form.isActive} setIsActive={form.setIsActive}
            vehicles={vehicles}
            isEdit={form.isEdit}
          />

          <TechnicianFormPassword
            isEdit={form.isEdit}
            password={form.password} setPassword={form.setPassword}
            showPassword={form.showPassword} setShowPassword={form.setShowPassword}
            showResetPassword={form.showResetPassword} setShowResetPassword={form.setShowResetPassword}
            newPassword={form.newPassword} setNewPassword={form.setNewPassword}
            onGenerate={form.generatePassword}
          />

          <TechnicianFormActions
            isEdit={form.isEdit}
            submitting={form.submitting}
            onClose={onClose}
          />
        </form>
      </div>
    </div>
  );
}
