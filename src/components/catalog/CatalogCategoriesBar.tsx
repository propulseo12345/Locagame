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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {/* Bouton "Tous" */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !selectedCategory
                ? 'bg-[#33ffcc] text-[#000033]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            Tous ({totalProductsCount})
          </button>
          {categoriesWithCount.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-[#33ffcc] text-[#000033]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
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
