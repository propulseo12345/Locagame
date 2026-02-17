import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface EventLightboxProps {
  gallery: string[];
  currentImageIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectIndex: (index: number) => void;
}

export default function EventLightbox({
  gallery,
  currentImageIndex,
  onClose,
  onNext,
  onPrev,
  onSelectIndex
}: EventLightboxProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#000033]/95 backdrop-blur-xl flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 text-white"
      >
        <X className="w-6 h-6" />
      </button>

      {gallery.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={onNext}
            className="absolute right-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <img
        src={gallery[currentImageIndex]}
        alt="Event"
        className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
      />

      {gallery.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {gallery.map((_, index) => (
            <button
              key={index}
              onClick={() => onSelectIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? 'bg-[#33ffcc] w-8'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
