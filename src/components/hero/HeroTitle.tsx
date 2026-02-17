import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { animations } from './constants';

export function HeroTitle() {
  return (
    <>
      {/* Badge de confiance */}
      <motion.div variants={animations.fadeUp} className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-[#33ffcc]" />
          <span className="text-sm text-white/80">
            <span className="text-[#33ffcc] font-semibold">+2000</span> evenements reussis en PACA
          </span>
        </div>
      </motion.div>

      {/* Titre */}
      <motion.div variants={animations.fadeUp} className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-[#33ffcc] via-[#66ffdd] to-[#33ffcc] bg-clip-text text-transparent">
              Loue & Joue
            </span>
            <motion.span
              className="absolute -bottom-2 left-0 right-0 h-3 bg-[#33ffcc]/20 rounded-full -skew-x-3"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </span>
        </h1>
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-light">
          Baby-foot, poker, bornes arcade, jeux en bois... Tout pour animer vos evenements en region PACA
        </p>
      </motion.div>
    </>
  );
}
