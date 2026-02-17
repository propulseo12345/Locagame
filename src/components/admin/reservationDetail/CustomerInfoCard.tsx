import React from 'react';
import { User, Mail, Phone, Building2, Users } from 'lucide-react';
import { Order } from '../../../types';

interface CustomerInfoCardProps {
  reservation: Order;
}

export default function CustomerInfoCard({ reservation }: CustomerInfoCardProps) {
  const customer = reservation.customer as any;
  const recipientData = reservation.recipient_data as any;

  return (
    <>
      {/* Informations Client */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#33ffcc]" />
          Informations client
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Nom complet</div>
              <div className="font-medium text-gray-900">
                {customer?.first_name} {customer?.last_name}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <a href={`mailto:${customer?.email}`} className="text-[#33ffcc] hover:underline">
                {customer?.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <a href={`tel:${customer?.phone}`} className="text-[#33ffcc] hover:underline">
                {customer?.phone}
              </a>
            </div>
          </div>
          <div className="space-y-3">
            {customer?.is_professional && (
              <>
                <div className="flex items-center gap-2 text-purple-600">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Client professionnel</span>
                </div>
                {customer?.company_name && (
                  <div>
                    <div className="text-sm text-gray-500">Entreprise</div>
                    <div className="font-medium text-gray-900">{customer.company_name}</div>
                  </div>
                )}
                {customer?.siret && (
                  <div>
                    <div className="text-sm text-gray-500">SIRET</div>
                    <div className="font-medium text-gray-900">{customer.siret}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Receptionnaire (si different) */}
      {recipientData && !recipientData.sameAsCustomer && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            Receptionnaire sur place
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Nom complet</div>
              <div className="font-medium text-gray-900">
                {recipientData.firstName} {recipientData.lastName}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${recipientData.phone}`} className="text-[#33ffcc] hover:underline">
                  {recipientData.phone}
                </a>
              </div>
              {recipientData.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${recipientData.email}`} className="text-[#33ffcc] hover:underline">
                    {recipientData.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
