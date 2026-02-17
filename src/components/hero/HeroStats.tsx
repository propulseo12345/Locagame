import { motion } from 'framer-motion';
import { animations } from './constants';

const stats = [
  { value: '200+', label: 'Jeux disponibles' },
  { value: '10 ans', label: "d'experience" },
  { value: '98%', label: 'Clients satisfaits' },
];

export function HeroStats() {
  return (
    <motion.div
      variants={animations.fadeUp}
      className="flex flex-wrap justify-center items-center gap-8 md:gap-12 pt-6 border-t border-white/5 mt-8"
    >
      {stats.map((stat, idx) => (
        <div key={idx} className="text-center">
          <div className="text-2xl md:text-3xl font-black text-[#33ffcc]">{stat.value}</div>
          <div className="text-sm text-white/40">{stat.label}</div>
        </div>
      ))}
    </motion.div>
  );
}
