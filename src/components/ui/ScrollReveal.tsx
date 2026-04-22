import { motion, useInView, Variants, useReducedMotion } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';

// Desktop animation variants (full distances)
const desktopVariants: Record<string, Variants> = {
  fadeUp: { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0 } },
  fadeDown: { hidden: { opacity: 0, y: -60 }, visible: { opacity: 1, y: 0 } },
  fadeLeft: { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } },
  fadeRight: { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } },
  fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  scale: { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } },
  scaleRotate: { hidden: { opacity: 0, scale: 0.8, rotate: -10 }, visible: { opacity: 1, scale: 1, rotate: 0 } },
  slideUp: { hidden: { opacity: 0, y: 100 }, visible: { opacity: 1, y: 0 } },
  blur: { hidden: { opacity: 0, filter: 'blur(10px)' }, visible: { opacity: 1, filter: 'blur(0px)' } }
};

// Mobile animation variants (reduced distances for smoother scroll)
const mobileVariants: Record<string, Variants> = {
  fadeUp: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
  fadeDown: { hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } },
  fadeLeft: { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } },
  fadeRight: { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } },
  fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  scale: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } },
  scaleRotate: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, rotate: 0 } },
  slideUp: { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } },
  blur: { hidden: { opacity: 0 }, visible: { opacity: 1 } }
};

// Keep backward-compat export
const animationVariants = desktopVariants;

type AnimationType = keyof typeof animationVariants;

interface ScrollRevealProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
  className?: string;
  stagger?: number;
  as?: keyof JSX.IntrinsicElements;
}

export function ScrollReveal({
  children,
  animation = 'fadeUp',
  delay = 0,
  duration = 0.6,
  once = true,
  threshold = 0.2,
  className = '',
  as = 'div'
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;

  // Skip animations entirely when user prefers reduced motion
  if (prefersReducedMotion) {
    return <MotionComponent className={className}>{children}</MotionComponent>;
  }

  const variants = isMobile ? mobileVariants[animation] : desktopVariants[animation];
  const mobileDuration = isMobile ? Math.min(duration, 0.4) : duration;

  return (
    <MotionComponent
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration: mobileDuration,
        delay: isMobile ? Math.min(delay, 0.1) : delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      style={isMobile ? { willChange: 'opacity, transform' } : undefined}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}

// Composant pour animer des éléments enfants avec un effet de décalage (stagger)
interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  animation?: AnimationType;
  duration?: number;
  once?: boolean;
  threshold?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  animation: _animation = 'fadeUp',
  duration: _duration = 0.5,
  once = true,
  threshold = 0.2,
  className = ''
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Élément enfant pour le stagger
interface StaggerItemProps {
  children: ReactNode;
  animation?: AnimationType;
  duration?: number;
  className?: string;
}

export function StaggerItem({
  children,
  animation = 'fadeUp',
  duration = 0.5,
  className = ''
}: StaggerItemProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const prefersReducedMotion = useReducedMotion();
  const variants = isMobile ? mobileVariants[animation] : desktopVariants[animation];

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={variants}
      transition={{
        duration: isMobile ? Math.min(duration, 0.3) : duration,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Composant pour l'effet parallax subtil
interface ParallaxProps {
  children: ReactNode;
  offset?: number;
  className?: string;
}

export function Parallax({
  children,
  offset = 50,
  className = ''
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0 });
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Disable parallax entirely on mobile (causes scroll jank) or reduced motion
  if (prefersReducedMotion || isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ y: offset }}
      animate={isInView ? { y: 0 } : { y: offset }}
      transition={{
        duration: 0.8,
        ease: 'easeOut'
      }}
      style={{ willChange: 'transform' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Export des types d'animation disponibles
export type { AnimationType };
export { animationVariants };
