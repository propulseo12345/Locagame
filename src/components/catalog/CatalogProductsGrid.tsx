import { Search, X } from 'lucide-react';
import { Product, Category, FilterOptions } from '../../types';
import ProductCard from '../ProductCard';
import { CatalogResultsBar } from './CatalogResultsBar';
import { CatalogPagination } from './CatalogPagination';

interface CategoryWithCount extends Category {
  productCount: number;
}

interface CatalogProductsGridProps {
  loading: boolean;
  error: string | null;
  products: Product[];
  filteredProducts: Product[];
  paginatedProducts: Product[];
  categoriesWithCount: CategoryWithCount[];
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  selectedCategory: string | null;
  searchTerm: string;
  startDate: string;
  endDate: string;
  filters: FilterOptions;
  unavailableProductIds: Set<string>;
  activeFiltersCount: number;
  handleFilterChange: (key: keyof FilterOptions, value: any) => void;
  clearAllFilters: () => void;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  productsRef: React.RefObject<HTMLDivElement | null>;
}

export function CatalogProductsGrid({
  loading, error, products, filteredProducts, paginatedProducts,
  categoriesWithCount, viewMode, setViewMode, selectedCategory,
  searchTerm, startDate, endDate, filters, unavailableProductIds,
  activeFiltersCount, handleFilterChange, clearAllFilters,
  totalPages, currentPage, setCurrentPage, productsRef,
}: CatalogProductsGridProps) {
  const gridClass = `grid gap-5 ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`;
  const showCategoryView = !selectedCategory && !searchTerm && Object.keys(filters).length === 0 && !startDate;

  return (
    <div ref={productsRef} className="relative z-10 py-8 bg-gradient-to-b from-transparent to-[#000033]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CatalogResultsBar
          filteredCount={filteredProducts.length}
          startDate={startDate} endDate={endDate} searchTerm={searchTerm}
          unavailableCount={unavailableProductIds.size}
          activeFiltersCount={activeFiltersCount}
          filters={filters} viewMode={viewMode} setViewMode={setViewMode}
          handleFilterChange={handleFilterChange} clearAllFilters={clearAllFilters}
        />

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="inline-block w-8 h-8 border-4 border-[#33ffcc] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Chargement du catalogue...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/10 rounded-full mb-6">
              <X className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Erreur de connexion</h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">{error}</p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl mx-auto text-left">
              <p className="text-white font-semibold mb-3">Solutions possibles :</p>
              <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
                <li>Créez un fichier <code className="bg-white/10 px-2 py-1 rounded">.env</code> à la racine du projet</li>
                <li>Ajoutez vos identifiants Supabase :
                  <pre className="bg-[#000033] p-3 rounded mt-2 text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon`}
                  </pre>
                </li>
                <li>Redémarrez le serveur de développement</li>
                <li>Vérifiez que les tables existent dans Supabase</li>
                <li>Vérifiez les politiques RLS (Row Level Security) dans Supabase</li>
              </ol>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 rounded-full mb-6">
              <Search className="w-12 h-12 text-[#33ffcc]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Aucun produit disponible</h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Le catalogue est vide pour le moment. Les produits seront ajoutés prochainement.
            </p>
          </div>
        ) : paginatedProducts.length > 0 ? (
          <>
            {showCategoryView ? (
              categoriesWithCount
                .filter(cat => cat.productCount > 0)
                .map(category => {
                  const categoryProducts = filteredProducts.filter(p => p.category_id === category.id);
                  if (categoryProducts.length === 0) return null;
                  return (
                    <div key={category.id} className="mb-10">
                      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span>{category.icon}</span>
                        {category.name}
                        <span className="text-sm font-normal text-gray-500">({categoryProducts.length})</span>
                      </h2>
                      <div className={gridClass}>
                        {categoryProducts.map((product) => (
                          <ProductCard key={product.id} product={product} viewMode={viewMode} />
                        ))}
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className={gridClass}>
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            )}
            <CatalogPagination totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">Aucun produit trouvé pour ces critères</p>
            <button onClick={clearAllFilters} className="text-[#33ffcc] hover:underline text-sm">
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
