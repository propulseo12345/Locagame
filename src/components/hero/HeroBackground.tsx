import { motion } from 'framer-motion';
import { heroImages } from './constants';

interface HeroBackgroundProps {
  currentImageIndex: number;
}

export function HeroBackground({ currentImageIndex }: HeroBackgroundProps) {
  return (
    <div className="absolute inset-0">
      {heroImages.map((image, index) => (
        <motion.div
          key={index}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${image}')` }}
          initial={false}
          animate={{
            opacity: index === currentImageIndex ? 1 : 0,
            scale: index === currentImageIndex ? 1 : 1.1
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      ))}

      {/* Overlay complexe pour profondeur */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000033]/90 via-[#000033]/75 to-[#000033]/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,#000033_70%)]" />

      {/* Noise texture subtil */}
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
      />

      {/* Accent lumineux */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#33ffcc]/5 blur-[150px] rounded-full" />
    </div>
  );
}
