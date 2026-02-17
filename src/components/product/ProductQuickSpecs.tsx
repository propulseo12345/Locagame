import { Users, Clock, Sparkles } from 'lucide-react';
import { Product } from '../../types';

interface ProductQuickSpecsProps {
  product: Product;
}

export function ProductQuickSpecs({ product }: ProductQuickSpecsProps) {
  return (
    <div className="hidden lg:block bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
      <h4 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#33ffcc]" />
        En un coup d'oeil
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#33ffcc]/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#33ffcc]" />
          </div>
          <div>
            <div className="text-lg font-black text-white">{product.specifications.players.min}-{product.specifications.players.max}</div>
            <div className="text-xs text-white/50">Joueurs</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#66cccc]/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#66cccc]" />
          </div>
          <div>
            <div className="text-lg font-black text-white">{product.specifications.setup_time}</div>
            <div className="text-xs text-white/50">Min setup</div>
          </div>
        </div>
      </div>
    </div>
  );
}
