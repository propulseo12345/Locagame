import { Heart } from 'lucide-react';

interface FavoritesHeaderProps {
  count: number;
}

export default function FavoritesHeader({ count }: FavoritesHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#fe1979]/20 via-[#fe1979]/10 to-transparent backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#fe1979]/10 rounded-full blur-3xl"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-[#fe1979]/20 rounded-xl">
            <Heart className="w-8 h-8 text-[#fe1979] fill-[#fe1979]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Mes favoris
          </h1>
        </div>
        <p className="text-base text-gray-300">
          Vos produits préférés • {count} produit(s)
        </p>
      </div>
    </div>
  );
}
