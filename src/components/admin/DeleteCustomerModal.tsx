import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Customer } from '../../types';
import { CustomersService } from '../../services';

interface DeleteCustomerModalProps {
  customer: Customer;
  onClose: () => void;
  onDeleted: (customerId: string) => void;
}

export default function DeleteCustomerModal({ customer, onClose, onDeleted }: DeleteCustomerModalProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await CustomersService.forceDeleteCustomer(customer.id);
      onDeleted(customer.id);
    } catch (err) {
      console.error('Erreur suppression client:', err);
      alert('Erreur lors de la suppression du client.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Supprimer le client</h3>
        </div>
        <p className="text-gray-600 mb-2">
          Êtes-vous sûr de vouloir supprimer ce client ?
        </p>
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <p className="font-semibold text-gray-900">
            {customer.first_name} {customer.last_name}
          </p>
          <p className="text-sm text-gray-500">{customer.email}</p>
          {customer.company_name && (
            <p className="text-sm text-blue-600">{customer.company_name}</p>
          )}
        </div>
        <p className="text-sm text-red-600 mb-6">
          Cette action est irréversible. Les réservations associées pourraient bloquer la suppression.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Supprimer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
