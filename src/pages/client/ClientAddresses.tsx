import { Loader2 } from 'lucide-react';
import { useClientAddresses } from '../../hooks/client/useClientAddresses';
import {
  AddressesHeader,
  AddressCard,
  AddressEmptyState,
  AddressFormModal,
  AddNewAddressCard,
} from '../../components/client/addresses';

export default function ClientAddresses() {
  const {
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
  } = useClientAddresses();

  if (loadingAddresses) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#33ffcc] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Chargement des adresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6 md:mt-8">
      <AddressesHeader
        count={addresses.length}
        onAdd={() => handleOpenModal()}
      />

      {addresses.length === 0 ? (
        <AddressEmptyState onAdd={() => handleOpenModal()} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {addresses.map((address, index) => (
            <AddressCard
              key={address.id}
              address={address}
              index={index}
              deletingId={deletingId}
              settingDefaultId={settingDefaultId}
              onSetDefault={handleSetDefault}
              onDelete={handleDelete}
            />
          ))}
          <AddNewAddressCard onAdd={() => handleOpenModal()} />
        </div>
      )}

      {showModal && (
        <AddressFormModal
          editingAddress={editingAddress}
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
