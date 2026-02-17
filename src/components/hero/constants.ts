import { useState, useEffect } from 'react';

// Animations orchestrees
export const animations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  },
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  },
  searchBar: {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }
    }
  },
  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }
};

// Images de fond
export const heroImages = [
  'https://images.pexels.com/photos/4691567/pexels-photo-4691567.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/163888/pexels-photo-163888.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/1111597/pexels-photo-1111597.jpeg?auto=compress&cs=tinysrgb&w=1920',
];

// Icones categories avec images
export const categoryVisuals: Record<string, { gradient: string; emoji: string }> = {
  'Casino & Poker': { gradient: 'from-red-500 to-orange-600', emoji: '🎰' },
  'Jeux de Bar': { gradient: 'from-amber-500 to-yellow-600', emoji: '🎱' },
  'Jeux Video': { gradient: 'from-purple-500 to-pink-600', emoji: '🎮' },
  'Jeux en Bois': { gradient: 'from-orange-600 to-amber-700', emoji: '🪵' },
  'Kermesse': { gradient: 'from-green-500 to-emerald-600', emoji: '🎪' },
  'Jeux Sportifs': { gradient: 'from-blue-500 to-cyan-600', emoji: '⚽' },
  'Loto & Bingo': { gradient: 'from-pink-500 to-rose-600', emoji: '🎯' },
  'Decoration': { gradient: 'from-violet-500 to-purple-600', emoji: '✨' },
  'Son & Lumiere': { gradient: 'from-cyan-500 to-blue-600', emoji: '🔊' },
};

// Slug map pour categories
export const categorySlugMap: Record<string, string> = {
  'Casino & Poker': 'casino-poker',
  'Jeux de Bar': 'jeux-bar',
  'Jeux Video': 'jeux-video',
  'Jeux en Bois': 'jeux-bois',
  'Kermesse': 'kermesse',
  'Jeux Sportifs': 'jeux-sportifs',
  'Loto & Bingo': 'loto-bingo',
  'Decoration': 'decoration',
  'Son & Lumiere': 'son-lumiere'
};

export function getCategorySlug(name: string): string {
  return categorySlugMap[name] || name.toLowerCase().replace(/\s+/g, '-');
}

// Hook debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Calcul duree
export function calculateDays(from: string, to: string): number {
  const start = new Date(from);
  const end = new Date(to);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}
