import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AddressesService, AddressInput, Address } from '../../services/addresses.service';

export type { Address, AddressInput };

export type AddressFormData = AddressInput & { label?: string };

const EMPTY_FORM: AddressFormData = {
  address_line1: '',
  address_line2: '',
  city: '',
  postal_code: '',
  is_default: false,
  label: '',
};

export function useClientAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({ ...EMPTY_FORM });

  useEffect(() => {
    if (!user || user.role !== 'client') return;
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    if (!user) return;

    try {
      setLoadingAddresses(true);
      const addressesData = await AddressesService.getCustomerAddresses(user.id);
      setAddresses(addressesData);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        address_line1: address.address_line1,
        address_line2: address.address_line2 || '',
        city: address.city,
        postal_code: address.postal_code,
        is_default: address.is_default,
        label: '',
      });
    } else {
      setEditingAddress(null);
      setFormData({
        ...EMPTY_FORM,
        is_default: addresses.length === 0,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAddress(null);
    setFormData({ ...EMPTY_FORM });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const addressData: AddressInput = {
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        postal_code: formData.postal_code,
        is_default: formData.is_default || false,
      };

      await AddressesService.createAddress(user.id, addressData);
      await loadAddresses();
      handleCloseModal();
    } catch (error) {
      console.error('Error creating address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Etes-vous sur de vouloir supprimer cette adresse ?')) return;

    setDeletingId(addressId);
    try {
      await AddressesService.deleteAddress(addressId);
      await loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user) return;

    setSettingDefaultId(addressId);
    try {
      await AddressesService.setDefaultAddress(user.id, addressId);
      await loadAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
    } finally {
      setSettingDefaultId(null);
    }
  };

  return {
    addresses,
    showModal,
    editingAddress,
    loading,
    loadingAddresses,
    deletingId,
    settingDefaultId,
    formData,
    setFormData,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
    handleSetDefault,
  };
}
