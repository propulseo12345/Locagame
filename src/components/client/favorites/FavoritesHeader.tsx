interface FavoritesHeaderProps {
  count: number;
}

export default function FavoritesHeader({ count }: FavoritesHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white tracking-tight">Mes favoris</h1>
      <p className="text-sm text-gray-400 mt-1">
        {count} produit{count > 1 ? 's' : ''} sauvegardé{count > 1 ? 's' : ''}
      </p>
    </div>
  );
}
