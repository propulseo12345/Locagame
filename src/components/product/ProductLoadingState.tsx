import { Link } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';

export function ProductLoading() {
  return (
    <div className="min-h-screen bg-[#000033] pt-header flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#33ffcc] border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-[#fe1979] border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-white/60 text-lg">Chargement du produit...</p>
      </div>
    </div>
  );
}

export function ProductNotFound() {
  return (
    <div className="min-h-screen bg-[#000033] pt-header flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-[#fe1979]/20 rounded-full mb-6">
          <Package className="w-12 h-12 text-[#fe1979]" />
        </div>
        <h1 className="text-2xl font-black text-white mb-4">Produit non trouv&eacute;</h1>
        <p className="text-white/60 mb-6">Ce produit n'existe pas ou a &eacute;t&eacute; supprim&eacute;</p>
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] rounded-xl font-bold hover:bg-[#66cccc] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au catalogue
        </Link>
      </div>
    </div>
  );
}
