import { Category } from '../../types';

interface CategoryWithCount extends Category {
  productCount: number;
}

interface CatalogCategoriesBarProps {
  categoriesWithCount: CategoryWithCount[];
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  handleCategoryClick: (categoryId: string) => void;
  totalProductsCount: number;
}

export function CatalogCategoriesBar({
  categoriesWithCount,
  selectedCategory,
  setSelectedCategory,
  handleCategoryClick,
  totalProductsCount,
}: CatalogCategoriesBarProps) {
  return (
    <div className="relative z-10 py-3 border-b border-white/5">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
          {/* Bouton "Tous" */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
              !selectedCategory
                ? 'bg-[#33ffcc] text-[#000033] shadow-[0_0_12px_rgba(51,255,204,0.3)]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            Tous ({totalProductsCount})
          </button>
          {categoriesWithCount.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap active:scale-95 ${
                selectedCategory === category.id
                  ? 'bg-[#33ffcc] text-[#000033] shadow-[0_0_12px_rgba(51,255,204,0.3)]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {category.icon} {category.name} ({category.productCount})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
