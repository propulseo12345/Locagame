import React from 'react';
import { FileText, Building2, User } from 'lucide-react';
import { Order } from '../../../types';

interface BillingCardProps {
  reservation: Order;
}

export default function BillingCard({ reservation }: BillingCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-purple-500" />
        Facturation
      </h2>
      <div className="space-y-4">
        {/* Type de client */}
        <div className="flex items-center gap-2">
          {reservation.is_business ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
              <Building2 className="w-4 h-4" />
              Client professionnel
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
              <User className="w-4 h-4" />
              Particulier
            </span>
          )}
        </div>

        {/* Adresse de facturation (si professionnel) */}
        {reservation.is_business ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Raison sociale</div>
                <div className="font-medium text-gray-900">
                  {reservation.billing_company_name || 'Non renseigne'}
                </div>
              </div>
              {reservation.billing_vat_number && (
                <div>
                  <div className="text-sm text-gray-500">N. TVA</div>
                  <div className="font-medium text-gray-900">{reservation.billing_vat_number}</div>
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Adresse de facturation</div>
              <div className="font-medium text-gray-900 space-y-0.5">
                {reservation.billing_address_line1 ? (
                  <>
                    <div>{reservation.billing_address_line1}</div>
                    {reservation.billing_address_line2 && (
                      <div>{reservation.billing_address_line2}</div>
                    )}
                    <div>
                      {reservation.billing_postal_code} {reservation.billing_city}
                    </div>
                    <div>{reservation.billing_country || 'FR'}</div>
                  </>
                ) : (
                  <span className="text-gray-400 italic">Non renseignee</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">
            Pas d'adresse de facturation specifique (client particulier)
          </p>
        )}
      </div>
    </div>
  );
}
