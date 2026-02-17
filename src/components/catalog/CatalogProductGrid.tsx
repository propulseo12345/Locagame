import { Search, X } from 'lucide-react';
import { Product, Category } from '../../types';
import ProductCard from '../ProductCard';

interface CategoryWithCount extends Category {
  productCount: number;
}

interface CatalogProductGridProps {
  loading: boolean;
  error: string | null;
  products: Product[];
  filteredProducts: Product[];
  paginatedProducts: Product[];
  categoriesWithCount: CategoryWithCount[];
  viewMode: 'grid' | 'list';
  selectedCategory: string | null;
  searchTerm: string;
  filters: Record<string, any>;
  startDate: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

export function CatalogProductGrid({
  loading,
  error,
  products,
  filteredProducts,
  paginatedProducts,
  categoriesWithCount,
  viewMode,
  selectedCategory,
  searchTerm,
  filters,
  startDate,
  currentPage,
  totalPages,
  onPageChange,
  onClearFilters,
}: CatalogProductGridProps) {
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (products.length === 0) {
    return <EmptyState />;
  }

  if (paginatedProducts.length === 0) {
    return <NoResultsState onClearFilters={onClearFilters} />;
  }

  const showCategoryGrouping =
    !selectedCategory && !searchTerm && Object.keys(filters).length === 0 && !startDate;

  return (
    <>
      {showCategoryGrouping ? (
        <CategoryGroupedView
          categoriesWithCount={categoriesWithCount}
          filteredProducts={filteredProducts}
          viewMode={viewMode}
        />
      ) : (
        <FlatGridView products={paginatedProducts} viewMode={viewMode} />
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}

const LoadingState = () => (
  <div className="text-center py-12 text-gray-400">
    <div className="inline-block w-8 h-8 border-4 border-[#33ffcc] border-t-transparent rounded-full animate-spin mb-4" />
    <p>Chargement du catalogue...</p>
  </div>
);

const ErrorState = ({ error }: { error: string }) => (
  <div className="text-center py-16">
    <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/10 rounded-full mb-6">
      <X className="w-12 h-12 text-red-400" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-3">Erreur de connexion</h3>
    <p className="text-gray-300 mb-6 max-w-md mx-auto">{error}</p>
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl mx-auto text-left">
      <p className="text-white font-semibold mb-3">Solutions possibles :</p>
      <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
        <li>Creez un fichier <code className="bg-white/10 px-2 py-1 rounded">.env</code> a la racine du projet</li>
        <li>Ajoutez vos identifiants Supabase :
          <pre className="bg-[#000033] p-3 rounded mt-2 text-xs overflow-x-auto">{`VITE_SUPABASE_URL=https://votre-projet.supabase.co\nVITE_SUPABASE_ANON_KEY=votre-cle-anon`}</pre>
        </li>
        <li>Redemarrez le serveur de developpement</li>
        <li>Verifiez que les tables existent dans Supabase</li>
        <li>Verifiez les politiques RLS (Row Level Security) dans Supabase</li>
      </ol>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-16">
    <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 rounded-full mb-6">
      <Search className="w-12 h-12 text-[#33ffcc]" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-3">Aucun produit disponible</h3>
    <p className="text-gray-300 mb-6 max-w-md mx-auto">
      Le catalogue est vide pour le moment. Les produits seront ajoutes prochainement.
    </p>
  </div>
);

const NoResultsState = ({ onClearFilters }: { onClearFilters: () => void }) => (
  <div className="text-center py-20">
    <p className="text-gray-400 mb-4">Aucun produit trouve pour ces criteres</p>
    <button onClick={onClearFilters} className="text-[#33ffcc] hover:underline text-sm">
      Reinitialiser les filtres
    </button>
  </div>
);

function CategoryGroupedView({
  categoriesWithCount,
  filteredProducts,
  viewMode,
}: {
  categoriesWithCount: CategoryWithCount[];
  filteredProducts: Product[];
  viewMode: 'grid' | 'list';
}) {
  return (
    <>
      {categoriesWithCount
        .filter((cat) => cat.productCount > 0)
        .map((category) => {
          const categoryProducts = filteredProducts.filter((p) => p.category_id === category.id);
          if (categoryProducts.length === 0) return null;

          return (
            <div key={category.id} className="mb-10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>{category.icon}</span>
                {category.name}
                <span className="text-sm font-normal text-gray-500">({categoryProducts.length})</span>
              </h2>
              <div
                className={`grid gap-5 ${
                  viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
                }`}
              >
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            </div>
          );
        })}
    </>
  );
}

function FlatGridView({ products, viewMode }: { products: Product[]; viewMode: 'grid' | 'list' }) {
  return (
    <div
      className={`grid gap-5 ${
        viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
      }`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} viewMode={viewMode} />
      ))}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });

  return (
    <div className="mt-10 flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        &larr; Precedent
      </button>

      <div className="flex items-center gap-1 mx-2">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 text-sm rounded-lg transition-all ${
              page === currentPage
                ? 'bg-[#33ffcc] text-[#000033] font-bold'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Suivant &rarr;
      </button>
    </div>
  );
}
