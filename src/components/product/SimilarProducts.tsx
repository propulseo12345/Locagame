import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { ProductsService } from '../../services';
import { Product } from '../../types';
import { formatPrice } from '../../utils/pricing';
import { SwipeCarousel } from '../mobile';

interface SimilarProductsProps {
  categoryId: string;
  currentProductId: string;
}

function SimilarProductCard({ product }: { product: Product }) {
  const image = product.images?.[0] || 'https://images.pexels.com/photos/163888/pexels-photo-163888.jpeg?auto=compress&cs=tinysrgb&w=800';
  const price = product.pricing?.oneDay || 0;
  const players = product.specifications?.players;

  return (
    <Link to={`/produit/${product.id}`} className="group block">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
        <img
          src={image}
          alt={product.name}
          width={400}
          height={300}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000033]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <h3 className="text-white font-bold text-sm leading-snug group-hover:text-[#33ffcc] transition-colors line-clamp-2 mb-1">
        {product.name}
      </h3>
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-black text-white">{formatPrice(price)}</span>
          <span className="text-gray-500 text-xs">/jour</span>
        </div>
        {players && (
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Users className="w-3.5 h-3.5" />
            <span>{players.min}-{players.max}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function SimilarProducts({ categoryId, currentProductId }: SimilarProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilar() {
      try {
        const data = await ProductsService.getProducts({ category: categoryId });
        setProducts(data.filter(p => p.id !== currentProductId).slice(0, 6));
      } catch {
        // Silent fail — section simply won't show
      } finally {
        setLoading(false);
      }
    }
    fetchSimilar();
  }, [categoryId, currentProductId]);

  if (loading || products.length === 0) return null;

  return (
    <section className="mt-12 pb-8">
      <h2 className="text-xl font-black text-white mb-6">Produits similaires</h2>

      {/* Mobile: SwipeCarousel */}
      <div className="lg:hidden">
        <SwipeCarousel itemsPerView={1.8} gap={12} autoPlay autoPlayInterval={4000}>
          {products.map(product => (
            <SimilarProductCard key={product.id} product={product} />
          ))}
        </SwipeCarousel>
      </div>

      {/* Desktop: grid */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map(product => (
          <SimilarProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
