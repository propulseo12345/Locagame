import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ProductLightboxProps {
  images: string[];
  currentIndex: number;
  productName: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function ProductLightbox({
  images,
  currentIndex,
  productName,
  onClose,
  onIndexChange
}: ProductLightboxProps) {
  const prevImage = () => {
    onIndexChange((currentIndex - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    onIndexChange((currentIndex + 1) % images.length);
  };

  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 z-10"
      >
        <X className="w-6 h-6" />
      </button>

      <img
        src={images[currentIndex]}
        alt={productName}
        className="max-w-full max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Thumbnails in lightbox */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 backdrop-blur-md rounded-full px-4 py-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); onIndexChange(index); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-[#33ffcc] w-6' : 'bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
