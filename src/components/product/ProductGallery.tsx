import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Play } from 'lucide-react';
import { ProductLightbox } from './ProductLightbox';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  category: string;
  totalStock: number;
  shortDescription?: string;
}

export function ProductGallery({
  images,
  productName,
  category,
  totalStock,
  shortDescription
}: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Image principale */}
        <div className="relative group overflow-hidden rounded-3xl aspect-[4/3] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20">
          <img
            src={images[currentImageIndex] || '/placeholder-product.jpg'}
            alt={`${productName} - Location de jeu pour événement en région PACA. ${shortDescription || 'Jeu disponible à la location avec installation professionnelle.'}`}
            className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
            onClick={() => setShowLightbox(true)}
            fetchPriority={currentImageIndex === 0 ? "high" : "auto"}
            loading={currentImageIndex === 0 ? "eager" : "lazy"}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {totalStock < 5 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fe1979]/90 backdrop-blur-md text-white rounded-full shadow-lg">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-bold">Très demandé</span>
              </div>
            )}
            <div className="px-3 py-1.5 bg-[#33ffcc]/20 backdrop-blur-md text-[#33ffcc] rounded-full border border-[#33ffcc]/30">
              <span className="text-xs font-bold">{category}</span>
            </div>
          </div>

          {/* Navigation images */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all duration-300 opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all duration-300 opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Indicateurs images */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-md rounded-full px-3 py-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'w-6 bg-[#33ffcc]'
                      : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Zoom hint */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full text-white/70 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-3 h-3" />
            Cliquez pour agrandir
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-3">
            {images.slice(0, 5).map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'ring-2 ring-[#33ffcc] ring-offset-2 ring-offset-[#000033]'
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                <img
                  src={image}
                  alt={`${productName} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <ProductLightbox
          images={images}
          currentIndex={currentImageIndex}
          productName={productName}
          onClose={() => setShowLightbox(false)}
          onIndexChange={setCurrentImageIndex}
        />
      )}
    </>
  );
}
