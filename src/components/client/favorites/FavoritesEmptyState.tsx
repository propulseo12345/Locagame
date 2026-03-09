import { Link } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';

export default function FavoritesEmptyState() {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center shadow-xl">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-[#fe1979]/20 rounded-full mb-6">
        <Heart className="w-12 h-12 text-[#fe1979]" />
      </div>
      <h3 className="text-xl font-black text-white mb-3">Aucun favori</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        Ajoutez des produits à vos favoris pour les retrouver facilement
      </p>
      <Link
        to="/catalogue"
        className="inline-flex items-center gap-2 px-8 py-4 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all duration-300 hover:scale-105"
      >
        <Sparkles className="w-5 h-5" />
        Parcourir le catalogue
      </Link>
    </div>
  );
}
