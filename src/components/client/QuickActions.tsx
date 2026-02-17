import { Link } from 'react-router-dom';
import { Package, Heart, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
      <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[#33ffcc]" />
        Actions rapides
      </h2>

      <div className="space-y-3">
        <Link
          to="/catalogue"
          className="flex items-center justify-between p-4 bg-gradient-to-r from-[#33ffcc]/20 to-[#66cccc]/10 border border-[#33ffcc]/30 rounded-xl hover:from-[#33ffcc]/30 hover:to-[#66cccc]/20 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#33ffcc]/30 rounded-lg">
              <Package className="w-5 h-5 text-[#33ffcc]" />
            </div>
            <span className="text-white font-bold">Parcourir le catalogue</span>
          </div>
          <ArrowRight className="w-5 h-5 text-[#33ffcc] group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/client/favorites"
          className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#fe1979]/50 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#fe1979]/20 rounded-lg">
              <Heart className="w-5 h-5 text-[#fe1979]" />
            </div>
            <span className="text-white font-bold">Voir mes favoris</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#fe1979] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/contact"
          className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#33ffcc]/50 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#66cccc]/20 rounded-lg">
              <Mail className="w-5 h-5 text-[#66cccc]" />
            </div>
            <span className="text-white font-bold">Demander un devis</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#66cccc] group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
