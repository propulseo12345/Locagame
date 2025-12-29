interface CategoryWithCount {
  id: string;
  name: string;
  icon?: string;
  productCount: number;
}

interface CategoryFiltersProps {
  categories: CategoryWithCount[];
  selectedCategory: string | null;
  totalProducts: number;
  onCategoryClick: (categoryId: string | null) => void;
}

export function CategoryFilters({
  categories,
  selectedCategory,
  totalProducts,
  onCategoryClick
}: CategoryFiltersProps) {
  return (
    <div className="relative z-10 py-3 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {/* Bouton "Tous" */}
          <button
            onClick={() => onCategoryClick(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !selectedCategory
                ? 'bg-[#33ffcc] text-[#000033]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            Tous ({totalProducts})
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
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
