import { X, Plus } from 'lucide-react';
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
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Images</h2>
      <div className="space-y-4">
        {/* Liste des images existantes */}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
                  }}
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Ajouter une nouvelle image */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="URL de l'image"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
          />
          <button
            type="button"
            onClick={onAddImage}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Entrez l'URL complete de l'image (ex: https://example.com/image.jpg)
        </p>
      </div>
    </div>
  );
}
