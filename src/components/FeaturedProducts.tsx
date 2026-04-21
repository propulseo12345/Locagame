import { ArrowRight, Heart, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { ProductsService, CategoriesService } from '../services';
import { Product } from '../types';
import { formatPrice } from '../utils/pricing';
import { ScrollReveal } from './ui';
import { SwipeCarousel } from './mobile';
import { FeaturedProductCardSkeleton } from './ui/skeletons';

function FeaturedProductCard({ product, index, getCategoryName }: { product: Product; index: number; getCategoryName: (id: string) => string }) {
  const productImage = product.images?.[0] || 'https://images.pexels.com/photos/163888/pexels-photo-163888.jpeg?auto=compress&cs=tinysrgb&w=800';
  const productPrice = product.pricing?.oneDay || 0;
  const players = product.specifications?.players;

  return (
    <Link to={`/produit/${product.id}`} className="group block">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
        <img
          src={productImage}
          alt={product.name}
          width={400}
          height={300}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000033]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {index === 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#fe1979] text-white text-xs font-bold rounded-full">
            <Heart className="w-3 h-3 fill-current" />
            Favori
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <span className="text-white text-sm font-medium">Voir les détails</span>
          <ArrowRight className="w-4 h-4 text-[#33ffcc]" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-[#33ffcc] text-xs font-semibold uppercase tracking-wider">
          {getCategoryName(product.category_id)}
        </p>
        <h3 className="text-white font-bold text-lg leading-snug group-hover:text-[#33ffcc] transition-colors duration-300 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{formatPrice(productPrice)}</span>
            <span className="text-gray-500 text-sm">/jour</span>
          </div>
          {players && (
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <Users className="w-4 h-4" />
              <span>{players.min}-{players.max}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Variantes d'animation
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          ProductsService.getFeaturedProducts(4),
          CategoriesService.getCategories()
        ]);
        setFeaturedProducts(productsData);
        setCategories(categoriesData);
      } catch (err: any) {
        const message = err?.message || 'Impossible de charger les produits';
        console.error('[FeaturedProducts] Erreur:', err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const getCategoryName = (categoryId: string) => {
    const found = categories.find((c: any) => c.id === categoryId);
    return found ? found.name : 'Jeu';
  };

  return (
    <section className="py-12 md:py-24 bg-[#000033] relative overflow-hidden">
      {/* Fond subtil */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#33ffcc]/[0.02] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-8 md:mb-12">
          <div>
            <ScrollReveal animation="fadeUp">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-[#fe1979]" />
                <span className="text-[#fe1979] text-sm font-semibold uppercase tracking-wider">Sélection</span>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fadeUp" delay={0.1}>
              <h2 className="text-xl md:text-5xl font-black text-white">
                Nos Coups de Cœur
              </h2>
            </ScrollReveal>
          </div>
          <ScrollReveal animation="fadeLeft" delay={0.2}>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 text-[#33ffcc] font-semibold hover:gap-4 transition-all duration-300 group"
            >
              Voir tout le catalogue
              <ArrowRight className="w-5 h-5" />
            </Link>
          </ScrollReveal>
        </div>

        {/* Grille de produits */}
        {error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <FeaturedProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Mobile: SwipeCarousel */}
            <div className="sm:hidden">
              <SwipeCarousel itemsPerView={1.15} gap={16} autoPlay autoPlayInterval={4000}>
                {featuredProducts.map((product, index) => (
                  <FeaturedProductCard key={product.id} product={product} index={index} getCategoryName={getCategoryName} />
                ))}
              </SwipeCarousel>
            </div>

            {/* Desktop: grid */}
            <motion.div
              className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {featuredProducts.map((product, index) => (
                <motion.div key={product.id} variants={cardVariants}>
                  <FeaturedProductCard product={product} index={index} getCategoryName={getCategoryName} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        {/* CTA discret */}
        <ScrollReveal animation="fadeUp" delay={0.3}>
          <div className="mt-10 md:mt-16 text-center">
            <p className="text-gray-400 mb-4 md:mb-6">
              Plus de <span className="text-white font-semibold">200 jeux</span> disponibles pour vos événements
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0">
              <Link
                to="/catalogue"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all duration-300 hover:scale-105"
              >
                Explorer le catalogue
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact?subject=devis"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4 border-2 border-white/20 text-white font-semibold rounded-xl hover:border-[#33ffcc] hover:text-[#33ffcc] transition-all duration-300"
              >
                Demander un devis
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
