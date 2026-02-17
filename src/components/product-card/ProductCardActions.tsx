import { ShoppingCart, ArrowRight } from 'lucide-react';

interface ProductCardActionsProps {
  isAddingToCart: boolean;
  addedToCart: boolean;
  onAddToCart: (e?: React.MouseEvent) => void;
  productName: string;
  variant: 'grid' | 'list';
}

export function ProductCardActions({
  isAddingToCart, addedToCart, onAddToCart, productName, variant,
}: ProductCardActionsProps) {
  const isGrid = variant === 'grid';

  return (
    <div className={`flex items-center ${isGrid ? 'justify-between' : ''} gap-${isGrid ? '2' : '3'} ${isGrid ? '' : 'mt-auto'}`}>
      <button
        onClick={onAddToCart}
        disabled={isAddingToCart || addedToCart}
        className={`${isGrid ? 'flex-1' : ''} flex items-center justify-center gap-2 ${
          isGrid ? 'px-4 py-2.5' : 'px-6 py-3'
        } rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 font-bold ${
          isGrid ? 'text-sm' : ''
        } ${
          addedToCart ? 'bg-green-500 text-white' : 'bg-[#33ffcc] text-[#000033] hover:bg-[#66cccc]'
        } disabled:opacity-50 disabled:cursor-not-allowed ${
          isGrid ? 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33ffcc]' : ''
        }`}
        aria-label={addedToCart ? 'Produit ajoute au panier' : 'Ajouter au panier'}
      >
        <ShoppingCart className={`w-${isGrid ? '4' : '5'} h-${isGrid ? '4' : '5'}`} />
        {isAddingToCart ? 'Ajout...' : addedToCart ? (isGrid ? 'Ajoute!' : 'Ajoute !') : (isGrid ? 'Ajouter' : 'Ajouter au panier')}
      </button>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        className={`flex items-center gap-${isGrid ? '1.5' : '2'} ${
          isGrid ? 'px-3 py-2.5' : 'px-6 py-3'
        } border-2 border-white/20 text-white rounded-xl hover:border-[#33ffcc] hover:bg-white/10 transition-all duration-300 font-semibold ${
          isGrid ? 'text-sm' : ''
        } group/link ${isGrid ? 'focus:outline-none focus:ring-2 focus:ring-[#33ffcc]' : ''}`}
        aria-label={`Voir les details de ${productName}`}
      >
        {isGrid ? 'Voir' : 'Details'}
        <ArrowRight className={`w-${isGrid ? '4' : '5'} h-${isGrid ? '4' : '5'} group-hover/link:translate-x-1 transition-transform ${isGrid ? 'duration-300' : ''}`} />
      </button>
    </div>
  );
}
