import { X, Plus, Image, Upload } from 'lucide-react';
import { ProductFormData } from './types';

interface Props {
  formData: ProductFormData;
  newImageUrl: string;
  setNewImageUrl: (url: string) => void;
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
}

export default function ProductImagesSection({
  formData,
  newImageUrl,
  setNewImageUrl,
  onAddImage,
  onRemoveImage,
}: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddImage();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Image className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900">Images</h2>
        {formData.images.length > 0 && (
          <span className="text-xs text-gray-400">{formData.images.length} image(s)</span>
        )}
      </div>

      {formData.images.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          {formData.images.map((image, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Erreur';
                }}
              />
              {index === 0 && (
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-medium bg-gray-900 text-white rounded">
                  Principal
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemoveImage(index)}
                className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Coller l'URL de l'image..."
            className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={onAddImage}
          disabled={!newImageUrl.trim()}
          className="h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>
    </div>
  );
}
