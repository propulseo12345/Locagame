interface ReservationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export default function ReservationFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: ReservationFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
          <input
            type="text"
            placeholder="N&deg; commande, nom client, email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending_payment">Paiement en attente</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirm&eacute;</option>
            <option value="preparing">En pr&eacute;paration</option>
            <option value="delivered">Livr&eacute;</option>
            <option value="completed">Termin&eacute;</option>
            <option value="cancelled">Annul&eacute;</option>
          </select>
        </div>
      </div>
    </div>
  );
}
