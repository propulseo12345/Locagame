import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';

export default function EmptyCart() {
  return (
    <div className="min-h-screen bg-[#000033] pt-header">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#33ffcc]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#66cccc]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          {/* Icône animée */}
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-8">
            <div className="absolute inset-0 bg-[#33ffcc]/10 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 bg-[#33ffcc]/5 rounded-full"></div>
            <ShoppingCart className="w-16 h-16 text-white/30" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Votre panier est vide
          </h1>
          <p className="text-lg text-white/60 mb-10 max-w-md mx-auto">
            Découvrez notre sélection de jeux et activités pour animer votre prochain événement
          </p>

          {/* CTA principal */}
          <Link
            to="/catalogue"
            className="group inline-flex items-center gap-3 bg-[#33ffcc] text-[#000033] font-bold text-lg px-8 py-4 rounded-xl hover:shadow-[0_0_30px_rgba(51,255,204,0.4)] transition-all duration-300 hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5" />
            Explorer le catalogue
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Suggestions rapides */}
          <div className="mt-16 pt-12 border-t border-white/10">
            <p className="text-sm text-white/40 mb-6">Catégories populaires</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Casino & Poker', 'Jeux de Bar', 'Bornes Arcade', 'Jeux en Bois'].map((cat) => (
                <Link
                  key={cat}
                  to={`/catalogue?category=${cat.toLowerCase().replace(/ /g, '-')}`}
                  className="group px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#33ffcc]/30 rounded-full text-white/70 hover:text-white text-sm transition-all duration-200"
                >
                  {cat}
                  <ChevronRight className="inline-block w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
