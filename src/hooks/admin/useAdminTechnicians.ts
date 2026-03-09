import { useState, useEffect, useMemo, useCallback } from 'react';
import { TechniciansService } from '../../services/technicians.service';
import type { Technician, Vehicle } from '../../services/technicians.service';
import { useToast } from '../../contexts/ToastContext';
import type { TechnicianFormData } from '../../components/admin/technicians/TechnicianFormModal';

export function useAdminTechnicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Technician | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { addToast } = useToast();

  const loadData = useCallback(async () => {
    setError(null);
    try {
      setLoading(true);
      const [techs, vehs] = await Promise.all([
        TechniciansService.getAllTechnicians(true),
        TechniciansService.getAllVehicles(),
      ]);
      setTechnicians(techs);
      setVehicles(vehs);
    } catch (err) {
      console.error('Erreur chargement techniciens:', err);
      setError('Impossible de charger les techniciens.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTechnicians = useMemo(() => {
    return technicians.filter((t) => {
      const matchesSearch =
        `${t.first_name} ${t.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && t.is_active) ||
        (statusFilter === 'inactive' && !t.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [technicians, searchTerm, statusFilter]);

  const vehicleMap = useMemo(() => {
    const map = new Map<string, Vehicle>();
    vehicles.forEach((v) => map.set(v.id, v));
    return map;
  }, [vehicles]);

  const handleCreate = () => {
    setEditingTechnician(null);
    setShowModal(true);
  };

  const handleEdit = (tech: Technician) => {
    setEditingTechnician(tech);
    setShowModal(true);
  };

  const handleSubmit = async (data: TechnicianFormData) => {
    if (editingTechnician) {
      // Update technician
      await TechniciansService.updateTechnician(editingTechnician.id, {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone || undefined,
        vehicle_id: data.vehicleId || undefined,
        is_active: data.isActive,
      });
      // Reset password if provided
      if (data.password) {
        await TechniciansService.resetPassword(editingTechnician.id, data.password);
      }
      addToast('Technicien mis à jour', 'success');
    } else {
      // Create technician
      await TechniciansService.createTechnician({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
        vehicleId: data.vehicleId || undefined,
      });
      addToast('Technicien créé avec succès', 'success');
    }
    setShowModal(false);
    setEditingTechnician(null);
    await loadData();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setDeleting(true);
      const result = await TechniciansService.deleteTechnician(deleteConfirm.id);
      if (result.mode === 'deactivated') {
        addToast('Technicien désactivé (tâches existantes)', 'info');
      } else {
        addToast('Technicien supprimé', 'success');
      }
      setDeleteConfirm(null);
      await loadData();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Erreur lors de la suppression',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  };

  const stats = {
    total: technicians.length,
    active: technicians.filter((t) => t.is_active).length,
    inactive: technicians.filter((t) => !t.is_active).length,
  };

  return {
    // Data
    vehicles,
    filteredTechnicians,
    vehicleMap,
    stats,
    // State
    loading,
    error,
    searchTerm,
    statusFilter,
    showModal,
    editingTechnician,
    deleteConfirm,
    deleting,
    // Actions
    setSearchTerm,
    setStatusFilter,
    setShowModal,
    setEditingTechnician,
    setDeleteConfirm,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleDelete,
    loadData,
  };
}
