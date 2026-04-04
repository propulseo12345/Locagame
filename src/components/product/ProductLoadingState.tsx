import { Link } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { ProductPageSkeleton } from '../ui/skeletons';

export function ProductLoading() {
  return <ProductPageSkeleton />;
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
