import { X, Plus } from 'lucide-react';

interface ProductImagesFormProps {
  images: string[];
  newImageUrl: string;
  onNewImageUrlChange: (url: string) => void;
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
}

export default function ProductImagesForm({
  images,
  newImageUrl,
  onNewImageUrlChange,
  onAddImage,
  onRemoveImage,
}: ProductImagesFormProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Images</h3>
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/300x200?text=Image+non+disponible';
                }}
              />
              <button
                type="button"
                onClick={() => onRemoveImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={newImageUrl}
          onChange={(e) => onNewImageUrlChange(e.target.value)}
          placeholder="URL de l'image (https://...)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
        />
        <button
          type="button"
          onClick={onAddImage}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>
    </div>
  );
}
