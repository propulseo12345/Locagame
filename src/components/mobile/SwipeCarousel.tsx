import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeCarouselProps {
  children: ReactNode[];
  itemsPerView?: number;
  gap?: number;
  showArrows?: boolean;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export function SwipeCarousel({
  children,
  itemsPerView = 1.15,
  gap = 16,
  showArrows = true,
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 4000,
  className = '',
}: SwipeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const totalItems = children.length;

  // Calculate item width as percentage based on itemsPerView
  const itemWidthPercent = 100 / itemsPerView;

  const pauseAutoPlay = useCallback(() => {
    setIsPaused(true);
    clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setIsPaused(false), 3000);
  }, []);

  useEffect(() => {
    return () => clearTimeout(resumeTimerRef.current);
  }, []);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);

    // Calculate active index from scroll position
    const itemWidth = el.scrollWidth / totalItems;
    const newIndex = Math.round(el.scrollLeft / itemWidth);
    setActiveIndex(Math.min(newIndex, totalItems - 1));
  }, [totalItems]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  // Pause autoplay on touch
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !autoPlay) return;
    const handleTouch = () => pauseAutoPlay();
    el.addEventListener('touchstart', handleTouch, { passive: true });
    return () => el.removeEventListener('touchstart', handleTouch);
  }, [autoPlay, pauseAutoPlay]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || totalItems <= 1 || isPaused) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const itemWidth = el.scrollWidth / totalItems;
      const nextIndex = activeIndex + 1 >= totalItems ? 0 : activeIndex + 1;
      el.scrollTo({ left: nextIndex * itemWidth, behavior: 'smooth' });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, activeIndex, totalItems, isPaused]);

  const scrollTo = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    pauseAutoPlay();
    const itemWidth = el.scrollWidth / totalItems;
    const scrollAmount = direction === 'left' ? -itemWidth : itemWidth;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    pauseAutoPlay();
    const itemWidth = el.scrollWidth / totalItems;
    el.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
  };

  if (totalItems === 0) return null;

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => autoPlay && setIsPaused(true)}
      onMouseLeave={() => autoPlay && setIsPaused(false)}
    >
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{
          gap: `${gap}px`,
          scrollPaddingLeft: '0px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children.map((child, i) => (
          <div
            key={i}
            className="snap-start flex-shrink-0"
            style={{ width: `calc(${itemWidthPercent}% - ${gap * (itemsPerView - 1) / itemsPerView}px)` }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Arrows — mobile (small, translucent) + desktop */}
      {showArrows && totalItems > Math.ceil(itemsPerView) && (
        <>
          {/* Mobile arrows */}
          <button
            onClick={() => scrollTo('left')}
            disabled={!canScrollLeft}
            className="flex md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollTo('right')}
            disabled={!canScrollRight}
            className="flex md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none"
            aria-label="Suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Desktop arrows */}
          <button
            onClick={() => scrollTo('left')}
            disabled={!canScrollLeft}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollTo('right')}
            disabled={!canScrollRight}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none"
            aria-label="Suivant"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && totalItems > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: totalItems }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-6 h-2 bg-[#33ffcc]'
                  : 'w-2 h-2 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Aller à l'élément ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SwipeCarousel;
