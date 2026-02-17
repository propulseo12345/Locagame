import { Users } from 'lucide-react';
import { Order } from '../../../types';

interface TaskRecipientInfoProps {
  reservation: Order;
}

export function TaskRecipientInfo({ reservation }: TaskRecipientInfoProps) {
  if (!reservation.recipient_data) return null;
  if ((reservation.recipient_data as any).sameAsCustomer) return null;

  const recipient = reservation.recipient_data as any;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-200 bg-orange-50">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-orange-500" />
        Réceptionnaire sur place
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Nom</p>
          <p className="text-base font-semibold text-gray-900">
            {recipient.firstName} {recipient.lastName}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Téléphone</p>
          <a
            href={`tel:${recipient.phone}`}
            className="text-base font-semibold text-[#33ffcc] hover:text-[#66cccc]"
          >
            {recipient.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
