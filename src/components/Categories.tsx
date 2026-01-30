import { Dices, Gamepad2, Trees, Sparkles, PartyPopper, Trophy, Palette, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CategoriesService, ProductsService } from '../services';
import type { Category } from '../services/categories.service';
import { Product } from '../types';

// Mapping des icônes par slug de catégorie
const iconMap: Record<string, typeof Dices> = {
  'casino-poker': Dices,
  'jeux-bar': Gamepad2,
  'jeux-video': Gamepad2,
  'jeux-bois': Trees,
  'kermesse': PartyPopper,
  'jeux-sportifs': Trophy,
  'loto-bingo': Sparkles,
  'decoration': Palette,
};

// Images par défaut par slug
const defaultImages: Record<string, string> = {
  'casino-poker': 'https://images.pexels.com/photos/4507040/pexels-photo-4507040.jpeg?auto=compress&cs=tinysrgb&w=800',
  'jeux-bar': 'https://images.pexels.com/photos/163888/foosball-fun-game-team-163888.jpeg?auto=compress&cs=tinysrgb&w=800',
  'jeux-video': 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800',
  'jeux-bois': 'https://images.pexels.com/photos/4092459/pexels-photo-4092459.jpeg?auto=compress&cs=tinysrgb&w=800',
  'kermesse': 'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=800',
  'jeux-sportifs': 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=800',
  'loto-bingo': 'https://images.pexels.com/photos/3831645/pexels-photo-3831645.jpeg?auto=compress&cs=tinysrgb&w=800',
  'decoration': 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800',
};

export function Categories() {
  const [categories, setCategories] = useState<(Category & { count: number; icon: typeof Dices; image: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const [categoriesData, productsData] = await Promise.all([
          CategoriesService.getCategories(),
          ProductsService.getProducts()
        ]);

        // Enrichir les catégories avec les compteurs et les icônes
        const enrichedCategories = categoriesData.map(cat => {
          const count = productsData.filter(p => p.category_id === cat.id).length;
          const Icon = iconMap[cat.slug] || Dices;
          const image = defaultImages[cat.slug] || 'https://images.pexels.com/photos/163888/foosball-fun-game-team-163888.jpeg?auto=compress&cs=tinysrgb&w=800';
          
          return {
            ...cat,
            count,
            icon: Icon,
            image
          };
        });

        setCategories(enrichedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);
  return (
    <section className="py-20 bg-[#000033] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMEZGRDEiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-[#33ffcc]/10 border border-[#33ffcc]/30 rounded-full">
            <span className="text-[#33ffcc] friendly-badge text-base">8 univers de jeux</span>
          </div>
          <h2 className="section-title">
            Nos <span className="gradient-text">Catégories</span>
          </h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            Découvrez notre collection complète de jeux pour tous vos événements professionnels et privés en région PACA
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl aspect-square bg-white/5 animate-pulse"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#000033] via-[#000033]/50 to-transparent"></div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="absolute top-4 right-4 w-10 h-6 bg-white/10 rounded-full"></div>
                  <div className="mb-4 w-14 h-14 bg-white/10 rounded-xl"></div>
                  <div className="h-6 w-3/4 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 w-full bg-white/10 rounded mb-1"></div>
                  <div className="h-4 w-2/3 bg-white/10 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
            return (
                <Link
                key={category.id}
                to={`/catalogue?category=${category.slug || category.id}`}
                className="group relative overflow-hidden rounded-2xl aspect-square hover:scale-105 transition-all duration-500 hover:z-10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000033] via-[#000033]/70 to-transparent group-hover:from-[#000033]/90 group-hover:via-[#000033]/80 transition-all duration-500"></div>

                {/* Overlay au hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#33ffcc]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  {/* Badge de catégorie */}
                  <div className="absolute top-4 right-4 bg-[#33ffcc]/20 backdrop-blur-sm rounded-full px-3 py-1 border border-[#33ffcc]/30">
                    <span className="text-[#33ffcc] text-sm friendly-badge">{category.count}</span>
                  </div>

                  {/* Icône avec animation */}
                  <div className="mb-4 w-14 h-14 bg-[#33ffcc]/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-[#33ffcc]/30 group-hover:bg-[#33ffcc] group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-7 h-7 text-[#33ffcc] group-hover:text-[#000033] transition-colors duration-300" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#33ffcc] transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-gray-300 text-sm mb-3 leading-relaxed group-hover:text-white transition-colors duration-300">
                    {category.description}
                  </p>
                  
                  {/* CTA au hover */}
                  <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <div className="flex items-center text-[#33ffcc] text-sm font-semibold">
                      Voir les produits
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Effet de brillance au hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </Link>
            );
          })}
          </div>
        )}

        {/* CTA section */}
        <div className="text-center mt-16">
          <Link to="/catalogue" className="btn-primary text-lg px-8 py-4 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2">
            Explorer tout le catalogue
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
