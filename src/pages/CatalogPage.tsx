import { useState, useMemo, useRef } from 'react';
import { FilterOptions } from '../types';
import { SEO } from '../components/SEO';
import { BreadcrumbSchema } from '../components/BreadcrumbSchema';
import { CatalogHeroSection, CatalogCategoriesBar, CatalogProductsGrid } from '../components/catalog';
import { useCatalogData, useCatalogSearch, useCatalogAvailability, useCatalogPagination } from '../hooks/catalog';

export default function CatalogPage() {
  const productsRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { products, categories, loading, error, categoriesWithCount } = useCatalogData();
  const search = useCatalogSearch({ categories, selectedCategory, setSelectedCategory, productsRef });
  const { unavailableProductIds, checkingAvailability, availabilityError } = useCatalogAvailability({
    products, debouncedStartDate: search.debouncedStartDate, debouncedEndDate: search.debouncedEndDate,
  });

  const filteredProducts = useMemo(() => {
    let f = [...products];
    if (selectedCategory) f = f.filter(p => p.category_id === selectedCategory);
    if (search.searchTerm) {
      const term = search.searchTerm.toLowerCase();
      f = f.filter(p => p.name.toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term));
    }
    if (filters.category) f = f.filter(p => p.category_id === filters.category);
    if (filters.price_min !== undefined) f = f.filter(p => p.pricing.oneDay >= filters.price_min!);
    if (filters.price_max !== undefined) f = f.filter(p => p.pricing.oneDay <= filters.price_max!);
    if (filters.players_min !== undefined) f = f.filter(p => p.specifications.players.max >= filters.players_min!);
    if (filters.players_max !== undefined) f = f.filter(p => p.specifications.players.min <= filters.players_max!);
    if (search.startDate && search.endDate && unavailableProductIds.size > 0) f = f.filter(p => !unavailableProductIds.has(p.id));
    switch (filters.sort_by) {
      case 'price_asc': f.sort((a, b) => a.pricing.oneDay - b.pricing.oneDay); break;
      case 'price_desc': f.sort((a, b) => b.pricing.oneDay - a.pricing.oneDay); break;
      case 'popularity': f.sort((a, b) => b.total_stock - a.total_stock); break;
      case 'newest': f.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      default:
        if (search.searchTerm) {
          const term = search.searchTerm.toLowerCase();
          f.sort((a, b) => (b.name.toLowerCase().includes(term) ? 2 : 1) - (a.name.toLowerCase().includes(term) ? 2 : 1));
        }
    }
    return f;
  }, [products, filters, search.searchTerm, selectedCategory, search.startDate, search.endDate, unavailableProductIds]);

  const pagination = useCatalogPagination({
    filteredProducts, filters, searchTerm: search.searchTerm, selectedCategory, startDate: search.startDate, endDate: search.endDate,
  });

  const handleFilterChange = (key: keyof FilterOptions, value: any) => setFilters(prev => ({ ...prev, [key]: value }));
  const handleCategoryClick = (id: string) => {
    setSelectedCategory(selectedCategory === id ? null : id);
    setTimeout(() => productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };
  const clearAllFilters = () => {
    setFilters({}); search.setSearchTerm(''); setSelectedCategory(null); search.clearDates();
    search.setSearchParams(new URLSearchParams(), { replace: true });
  };
  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (search.searchTerm ? 1 : 0) + (selectedCategory ? 1 : 0) + (search.startDate ? 1 : 0);

  const pageTitle = selectedCategory
    ? (categories.find(c => c.id === selectedCategory)?.name ? `Location ${categories.find(c => c.id === selectedCategory)!.name}` : 'Catalogue')
    : search.searchTerm ? `Recherche: ${search.searchTerm}` : 'Catalogue de jeux à louer';

  return (
    <>
      <SEO title={pageTitle} description={`Découvrez notre catalogue de ${products.length}+ jeux à louer pour vos événements : jeux de bar, casino, jeux en bois, bornes arcade et plus. Livraison en région PACA.`} keywords="location jeux, catalogue jeux, jeux événement, baby-foot location, poker location, borne arcade, jeux bois, Marseille, PACA" url="https://www.locagame.fr/catalogue" />
      <BreadcrumbSchema items={[{ name: 'Accueil', url: 'https://www.locagame.fr' }, { name: 'Catalogue', url: 'https://www.locagame.fr/catalogue' }]} />
      <div className="min-h-screen bg-gradient-to-b from-[#000033] via-[#000033] to-[#001144] pt-header">
        <CatalogHeroSection productsCount={products.length} searchTerm={search.searchTerm} setSearchTerm={search.setSearchTerm} startDate={search.startDate} endDate={search.endDate} handleStartDateChange={search.handleStartDateChange} handleEndDateChange={search.handleEndDateChange} clearDates={search.clearDates} handleSearchSubmit={search.handleSearchSubmit} getTodayString={search.getTodayString} checkingAvailability={checkingAvailability} availabilityError={availabilityError} searchParams={search.searchParams} setSearchParams={search.setSearchParams} />
        <CatalogCategoriesBar categoriesWithCount={categoriesWithCount} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} handleCategoryClick={handleCategoryClick} totalProductsCount={products.length} />
        <CatalogProductsGrid loading={loading} error={error} products={products} filteredProducts={filteredProducts} paginatedProducts={pagination.paginatedProducts} categoriesWithCount={categoriesWithCount} viewMode={viewMode} setViewMode={setViewMode} selectedCategory={selectedCategory} searchTerm={search.searchTerm} startDate={search.startDate} endDate={search.endDate} filters={filters} unavailableProductIds={unavailableProductIds} activeFiltersCount={activeFiltersCount} handleFilterChange={handleFilterChange} clearAllFilters={clearAllFilters} totalPages={pagination.totalPages} currentPage={pagination.currentPage} setCurrentPage={pagination.setCurrentPage} productsRef={productsRef} />
      </div>
    </>
  );
}
