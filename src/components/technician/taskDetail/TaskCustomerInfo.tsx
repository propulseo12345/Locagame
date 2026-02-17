import { User } from 'lucide-react';
import { DeliveryTask } from '../../../types';

interface TaskCustomerInfoProps {
  customer: DeliveryTask['customer'];
  orderNumber: string;
}

export function TaskCustomerInfo({ customer, orderNumber }: TaskCustomerInfoProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-[#33ffcc]" />
        Informations client
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Nom</p>
          <p className="text-base font-semibold text-gray-900">
            {customer.firstName} {customer.lastName}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Téléphone</p>
          <a
            href={`tel:${customer.phone}`}
            className="text-base font-semibold text-[#33ffcc] hover:text-[#66cccc]"
          >
            {customer.phone}
          </a>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Email</p>
          <a
            href={`mailto:${customer.email}`}
            className="text-base font-semibold text-gray-900 hover:text-[#33ffcc]"
          >
            {customer.email}
          </a>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Commande</p>
          <p className="text-base font-semibold text-gray-900">
            {orderNumber}
          </p>
        </div>
      </div>
    </div>
  );
}
