import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function FavoritesEmptyState() {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-12 text-center">
      <Heart className="w-8 h-8 text-gray-600 mx-auto mb-3" />
      <h3 className="text-base font-semibold text-white mb-2">Aucun favori</h3>
      <p className="text-sm text-gray-400 mb-5 max-w-sm mx-auto">
        Ajoutez des produits à vos favoris pour les retrouver facilement
      </p>
      <Link
        to="/catalogue"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#33ffcc] text-[#000033] text-sm font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
      >
        Parcourir le catalogue
      </Link>
    </div>
  );
}
