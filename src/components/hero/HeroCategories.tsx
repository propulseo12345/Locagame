import { motion } from 'framer-motion';
import { Category } from '../../types';
import { animations, categoryVisuals, getCategorySlug } from './constants';

interface HeroCategoriesProps {
  categories: Category[];
  onCategoryClick: (slug: string) => void;
}

export function HeroCategories({ categories, onCategoryClick }: HeroCategoriesProps) {
  return (
    <motion.div variants={animations.fadeUp} className="pt-4">
      <p className="text-center text-white/40 text-sm mb-5 uppercase tracking-wider">
        Explorer par categorie
      </p>
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-4xl mx-auto">
        {categories.slice(0, 8).map((category, idx) => {
          const visual = categoryVisuals[category.name] || { gradient: 'from-gray-500 to-gray-600', emoji: '🎲' };
          return (
            <motion.button
              key={category.id}
              variants={animations.staggerItem}
              custom={idx}
              onClick={() => onCategoryClick(getCategorySlug(category.name))}
              className="group relative px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/[0.08]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{visual.emoji}</span>
                <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                  {category.name}
                </span>
              </div>

              {/* Glow effect on hover */}
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${visual.gradient} opacity-0 group-hover:opacity-10 transition-opacity blur-xl`} />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
