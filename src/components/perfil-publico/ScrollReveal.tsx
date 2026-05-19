import { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'scale';
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}

export const ScrollReveal = ({ 
  children, 
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.1,
  className = ''
}: ScrollRevealProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const getInitialStyles = () => {
    const base = {
      opacity: 0,
      transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
    };

    switch (animation) {
      case 'fade-up':
        return { ...base, transform: 'translateY(30px)' };
      case 'fade-in':
        return base;
      case 'fade-left':
        return { ...base, transform: 'translateX(-30px)' };
      case 'fade-right':
        return { ...base, transform: 'translateX(30px)' };
      case 'scale':
        return { ...base, transform: 'scale(0.95)' };
      default:
        return base;
    }
  };

  const getVisibleStyles = () => ({
    opacity: 1,
    transform: 'translateY(0) translateX(0) scale(1)',
    transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
  });

  return (
    <div
      ref={ref}
      className={className}
      style={isVisible ? getVisibleStyles() : getInitialStyles()}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
