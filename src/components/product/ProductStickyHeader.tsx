import { Link } from 'react-router-dom';
import { ArrowLeft, Share2, Heart } from 'lucide-react';

interface ProductStickyHeaderProps {
  productName: string;
  isLiked: boolean;
  onShare: () => void;
  onLike: () => void;
}

export function ProductStickyHeader({
  productName,
  isLiked,
  onShare,
  onLike,
}: ProductStickyHeaderProps) {
  return (
    <div className="sticky top-[var(--header-height)] z-40 bg-[#000033]/95 backdrop-blur-xl border-b border-white/10 transition-[top] duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 text-white/70 hover:text-[#33ffcc] transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Catalogue
          </Link>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-white/40">
            <Link to="/" className="hover:text-white/60 transition-colors">Accueil</Link>
            <span>/</span>
            <Link to="/catalogue" className="hover:text-white/60 transition-colors">Catalogue</Link>
            <span>/</span>
            <span className="text-[#33ffcc]">{productName}</span>
          </div>

          {/* Actions rapides */}
          <div className="flex items-center gap-2">
            <button
              onClick={onShare}
              className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onLike}
              className={`p-2 rounded-lg transition-all ${
                isLiked
                  ? 'bg-[#fe1979] text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
