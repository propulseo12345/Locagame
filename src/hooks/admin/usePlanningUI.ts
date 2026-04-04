import { useState, useEffect } from 'react';
import type { Vehicle } from '../../services/technicians.service';
import type { VehicleFormData } from '../../components/admin/planning/planning.types';
import { DEFAULT_VEHICLE_FORM } from '../../components/admin/planning/planning.types';

export function usePlanningUI() {
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [vehicleFormData, setVehicleFormData] = useState<VehicleFormData>(DEFAULT_VEHICLE_FORM);

  // Fermer le menu en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.menu-container')) {
        setShowMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return {
    showVehicleModal, setShowVehicleModal,
    editingVehicle, setEditingVehicle,
    showDeleteConfirm, setShowDeleteConfirm,
    showMenu, setShowMenu,
    vehicleFormData, setVehicleFormData,
  };
}
